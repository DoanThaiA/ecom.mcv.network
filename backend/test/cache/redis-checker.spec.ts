import KeyvRedis from '@keyv/redis';
import {
  checkRedisHealth,
  isRedisAvailable,
} from '../../src/cache/utils/redis-checker';

const mockPing = jest.fn();
const mockGet = jest.fn();
const mockGetClient = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@keyv/redis', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    get: mockGet,
    getClient: mockGetClient,
    disconnect: mockDisconnect,
  })),
}));

describe('Redis checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(undefined);
    mockGetClient.mockResolvedValue({ ping: mockPing });
    mockPing.mockResolvedValue('PONG');
    mockDisconnect.mockResolvedValue(undefined);
  });

  describe('isRedisAvailable', () => {
    it('should preserve the cache availability check', async () => {
      const result = await isRedisAvailable('redis://localhost:6379');

      expect(result).toBe(true);
      expect(KeyvRedis).toHaveBeenCalledWith('redis://localhost:6379', {
        throwOnConnectError: true,
        throwOnErrors: true,
      });
      expect(mockGet).toHaveBeenCalledWith('test');
      expect(mockGetClient).not.toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalledWith();
    });
  });

  describe('checkRedisHealth', () => {
    it('should use a bounded PING check and disconnect the temporary client', async () => {
      const result = await checkRedisHealth('redis://localhost:6379');

      expect(result).toBe(true);
      expect(KeyvRedis).toHaveBeenCalledWith('redis://localhost:6379', {
        throwOnConnectError: true,
        throwOnErrors: true,
        connectionTimeout: 1000,
      });
      expect(mockGetClient).toHaveBeenCalledTimes(1);
      expect(mockPing).toHaveBeenCalledTimes(1);
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalledWith(true);
    });

    it('should return false when Redis PING fails', async () => {
      mockPing.mockRejectedValue(new Error('Redis unavailable'));

      const result = await checkRedisHealth('redis://localhost:6379');

      expect(result).toBe(false);
      expect(mockDisconnect).toHaveBeenCalledWith(true);
    });

    it('should time out when Redis PING does not respond', async () => {
      jest.useFakeTimers();
      mockPing.mockReturnValue(new Promise(() => undefined));

      try {
        const checkPromise = checkRedisHealth('redis://localhost:6379');
        let settled = false;
        void checkPromise.finally(() => {
          settled = true;
        });

        await jest.advanceTimersByTimeAsync(1000);
        await Promise.resolve();

        expect(settled).toBe(true);
        await expect(checkPromise).resolves.toBe(false);
        expect(mockDisconnect).toHaveBeenCalledWith(true);
      } finally {
        jest.useRealTimers();
      }
    });

    it('should return false without creating a client when Redis URL is missing', async () => {
      const result = await checkRedisHealth(undefined);

      expect(result).toBe(false);
      expect(KeyvRedis).not.toHaveBeenCalled();
    });
  });
});
