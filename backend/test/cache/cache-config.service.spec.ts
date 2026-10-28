import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheConfigService } from '../../src/cache/cache-config.service';
import { isRedisAvailable } from '../../src/cache/utils/redis-checker';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
import { CacheableMemory } from 'cacheable';

jest.mock('../../src/cache/utils/redis-checker');
jest.mock('@keyv/redis');
jest.mock('keyv');
jest.mock('cacheable');

describe('CacheConfigService', () => {
  let service: CacheConfigService;
  let configService: jest.Mocked<ConfigService>;
  let loggerErrorSpy: jest.SpyInstance;

  const mockKeyvRedis = {
    on: jest.fn(),
  };

  const mockKeyv = {
    on: jest.fn(),
  };

  const mockCacheableMemory = {};

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'cache.redisUrl') return 'redis://localhost:6379';
        if (key === 'cache.ttl') return 3600000;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheConfigService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CacheConfigService>(CacheConfigService);
    configService = module.get(ConfigService);

    // Reset mocks
    (isRedisAvailable as jest.Mock).mockReset();
    (KeyvRedis as unknown as jest.Mock).mockReset();
    (Keyv as unknown as jest.Mock).mockReset();
    (CacheableMemory as unknown as jest.Mock).mockReset();

    // Setup default mocks
    (KeyvRedis as unknown as jest.Mock).mockReturnValue(mockKeyvRedis);
    (Keyv as unknown as jest.Mock).mockReturnValue(mockKeyv);
    (CacheableMemory as unknown as jest.Mock).mockReturnValue(
      mockCacheableMemory,
    );
  });

  beforeAll(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterAll(() => {
    loggerErrorSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCacheOptions', () => {
    it('should create cache options with Redis and in-memory stores when Redis is available', async () => {
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);

      const result = await service.createCacheOptions();

      expect(isRedisAvailable).toHaveBeenCalledWith('redis://localhost:6379');
      expect(KeyvRedis).toHaveBeenCalledWith('redis://localhost:6379', {
        throwOnConnectError: false,
        throwOnErrors: false,
      });
      expect(mockKeyvRedis.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
      expect(Keyv).toHaveBeenCalledTimes(2); // Redis store + memory store
      expect(Keyv).toHaveBeenCalledWith({
        store: mockKeyvRedis,
        namespace: 'cache',
      });
      expect(CacheableMemory).toHaveBeenCalledWith({
        ttl: 3600000,
        lruSize: 5000,
      });
      expect(Keyv).toHaveBeenCalledWith({
        store: mockCacheableMemory,
        namespace: 'cache',
      });
      expect(result).toEqual({
        stores: [mockKeyv, mockKeyv],
        ttl: 3600000,
      });
      expect(mockKeyv.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should create cache options with only in-memory store when Redis is not available', async () => {
      (isRedisAvailable as jest.Mock).mockResolvedValue(false);

      const result = await service.createCacheOptions();

      expect(isRedisAvailable).toHaveBeenCalledWith('redis://localhost:6379');
      expect(KeyvRedis).not.toHaveBeenCalled();
      expect(Keyv).toHaveBeenCalledTimes(1); // Only memory store
      expect(Keyv).toHaveBeenCalledWith({
        store: mockCacheableMemory,
        namespace: 'cache',
      });
      expect(result).toEqual({
        stores: [mockKeyv],
        ttl: 3600000,
      });
    });

    it('should use config values for Redis URL and TTL', async () => {
      const customRedisUrl = 'redis://custom:6380';
      const customTtl = 7200000;
      configService.get.mockImplementation((key: string) => {
        if (key === 'cache.redisUrl') return customRedisUrl;
        if (key === 'cache.ttl') return customTtl;
        return null;
      });
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);

      const result = await service.createCacheOptions();

      expect(configService.get).toHaveBeenCalledWith('cache.redisUrl', {
        infer: true,
      });
      expect(configService.get).toHaveBeenCalledWith('cache.ttl', {
        infer: true,
      });
      expect(isRedisAvailable).toHaveBeenCalledWith(customRedisUrl);
      expect(KeyvRedis).toHaveBeenCalledWith(customRedisUrl, {
        throwOnConnectError: false,
        throwOnErrors: false,
      });
      expect(CacheableMemory).toHaveBeenCalledWith({
        ttl: customTtl,
        lruSize: 5000,
      });
      expect(result.ttl).toBe(customTtl);
    });

    it('should handle Redis initialization error gracefully', async () => {
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (KeyvRedis as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('Redis connection failed');
      });

      const result = await service.createCacheOptions();

      // Should still return result with only memory store
      expect(result).toEqual({
        stores: [mockKeyv],
        ttl: 3600000,
      });
      // KeyvRedis should have been attempted
      expect(KeyvRedis).toHaveBeenCalled();
      // Should fall back to memory store only
      expect(Keyv).toHaveBeenCalledTimes(1);
    });

    it('should attach error handler to Redis store', async () => {
      let redisErrorHandler: ((...args: any[]) => void) | undefined;
      const mockKeyvRedisWithHandler = {
        on: jest.fn((event: string, handler: (...args: any[]) => void) => {
          if (event === 'error') {
            redisErrorHandler = handler;
          }
        }),
      };
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (KeyvRedis as unknown as jest.Mock).mockReturnValue(
        mockKeyvRedisWithHandler,
      );

      await service.createCacheOptions();

      expect(mockKeyvRedisWithHandler.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
      expect(redisErrorHandler).toBeDefined();

      // Verify error handler doesn't throw
      expect(redisErrorHandler).toBeDefined();
      if (redisErrorHandler) {
        expect(() => redisErrorHandler!(new Error('Test error'))).not.toThrow();
      }
    });

    it('should attach error handler to Keyv stores', async () => {
      let keyvErrorHandler: ((...args: any[]) => void) | undefined;
      const mockKeyvWithHandler = {
        on: jest.fn((event: string, handler: (...args: any[]) => void) => {
          if (event === 'error') {
            keyvErrorHandler = handler;
          }
        }),
      };
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (Keyv as unknown as jest.Mock).mockReturnValue(mockKeyvWithHandler);

      await service.createCacheOptions();

      expect(mockKeyvWithHandler.on).toHaveBeenCalled();
      expect(keyvErrorHandler).toBeDefined();

      // Verify error handler doesn't throw
      expect(keyvErrorHandler).toBeDefined();
      if (keyvErrorHandler) {
        expect(() => keyvErrorHandler!(new Error('Test error'))).not.toThrow();
      }
    });

    it('should create memory store with correct LRU size', async () => {
      (isRedisAvailable as jest.Mock).mockResolvedValue(false);

      await service.createCacheOptions();

      expect(CacheableMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          lruSize: 5000,
        }),
      );
    });

    it('should set namespace for cache stores', async () => {
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);

      await service.createCacheOptions();

      // Redis store should have namespace
      expect(Keyv).toHaveBeenCalledWith(
        expect.objectContaining({
          namespace: 'cache',
        }),
      );
    });

    it('should return stores array in correct order', async () => {
      const redisStore = { type: 'redis', on: jest.fn() };
      const memoryStore = { type: 'memory', on: jest.fn() };
      (isRedisAvailable as jest.Mock).mockResolvedValue(true);
      (Keyv as unknown as jest.Mock)
        .mockReturnValueOnce(redisStore)
        .mockReturnValueOnce(memoryStore);

      const result = await service.createCacheOptions();

      // Redis store should be first, memory store second
      expect(result.stores).toEqual([redisStore, memoryStore]);
    });

    it('should handle isRedisAvailable rejection gracefully', async () => {
      (isRedisAvailable as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(service.createCacheOptions()).rejects.toThrow(
        'Network error',
      );
    });
  });
});
