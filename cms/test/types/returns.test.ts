import { describe, it, expect } from 'vitest';
import {
  ReturnStatus,
  ReturnType,
  ReturnReason,
  getReturnStatusKey,
  getReturnStatusColor,
  getReturnTypeKey,
  getReturnReasonKey,
  type ReturnTab,
  type ReturnItem,
  type ReturnRequest,
  type ReturnOrderSnapshot,
  type ReturnFilters,
  type ReturnSort,
  type GetReturnsRequest,
  type GetReturnsResponse,
  type ReturnTabCounts,
  type UpdateReturnStatusRequest,
} from 'src/types/returns';

describe('types/returns', () => {
  describe('Enum Exports', () => {
    it('exports ReturnStatus enum', () => {
      expect(ReturnStatus.PENDING).toBe('pending');
      expect(ReturnStatus.CONFIRMED).toBe('confirmed');
      expect(ReturnStatus.REFUNDED).toBe('refunded');
      expect(ReturnStatus.REJECTED).toBe('rejected');
    });

    it('exports ReturnType enum', () => {
      expect(ReturnType.REFUND).toBe('refund');
      expect(ReturnType.EXCHANGE).toBe('exchange');
    });

    it('exports ReturnReason enum', () => {
      expect(ReturnReason.DEFECTIVE).toBe('defective');
      expect(ReturnReason.WRONG_ITEM).toBe('wrong_item');
      expect(ReturnReason.NOT_AS_DESCRIBED).toBe('not_as_described');
      expect(ReturnReason.CHANGED_MIND).toBe('changed_mind');
      expect(ReturnReason.OTHER).toBe('other');
    });
  });

  describe('getReturnStatusKey', () => {
    it('returns correct key for PENDING', () => {
      expect(getReturnStatusKey(ReturnStatus.PENDING)).toBe('returnStatusPending');
    });

    it('returns correct key for CONFIRMED', () => {
      expect(getReturnStatusKey(ReturnStatus.CONFIRMED)).toBe('returnStatusConfirmed');
    });

    it('returns correct key for REFUNDED', () => {
      expect(getReturnStatusKey(ReturnStatus.REFUNDED)).toBe('returnStatusRefunded');
    });

    it('returns correct key for REJECTED', () => {
      expect(getReturnStatusKey(ReturnStatus.REJECTED)).toBe('returnStatusRejected');
    });
  });

  describe('getReturnStatusColor', () => {
    it('returns warning for PENDING', () => {
      expect(getReturnStatusColor(ReturnStatus.PENDING)).toBe('warning');
    });

    it('returns info for CONFIRMED', () => {
      expect(getReturnStatusColor(ReturnStatus.CONFIRMED)).toBe('info');
    });

    it('returns success for REFUNDED', () => {
      expect(getReturnStatusColor(ReturnStatus.REFUNDED)).toBe('success');
    });

    it('returns error for REJECTED', () => {
      expect(getReturnStatusColor(ReturnStatus.REJECTED)).toBe('error');
    });

    it('returns default for unknown status', () => {
      expect(getReturnStatusColor('unknown' as ReturnStatus)).toBe('default');
    });
  });

  describe('getReturnTypeKey', () => {
    it('returns correct key for REFUND', () => {
      expect(getReturnTypeKey(ReturnType.REFUND)).toBe('returnTypeRefund');
    });

    it('returns correct key for EXCHANGE', () => {
      expect(getReturnTypeKey(ReturnType.EXCHANGE)).toBe('returnTypeExchange');
    });
  });

  describe('getReturnReasonKey', () => {
    it('returns correct key for DEFECTIVE', () => {
      expect(getReturnReasonKey(ReturnReason.DEFECTIVE)).toBe('returnReasonDefective');
    });

    it('returns correct key for WRONG_ITEM', () => {
      expect(getReturnReasonKey(ReturnReason.WRONG_ITEM)).toBe('returnReasonWrongItem');
    });

    it('returns correct key for NOT_AS_DESCRIBED', () => {
      expect(getReturnReasonKey(ReturnReason.NOT_AS_DESCRIBED)).toBe('returnReasonNotAsDescribed');
    });

    it('returns correct key for CHANGED_MIND', () => {
      expect(getReturnReasonKey(ReturnReason.CHANGED_MIND)).toBe('returnReasonChangedMind');
    });

    it('returns correct key for OTHER', () => {
      expect(getReturnReasonKey(ReturnReason.OTHER)).toBe('returnReasonOther');
    });
  });

  describe('Type Definitions', () => {
    it('ReturnTab type is valid', () => {
      const tab: ReturnTab = 'all';
      expect(tab).toBeDefined();
    });

    it('ReturnItem type is valid', () => {
      const item: ReturnItem = {
        productId: 'p1',
        variantId: 'v1',
        code: 'SKU123',
        name: 'Product Name',
        image: 'https://example.com/image.jpg',
        price: 100000,
        quantity: 2,
        subtotal: 200000,
      };
      expect(item).toBeDefined();
    });

    it('ReturnOrderSnapshot type is valid', () => {
      const snapshot: ReturnOrderSnapshot = {
        orderId: 'o1',
        orderNumber: 'ORD123',
        orderAmount: 500000,
        nhanh: {
          orderId: 123,
          syncStatus: 'synced',
        },
      };
      expect(snapshot).toBeDefined();
    });

    it('ReturnRequest type is valid with all fields', () => {
      const request: ReturnRequest = {
        id: 'r1',
        returnNumber: 'RET123',
        orderId: 'o1',
        orderNumber: 'ORD123',
        customer: {
          name: 'John Doe',
          phone: '0123456789',
          email: 'john@example.com',
          address: '123 Main St',
        },
        items: [],
        type: ReturnType.REFUND,
        reason: ReturnReason.DEFECTIVE,
        reasonDetail: 'Product is broken',
        amount: 200000,
        status: ReturnStatus.PENDING,
        shippingCarrier: 'GHN',
        images: ['img1.jpg', 'img2.jpg'],
        adminNote: 'Processing',
        processedBy: 'admin1',
        processedAt: '2024-01-01',
        bankName: 'Vietcombank',
        bankAccountNumber: '1234567890',
        bankAccountName: 'John Doe',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        orderSnapshot: null,
      };
      expect(request).toBeDefined();
    });

    it('ReturnRequest type is valid with minimal fields', () => {
      const request: ReturnRequest = {
        id: 'r1',
        returnNumber: 'RET123',
        orderId: 'o1',
        orderNumber: 'ORD123',
        customer: {
          name: 'John Doe',
          phone: '0123456789',
        },
        items: [],
        type: ReturnType.REFUND,
        reason: ReturnReason.DEFECTIVE,
        amount: 200000,
        status: ReturnStatus.PENDING,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        orderSnapshot: null,
      };
      expect(request).toBeDefined();
    });

    it('ReturnFilters type is valid', () => {
      const filters: ReturnFilters = {
        search: 'test',
        orderNumber: 'ORD123',
        phone: '0123456789',
        status: ReturnStatus.PENDING,
        type: ReturnType.REFUND,
        reason: ReturnReason.DEFECTIVE,
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        tab: 'all',
      };
      expect(filters).toBeDefined();
    });

    it('ReturnSort type is valid', () => {
      const sort: ReturnSort = {
        orderBy: 'createdAt',
        order: 'desc',
      };
      expect(sort).toBeDefined();
    });

    it('GetReturnsRequest type is valid', () => {
      const request: GetReturnsRequest = {
        page: 1,
        limit: 10,
        filters: {},
        sort: { orderBy: 'createdAt', order: 'desc' },
      };
      expect(request).toBeDefined();
    });

    it('GetReturnsResponse type is valid', () => {
      const response: GetReturnsResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
      };
      expect(response).toBeDefined();
    });

    it('ReturnTabCounts type is valid', () => {
      const counts: ReturnTabCounts = {
        all: 100,
        pending: 30,
        confirmed: 20,
        refunded: 40,
        rejected: 10,
      };
      expect(counts).toBeDefined();
    });

    it('UpdateReturnStatusRequest type is valid with adminNote', () => {
      const request: UpdateReturnStatusRequest = {
        status: ReturnStatus.CONFIRMED,
        adminNote: 'Approved for refund',
      };
      expect(request).toBeDefined();
    });

    it('UpdateReturnStatusRequest type is valid without adminNote', () => {
      const request: UpdateReturnStatusRequest = {
        status: ReturnStatus.CONFIRMED,
      };
      expect(request).toBeDefined();
    });
  });
});
