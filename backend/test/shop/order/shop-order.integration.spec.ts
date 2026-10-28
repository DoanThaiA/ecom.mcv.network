import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { OrderService } from '../../../src/shop/order/order.service';
import { OrderDocumentRepository } from '../../../src/shop/order/model/order.repository';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import {
  OrderSchemaClass,
  OrderSchema,
} from '../../../src/shop/order/model/order.schema';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../../../src/shop/order/domain/order.enums';
import { OnepayService } from '../../../src/payment/onepay/onepay.service';
import { InfocmsService } from '../../../src/payment/infocms/infocms.service';
import { OrderCdpSyncService } from '../../../src/cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '../../../src/nhanh/services/order-nhanh-sync.service';

/**
 * Integration tests for Shop Order functionality
 * Tests the order query and cancellation functionality.
 * Note: Order creation is handled through the checkout flow only.
 */
describe('Shop Order Integration', () => {
  let service: OrderService;
  let orderModel: PaginateModel<OrderSchemaClass>;
  let module: TestingModule;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  // Helper to create test order directly in DB
  const createTestOrder = async (
    overrides: Partial<{
      orderNumber: string;
      userId: string | null;
      sessionId: string;
      status: OrderStatus;
      paymentStatus: PaymentStatus;
      phone: string;
    }> = {},
  ) => {
    const timestamp = Date.now() + Math.random();
    const orderData = {
      orderNumber: overrides.orderNumber ?? `ORD-${timestamp}`,
      userId: overrides.userId !== undefined ? overrides.userId : null,
      sessionId: overrides.sessionId ?? `session-${timestamp}`,
      customer: {
        name: 'Test Customer',
        phone: overrides.phone ?? '0901234567',
        email: 'test@example.com',
      },
      shippingAddress: {
        address: '123 Test St',
        ward: 'Ben Nghe',
        district: 'District 1',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        cityId: 79,
        districtId: 769,
        wardId: 26740,
      },
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          variantId: null,
          code: 'TEST-001',
          name: 'Test Product',
          image: null,
          price: 100000,
          originalPrice: 100000,
          quantity: 1,
          subtotal: 100000,
          discount: 0,
        },
      ],
      subtotal: 100000,
      shippingFee: 30000,
      depotId: 12345,
      discount: 0,
      totalDiscount: 0,
      total: 130000,
      status: overrides.status ?? OrderStatus.PENDING,
      paymentStatus: overrides.paymentStatus ?? PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.COD,
      note: null,
    };

    const order = await orderModel.create(orderData);
    return order;
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: OrderSchemaClass.name, schema: OrderSchema },
        ]),
      ],
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useClass: OrderDocumentRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18n,
        },
        {
          provide: OnepayService,
          useValue: { createPaymentUrl: jest.fn() },
        },
        {
          provide: InfocmsService,
          useValue: {
            createQrPayment: jest.fn(),
            checkPaymentStatus: jest.fn(),
          },
        },
        {
          provide: OrderCdpSyncService,
          useValue: {
            syncOrder: jest.fn(),
            syncOrderCancellation: jest.fn(),
          },
        },
        {
          provide: OrderNhanhSyncService,
          useValue: { syncOrder: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderModel = module.get<PaginateModel<OrderSchemaClass>>(
      getModelToken(OrderSchemaClass.name),
    );
  });

  afterAll(async () => {
    await module.close();
    await closeInMongodConnection();
  });

  beforeEach(async () => {
    await orderModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('cancelOrder (customer cancellation)', () => {
    it('should cancel PENDING order by user', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const order = await createTestOrder({
        userId,
        status: OrderStatus.PENDING,
      });

      const cancelled = await service.cancelOrder(
        order._id.toString(),
        order.sessionId,
        'Changed my mind',
        userId,
      );

      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
      expect(cancelled.cancellationReason).toBe('Changed my mind');
      expect(cancelled.cancelledAt).toBeDefined();
    });

    it('should cancel CONFIRMED order by user', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const order = await createTestOrder({
        userId,
        status: OrderStatus.CONFIRMED,
      });

      const cancelled = await service.cancelOrder(
        order._id.toString(),
        order.sessionId,
        undefined,
        userId,
      );

      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
      expect(cancelled.cancellationReason).toBe('Cancelled by customer');
    });

    it('should cancel order by guest (session only)', async () => {
      const sessionId = 'guest-session-123';
      const order = await createTestOrder({
        userId: null,
        sessionId,
        status: OrderStatus.PENDING,
      });

      const cancelled = await service.cancelOrder(
        order._id.toString(),
        sessionId,
        'No longer needed',
      );

      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
    });

    it('should reject cancellation of PROCESSING order', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const order = await createTestOrder({
        userId,
        status: OrderStatus.PROCESSING,
      });

      await expect(
        service.cancelOrder(
          order._id.toString(),
          order.sessionId,
          undefined,
          userId,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject cancellation of SHIPPED order', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const order = await createTestOrder({
        userId,
        status: OrderStatus.SHIPPED,
      });

      await expect(
        service.cancelOrder(
          order._id.toString(),
          order.sessionId,
          undefined,
          userId,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject cancellation by wrong user', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const wrongUserId = new mongoose.Types.ObjectId().toString();
      const order = await createTestOrder({
        userId,
        status: OrderStatus.PENDING,
      });

      await expect(
        service.cancelOrder(
          order._id.toString(),
          order.sessionId,
          undefined,
          wrongUserId,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should reject cancellation by wrong session', async () => {
      const order = await createTestOrder({
        userId: null,
        sessionId: 'correct-session',
        status: OrderStatus.PENDING,
      });

      await expect(
        service.cancelOrder(order._id.toString(), 'wrong-session', undefined),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('lookupOrder (guest order lookup)', () => {
    it('should find order by order number and phone', async () => {
      const order = await createTestOrder({
        orderNumber: 'ORD-LOOKUP-001',
        phone: '0909999888',
      });

      const found = await service.lookupOrder('ORD-LOOKUP-001', '0909999888');

      expect(found.orderNumber).toBe('ORD-LOOKUP-001');
      expect(found.customer.phone).toBe('0909999888');
    });

    it('should throw when order number not found', async () => {
      await expect(
        service.lookupOrder('NON-EXISTENT', '0901234567'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw when phone does not match', async () => {
      await createTestOrder({
        orderNumber: 'ORD-MISMATCH-001',
        phone: '0901234567',
      });

      await expect(
        service.lookupOrder('ORD-MISMATCH-001', '0909999999'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getByUserId and getBySessionId', () => {
    it('should get orders by user ID', async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      await createTestOrder({ userId, orderNumber: 'ORD-USER-001' });
      await createTestOrder({ userId, orderNumber: 'ORD-USER-002' });
      await createTestOrder({ userId: null, orderNumber: 'ORD-OTHER-001' });

      const orders = await service.getByUserId(userId);

      expect(orders).toHaveLength(2);
      expect(orders.map((o) => o.orderNumber).sort()).toEqual([
        'ORD-USER-001',
        'ORD-USER-002',
      ]);
    });

    it('should get orders by session ID', async () => {
      const sessionId = 'test-session-xyz';

      await createTestOrder({ sessionId, orderNumber: 'ORD-SESSION-001' });
      await createTestOrder({ sessionId, orderNumber: 'ORD-SESSION-002' });
      await createTestOrder({
        sessionId: 'other-session',
        orderNumber: 'ORD-OTHER-001',
      });

      const orders = await service.getBySessionId(sessionId);

      expect(orders).toHaveLength(2);
      expect(orders.map((o) => o.orderNumber).sort()).toEqual([
        'ORD-SESSION-001',
        'ORD-SESSION-002',
      ]);
    });
  });

  describe('getById and getByOrderNumber', () => {
    it('should get order by ID', async () => {
      const order = await createTestOrder({ orderNumber: 'ORD-BYID-001' });

      const found = await service.getById(order._id.toString());

      expect(found.orderNumber).toBe('ORD-BYID-001');
    });

    it('should throw when order ID not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(service.getById(fakeId)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should get order by order number', async () => {
      await createTestOrder({ orderNumber: 'ORD-BYNUM-001' });

      const found = await service.getByOrderNumber('ORD-BYNUM-001');

      expect(found.orderNumber).toBe('ORD-BYNUM-001');
    });

    it('should throw when order number not found', async () => {
      await expect(
        service.getByOrderNumber('NON-EXISTENT'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getOrders (paginated query)', () => {
    it('should return paginated orders', async () => {
      for (let i = 0; i < 15; i++) {
        await createTestOrder({
          orderNumber: `ORD-PAGE-${i.toString().padStart(3, '0')}`,
        });
      }

      const result = await service.getOrders({ page: 1, limit: 10 });

      expect(result.docs).toHaveLength(10);
      expect(result.totalDocs).toBe(15);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(true);
    });

    it('should filter by order status', async () => {
      await createTestOrder({
        status: OrderStatus.PENDING,
        orderNumber: 'ORD-PEND-001',
      });
      await createTestOrder({
        status: OrderStatus.CONFIRMED,
        orderNumber: 'ORD-CONF-001',
      });
      await createTestOrder({
        status: OrderStatus.CANCELLED,
        orderNumber: 'ORD-CANC-001',
      });

      const result = await service.getOrders({
        filters: { status: OrderStatus.PENDING },
      });

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].orderNumber).toBe('ORD-PEND-001');
    });

    it('should filter by order number', async () => {
      await createTestOrder({ orderNumber: 'ORD-SEARCH-001' });
      await createTestOrder({ orderNumber: 'ORD-OTHER-001' });

      const result = await service.getOrders({
        filters: { orderNumber: 'ORD-SEARCH-001' },
      });

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].orderNumber).toBe('ORD-SEARCH-001');
    });

    it('should filter by phone number', async () => {
      await createTestOrder({
        phone: '0909111222',
        orderNumber: 'ORD-PHONE-001',
      });
      await createTestOrder({
        phone: '0909333444',
        orderNumber: 'ORD-PHONE-002',
      });

      const result = await service.getOrders({
        filters: { phone: '0909111222' },
      });

      expect(result.docs).toHaveLength(1);
      expect(result.docs[0].orderNumber).toBe('ORD-PHONE-001');
    });

    it('should sort by createdAt descending by default', async () => {
      const order1 = await createTestOrder({ orderNumber: 'ORD-SORT-001' });
      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
      const order2 = await createTestOrder({ orderNumber: 'ORD-SORT-002' });

      const result = await service.getOrders({});

      expect(result.docs[0].orderNumber).toBe('ORD-SORT-002');
      expect(result.docs[1].orderNumber).toBe('ORD-SORT-001');
    });
  });
});
