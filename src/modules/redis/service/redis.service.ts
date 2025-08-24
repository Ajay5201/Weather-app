import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      console.log('test')
      console.log(this.configService.get<string>('REDIS_HOST'))
      this.redis = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        this.logger.log('Redis is ready to accept commands');
        this.isConnected = true;
      });

      this.redis.on('close', () => {
        this.logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        this.logger.log('Redis reconnecting...');
      });

      await this.redis.connect();

    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected || !this.redis) {
        this.logger.warn('Redis not connected, skipping get operation');
        return null;
      }

      const result = await this.redis.get(key);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        this.logger.warn('Redis not connected, skipping set operation');
        return false;
      }

      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        this.logger.warn('Redis not connected, skipping delete operation');
        return false;
      }

      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error);
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
        this.logger.log('Redis connection closed gracefully');
      }
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }
}
