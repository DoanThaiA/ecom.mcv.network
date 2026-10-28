import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderDocumentModule } from '../../../src/shop/order/model/order-document.module';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../../../src/shop/order/domain/order.enums';
import { PaymentEventStatus } from '../../../src/shop/order/domain/order';
import { createTestingDatabase } from '../../helpers/mongodb.helper';

const USER_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const PRODUCT_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';

const makeOrderData = (overrides: Record<string, any> = {}) => ({
  orderNumber: `ORD-2024-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  userId: USER_ID,
  sessionId: 'session-abc',
  customer: {
    name: 'Nguyen Van A',
    phone: '0901234567',
    email: 'customer@example.com',
  },
  shippingAddress: {
    address: '123 Nguyen Hue',
    ward: 'Ben Nghe',
    district: 'District 1',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
  },
  items: [
    {
      productId: PRODUCT_ID,
      variantId: null,
      code: 'PROD-001',
      name: 'Test Product',
      image: null,
      price: 100000,
      quantity: 1,
      subtotal: 100000,
      discount: 0,
      originalPrice: 100000,
      discountDetails: null,
    },
  ],
  subtotal: 100000,
  shippingFee: 30000,
  discount: 0,
  totalDiscount: 0,
  shippingDiscount: 0,
  total: 130000,
  status: OrderStatus.PENDING,
  paymentStatus: PaymentStatus.PENDING,
  paymentMethod: PaymentMethod.COD,
  note: null,
  cancelledAt: null,
  cancellationReason: null,
  cdp: null,
  nhanh: null,
  infocms: null,
  paymentHistory: null,
  ...overrides,
});

describe('OrderDocumentRepository', () => {
  let module: TestingModule;
  let repository: OrderRepository;
  let closeDatabase: () => Promise<void>;
  let clearDatabase: (module: TestingModule) => Promise<void>;

  beforeAll(async () => {
    const db = await createTestingDatabase();
    closeDatabase = db.closeDatabase;
    clearDatabase = db.clearDatabase;

    module = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(db.uri), OrderDocumentModule],
    }).compile();

    repository = module.get<OrderRepository>(OrderRepository);
  });

  afterEach(async () => {
    await clearDatabase(module);
  });

  afterAll(async () => {
    await module.close();
    await closeDatabase();
  });

  describe('create', () => {
    it('should create an order and return domain entity with string id', async () => {
      const order = await repository.create(makeOrderData());

      expect(order.id).toBeDefined();
      expect(typeof order.id).toBe('string');
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.customer.name).toBe('Nguyen Van A');
    });

    it('should persist the orderNumber', async () => {
      const orderNumber = 'ORD-2024-TEST-001';
      const order = await repository.create(makeOrderData({ orderNumber }));

      expect(order.orderNumber).toBe(orderNumber);
    });
  });

  describe('findById', () => {
    it('should return order when found', async () => {
      const created = await repository.create(makeOrderData());

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent id', async () => {
      const found = await repository.findById('000000000000000000000000');

      expect(found).toBeNull();
    });
  });

  describe('findByOrderNumber', () => {
    it('should return order when order number exists', async () => {
      const created = await repository.create(
        makeOrderData({ orderNumber: 'ORD-FIND-001' }),
      );

      const found = await repository.findByOrderNumber('ORD-FIND-001');

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null when order number does not exist', async () => {
      const found = await repository.findByOrderNumber('ORD-NOTEXIST-999');

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    const USER_OWNER = 'cccccccccccccccccccccccc';
    const USER_OTHER = 'dddddddddddddddddddddddd';

    it('should return all orders for a user', async () => {
      await repository.create(
        makeOrderData({ userId: USER_OWNER, orderNumber: 'ORD-U-001' }),
      );
      await repository.create(
        makeOrderData({ userId: USER_OWNER, orderNumber: 'ORD-U-002' }),
      );
      await repository.create(
        makeOrderData({ userId: USER_OTHER, orderNumber: 'ORD-U-003' }),
      );

      const orders = await repository.findByUserId(USER_OWNER);

      expect(orders).toHaveLength(2);
      orders.forEach((o) => expect(o.userId).toBe(USER_OWNER));
    });

    it('should return empty array for unknown userId', async () => {
      const orders = await repository.findByUserId('000000000000000000000001');

      expect(orders).toHaveLength(0);
    });
  });

  describe('findBySessionId', () => {
    it('should return all orders for a session', async () => {
      await repository.create(
        makeOrderData({ sessionId: 'sess-123', orderNumber: 'ORD-S-001' }),
      );
      await repository.create(
        makeOrderData({ sessionId: 'sess-123', orderNumber: 'ORD-S-002' }),
      );
      await repository.create(
        makeOrderData({ sessionId: 'sess-other', orderNumber: 'ORD-S-003' }),
      );

      const orders = await repository.findBySessionId('sess-123');

      expect(orders).toHaveLength(2);
    });

    it('should return empty array for unknown sessionId', async () => {
      const orders = await repository.findBySessionId('nonexistent-session');

      expect(orders).toHaveLength(0);
    });
  });

  describe('findManyWithPagination', () => {
    const PAGINATE_USER = 'eeeeeeeeeeeeeeeeeeeeeeee';
    const OTHER_USER = 'fffffffffffffffffffffffF'.toLowerCase();

    it('should filter by userId', async () => {
      await repository.create(
        makeOrderData({ userId: PAGINATE_USER, orderNumber: 'ORD-P-001' }),
      );
      await repository.create(
        makeOrderData({ userId: PAGINATE_USER, orderNumber: 'ORD-P-002' }),
      );
      await repository.create(
        makeOrderData({ userId: OTHER_USER, orderNumber: 'ORD-P-003' }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { userId: PAGINATE_USER },
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.totalDocs).toBe(2);
      result.docs.forEach((o) => expect(o.userId).toBe(PAGINATE_USER));
    });

    it('should filter by status', async () => {
      await repository.create(
        makeOrderData({
          status: OrderStatus.PENDING,
          orderNumber: 'ORD-ST-001',
        }),
      );
      await repository.create(
        makeOrderData({
          status: OrderStatus.CANCELLED,
          orderNumber: 'ORD-ST-002',
        }),
      );
      await repository.create(
        makeOrderData({
          status: OrderStatus.PENDING,
          orderNumber: 'ORD-ST-003',
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { status: OrderStatus.PENDING },
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.totalDocs).toBe(2);
    });

    it('should paginate correctly', async () => {
      for (let i = 1; i <= 5; i++) {
        await repository.create(
          makeOrderData({
            orderNumber: `ORD-PAGE-${i.toString().padStart(3, '0')}`,
          }),
        );
      }

      const page1 = await repository.findManyWithPagination({
        paginationOptions: { page: 1, limit: 3 },
      });

      expect(page1.docs).toHaveLength(3);
      expect(page1.totalDocs).toBe(5);

      const page2 = await repository.findManyWithPagination({
        paginationOptions: { page: 2, limit: 3 },
      });

      expect(page2.docs).toHaveLength(2);
    });

    it('should filter unsynced Nhanh orders when nhanhSynced=false', async () => {
      await repository.create(
        makeOrderData({ orderNumber: 'ORD-NS-001', nhanh: null }),
      );
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-NS-002',
          nhanh: { orderId: 12345, syncStatus: 'synced' },
        }),
      );
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-NS-003',
          nhanh: { syncStatus: 'failed', syncError: 'API down' },
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { nhanhSynced: false },
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.totalDocs).toBe(2);
      const numbers = result.docs.map((o) => o.orderNumber).sort();
      expect(numbers).toEqual(['ORD-NS-001', 'ORD-NS-003']);
    });

    it('should exclude cancelled orders from unsynced result', async () => {
      await repository.create(
        makeOrderData({ orderNumber: 'ORD-NS-CXL-001', nhanh: null }),
      );
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-NS-CXL-002',
          status: OrderStatus.CANCELLED,
          nhanh: null,
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { nhanhSynced: false },
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.totalDocs).toBe(1);
      expect(result.docs[0].orderNumber).toBe('ORD-NS-CXL-001');
    });

    it('should keep cancelled orders if caller explicitly filters by status=cancelled', async () => {
      await repository.create(
        makeOrderData({ orderNumber: 'ORD-NS-EX-001', nhanh: null }),
      );
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-NS-EX-002',
          status: OrderStatus.CANCELLED,
          nhanh: null,
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { nhanhSynced: false, status: OrderStatus.CANCELLED },
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.totalDocs).toBe(1);
      expect(result.docs[0].orderNumber).toBe('ORD-NS-EX-002');
    });

    it('should match phone filter regardless of input format (0/84/+84/partial)', async () => {
      // DB stores phones in E.164 (+84...) after checkout normalization. The
      // CMS phone search must work for all common user-typed formats.
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-PH-001',
          customer: {
            name: 'Khach A',
            phone: '+84869940486',
            email: 'a@example.com',
          },
        }),
      );
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-PH-002',
          customer: {
            name: 'Khach B',
            phone: '+84111111111',
            email: 'b@example.com',
          },
        }),
      );

      const cases: { input: string; label: string }[] = [
        { input: '0869940486', label: 'leading-zero local' },
        { input: '869940486', label: 'no prefix' },
        { input: '84869940486', label: '84 prefix' },
        { input: '+84869940486', label: 'E.164' },
        { input: '86994', label: 'partial substring' },
      ];

      for (const { input, label } of cases) {
        const result = await repository.findManyWithPagination({
          filterOptions: { phone: input },
          paginationOptions: { page: 1, limit: 10 },
        });

        expect(result.totalDocs).toBe(1);
        expect(result.docs[0].orderNumber).toBe(`ORD-PH-001`);
        // attach label so a failure clearly identifies the offending case
        expect(`${label}: ${result.docs[0].customer.phone}`).toBe(
          `${label}: +84869940486`,
        );
      }
    });

    it('should filter synced Nhanh orders when nhanhSynced=true', async () => {
      await repository.create(
        makeOrderData({ orderNumber: 'ORD-NS-101', nhanh: null }),
      );
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-NS-102',
          nhanh: { orderId: 99, syncStatus: 'synced' },
        }),
      );

      const result = await repository.findManyWithPagination({
        filterOptions: { nhanhSynced: true },
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result.totalDocs).toBe(1);
      expect(result.docs[0].orderNumber).toBe('ORD-NS-102');
    });
  });

  describe('countUnsyncedToNhanh', () => {
    it('should return 0 when no orders exist', async () => {
      const count = await repository.countUnsyncedToNhanh();

      expect(count).toBe(0);
    });

    it('should count only orders without nhanh.orderId', async () => {
      await repository.create(
        makeOrderData({ orderNumber: 'ORD-CNT-001', nhanh: null }),
      );
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-CNT-002',
          nhanh: { syncStatus: 'failed', syncError: 'oops' },
        }),
      );
      await repository.create(
        makeOrderData({
          orderNumber: 'ORD-CNT-003',
          nhanh: { orderId: 555, syncStatus: 'synced' },
        }),
      );

      const count = await repository.countUnsyncedToNhanh();

      expect(count).toBe(2);
    });
  });

  describe('update', () => {
    it('should update order fields and return updated order', async () => {
      const order = await repository.create(makeOrderData());

      const updated = await repository.update(order.id, {
        status: OrderStatus.CONFIRMED,
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should return null for non-existent order id', async () => {
      const updated = await repository.update('000000000000000000000000', {
        status: OrderStatus.CONFIRMED,
      });

      expect(updated).toBeNull();
    });
  });

  describe('generateOrderNumber', () => {
    it('should return a non-empty string', async () => {
      const orderNumber = await repository.generateOrderNumber();

      expect(orderNumber).toBeDefined();
      expect(typeof orderNumber).toBe('string');
      expect(orderNumber.length).toBeGreaterThan(0);
    });
  });

  describe('addPaymentEvent', () => {
    it('should set paymentStatus to PAID when SUCCESS event added', async () => {
      const order = await repository.create(makeOrderData());

      const updated = await repository.addPaymentEvent(order.id, {
        status: PaymentEventStatus.SUCCESS,
        timestamp: new Date(),
        amount: 130000,
        ref: 'txn-ref-123',
        code: '00',
        message: 'Success',
      });

      expect(updated).not.toBeNull();
      expect(updated!.paymentStatus).toBe(PaymentStatus.PAID);
    });

    it('should set paymentStatus to FAILED when FAILED event added', async () => {
      const order = await repository.create(makeOrderData());

      const updated = await repository.addPaymentEvent(order.id, {
        status: PaymentEventStatus.FAILED,
        timestamp: new Date(),
        amount: 130000,
        ref: null,
        code: 'E01',
        message: 'Payment failed',
      });

      expect(updated).not.toBeNull();
      expect(updated!.paymentStatus).toBe(PaymentStatus.FAILED);
    });
  });
});
