import { describe, it, expect } from 'vitest';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  getOrderStatusKey,
  getOrderStatusColor,
  getPaymentStatusKey,
  getPaymentMethodKey,
  type OrderTab,
  type OrderCustomer,
  type OrderAddress,
  type OrderItem,
  type OrderDiscountDetail,
  type OrderCdpSyncInfo,
  type OrderNhanhSyncInfo,
  type Order,
  type OrderFilters,
  type OrderSort,
  type GetOrdersRequest,
  type GetOrdersResponse,
  type OrderTabCounts,
  type UpdateOrderStatusRequest,
  type UpdatePaymentStatusRequest,
} from 'src/types/orders';

describe('types/orders', () => {
  describe('Enum Exports', () => {
    it('exports OrderStatus enum', () => {
      expect(OrderStatus.PENDING).toBe('pending');
      expect(OrderStatus.CONFIRMED).toBe('confirmed');
      expect(OrderStatus.PROCESSING).toBe('processing');
      expect(OrderStatus.SHIPPED).toBe('shipped');
      expect(OrderStatus.DELIVERED).toBe('delivered');
      expect(OrderStatus.CANCELLED).toBe('cancelled');
      expect(OrderStatus.REFUNDED).toBe('refunded');
    });

    it('exports PaymentStatus enum', () => {
      expect(PaymentStatus.PENDING).toBe('pending');
      expect(PaymentStatus.PAID).toBe('paid');
      expect(PaymentStatus.FAILED).toBe('failed');
      expect(PaymentStatus.REFUNDED).toBe('refunded');
    });

    it('exports PaymentMethod enum', () => {
      expect(PaymentMethod.COD).toBe('cod');
      expect(PaymentMethod.BANK_TRANSFER).toBe('bank_transfer');
      expect(PaymentMethod.CARD).toBe('card');
      expect(PaymentMethod.EWALLET).toBe('ewallet');
    });
  });

  describe('getOrderStatusKey', () => {
    it('returns correct key for PENDING', () => {
      expect(getOrderStatusKey(OrderStatus.PENDING)).toBe('orderStatusPending');
    });

    it('returns correct key for CONFIRMED', () => {
      expect(getOrderStatusKey(OrderStatus.CONFIRMED)).toBe('orderStatusConfirmed');
    });

    it('returns correct key for PROCESSING', () => {
      expect(getOrderStatusKey(OrderStatus.PROCESSING)).toBe('orderStatusProcessing');
    });

    it('returns correct key for SHIPPED', () => {
      expect(getOrderStatusKey(OrderStatus.SHIPPED)).toBe('orderStatusShipped');
    });

    it('returns correct key for DELIVERED', () => {
      expect(getOrderStatusKey(OrderStatus.DELIVERED)).toBe('orderStatusDelivered');
    });

    it('returns correct key for CANCELLED', () => {
      expect(getOrderStatusKey(OrderStatus.CANCELLED)).toBe('orderStatusCancelled');
    });

    it('returns correct key for REFUNDED', () => {
      expect(getOrderStatusKey(OrderStatus.REFUNDED)).toBe('orderStatusRefunded');
    });
  });

  describe('getOrderStatusColor', () => {
    it('returns info for PENDING', () => {
      expect(getOrderStatusColor(OrderStatus.PENDING)).toBe('info');
    });

    it('returns primary for CONFIRMED', () => {
      expect(getOrderStatusColor(OrderStatus.CONFIRMED)).toBe('primary');
    });

    it('returns warning for PROCESSING', () => {
      expect(getOrderStatusColor(OrderStatus.PROCESSING)).toBe('warning');
    });

    it('returns secondary for SHIPPED', () => {
      expect(getOrderStatusColor(OrderStatus.SHIPPED)).toBe('secondary');
    });

    it('returns success for DELIVERED', () => {
      expect(getOrderStatusColor(OrderStatus.DELIVERED)).toBe('success');
    });

    it('returns error for CANCELLED', () => {
      expect(getOrderStatusColor(OrderStatus.CANCELLED)).toBe('error');
    });

    it('returns error for REFUNDED', () => {
      expect(getOrderStatusColor(OrderStatus.REFUNDED)).toBe('error');
    });

    it('returns default for unknown status', () => {
      expect(getOrderStatusColor('unknown' as OrderStatus)).toBe('default');
    });
  });

  describe('getPaymentStatusKey', () => {
    it('returns correct key for PENDING', () => {
      expect(getPaymentStatusKey(PaymentStatus.PENDING)).toBe('paymentStatusPending');
    });

    it('returns correct key for PAID', () => {
      expect(getPaymentStatusKey(PaymentStatus.PAID)).toBe('paymentStatusPaid');
    });

    it('returns correct key for FAILED', () => {
      expect(getPaymentStatusKey(PaymentStatus.FAILED)).toBe('paymentStatusFailed');
    });

    it('returns correct key for REFUNDED', () => {
      expect(getPaymentStatusKey(PaymentStatus.REFUNDED)).toBe('paymentStatusRefunded');
    });
  });

  describe('getPaymentMethodKey', () => {
    it('returns correct key for COD', () => {
      expect(getPaymentMethodKey(PaymentMethod.COD)).toBe('paymentMethodCod');
    });

    it('returns correct key for BANK_TRANSFER', () => {
      expect(getPaymentMethodKey(PaymentMethod.BANK_TRANSFER)).toBe('paymentMethodBankTransfer');
    });

    it('returns correct key for CARD', () => {
      expect(getPaymentMethodKey(PaymentMethod.CARD)).toBe('paymentMethodCard');
    });

    it('returns correct key for EWALLET', () => {
      expect(getPaymentMethodKey(PaymentMethod.EWALLET)).toBe('paymentMethodEwallet');
    });
  });

  describe('Type Definitions', () => {
    it('OrderTab type is valid', () => {
      const tab: OrderTab = 'all';
      expect(tab).toBeDefined();
    });

    it('OrderCustomer type is valid', () => {
      const customer: OrderCustomer = {
        name: 'John Doe',
        phone: '0123456789',
        email: 'john@example.com',
      };
      expect(customer).toBeDefined();
    });

    it('OrderAddress type is valid', () => {
      const address: OrderAddress = {
        street: '123 Main St',
        ward: 'Ward 1',
        district: 'District 1',
        city: 'Ho Chi Minh',
        country: 'Vietnam',
        cityId: 1,
        districtId: 2,
        wardId: 3,
      };
      expect(address).toBeDefined();
    });

    it('OrderItem type is valid', () => {
      const item: OrderItem = {
        productId: 'p1',
        variantId: 'v1',
        code: 'SKU123',
        name: 'Product Name',
        image: 'https://example.com/image.jpg',
        price: 100000,
        quantity: 2,
        subtotal: 200000,
        comboInstanceId: 'combo1',
        comboId: 'c1',
        comboName: 'Combo Deal',
      };
      expect(item).toBeDefined();
    });

    it('OrderDiscountDetail type is valid', () => {
      const discount: OrderDiscountDetail = {
        type: 'combo',
        referenceId: 'ref1',
        referenceName: 'Discount Name',
        instanceId: 'inst1',
        discountType: 'FIXED',
        discountValue: 50000,
        discountAmount: 50000,
      };
      expect(discount).toBeDefined();
    });

    it('OrderCdpSyncInfo type is valid', () => {
      const sync: OrderCdpSyncInfo = {
        customerId: 'cust1',
        syncStatus: 'synced',
        syncedAt: '2024-01-01',
        syncError: null,
      };
      expect(sync).toBeDefined();
    });

    it('OrderNhanhSyncInfo type is valid', () => {
      const sync: OrderNhanhSyncInfo = {
        orderId: 123,
        syncStatus: 'synced',
        syncedAt: '2024-01-01',
        syncError: null,
      };
      expect(sync).toBeDefined();
    });

    it('Order type is valid', () => {
      const order: Order = {
        id: 'o1',
        orderNumber: 'ORD123',
        userId: 'user1',
        sessionId: 'sess1',
        customer: { name: 'John', phone: '0123456789' },
        shippingAddress: { street: '123 Main', city: 'HCM' },
        items: [],
        subtotal: 100000,
        shippingFee: 30000,
        depotId: 1,
        discount: 10000,
        discountDetails: [],
        total: 120000,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.COD,
        note: 'Test note',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        cancelledAt: null,
        cancellationReason: null,
        cdp: null,
        nhanh: null,
      };
      expect(order).toBeDefined();
    });

    it('OrderFilters type is valid', () => {
      const filters: OrderFilters = {
        search: 'test',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        orderNumber: 'ORD123',
        phone: '0123456789',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        tab: 'all',
      };
      expect(filters).toBeDefined();
    });

    it('OrderSort type is valid', () => {
      const sort: OrderSort = {
        orderBy: 'createdAt',
        order: 'desc',
      };
      expect(sort).toBeDefined();
    });

    it('GetOrdersRequest type is valid', () => {
      const request: GetOrdersRequest = {
        page: 1,
        limit: 10,
        filters: {},
        sort: { orderBy: 'createdAt', order: 'desc' },
      };
      expect(request).toBeDefined();
    });

    it('GetOrdersResponse type is valid', () => {
      const response: GetOrdersResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
      };
      expect(response).toBeDefined();
    });

    it('OrderTabCounts type is valid', () => {
      const counts: OrderTabCounts = {
        all: 100,
        pending: 10,
        confirmed: 20,
        processing: 15,
        shipped: 25,
        delivered: 20,
        cancelled: 10,
      };
      expect(counts).toBeDefined();
    });

    it('UpdateOrderStatusRequest type is valid', () => {
      const request: UpdateOrderStatusRequest = {
        status: OrderStatus.CONFIRMED,
        reason: 'Approved by admin',
      };
      expect(request).toBeDefined();
    });

    it('UpdatePaymentStatusRequest type is valid', () => {
      const request: UpdatePaymentStatusRequest = {
        paymentStatus: PaymentStatus.PAID,
      };
      expect(request).toBeDefined();
    });
  });
});
