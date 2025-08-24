// rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../modules/redis/service/redis.service';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (context: ExecutionContext) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>('rateLimit', context.getHandler());
    
    if (!rateLimitOptions) {
      return true; // No rate limiting configured
    }

    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(context, rateLimitOptions);
    
    const currentCount = await this.getCurrentCount(key);
    
    if (currentCount >= rateLimitOptions.maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Please try again later.',
          error: 'Too Many Requests',
          retryAfter: Math.ceil(rateLimitOptions.windowMs / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.incrementCount(key, rateLimitOptions.windowMs);
    return true;
  }

  private generateKey(context: ExecutionContext, options: RateLimitOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(context);
    }

    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const route = request.route?.path || request.path;
    
    return `rate-limit:${ip}:${route}`;
  }

  private async getCurrentCount(key: string): Promise<number> {
    try {
      const count = await this.redisService.get(key);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      return 0;
    }
  }

  private async incrementCount(key: string, windowMs: number): Promise<void> {
    try {
      const currentCount = await this.getCurrentCount(key);
      const newCount = currentCount + 1;
      
      // Set the key with the new count and window expiration
      await this.redisService.set(key, newCount.toString(), Math.ceil(windowMs / 1000));
    } catch (error) {
      // If Redis fails, continue (fail open)
    }
  }
}
