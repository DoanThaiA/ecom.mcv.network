import { describe, it, expect } from 'vitest';
import { mapApiOrderToOrder } from '@/lib/utils/orderMapper';
import {
  OrderStatus as ApiOrderStatus,
  PaymentStatus as ApiPaymentStatus,
} from '@/types/gen/shop/shared/orders/order';

describe('mapApiOrderToOrder', () => {
  it('maps complete API order to frontend order', () => {
    const apiOrder = {
      id: 'order-123',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_CONFIRMED,
      paymentStatus: ApiPaymentStatus.PAYMENT_STATUS_PAID,
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [
        {
          productId: 'product-1',
          name: 'Product 1',
          price: 50000,
          quantity: 2,
          image: 'https://example.com/image1.jpg',
        },
      ],
    };

    const result = mapApiOrderToOrder(apiOrder);

    expect(result).toEqual({
      id: 'order-123',
      orderNumber: 'ORD-001',
      status: 'confirmed',
      paymentStatus: 'paid',
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [
        {
          id: 'order-123-0',
          productId: 'product-1',
          name: 'Product 1',
          price: 50000,
          quantity: 2,
          image: 'https://example.com/image1.jpg',
        },
      ],
    });
  });

  it('maps order status enum values correctly', () => {
    const statuses: Array<[ApiOrderStatus, string]> = [
      [ApiOrderStatus.ORDER_STATUS_UNSPECIFIED, 'pending'],
      [ApiOrderStatus.ORDER_STATUS_PENDING, 'pending'],
      [ApiOrderStatus.ORDER_STATUS_CONFIRMED, 'confirmed'],
      [ApiOrderStatus.ORDER_STATUS_PROCESSING, 'processing'],
      [ApiOrderStatus.ORDER_STATUS_SHIPPED, 'shipped'],
      [ApiOrderStatus.ORDER_STATUS_DELIVERED, 'delivered'],
      [ApiOrderStatus.ORDER_STATUS_CANCELLED, 'cancelled'],
      [ApiOrderStatus.ORDER_STATUS_REFUNDED, 'cancelled'],
      [ApiOrderStatus.UNRECOGNIZED, 'pending'],
    ];

    statuses.forEach(([apiStatus, expectedStatus]) => {
      const apiOrder = {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: apiStatus,
        total: 100000,
        createdAt: '2024-01-01T00:00:00Z',
        items: [],
      };

      const result = mapApiOrderToOrder(apiOrder);
      expect(result.status).toBe(expectedStatus);
    });
  });

  it('maps payment status enum values correctly', () => {
    const statuses: Array<[ApiPaymentStatus, string]> = [
      [ApiPaymentStatus.PAYMENT_STATUS_PENDING, 'pending'],
      [ApiPaymentStatus.PAYMENT_STATUS_PAID, 'paid'],
      [ApiPaymentStatus.PAYMENT_STATUS_FAILED, 'failed'],
      [ApiPaymentStatus.PAYMENT_STATUS_REFUNDED, 'refunded'],
    ];

    statuses.forEach(([apiStatus, expectedStatus]) => {
      const apiOrder = {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: ApiOrderStatus.ORDER_STATUS_PENDING,
        paymentStatus: apiStatus,
        total: 100000,
        createdAt: '2024-01-01T00:00:00Z',
        items: [],
      };

      const result = mapApiOrderToOrder(apiOrder);
      expect(result.paymentStatus).toBe(expectedStatus);
    });
  });

  it('handles UNSPECIFIED and UNRECOGNIZED payment statuses', () => {
    // UNSPECIFIED (0) is falsy, so it returns undefined
    const unspecifiedOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      paymentStatus: ApiPaymentStatus.PAYMENT_STATUS_UNSPECIFIED,
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };
    expect(mapApiOrderToOrder(unspecifiedOrder).paymentStatus).toBeUndefined();

    // UNRECOGNIZED should map to pending if it's truthy
    const unrecognizedOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      paymentStatus: ApiPaymentStatus.UNRECOGNIZED,
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };
    const result = mapApiOrderToOrder(unrecognizedOrder);
    expect(result.paymentStatus).toBe('pending');
  });

  it('handles string status with ORDER_STATUS_ prefix', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: 'ORDER_STATUS_CONFIRMED',
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.status).toBe('confirmed');
  });

  it('handles string status without prefix', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: 'delivered',
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.status).toBe('delivered');
  });

  it('handles string payment status with PAYMENT_STATUS_ prefix', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      paymentStatus: 'PAYMENT_STATUS_PAID',
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.paymentStatus).toBe('paid');
  });

  it('handles string payment status without prefix', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      paymentStatus: 'paid',
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.paymentStatus).toBe('paid');
  });

  it('handles missing payment status', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.paymentStatus).toBeUndefined();
  });

  it('handles Date object for createdAt', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      total: 100000,
      createdAt: date,
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.createdAt).toBe(date.toISOString());
  });

  it('handles string for createdAt', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
  });

  it('handles missing createdAt', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      total: 100000,
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.createdAt).toBe('');
  });

  it('maps multiple order items', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      total: 150000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [
        {
          productId: 'product-1',
          name: 'Product 1',
          price: 50000,
          quantity: 1,
          image: 'https://example.com/image1.jpg',
        },
        {
          productId: 'product-2',
          name: 'Product 2',
          price: 100000,
          quantity: 1,
          image: 'https://example.com/image2.jpg',
        },
      ],
    };

    const result = mapApiOrderToOrder(apiOrder);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('order-1-0');
    expect(result.items[1].id).toBe('order-1-1');
    expect(result.items[0].productId).toBe('product-1');
    expect(result.items[1].productId).toBe('product-2');
  });

  it('handles empty items array', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      total: 0,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.items).toEqual([]);
  });

  it('generates unique item IDs using order ID and index', () => {
    const apiOrder = {
      id: 'order-123',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [
        {
          productId: 'product-1',
          name: 'Product 1',
          price: 50000,
          quantity: 1,
        },
        {
          productId: 'product-1', // Same product
          name: 'Product 1',
          price: 50000,
          quantity: 1,
        },
      ],
    };

    const result = mapApiOrderToOrder(apiOrder);

    expect(result.items[0].id).toBe('order-123-0');
    expect(result.items[1].id).toBe('order-123-1');
  });

  it('defaults to pending for unknown status string', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: 'unknown_status',
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.status).toBe('pending');
  });

  it('defaults to pending for unknown payment status string', () => {
    const apiOrder = {
      id: 'order-1',
      orderNumber: 'ORD-001',
      status: ApiOrderStatus.ORDER_STATUS_PENDING,
      paymentStatus: 'unknown_payment',
      total: 100000,
      createdAt: '2024-01-01T00:00:00Z',
      items: [],
    };

    const result = mapApiOrderToOrder(apiOrder);
    expect(result.paymentStatus).toBe('pending');
  });
});
