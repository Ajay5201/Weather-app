// rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RateLimitOptions } from '../../core/guards/rate-limit.guard';

export const RATE_LIMIT_KEY = 'rateLimit';

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);


export const RateLimits = {

  // Weather API specific rate limiting (OpenWeather has 1000 calls/day limit)
  WEATHER_API: {
    windowMs: 24 * 60 * 60 * 1000, 
    maxRequests: 800, 
  },
  
  // City search rate limiting
  CITY_SEARCH: {
    windowMs: 15 * 60 * 1000, 
    maxRequests: 250,
  },
};
