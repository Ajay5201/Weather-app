// city-lookup.service.ts
import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { firstValueFrom } from 'rxjs';
import { CitySearchResultDto } from '../dto/city-lookup-response.dto';
import { URL_CONSTANTS } from '../../../constants/url.constants';

@Injectable()
export class CityLookUpService {
  private readonly logger = new Logger(CityLookUpService.name);
  private redis: Redis;
  private readonly geoapifyApiKey: string;
  private readonly citySearchCacheTTL: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const geoapifyApiKey = this.configService.get<string>('GEO_APIFY_API_KEY');
    this.citySearchCacheTTL = this.configService.get<number>('CITY_SEARCH_CACHE_TTL', 12 * 3600);
    
    if (!geoapifyApiKey) {
      throw new InternalServerErrorException(
        'Missing required environment variable: GEO_APIFY_API_KEY',
      );
    }
    this.geoapifyApiKey = geoapifyApiKey;

    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      this.redis = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      
    }
  }

  async search(query: string): Promise<CitySearchResultDto[]> {
    try {
      // Input validation and sanitization
      const sanitizedQuery = this.sanitizeSearchQuery(query);
      
      if (!sanitizedQuery) {
        return [];
      }

      const cached = await this.getFromCache(sanitizedQuery);
      if (cached) {
        return cached;
      }

      const results = await this.fetchFromAPI(sanitizedQuery);
      
      await this.setCache(sanitizedQuery, results);
      
      return results;
    } catch (error) {
      this.logger.error(`City search failed for query "${query}":`, error);
      return this.getFallbackResults(query);
    }
  }

  private sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      throw new BadRequestException('Search query must be a valid string');
    }
    
    const sanitized = query.trim().replace(/[<>\"'&]/g, '');
    if (sanitized.length < 1 || sanitized.length > 100) {
      throw new BadRequestException('Search query must be between 1 and 100 characters');
    }
    
    return sanitized.toLowerCase();
  }

  private async getFromCache(query: string): Promise<CitySearchResultDto[] | null> {
    try {
      if (!this.redis || this.redis.status !== 'ready') {
        return null;
      }
      
      const cacheKey = `city-search:${query}`;
      const cached = await this.redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  private async setCache(query: string, results: CitySearchResultDto[]): Promise<void> {
    try {
      if (!this.redis || this.redis.status !== 'ready') {
        return;
      }
      
      const cacheKey = `city-search:${query}`;
      await this.redis.set(cacheKey, JSON.stringify(results), 'EX', this.citySearchCacheTTL);
    } catch (error) {
      this.logger.warn('Cache setting failed:', error);
    }
  }

  private async fetchFromAPI(query: string): Promise<CitySearchResultDto[]> {
    try {
      const url = `${URL_CONSTANTS.GEO_APIFY}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            text: query,
            format: 'json',
            apiKey: this.geoapifyApiKey,
            limit: 40, 
          },
        }),
      );

      if (!response.data || !response.data.results) {
        throw new Error('Invalid response format from Geoapify API');
      }

      return this.transformAPIResponse(response.data.results);
    } catch (error) {
      if (error.response?.status === 401) {
        throw new InternalServerErrorException('Invalid API key for Geoapify');
      }
      if (error.response?.status === 429) {
        throw new InternalServerErrorException('Geoapify API rate limit exceeded');
      }
      throw error;
    }
  }

  private transformAPIResponse(results: any[]): CitySearchResultDto[] {
    return results
      .filter((r: any) => r.city || r.county || r.address_line1)
      .map((r: any) => ({
        name: r.city || r.county || r.address_line1 || '',
        state: r.state || r.state_district || '',
        country: r.country || '',
        latitude: r.lat || 0,
        longitude: r.lon || 0,
        displayName: r.formatted || '',
      }))
      .filter(result => result.name && result.latitude && result.longitude);
  }

  private getFallbackResults(query: string): CitySearchResultDto[] {
    const commonCities = [
      { name: 'London', state: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
      { name: 'New York', state: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
      { name: 'Tokyo', state: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
      { name: 'Paris', state: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
      { name: 'Sydney', state: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093 },
    ];

    const lowerQuery = query.toLowerCase();
    return commonCities
      .filter(city => city.name.toLowerCase().includes(lowerQuery))
      .map(city => ({
        name: city.name,
        state: city.state,
        country: city.country,
        latitude: city.lat,
        longitude: city.lon,
        displayName: `${city.name}, ${city.state}, ${city.country}`,
      }));
  }
}
