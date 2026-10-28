import { describe, it, expect, vi, beforeEach } from 'vitest';
import { zaloRepository } from 'src/repositories/zalo.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('ZaloRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRedirectUrl', () => {
    it('calls GET /integration/zalo/redirect', async () => {
      const mockResponse = { data: { url: 'https://zalo.redirect.url' } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await zaloRepository.getRedirectUrl();

      expect(axiosInstance.get).toHaveBeenCalledWith('/integration/zalo/redirect');
    });

    it('returns redirect URL response', async () => {
      const mockData = { url: 'https://zalo.redirect.url' };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await zaloRepository.getRedirectUrl();

      expect(result).toEqual(mockData);
    });

    it('returns ZaloRedirectResponse type', async () => {
      const mockData = { url: 'https://test.url' };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await zaloRepository.getRedirectUrl();

      expect(result).toHaveProperty('url');
      expect(typeof result.url).toBe('string');
    });

    it('is an async function', () => {
      expect(zaloRepository.getRedirectUrl).toBeInstanceOf(Function);
    });

    it('handles API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('API Error'));

      await expect(zaloRepository.getRedirectUrl()).rejects.toThrow('API Error');
    });
  });

  describe('handleCallback', () => {
    it('calls POST /integration/zalo/callback', async () => {
      const payload = { code: 'auth-code', state: 'state' };
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await zaloRepository.handleCallback(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/integration/zalo/callback', payload);
    });

    it('passes payload to API', async () => {
      const payload = { code: 'test-code', state: 'test-state' };
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await zaloRepository.handleCallback(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/integration/zalo/callback', payload);
    });

    it('returns callback response', async () => {
      const payload = { code: 'auth-code', state: 'state' };
      const mockData = { success: true, message: 'Connected' };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockData });

      const result = await zaloRepository.handleCallback(payload);

      expect(result).toEqual(mockData);
    });

    it('returns ZaloCallbackResponse type', async () => {
      const payload = { code: 'code', state: 'state' };
      const mockData = { success: true };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockData });

      const result = await zaloRepository.handleCallback(payload);

      expect(result).toHaveProperty('success');
    });

    it('is an async function', () => {
      expect(zaloRepository.handleCallback).toBeInstanceOf(Function);
    });

    it('handles API errors', async () => {
      const payload = { code: 'code', state: 'state' };
      vi.mocked(axiosInstance.post).mockRejectedValue(new Error('Callback Error'));

      await expect(zaloRepository.handleCallback(payload)).rejects.toThrow('Callback Error');
    });

    it('accepts ZaloCallbackRequest parameter', async () => {
      const payload = { code: 'test', state: 'test' };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: { success: true } });

      await zaloRepository.handleCallback(payload);

      expect(axiosInstance.post).toHaveBeenCalled();
    });
  });

  describe('checkConnection', () => {
    it('calls GET /integration/zalo/connection', async () => {
      const mockResponse = { data: { connected: true } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await zaloRepository.checkConnection();

      expect(axiosInstance.get).toHaveBeenCalledWith('/integration/zalo/connection');
    });

    it('returns connection status response', async () => {
      const mockData = { connected: true, oaInfo: { name: 'Test OA' } };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await zaloRepository.checkConnection();

      expect(result).toEqual(mockData);
    });

    it('returns ZaloCheckConnectionResponse type', async () => {
      const mockData = { connected: true };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await zaloRepository.checkConnection();

      expect(result).toHaveProperty('connected');
      expect(typeof result.connected).toBe('boolean');
    });

    it('is an async function', () => {
      expect(zaloRepository.checkConnection).toBeInstanceOf(Function);
    });

    it('handles API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Connection Error'));

      await expect(zaloRepository.checkConnection()).rejects.toThrow('Connection Error');
    });

    it('returns connected status', async () => {
      const mockData = { connected: false };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await zaloRepository.checkConnection();

      expect(result.connected).toBe(false);
    });
  });

  describe('ZaloRepository class', () => {
    it('exports singleton instance', () => {
      expect(zaloRepository).toBeDefined();
      expect(zaloRepository).toBeInstanceOf(Object);
    });

    it('has getRedirectUrl method', () => {
      expect(zaloRepository.getRedirectUrl).toBeDefined();
    });

    it('has handleCallback method', () => {
      expect(zaloRepository.handleCallback).toBeDefined();
    });

    it('has checkConnection method', () => {
      expect(zaloRepository.checkConnection).toBeDefined();
    });

    it('uses axiosInstance for API calls', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: {} });
      await zaloRepository.getRedirectUrl();
      expect(axiosInstance.get).toHaveBeenCalled();
    });

    it('handles Zalo OA integration', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { url: 'test' } });
      const result = await zaloRepository.getRedirectUrl();
      expect(result).toBeDefined();
    });
  });
});
