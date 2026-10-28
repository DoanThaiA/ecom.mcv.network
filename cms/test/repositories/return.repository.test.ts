import { describe, it, expect, vi, beforeEach } from 'vitest';
import { returnRepository } from 'src/repositories/return.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('returnRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports returnRepository instance', () => {
    expect(returnRepository).toBeDefined();
    expect(returnRepository).toHaveProperty('getReturns');
    expect(returnRepository).toHaveProperty('getTabCounts');
    expect(returnRepository).toHaveProperty('getReturnById');
    expect(returnRepository).toHaveProperty('updateReturnStatus');
  });

  describe('getReturns', () => {
    it('calls GET /return-requests with default page and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({});

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
        },
      });
    });

    it('uses provided page and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({ page: 2, limit: 20 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 2,
          limit: 20,
        },
      });
    });

    it('maps tab to status (pending)', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { tab: 'pending' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          status: 'pending',
        },
      });
    });

    it('maps tab to status (confirmed → approved)', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { tab: 'confirmed' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          status: 'approved',
        },
      });
    });

    it('maps tab to status (refunded → completed)', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { tab: 'refunded' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          status: 'completed',
        },
      });
    });

    it('maps tab to status (rejected)', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { tab: 'rejected' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          status: 'rejected',
        },
      });
    });

    it('ignores tab when value is "all"', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { tab: 'all' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
        },
      });
    });

    it('uses direct status filter over tab', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { tab: 'pending', status: 'confirmed' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          status: 'approved',
        },
      });
    });

    it('maps type refund to return', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { type: 'refund' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          requestType: 'return',
        },
      });
    });

    it('maps type exchange to exchange', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { type: 'exchange' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          requestType: 'exchange',
        },
      });
    });

    it('includes orderNumber filter', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { orderNumber: 'ORD123' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          orderNumber: 'ORD123',
        },
      });
    });

    it('includes fromDate filter', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { fromDate: '2024-01-01' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          fromDate: '2024-01-01',
        },
      });
    });

    it('includes toDate filter', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturns({
        filters: { toDate: '2024-12-31' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 10,
          toDate: '2024-12-31',
        },
      });
    });

    it('maps backend response to frontend format', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'ret1',
              status: 'pending',
              requestType: 'return',
              returnReasons: ['wrong_product'],
              otherReason: null,
              images: ['image1.jpg'],
              adminNote: 'Test note',
              customer: {
                name: 'John Doe',
                phone: '0123456789',
                email: 'john@example.com',
                address: '123 Street',
              },
              orderSnapshot: {
                orderId: 'o1',
                orderNumber: 'ORD001',
                orderAmount: 1000,
                items: [
                  {
                    productId: 'p1',
                    variantId: 'v1',
                    code: 'CODE1',
                    name: 'Product 1',
                    image: 'product1.jpg',
                    price: 500,
                    quantity: 2,
                  },
                ],
                nhanh: { id: 'nh1' },
              },
              bankInfo: {
                bankName: 'Test Bank',
                accountNumber: '123456',
                accountHolder: 'John Doe',
              },
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturns({});

      expect(result.data[0]).toMatchObject({
        id: 'ret1',
        returnNumber: 'RET-ORD001',
        orderId: 'o1',
        orderNumber: 'ORD001',
        customer: {
          name: 'John Doe',
          phone: '0123456789',
          email: 'john@example.com',
          address: '123 Street',
        },
        items: [
          {
            productId: 'p1',
            variantId: 'v1',
            code: 'CODE1',
            name: 'Product 1',
            image: 'product1.jpg',
            price: 500,
            quantity: 2,
            subtotal: 1000,
          },
        ],
        type: 'refund',
        reason: 'wrongItem',
        reasonDetail: null,
        amount: 1000,
        status: 'pending',
        images: ['image1.jpg'],
        adminNote: 'Test note',
        bankName: 'Test Bank',
        bankAccountNumber: '123456',
        bankAccountName: 'John Doe',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      });
    });

    it('handles missing orderSnapshot', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'ret1',
              status: 'pending',
              requestType: 'return',
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturns({});

      expect(result.data[0].returnNumber).toBe('RET-N/A');
      expect(result.data[0].orderSnapshot).toBeNull();
    });

    it('handles defective reason', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'ret1',
              status: 'pending',
              requestType: 'return',
              returnReasons: ['defective'],
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturns({});

      expect(result.data[0].reason).toBe('defective');
    });

    it('handles damaged reason', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'ret1',
              status: 'pending',
              requestType: 'return',
              returnReasons: ['damaged'],
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturns({});

      expect(result.data[0].reason).toBe('notAsDescribed');
    });

    it('handles poor_quality reason', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'ret1',
              status: 'pending',
              requestType: 'return',
              returnReasons: ['poor_quality'],
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturns({});

      expect(result.data[0].reason).toBe('notAsDescribed');
    });

    it('handles exchange reasons', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 'ret1',
              status: 'pending',
              requestType: 'exchange',
              exchangeReasons: ['other'],
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturns({});

      expect(result.data[0].reason).toBe('other');
    });

    it('calculates hasNextPage correctly', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
          page: 2,
          totalPages: 5,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturns({ page: 2 });

      expect(result.hasNextPage).toBe(true);
    });

    it('calculates totalPages from total and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 25,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturns({ limit: 10 });

      expect(result.totalPages).toBe(3);
    });
  });

  describe('getTabCounts', () => {
    it('fetches all returns and counts by status', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', status: 'pending', requestType: 'return' },
            { id: '2', status: 'pending', requestType: 'return' },
            { id: '3', status: 'approved', requestType: 'return' },
            { id: '4', status: 'completed', requestType: 'return' },
            { id: '5', status: 'rejected', requestType: 'return' },
          ],
          total: 5,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getTabCounts();

      expect(result).toEqual({
        all: 5,
        pending: 2,
        confirmed: 1,
        refunded: 1,
        rejected: 1,
      });
    });

    it('filters by type when provided', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', status: 'pending', requestType: 'return' }],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getTabCounts('refund');

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests', {
        params: {
          page: 1,
          limit: 1000,
          requestType: 'return',
        },
      });
    });

    it('returns zero counts on error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

      const result = await returnRepository.getTabCounts();

      expect(result).toEqual({
        all: 0,
        pending: 0,
        confirmed: 0,
        refunded: 0,
        rejected: 0,
      });
    });
  });

  describe('getReturnById', () => {
    it('calls GET /return-requests/:id', async () => {
      const mockResponse = {
        data: {
          id: 'ret1',
          status: 'pending',
          requestType: 'return',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await returnRepository.getReturnById('ret1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/return-requests/ret1');
    });

    it('returns mapped ReturnRequest', async () => {
      const mockResponse = {
        data: {
          id: 'ret1',
          status: 'approved',
          requestType: 'exchange',
          exchangeReasons: ['other'],
          customer: {
            name: 'Jane Doe',
            phone: '0987654321',
          },
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await returnRepository.getReturnById('ret1');

      expect(result.id).toBe('ret1');
      expect(result.status).toBe('confirmed');
      expect(result.type).toBe('exchange');
    });
  });

  describe('updateReturnStatus', () => {
    it('calls PATCH /return-requests/:id with mapped status', async () => {
      const mockResponse = {
        data: {
          id: 'ret1',
          status: 'approved',
          requestType: 'return',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await returnRepository.updateReturnStatus('ret1', {
        status: 'confirmed',
        adminNote: 'Approved by admin',
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/return-requests/ret1', {
        status: 'approved',
        adminNote: 'Approved by admin',
      });
    });

    it('maps pending status', async () => {
      const mockResponse = {
        data: {
          id: 'ret1',
          status: 'pending',
          requestType: 'return',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await returnRepository.updateReturnStatus('ret1', {
        status: 'pending',
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/return-requests/ret1', {
        status: 'pending',
        adminNote: undefined,
      });
    });

    it('maps refunded to completed', async () => {
      const mockResponse = {
        data: {
          id: 'ret1',
          status: 'completed',
          requestType: 'return',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await returnRepository.updateReturnStatus('ret1', {
        status: 'refunded',
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/return-requests/ret1', {
        status: 'completed',
        adminNote: undefined,
      });
    });

    it('maps rejected status', async () => {
      const mockResponse = {
        data: {
          id: 'ret1',
          status: 'rejected',
          requestType: 'return',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await returnRepository.updateReturnStatus('ret1', {
        status: 'rejected',
        adminNote: 'Invalid request',
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/return-requests/ret1', {
        status: 'rejected',
        adminNote: 'Invalid request',
      });
    });

    it('returns mapped ReturnRequest', async () => {
      const mockResponse = {
        data: {
          id: 'ret1',
          status: 'completed',
          requestType: 'return',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await returnRepository.updateReturnStatus('ret1', {
        status: 'refunded',
      });

      expect(result.id).toBe('ret1');
      expect(result.status).toBe('refunded');
    });
  });
});
