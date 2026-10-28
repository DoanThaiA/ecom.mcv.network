import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HomeService } from '../../src/home/home.service';
import { checkRedisHealth } from '../../src/cache/utils/redis-checker';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('../../src/cache/utils/redis-checker', () => ({
  checkRedisHealth: jest.fn(),
}));

describe('HomeService', () => {
  let service: HomeService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'app.name') return 'CChat E-Commerce';
        if (key === 'cache.redisUrl') return 'redis://localhost:6379';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    configService = module.get(ConfigService);
    (checkRedisHealth as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('appInfo', () => {
    it('should return application name from config', () => {
      const result = service.appInfo();

      expect(result).toEqual({ name: 'CChat E-Commerce' });
      expect(configService.get).toHaveBeenCalledWith('app.name', {
        infer: true,
      });
    });

    it('should handle undefined app name', () => {
      configService.get.mockReturnValue(undefined);

      const result = service.appInfo();

      expect(result).toEqual({ name: undefined });
    });
  });

  describe('health', () => {
    it('should return health status with version', async () => {
      const mockVersionData = JSON.stringify({ version: '1.0.0' });
      (fs.readFileSync as jest.Mock).mockReturnValue(mockVersionData);

      const result = await Promise.resolve(service.health());

      expect(result).toEqual({
        status: 'ok',
        version: '1.0.0',
        timestamp: expect.any(String),
        redis: { status: 'up' },
      });
      expect(checkRedisHealth).toHaveBeenCalledWith('redis://localhost:6379');
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('version.json'),
        'utf8',
      );
    });

    it('should report Redis as down without failing the health response', async () => {
      const mockVersionData = JSON.stringify({ version: '1.0.0' });
      (fs.readFileSync as jest.Mock).mockReturnValue(mockVersionData);
      (checkRedisHealth as jest.Mock).mockResolvedValue(false);

      const result = await Promise.resolve(service.health());

      expect(result).toMatchObject({
        status: 'ok',
        redis: { status: 'down' },
      });
    });

    it('should report Redis as down when the Redis checker rejects', async () => {
      const mockVersionData = JSON.stringify({ version: '1.0.0' });
      (fs.readFileSync as jest.Mock).mockReturnValue(mockVersionData);
      (checkRedisHealth as jest.Mock).mockRejectedValue(
        new Error('Unexpected Redis error'),
      );

      const result = await service.health();

      expect(result).toMatchObject({
        status: 'ok',
        redis: { status: 'down' },
      });
    });

    it('should return ISO timestamp', async () => {
      const mockVersionData = JSON.stringify({ version: '2.0.0' });
      (fs.readFileSync as jest.Mock).mockReturnValue(mockVersionData);

      const result = await Promise.resolve(service.health());

      // Verify timestamp is valid ISO format
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should read version from version.json file', async () => {
      const mockVersionData = JSON.stringify({
        version: '3.5.2',
        buildDate: '2026-01-07',
      });
      (fs.readFileSync as jest.Mock).mockReturnValue(mockVersionData);

      const result = await Promise.resolve(service.health());

      expect(result.version).toBe('3.5.2');
      expect(result.status).toBe('ok');
    });

    it('should handle version file read errors', async () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(
        Promise.resolve().then(() => service.health()),
      ).rejects.toThrow('File not found');
    });

    it('should handle invalid JSON in version file', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');

      await expect(
        Promise.resolve().then(() => service.health()),
      ).rejects.toThrow();
    });
  });
});
