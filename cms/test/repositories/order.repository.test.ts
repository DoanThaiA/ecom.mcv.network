import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderRepository } from 'src/repositories/order.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('orderRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports orderRepository instance', () => {
    expect(orderRepository).toBeDefined();
    expect(orderRepository).toHaveProperty('getOrders');
    expect(orderRepository).toHaveProperty('getOrderById');
    expect(orderRepository).toHaveProperty('updateOrderStatus');
    expect(orderRepository).toHaveProperty('updatePaymentStatus');
  });

  describe('getOrders', () => {
    it('calls GET /orders with default page and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({});

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
        },
      });
    });

    it('uses provided page and limit', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({ page: 2, limit: 20 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 2,
          limit: 20,
        },
      });
    });

    it('includes explicit status filter', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { status: 'delivered' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({ status: 'delivered' }),
        },
      });
    });

    it('uses tab as status when status not provided and tab is not all', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { tab: 'pending' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({ status: 'pending' }),
        },
      });
    });

    it('ignores tab when it is all', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { tab: 'all' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
        },
      });
    });

    it('prefers explicit status over tab', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { status: 'delivered', tab: 'pending' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({ status: 'delivered' }),
        },
      });
    });

    it('includes paymentStatus filter', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { paymentStatus: 'paid' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({ paymentStatus: 'paid' }),
        },
      });
    });

    it('includes orderNumber filter', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { orderNumber: 'ORD123' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({ orderNumber: 'ORD123' }),
        },
      });
    });

    it('includes phone filter', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { phone: '0123456789' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({ phone: '0123456789' }),
        },
      });
    });

    it('includes fromDate filter', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { fromDate: '2024-01-01' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({ fromDate: '2024-01-01' }),
        },
      });
    });

    it('includes toDate filter', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: { toDate: '2024-12-31' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({ toDate: '2024-12-31' }),
        },
      });
    });

    it('includes sort when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const sort = [{ field: 'createdAt', order: 'desc' }];
      await orderRepository.getOrders({ sort });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          sort: JSON.stringify(sort),
        },
      });
    });

    it('handles empty filters object', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({ filters: {} });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
        },
      });
    });

    it('combines multiple filters', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrders({
        filters: {
          status: 'delivered',
          paymentStatus: 'paid',
          orderNumber: 'ORD123',
          phone: '0123456789',
          fromDate: '2024-01-01',
          toDate: '2024-12-31',
        },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders', {
        params: {
          page: 1,
          limit: 10,
          filters: JSON.stringify({
            status: 'delivered',
            paymentStatus: 'paid',
            orderNumber: 'ORD123',
            phone: '0123456789',
            fromDate: '2024-01-01',
            toDate: '2024-12-31',
          }),
        },
      });
    });

    it('returns GetOrdersResponse', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 'o1', orderNumber: 'ORD123' }],
          total: 1,
          page: 1,
          limit: 10,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await orderRepository.getOrders({});

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getOrderById', () => {
    it('calls GET /orders/:id', async () => {
      const mockResponse = {
        data: {
          id: 'o1',
          orderNumber: 'ORD123',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await orderRepository.getOrderById('o1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/orders/o1');
    });

    it('returns Order', async () => {
      const mockOrder = {
        id: 'o1',
        orderNumber: 'ORD123',
        status: 'pending',
      };
      const mockResponse = { data: mockOrder };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await orderRepository.getOrderById('o1');

      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('calls PATCH /orders/:id/status without reason', async () => {
      const mockResponse = {
        data: {
          id: 'o1',
          status: 'delivered',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await orderRepository.updateOrderStatus('o1', 'delivered');

      expect(axiosInstance.patch).toHaveBeenCalledWith('/orders/o1/status', {
        status: 'delivered',
        reason: undefined,
      });
    });

    it('calls PATCH /orders/:id/status with reason', async () => {
      const mockResponse = {
        data: {
          id: 'o1',
          status: 'cancelled',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await orderRepository.updateOrderStatus('o1', 'cancelled', 'Out of stock');

      expect(axiosInstance.patch).toHaveBeenCalledWith('/orders/o1/status', {
        status: 'cancelled',
        reason: 'Out of stock',
      });
    });

    it('returns updated Order', async () => {
      const mockOrder = {
        id: 'o1',
        orderNumber: 'ORD123',
        status: 'delivered',
      };
      const mockResponse = { data: mockOrder };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await orderRepository.updateOrderStatus('o1', 'delivered');

      expect(result).toEqual(mockOrder);
    });
  });

  describe('updatePaymentStatus', () => {
    it('calls PATCH /orders/:id/payment-status', async () => {
      const mockResponse = {
        data: {
          id: 'o1',
          paymentStatus: 'paid',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await orderRepository.updatePaymentStatus('o1', 'paid');

      expect(axiosInstance.patch).toHaveBeenCalledWith('/orders/o1/payment-status', {
        paymentStatus: 'paid',
      });
    });

    it('returns updated Order', async () => {
      const mockOrder = {
        id: 'o1',
        orderNumber: 'ORD123',
        paymentStatus: 'paid',
      };
      const mockResponse = { data: mockOrder };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await orderRepository.updatePaymentStatus('o1', 'paid');

      expect(result).toEqual(mockOrder);
    });
  });
});
