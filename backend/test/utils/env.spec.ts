describe('env.REDIS_URL', () => {
  const originalRedisUrl = process.env.REDIS_URL;

  const loadRedisUrl = async (): Promise<string> => {
    jest.resetModules();
    const { env } = await import('../../src/utils/env');
    return env.REDIS_URL;
  };

  afterEach(() => {
    if (originalRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = originalRedisUrl;
    }
  });

  it('should use REDIS_URL from the environment', async () => {
    process.env.REDIS_URL = 'redis://redis:6379';

    expect(await loadRedisUrl()).toBe('redis://redis:6379');
  });

  it.each([
    ['unset', undefined],
    ['empty', ''],
  ])('should fall back to localhost when REDIS_URL is %s', async (_, value) => {
    if (value === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = value;
    }

    expect(await loadRedisUrl()).toBe('redis://localhost:6379');
  });
});

describe('env.FILE_DRIVER', () => {
  const originalFileDriver = process.env.FILE_DRIVER;

  const loadFileDriver = async (): Promise<string> => {
    jest.resetModules();
    const { env } = await import('../../src/utils/env');
    return env.FILE_DRIVER;
  };

  afterEach(() => {
    if (originalFileDriver === undefined) {
      delete process.env.FILE_DRIVER;
    } else {
      process.env.FILE_DRIVER = originalFileDriver;
    }
  });

  it('should use FILE_DRIVER from the environment', async () => {
    process.env.FILE_DRIVER = 'local';

    expect(await loadFileDriver()).toBe('local');
  });

  it('should default to s3 when FILE_DRIVER is not set', async () => {
    delete process.env.FILE_DRIVER;

    expect(await loadFileDriver()).toBe('s3');
  });
});
