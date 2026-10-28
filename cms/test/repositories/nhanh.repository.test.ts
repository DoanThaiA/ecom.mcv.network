import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nhanhRepository } from 'src/repositories/nhanh.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('NhanhRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRedirectUrl', () => {
    it('calls GET /integration/nhanh/redirect', async () => {
      const mockResponse = { data: { url: 'https://nhanh.redirect.url' } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await nhanhRepository.getRedirectUrl();

      expect(axiosInstance.get).toHaveBeenCalledWith('/integration/nhanh/redirect');
    });

    it('returns redirect URL response', async () => {
      const mockData = { url: 'https://nhanh.vn/auth' };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.getRedirectUrl();

      expect(result).toEqual(mockData);
    });

    it('returns NhanhRedirectResponse type', async () => {
      const mockData = { url: 'https://test.url' };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.getRedirectUrl();

      expect(result).toHaveProperty('url');
      expect(typeof result.url).toBe('string');
    });

    it('handles API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('API Error'));

      await expect(nhanhRepository.getRedirectUrl()).rejects.toThrow('API Error');
    });
  });

  describe('handleCallback', () => {
    it('calls POST /integration/nhanh/callback', async () => {
      const payload = { code: 'access-code' };
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await nhanhRepository.handleCallback(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/integration/nhanh/callback', payload);
    });

    it('passes payload to API', async () => {
      const payload = { code: 'test-code' };
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await nhanhRepository.handleCallback(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/integration/nhanh/callback', payload);
    });

    it('returns callback response', async () => {
      const payload = { code: 'auth-code' };
      const mockData = { success: true, message: 'Connected' };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.handleCallback(payload);

      expect(result).toEqual(mockData);
    });

    it('returns NhanhCallbackResponse type', async () => {
      const payload = { code: 'code' };
      const mockData = { success: true };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.handleCallback(payload);

      expect(result).toHaveProperty('success');
    });

    it('handles API errors', async () => {
      const payload = { code: 'code' };
      vi.mocked(axiosInstance.post).mockRejectedValue(new Error('Callback Error'));

      await expect(nhanhRepository.handleCallback(payload)).rejects.toThrow('Callback Error');
    });
  });

  describe('syncAll', () => {
    it('calls POST /integration/nhanh/sync/all', async () => {
      const mockResponse = { data: { success: true, message: 'Synced' } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await nhanhRepository.syncAll();

      expect(axiosInstance.post).toHaveBeenCalledWith('/integration/nhanh/sync/all');
    });

    it('returns sync response', async () => {
      const mockData = { success: true, message: 'All data synced' };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.syncAll();

      expect(result).toEqual(mockData);
    });

    it('returns NhanhSyncAllResponse type', async () => {
      const mockData = { success: true };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.syncAll();

      expect(result).toHaveProperty('success');
    });

    it('handles API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValue(new Error('Sync Error'));

      await expect(nhanhRepository.syncAll()).rejects.toThrow('Sync Error');
    });
  });

  describe('checkConnection', () => {
    it('calls GET /integration/nhanh/connection', async () => {
      const mockResponse = { data: { connected: true } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await nhanhRepository.checkConnection();

      expect(axiosInstance.get).toHaveBeenCalledWith('/integration/nhanh/connection');
    });

    it('returns connection status response', async () => {
      const mockData = { connected: true, storeInfo: { name: 'Test Store' } };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.checkConnection();

      expect(result).toEqual(mockData);
    });

    it('returns NhanhCheckConnectionResponse type', async () => {
      const mockData = { connected: true };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.checkConnection();

      expect(result).toHaveProperty('connected');
      expect(typeof result.connected).toBe('boolean');
    });

    it('handles API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Connection Error'));

      await expect(nhanhRepository.checkConnection()).rejects.toThrow('Connection Error');
    });

    it('returns connected status false', async () => {
      const mockData = { connected: false };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.checkConnection();

      expect(result.connected).toBe(false);
    });
  });

  describe('syncProductCategories', () => {
    it('calls POST /integration/nhanh/sync/product-categories', async () => {
      const mockResponse = { data: { message: 'Categories synced' } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await nhanhRepository.syncProductCategories();

      expect(axiosInstance.post).toHaveBeenCalledWith('/integration/nhanh/sync/product-categories');
    });

    it('returns sync product categories response', async () => {
      const mockData = { message: 'Synced 50 categories' };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.syncProductCategories();

      expect(result).toEqual(mockData);
    });

    it('returns NhanhSyncProductCategoriesResponse type', async () => {
      const mockData = { message: 'Categories synced successfully' };
      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockData });

      const result = await nhanhRepository.syncProductCategories();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
    });

    it('handles API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValue(new Error('Sync Categories Error'));

      await expect(nhanhRepository.syncProductCategories()).rejects.toThrow('Sync Categories Error');
    });
  });

  describe('NhanhRepository class', () => {
    it('exports singleton instance', () => {
      expect(nhanhRepository).toBeDefined();
      expect(nhanhRepository).toBeInstanceOf(Object);
    });

    it('has getRedirectUrl method', () => {
      expect(nhanhRepository.getRedirectUrl).toBeDefined();
    });

    it('has handleCallback method', () => {
      expect(nhanhRepository.handleCallback).toBeDefined();
    });

    it('has syncAll method', () => {
      expect(nhanhRepository.syncAll).toBeDefined();
    });

    it('has checkConnection method', () => {
      expect(nhanhRepository.checkConnection).toBeDefined();
    });

    it('has syncProductCategories method', () => {
      expect(nhanhRepository.syncProductCategories).toBeDefined();
    });

    it('uses axiosInstance for API calls', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: {} });
      await nhanhRepository.getRedirectUrl();
      expect(axiosInstance.get).toHaveBeenCalled();
    });

    it('handles Nhanh.vn integration', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { url: 'test' } });
      const result = await nhanhRepository.getRedirectUrl();
      expect(result).toBeDefined();
    });
  });
});
