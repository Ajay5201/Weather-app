import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CitySearchResultDto } from '../dto/city-lookup-response.dto';
import { RedisService } from 'src/modules/redis/service/redis.service';
import { URL_CONSTANTS } from 'src/constants/url.constants';

@Injectable()
export class CityLookUpService {
  private readonly logger = new Logger(CityLookUpService.name);
  private readonly citySearchCacheTTL: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,  
  ) {
    this.citySearchCacheTTL = this.configService.get<number>('CITY_SEARCH_CACHE_TTL', 12 * 3600);
  }

  async search(query: string): Promise<CitySearchResultDto[]> {
    try {
      const sanitizedQuery = this.sanitizeSearchQuery(query);
      
      if (!sanitizedQuery) {
        return [];
      }

      const cacheKey = `city-search:${sanitizedQuery}`;
      const cached = await this.redisService.get(cacheKey);   
      if (cached) {
        console.log("returns forecast cached query data" , query)
        return JSON.parse(cached);
      }

      const results = await this.fetchFromBBCApi(sanitizedQuery);
      await this.redisService.set(cacheKey, JSON.stringify(results), this.citySearchCacheTTL);

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
    
    return sanitized;
  }

  private async fetchFromBBCApi(query: string): Promise<CitySearchResultDto[]> {
    try {
      const url = `${URL_CONSTANTS.BBCI_API}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            api_key: process.env.BBCI_API_KEY, 
            stack: 'aws',
            locale: 'en',
            filter: 'international',
            'place-types': 'settlement,airport,district',
            order: 'importance',
            s: query,
            a: 'true',
            format: 'json'
          },
          timeout: 5000, 
        }),
      );

      if (!response.data || !response.data.response) {
        throw new Error('Invalid response format from BBC API');
      }

      return this.transformBBCResponse(response.data.response.results.results);
    } catch (error) {
      if (error.response?.status === 429) {
        throw new InternalServerErrorException('BBC API rate limit exceeded');
      }
      if (error.code === 'ECONNABORTED') {
        throw new InternalServerErrorException('BBC API request timeout');
      }
      throw error;
    }
  }

  private transformBBCResponse(results: any): CitySearchResultDto[] {
    return results
    .filter((result: any) => result.name)
    .map((result: any) => ({
      name: result.name,
      country: result.container || '',
      displayName: result.container ? `${result.name}, ${result.container}` : result.name,
    }));
  }

  private getFallbackResults(query: string): CitySearchResultDto[] {
    const commonCities = [
      // Indian Cities
      { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777 },
      { name: 'Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
      { name: 'Bangalore', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
      { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
      { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
      { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867 },
      { name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567 },
      { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714 },
      { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873 },
      { name: 'Surat', state: 'Gujarat', country: 'India', lat: 21.1702, lon: 72.8311 },
      
      // International Cities
      { name: 'London', state: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
      { name: 'New York', state: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
      { name: 'Tokyo', state: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
      { name: 'Paris', state: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
      { name: 'Sydney', state: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093 },
      { name: 'Dubai', state: 'Dubai', country: 'UAE', lat: 25.276987, lon: 55.296249 },
      { name: 'Singapore', state: '', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
      { name: 'Beijing', state: '', country: 'China', lat: 39.9042, lon: 116.4074 },
    ];
  
    const lowerQuery = query.toLowerCase();
    return commonCities
      .filter(city => 
        city.name.toLowerCase().includes(lowerQuery) ||
        city.state.toLowerCase().includes(lowerQuery) ||
        city.country.toLowerCase().includes(lowerQuery)
      )
      .map(city => ({
        name: city.name,
        country: city.country,
        displayName: `${city.name}${city.state ? ', ' + city.state : ''}${city.country ? ', ' + city.country : ''}`,

      }));
  }
}