import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import { CacheableMemory } from 'cacheable';
import { AllConfigType } from '../config/config.type';
import { isRedisAvailable } from './utils/redis-checker';

@Injectable()
export class CacheConfigService
  implements CacheOptionsFactory, OnModuleDestroy
{
  private readonly logger = new Logger(CacheConfigService.name);
  private keyvRedis: KeyvRedis<any> | null = null;

  constructor(private configService: ConfigService<AllConfigType>) {}

  async onModuleDestroy(): Promise<void> {
    if (this.keyvRedis) {
      try {
        await this.keyvRedis.disconnect();
        this.logger.log('Redis connection closed');
      } catch (error) {
        this.logger.error(`Error closing Redis connection: ${error.message}`);
      }
    }
  }

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const redisUrl = this.configService.get('cache.redisUrl', { infer: true });
    const ttl = this.configService.get('cache.ttl', { infer: true });

    const stores: Keyv[] = [];

    // Check if Redis is available
    const redisAvailable = await isRedisAvailable(redisUrl);

    if (redisAvailable) {
      try {
        this.keyvRedis = new KeyvRedis(redisUrl, {
          throwOnConnectError: false,
          throwOnErrors: false,
        });
        this.keyvRedis.on('error', (err: Error) => {
          this.logger.error('Redis cache error:', err);
        });

        const redisStore = new Keyv({
          store: this.keyvRedis,
          namespace: 'cache',
        });
        // Extra catch to avoid crash, error already logged
        redisStore.on('error', () => {});

        stores.push(redisStore);
        this.logger.log('Redis cache store initialized');
      } catch (error) {
        this.logger.error(`Failed to initialize Redis store: ${error.message}`);
      }
    }

    // Add in-memory cache as fallback
    const memoryStore = new Keyv({
      store: new CacheableMemory({ ttl, lruSize: 5000 }),
      namespace: 'cache',
    });

    memoryStore.on('error', (err: Error) => {
      this.logger.error('In-memory cache error:', err);
    });

    stores.push(memoryStore);
    this.logger.log('In-memory cache store initialized');

    return {
      stores,
      ttl,
    };
  }
}
