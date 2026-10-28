import { describe, it, expect, vi, beforeEach } from 'vitest';
import { comboRepository } from 'src/repositories/combo.repository';
import axiosInstance from 'src/utils/axios';
import { ComboStatus, DiscountType } from 'src/types/gen/shared/shared/common/enums';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('src/utils/enum-converter', async () => {
  const enums = await import('src/types/gen/shared/shared/common/enums');
  return {
    COMBO_STATUS_API: {
      [enums.ComboStatus.COMBO_STATUS_ACTIVE]: 'active',
      [enums.ComboStatus.COMBO_STATUS_INACTIVE]: 'inactive',
    },
    DISCOUNT_TYPE_API: {
      [enums.DiscountType.DISCOUNT_TYPE_FIXED]: 'fixed',
      [enums.DiscountType.DISCOUNT_TYPE_PERCENTAGE]: 'percentage',
    },
    API_COMBO_STATUS: {
      active: enums.ComboStatus.COMBO_STATUS_ACTIVE,
      inactive: enums.ComboStatus.COMBO_STATUS_INACTIVE,
    },
    API_DISCOUNT_TYPE: {
      fixed: enums.DiscountType.DISCOUNT_TYPE_FIXED,
      percentage: enums.DiscountType.DISCOUNT_TYPE_PERCENTAGE,
    },
  };
});

