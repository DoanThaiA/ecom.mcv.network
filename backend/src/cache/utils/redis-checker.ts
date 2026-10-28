import KeyvRedis from '@keyv/redis';
import { Logger } from '@nestjs/common';

const logger = new Logger('RedisChecker');
const REDIS_HEALTH_CHECK_TIMEOUT_MS = 1000;

export async function isRedisAvailable(redisUrl?: string): Promise<boolean> {
  if (!redisUrl) return false;

  let store: KeyvRedis<any> | null = null;

  try {
    store = new KeyvRedis(redisUrl, {
      throwOnConnectError: true,
      throwOnErrors: true,
    });
    await store.get('test');
    return true;
  } catch (error) {
    logger.warn(error.message);
    return false;
  } finally {
    // Clean up connection
    if (store) {
      try {
        await store.disconnect();
      } catch {}
    }
  }
}

export async function checkRedisHealth(redisUrl?: string): Promise<boolean> {
  if (!redisUrl) return false;

  let store: KeyvRedis<any> | null = null;

  try {
    store = new KeyvRedis(redisUrl, {
      throwOnConnectError: true,
      throwOnErrors: true,
      connectionTimeout: REDIS_HEALTH_CHECK_TIMEOUT_MS,
    });
    const client = await store.getClient();
    let pingTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
      await Promise.race([
        client.ping(),
        new Promise<never>((_, reject) => {
          pingTimeout = setTimeout(
            () => reject(new Error('Redis PING timed out')),
            REDIS_HEALTH_CHECK_TIMEOUT_MS,
          );
        }),
      ]);
    } finally {
      if (pingTimeout) clearTimeout(pingTimeout);
    }

    return true;
  } catch {
    return false;
  } finally {
    if (store) {
      try {
        await store.disconnect(true);
      } catch {}
    }
  }
}
