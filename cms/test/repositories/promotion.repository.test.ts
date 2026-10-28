import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promotionRepository } from 'src/repositories/promotion.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('promotionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports promotionRepository instance', () => {
    expect(promotionRepository).toBeDefined();
    expect(promotionRepository).toHaveProperty('queryPromotions');
    expect(promotionRepository).toHaveProperty('getPromotion');
    expect(promotionRepository).toHaveProperty('createPromotion');
    expect(promotionRepository).toHaveProperty('updatePromotion');
    expect(promotionRepository).toHaveProperty('deletePromotion');
    expect(promotionRepository).toHaveProperty('pausePromotion');
    expect(promotionRepository).toHaveProperty('resumePromotion');
  });

  describe('queryPromotions', () => {
    it('calls GET /promotions with all params', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await promotionRepository.queryPromotions({
        page: 2,
        limit: 20,
        type: 'discount',
        status: 'active',
        keyword: 'summer',
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotions', {
        params: {
          page: 2,
          limit: 20,
          type: 'discount',
          status: 'active',
          keyword: 'summer',
        },
      });
    });

    it('includes only page when other params undefined', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await promotionRepository.queryPromotions({ page: 1 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotions', {
        params: {
          page: 1,
        },
      });
    });

    it('includes only limit when other params undefined', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await promotionRepository.queryPromotions({ limit: 50 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotions', {
        params: {
          limit: 50,
        },
      });
    });

    it('includes only type when other params undefined', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await promotionRepository.queryPromotions({ type: 'voucher' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotions', {
        params: {
          type: 'voucher',
        },
      });
    });

    it('includes only status when other params undefined', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await promotionRepository.queryPromotions({ status: 'inactive' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotions', {
        params: {
          status: 'inactive',
        },
      });
    });

    it('includes keyword when provided', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await promotionRepository.queryPromotions({ keyword: 'black friday' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotions', {
        params: {
          keyword: 'black friday',
        },
      });
    });

    it('omits keyword when empty string', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await promotionRepository.queryPromotions({ keyword: '' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotions', {
        params: {},
      });
    });

    it('transforms docs to data in response', async () => {
      const mockResponse = {
        data: {
          docs: [{ id: 'p1', name: 'Promo 1' }],
          totalDocs: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.data).toEqual([{ id: 'p1', name: 'Promo 1' }]);
    });

    it('transforms totalDocs to total in response', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 42,
          page: 1,
          limit: 10,
          totalPages: 5,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.total).toBe(42);
    });

    it('uses default empty array for missing docs', async () => {
      const mockResponse = {
        data: {
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.data).toEqual([]);
    });

    it('uses default 0 for missing totalDocs', async () => {
      const mockResponse = {
        data: {
          docs: [],
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.total).toBe(0);
    });

    it('uses default 1 for missing page', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.page).toBe(1);
    });

    it('uses default 10 for missing limit', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.limit).toBe(10);
    });

    it('uses default 0 for missing totalPages', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.totalPages).toBe(0);
    });

    it('preserves page from response', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
          page: 3,
          limit: 10,
          totalPages: 5,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.page).toBe(3);
    });

    it('preserves limit from response', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 0,
          page: 1,
          limit: 25,
          totalPages: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.limit).toBe(25);
    });

    it('preserves totalPages from response', async () => {
      const mockResponse = {
        data: {
          docs: [],
          totalDocs: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.queryPromotions({});

      expect(result.totalPages).toBe(10);
    });
  });

  describe('getPromotion', () => {
    it('calls GET /promotions/:id', async () => {
      const mockResponse = {
        data: {
          id: 'p1',
          name: 'Summer Sale',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await promotionRepository.getPromotion('p1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/promotions/p1');
    });

    it('returns Promotion from response', async () => {
      const mockPromotion = {
        id: 'p1',
        name: 'Black Friday',
        type: 'discount',
      };
      const mockResponse = { data: mockPromotion };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await promotionRepository.getPromotion('p1');

      expect(result).toEqual(mockPromotion);
    });
  });

  describe('createPromotion', () => {
    it('calls POST /promotions', async () => {
      const mockData = {
        name: 'New Promo',
        type: 'voucher',
        status: 'active',
      };
      const mockResponse = {
        data: {
          id: 'p1',
          ...mockData,
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await promotionRepository.createPromotion(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/promotions', mockData);
    });

    it('returns created Promotion', async () => {
      const mockData = {
        name: 'Test Promo',
        type: 'discount',
      };
      const mockPromotion = {
        id: 'p1',
        name: 'Test Promo',
        type: 'discount',
      };
      const mockResponse = { data: mockPromotion };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await promotionRepository.createPromotion(mockData);

      expect(result).toEqual(mockPromotion);
    });
  });

  describe('updatePromotion', () => {
    it('calls PATCH /promotions/:id', async () => {
      const mockData = {
        name: 'Updated Promo',
      };
      const mockResponse = {
        data: {
          id: 'p1',
          ...mockData,
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await promotionRepository.updatePromotion('p1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/promotions/p1', mockData);
    });

    it('returns updated Promotion', async () => {
      const mockData = {
        status: 'inactive',
      };
      const mockPromotion = {
        id: 'p1',
        name: 'Test',
        status: 'inactive',
      };
      const mockResponse = { data: mockPromotion };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await promotionRepository.updatePromotion('p1', mockData);

      expect(result).toEqual(mockPromotion);
    });
  });

  describe('deletePromotion', () => {
    it('calls DELETE /promotions/:id', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      await promotionRepository.deletePromotion('p1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/promotions/p1');
    });

    it('returns void', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      const result = await promotionRepository.deletePromotion('p1');

      expect(result).toBeUndefined();
    });
  });

  describe('pausePromotion', () => {
    it('calls PATCH /promotions/:id/pause', async () => {
      const mockResponse = {
        data: {
          id: 'p1',
          status: 'paused',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await promotionRepository.pausePromotion('p1');

      expect(axiosInstance.patch).toHaveBeenCalledWith('/promotions/p1/pause');
    });

    it('returns updated Promotion', async () => {
      const mockPromotion = {
        id: 'p1',
        name: 'Test Promo',
        status: 'paused',
      };
      const mockResponse = { data: mockPromotion };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await promotionRepository.pausePromotion('p1');

      expect(result).toEqual(mockPromotion);
    });
  });

  describe('resumePromotion', () => {
    it('calls PATCH /promotions/:id/resume', async () => {
      const mockResponse = {
        data: {
          id: 'p1',
          status: 'active',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await promotionRepository.resumePromotion('p1');

      expect(axiosInstance.patch).toHaveBeenCalledWith('/promotions/p1/resume');
    });

    it('returns updated Promotion', async () => {
      const mockPromotion = {
        id: 'p1',
        name: 'Test Promo',
        status: 'active',
      };
      const mockResponse = { data: mockPromotion };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await promotionRepository.resumePromotion('p1');

      expect(result).toEqual(mockPromotion);
    });
  });
});
