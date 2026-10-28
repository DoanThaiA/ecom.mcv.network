import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  orderRepository,
  type CreateOrderPayload,
  type CreateOrderFromCartPayload,
} from '@/lib/repositories/order.repository';
import axiosInstance from '@/lib/axios';
import type {
  Order,
  PaymentMethod,
} from '@/types/gen/shop/shared/orders/order';
import type { UpdatePaymentResponse } from '@/types/gen/shop/shop/shop/shop';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('OrderRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('creates order successfully', async () => {
      const payload: CreateOrderPayload = {
        customer: {
          name: 'John Doe',
          phone: '0123456789',
          email: 'john@example.com',
        },
        shippingAddress: {
          address: '123 Main St',
          ward: 'Ward 1',
          district: 'District 1',
          city: 'Ho Chi Minh',
          cityId: 1,
          districtId: 10,
          wardId: 100,
        },
        items: [
          {
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 2,
          },
        ],
        paymentMethod: 'COD' as PaymentMethod,
        note: 'Please deliver in the morning',
      };

      const mockOrder: Order = {
        id: 'order-123',
        orderNumber: 'ORD-001',
      } as Order;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockOrder,
      });

      const result = await orderRepository.createOrder(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/shop/orders', {
        customer: {
          name: 'John Doe',
          phone: '0123456789',
          email: 'john@example.com',
        },
        shippingAddress: {
          address: '123 Main St',
          ward: 'Ward 1',
          district: 'District 1',
          city: 'Ho Chi Minh',
        },
        items: payload.items,
        paymentMethod: 'COD',
        note: 'Please deliver in the morning',
      });

      expect(result).toEqual(mockOrder);
    });

    it('creates order without optional fields', async () => {
      const payload: CreateOrderPayload = {
        customer: {
          name: 'Jane Doe',
          phone: '0987654321',
        },
        shippingAddress: {
          address: '456 Second St',
          city: 'Hanoi',
        },
        items: [
          {
            productId: 'prod-2',
            quantity: 1,
          },
        ],
        paymentMethod: 'BANK_TRANSFER' as PaymentMethod,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'order-456' } as Order,
      });

      await orderRepository.createOrder(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith('/shop/orders', {
        customer: {
          name: 'Jane Doe',
          phone: '0987654321',
          email: undefined,
        },
        shippingAddress: {
          address: '456 Second St',
          ward: undefined,
          district: undefined,
          city: 'Hanoi',
        },
        items: payload.items,
        paymentMethod: 'BANK_TRANSFER',
        note: undefined,
      });
    });

    it('propagates API errors', async () => {
      const payload: CreateOrderPayload = {
        customer: { name: 'Test', phone: '123' },
        shippingAddress: { address: 'Test', city: 'Test' },
        items: [],
        paymentMethod: 'COD' as PaymentMethod,
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Order creation failed')
      );

      await expect(orderRepository.createOrder(payload)).rejects.toThrow(
        'Order creation failed'
      );
    });
  });

  describe('createOrderFromCart', () => {
    it('creates order from cart successfully', async () => {
      const payload: CreateOrderFromCartPayload = {
        customer: {
          name: 'John Doe',
          phone: '0123456789',
          email: 'john@example.com',
        },
        shippingAddress: {
          address: '123 Main St',
          ward: 'Ward 1',
          district: 'District 1',
          city: 'Ho Chi Minh',
          cityId: 1,
          districtId: 10,
          wardId: 100,
        },
        paymentMethod: 'COD',
        note: 'Fast delivery please',
        selectedItems: [
          { productId: 'prod-1', variantId: 'var-1' },
          { productId: 'prod-2' },
        ],
      };

      const mockOrder: Order = {
        id: 'order-789',
        orderNumber: 'ORD-002',
      } as Order;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockOrder,
      });

      const result = await orderRepository.createOrderFromCart(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/orders/from-cart',
        payload
      );

      expect(result).toEqual(mockOrder);
    });

    it('creates order from cart without optional fields', async () => {
      const payload: CreateOrderFromCartPayload = {
        customer: {
          name: 'Jane Doe',
          phone: '0987654321',
        },
        shippingAddress: {
          address: '456 Second St',
          ward: 'Ward 2',
          district: 'District 2',
          city: 'Hanoi',
          cityId: 2,
          districtId: 20,
          wardId: 200,
        },
        paymentMethod: 'BANK_TRANSFER',
        selectedItems: [{ productId: 'prod-3' }],
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: { id: 'order-999' } as Order,
      });

      await orderRepository.createOrderFromCart(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/shop/orders/from-cart',
        payload
      );
    });

    it('propagates API errors', async () => {
      const payload: CreateOrderFromCartPayload = {
        customer: { name: 'Test', phone: '123' },
        shippingAddress: {
          address: 'Test',
          ward: 'Test',
          district: 'Test',
          city: 'Test',
          cityId: 1,
          districtId: 1,
          wardId: 1,
        },
        paymentMethod: 'COD',
        selectedItems: [],
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Cart is empty')
      );

      await expect(
        orderRepository.createOrderFromCart(payload)
      ).rejects.toThrow('Cart is empty');
    });
  });

  describe('getOrders', () => {
    it('fetches user orders successfully', async () => {
      const mockOrders: Order[] = [
        { id: 'order-1', orderNumber: 'ORD-001' } as Order,
        { id: 'order-2', orderNumber: 'ORD-002' } as Order,
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockOrders,
      });

      const result = await orderRepository.getOrders();

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/orders', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockOrders);
      expect(result).toHaveLength(2);
    });

    it('handles empty orders array', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: [],
      });

      const result = await orderRepository.getOrders();

      expect(result).toEqual([]);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      await expect(orderRepository.getOrders()).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('getOrderById', () => {
    it('fetches order by ID successfully', async () => {
      const mockOrder: Order = {
        id: 'order-123',
        orderNumber: 'ORD-001',
      } as Order;

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockOrder,
      });

      const result = await orderRepository.getOrderById('order-123');

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/orders/order-123');
      expect(result).toEqual(mockOrder);
    });

    it('handles different order IDs', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { id: 'order-456' } as Order,
      });

      await orderRepository.getOrderById('order-456');

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/orders/order-456');
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Order not found')
      );

      await expect(
        orderRepository.getOrderById('invalid-id')
      ).rejects.toThrow('Order not found');
    });
  });

  describe('getOrderByIdFormatResponse', () => {
    it('fetches order by ID with any format', async () => {
      const mockResponse = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        customField: 'custom value',
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await orderRepository.getOrderByIdFormatResponse(
        'order-123'
      );

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/orders/order-123');
      expect(result).toEqual(mockResponse);
    });

    it('handles different order IDs', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { id: 'order-789' },
      });

      await orderRepository.getOrderByIdFormatResponse('order-789');

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/orders/order-789');
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Server error')
      );

      await expect(
        orderRepository.getOrderByIdFormatResponse('order-id')
      ).rejects.toThrow('Server error');
    });
  });

  describe('getOrderByNumber', () => {
    it('fetches order by order number successfully', async () => {
      const mockOrder: Order = {
        id: 'order-123',
        orderNumber: 'ORD-001',
      } as Order;

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockOrder,
      });

      const result = await orderRepository.getOrderByNumber('ORD-001');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/orders/number/ORD-001'
      );
      expect(result).toEqual(mockOrder);
    });

    it('handles different order numbers', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { orderNumber: 'ORD-999' } as Order,
      });

      await orderRepository.getOrderByNumber('ORD-999');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/orders/number/ORD-999'
      );
    });

    it('handles order numbers with special characters', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { orderNumber: 'ORD-2024-001' } as Order,
      });

      await orderRepository.getOrderByNumber('ORD-2024-001');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/orders/number/ORD-2024-001'
      );
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Order not found')
      );

      await expect(
        orderRepository.getOrderByNumber('INVALID')
      ).rejects.toThrow('Order not found');
    });
  });

  describe('updateOrderPayment', () => {
    it('updates order payment method successfully', async () => {
      const mockResponse: UpdatePaymentResponse = {
        order: { id: 'order-123', orderNumber: 'ORD-001' } as Order,
        paymentUrl: 'https://payment.example.com/pay/123',
      };

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await orderRepository.updateOrderPayment(
        'order-123',
        'VNPAY' as PaymentMethod
      );

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/shop/orders/order-123/payment',
        {
          orderId: 'order-123',
          paymentMethod: 'VNPAY',
        }
      );

      expect(result).toEqual(mockResponse);
      expect(result.paymentUrl).toBe('https://payment.example.com/pay/123');
    });

    it('updates to COD payment method', async () => {
      const mockResponse: UpdatePaymentResponse = {
        order: { id: 'order-456' } as Order,
      };

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await orderRepository.updateOrderPayment(
        'order-456',
        'COD' as PaymentMethod
      );

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/shop/orders/order-456/payment',
        {
          orderId: 'order-456',
          paymentMethod: 'COD',
        }
      );

      expect(result.paymentUrl).toBeUndefined();
    });

    it('handles different order IDs', async () => {
      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: { order: { id: 'order-789' } } as UpdatePaymentResponse,
      });

      await orderRepository.updateOrderPayment(
        'order-789',
        'BANK_TRANSFER' as PaymentMethod
      );

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/shop/orders/order-789/payment',
        expect.objectContaining({
          orderId: 'order-789',
        })
      );
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.patch).mockRejectedValueOnce(
        new Error('Payment update failed')
      );

      await expect(
        orderRepository.updateOrderPayment('order-123', 'VNPAY' as PaymentMethod)
      ).rejects.toThrow('Payment update failed');
    });
  });
});
