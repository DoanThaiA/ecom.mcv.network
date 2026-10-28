import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockReadFileSync = vi.fn();
const mockJoin = vi.fn((...args: string[]) => args.join('/'));

vi.mock('fs', () => ({
  default: { readFileSync: mockReadFileSync },
  readFileSync: mockReadFileSync,
}));

vi.mock('path', () => ({
  default: { join: mockJoin },
  join: mockJoin,
}));

describe('/health endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should return healthy status with version info when version.json exists', async () => {
    const mockVersion = { version: '1.6.360' };

    mockReadFileSync.mockReturnValue(JSON.stringify(mockVersion));

    const { GET } = await import('./route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'healthy',
      service: 'cchat-frontend',
      version: mockVersion.version,
    });
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('should return healthy status with error message when version.json does not exist', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    const { GET } = await import('./route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'healthy',
      service: 'cchat-frontend',
      version: 'unknown',
      error: 'version.json not found',
    });
    expect(data.timestamp).toBeDefined();
  });

  it('should always return status code 200', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('Any error');
    });

    const { GET } = await import('./route');
    const response = await GET();

    expect(response.status).toBe(200);
  });

  it('should include timestamp in ISO format', async () => {
    const mockVersion = { version: '1.0.0' };

    mockReadFileSync.mockReturnValue(JSON.stringify(mockVersion));

    const { GET } = await import('./route');

    const beforeCall = new Date();
    const response = await GET();
    const afterCall = new Date();
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
  });
});
