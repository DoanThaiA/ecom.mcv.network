import { registerAs } from '@nestjs/config';
import { env } from '../../utils/env';
import { CacheConfig } from './cache-config.type';

export default registerAs<CacheConfig>('cache', () => ({
  redisUrl: env.REDIS_URL,
  ttl: parseInt(env.CACHE_TTL, 10),
}));
