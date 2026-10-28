import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from './cache-config.service';
import cacheConfig from './config/cache.config';

@Module({
  imports: [
    ConfigModule.forFeature(cacheConfig),
    NestCacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
      imports: [ConfigModule],
    }),
  ],
})
export class CacheModule {}
