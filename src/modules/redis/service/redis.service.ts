// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    
    this.client = new Redis({
      host: process.env.REDIS_HOST ,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.on('error', (err) => {
      console.error(' Redis error:', err);
    });
  }

  onModuleDestroy() {
    return this.client.quit();
  }

  // Set cache value
  async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  // Get cache value
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Delete cache
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
