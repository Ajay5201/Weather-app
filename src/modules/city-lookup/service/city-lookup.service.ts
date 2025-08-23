// city-lookup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import Redis from 'ioredis';
import { firstValueFrom } from 'rxjs';
import { CitySearchResultDto } from '../dto/city-lookup-response.dto';
import { URL_CONSTANTS } from '../../../constants/url.constants';



@Injectable()
export class CityLookUpService {
  private readonly logger = new Logger(CityLookUpService.name);
  private redis: Redis;
  private readonly geoapifyApiKey = process.env.GEO_APIFY_API_KEY; 

  constructor(private readonly httpService: HttpService) {
    this.redis = new Redis(); 
  }

  async search(query: string): Promise<CitySearchResultDto[]> {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    const cacheKey = `city-search:${lowerQuery}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const url = `${URL_CONSTANTS.GEO_APIFY}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            text: query,
            format: 'json',
            apiKey: this.geoapifyApiKey,
          },
        }),
      );

      const results: CitySearchResultDto[] = (response.data.results || [])
        .filter((r: any) => r.city || r.county) 
        .map((r: any) => ({
          name: r.city || r.county || r.address_line1 || '',
          state: r.state || r.state_district,
          country: r.country,
          latitude: r.lat,
          longitude: r.lon,
          displayName: r.formatted,
        }));

      // Cache for 12 hours
      await this.redis.set(cacheKey, JSON.stringify(results), 'EX', 12 * 3600);

      return results;
    } catch (err) {
      this.logger.error('Geoapify API error', err);
      return [];
    }
  }
}