describe('comboRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports comboRepository instance', () => {
    expect(comboRepository).toBeDefined();
    expect(comboRepository).toHaveProperty('getCombos');
    expect(comboRepository).toHaveProperty('getComboById');
    expect(comboRepository).toHaveProperty('createCombo');
    expect(comboRepository).toHaveProperty('updateCombo');
    expect(comboRepository).toHaveProperty('deleteCombo');
  });

  describe('getCombos', () => {
    it('calls GET /combos', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await comboRepository.getCombos({});

      expect(axiosInstance.get).toHaveBeenCalledWith('/combos', {
        params: {},
      });
    });

    it('passes page parameter', async () => {
      const mockResponse = { data: { data: [], total: 0, page: 2, limit: 10 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await comboRepository.getCombos({ page: 2 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/combos', {
        params: { page: '2' },
      });
    });

    it('passes limit parameter', async () => {
      const mockResponse = { data: { data: [], total: 0, page: 1, limit: 20 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await comboRepository.getCombos({ limit: 20 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/combos', {
        params: { limit: '20' },
      });
    });

    it('passes filters as JSON string', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const filters = { name: 'test', status: ComboStatus.COMBO_STATUS_ACTIVE };
      await comboRepository.getCombos({ filters });

      expect(axiosInstance.get).toHaveBeenCalledWith('/combos', {
        params: { filters: JSON.stringify(filters) },
      });
    });

    it('passes sort as JSON string', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const sort = [{ field: 'createdAt', direction: 'desc' }];
      await comboRepository.getCombos({ sort });

      expect(axiosInstance.get).toHaveBeenCalledWith('/combos', {
        params: { sort: JSON.stringify(sort) },
      });
    });

    it('converts API status to enum', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'combo1',
              name: 'Test Combo',
              status: 'active',
              discountType: 'fixed',
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await comboRepository.getCombos({});

      expect(result.data[0].status).toBe(ComboStatus.COMBO_STATUS_ACTIVE);
    });

    it('converts API discountType to enum', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'combo1',
              name: 'Test Combo',
              status: 'active',
              discountType: 'percentage',
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await comboRepository.getCombos({});

      expect(result.data[0].discountType).toBe(DiscountType.DISCOUNT_TYPE_PERCENTAGE);
    });

    it('handles empty sort array', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await comboRepository.getCombos({ sort: [] });

      expect(axiosInstance.get).toHaveBeenCalledWith('/combos', {
        params: {},
      });
    });
  });

  describe('getComboById', () => {
    it('calls GET /combos/:id', async () => {
      const mockResponse = {
        data: {
          id: 'combo1',
          name: 'Test',
          status: 'active',
          discountType: 'fixed',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await comboRepository.getComboById('combo1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/combos/combo1');
    });

    it('converts API status to enum', async () => {
      const mockResponse = {
        data: {
          id: 'combo1',
          status: 'inactive',
          discountType: 'fixed',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await comboRepository.getComboById('combo1');

      expect(result.status).toBe(ComboStatus.COMBO_STATUS_INACTIVE);
    });

    it('converts API discountType to enum', async () => {
      const mockResponse = {
        data: {
          id: 'combo1',
          status: 'active',
          discountType: 'percentage',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await comboRepository.getComboById('combo1');

      expect(result.discountType).toBe(DiscountType.DISCOUNT_TYPE_PERCENTAGE);
    });
  });

  describe('createCombo', () => {
    it('calls POST /combos', async () => {
      const mockRequest = {
        name: 'New Combo',
        status: ComboStatus.COMBO_STATUS_ACTIVE,
        discountType: DiscountType.DISCOUNT_TYPE_FIXED,
        discountValue: 100,
      };
      const mockResponse = { data: { id: 'combo1', ...mockRequest } };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await comboRepository.createCombo(mockRequest);

      expect(axiosInstance.post).toHaveBeenCalledWith('/combos', {
        name: 'New Combo',
        status: 'active',
        discountType: 'fixed',
        discountValue: 100,
      });
    });

    it('converts enum status to API format', async () => {
      const mockRequest = {
        name: 'Test',
        status: ComboStatus.COMBO_STATUS_INACTIVE,
        discountType: DiscountType.DISCOUNT_TYPE_FIXED,
        discountValue: 50,
      };
      const mockResponse = { data: mockRequest };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await comboRepository.createCombo(mockRequest);

      const callArgs = vi.mocked(axiosInstance.post).mock.calls[0][1];
      expect(callArgs).toHaveProperty('status', 'inactive');
    });

    it('converts enum discountType to API format', async () => {
      const mockRequest = {
        name: 'Test',
        status: ComboStatus.COMBO_STATUS_ACTIVE,
        discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
        discountValue: 20,
      };
      const mockResponse = { data: mockRequest };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await comboRepository.createCombo(mockRequest);

      const callArgs = vi.mocked(axiosInstance.post).mock.calls[0][1];
      expect(callArgs).toHaveProperty('discountType', 'percentage');
    });
  });

  describe('updateCombo', () => {
    it('calls PATCH /combos/:id', async () => {
      const mockData = {
        name: 'Updated Combo',
      };
      const mockResponse = { data: { id: 'combo1', ...mockData } };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await comboRepository.updateCombo('combo1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/combos/combo1', mockData);
    });

    it('converts enum status to API format when provided', async () => {
      const mockData = {
        status: ComboStatus.COMBO_STATUS_INACTIVE,
      };
      const mockResponse = { data: mockData };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await comboRepository.updateCombo('combo1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/combos/combo1', {
        status: 'inactive',
      });
    });

    it('converts enum discountType to API format when provided', async () => {
      const mockData = {
        discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
      };
      const mockResponse = { data: mockData };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await comboRepository.updateCombo('combo1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/combos/combo1', {
        discountType: 'percentage',
      });
    });

    it('does not convert status when undefined', async () => {
      const mockData = {
        name: 'Updated',
      };
      const mockResponse = { data: mockData };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await comboRepository.updateCombo('combo1', mockData);

      const callArgs = vi.mocked(axiosInstance.patch).mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('status');
    });

    it('does not convert discountType when undefined', async () => {
      const mockData = {
        name: 'Updated',
      };
      const mockResponse = { data: mockData };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await comboRepository.updateCombo('combo1', mockData);

      const callArgs = vi.mocked(axiosInstance.patch).mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('discountType');
    });

    it('updates both status and discountType together', async () => {
      const mockData = {
        status: ComboStatus.COMBO_STATUS_ACTIVE,
        discountType: DiscountType.DISCOUNT_TYPE_FIXED,
      };
      const mockResponse = { data: mockData };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await comboRepository.updateCombo('combo1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/combos/combo1', {
        status: 'active',
        discountType: 'fixed',
      });
    });
  });

  describe('deleteCombo', () => {
    it('calls DELETE /combos/:id', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      await comboRepository.deleteCombo('combo1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/combos/combo1');
    });

    it('returns void', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      const result = await comboRepository.deleteCombo('combo1');

      expect(result).toBeUndefined();
    });
  });
});
