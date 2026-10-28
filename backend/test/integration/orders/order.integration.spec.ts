import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderService } from '../../../src/shop/order/order.service';
import { OrderDocumentModule } from '../../../src/shop/order/model/order-document.module';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../../../src/shop/order/domain/order.enums';
import { I18nService } from 'nestjs-i18n';
import { OnepayService } from '../../../src/payment/onepay/onepay.service';
import { InfocmsService } from '../../../src/payment/infocms/infocms.service';
import { OrderCdpSyncService } from '../../../src/cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '../../../src/nhanh/services/order-nhanh-sync.service';
import {
  createMockI18nService,
  createMockOnepayService,
  createMockInfocmsService,
  createMockOrderCdpSyncService,
  createMockOrderNhanhSyncService,
  createMockOrderTasksService,
} from '../../helpers/mock-factories';
import { OrderTasksService } from '../../../src/order-tasks/order-tasks.service';
import { createTestingDatabase } from '../../helpers/mongodb.helper';

const makeOrderData = (overrides: Record<string, any> = {}) => ({
  orderNumber: `ORD-INT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  userId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
  sessionId: 'int-session-id',
  customer: {
    name: 'Integration Test User',
    phone: '0901234567',
    email: 'integration@example.com',
  },
  shippingAddress: {
    address: '123 Test Street',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
  },
  items: [
    {
      productId: 'bbbbbbbbbbbbbbbbbbbbbbbb',
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

describe('OrderService (integration)', () => {
  let module: TestingModule;
  let service: OrderService;
  let orderRepository: OrderRepository;
  let closeDatabase: () => Promise<void>;
  let clearDatabase: (module: TestingModule) => Promise<void>;

  const mockI18nService = createMockI18nService();
  const mockOnepayService = createMockOnepayService();
  const mockInfocmsService = createMockInfocmsService();
  const mockOrderCdpSyncService = createMockOrderCdpSyncService();
  const mockOrderNhanhSyncService = createMockOrderNhanhSyncService();
  const mockOrderTasksService = createMockOrderTasksService();

  beforeAll(async () => {
    const db = await createTestingDatabase();
    closeDatabase = db.closeDatabase;
    clearDatabase = db.clearDatabase;

    module = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(db.uri), OrderDocumentModule],
      providers: [
        OrderService,
        { provide: I18nService, useValue: mockI18nService },
        { provide: OnepayService, useValue: mockOnepayService },
        { provide: InfocmsService, useValue: mockInfocmsService },
        { provide: OrderTasksService, useValue: mockOrderTasksService },
        { provide: OrderCdpSyncService, useValue: mockOrderCdpSyncService },
        { provide: OrderNhanhSyncService, useValue: mockOrderNhanhSyncService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<OrderRepository>(OrderRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await clearDatabase(module);
  });

  afterAll(async () => {
    await module.close();
    await closeDatabase();
  });

  describe('getById', () => {
    it('should return order created in DB', async () => {
      const created = await orderRepository.create(makeOrderData());

      const found = await service.getById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.orderNumber).toBe(created.orderNumber);
    });

    it('should throw NotFoundException for non-existent id', async () => {
      await expect(
        service.getById('000000000000000000000000'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getByIdWithOwnership', () => {
    it('should return order when authenticated user owns it', async () => {
      const ownerUserId = 'cccccccccccccccccccccccc';
      const created = await orderRepository.create(
        makeOrderData({ userId: ownerUserId, sessionId: 'owner-session' }),
      );

      const found = await service.getByIdWithOwnership(
        created.id,
        'other-session',
        ownerUserId,
      );

      expect(found.id).toBe(created.id);
    });

    it('should throw ForbiddenException when neither userId nor sessionId matches', async () => {
      const realOwnerId = 'dddddddddddddddddddddddd';
      const created = await orderRepository.create(
        makeOrderData({ userId: realOwnerId, sessionId: 'real-session' }),
      );

      await expect(
        service.getByIdWithOwnership(created.id, 'wrong-session', 'wrong-user'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('cancelOrder', () => {
    it('should set order status to CANCELLED in DB', async () => {
      const cancelUserId = 'eeeeeeeeeeeeeeeeeeeeeeee';
      const created = await orderRepository.create(
        makeOrderData({ userId: cancelUserId, status: OrderStatus.PENDING }),
      );

      await service.cancelOrder(
        created.id,
        'session-x',
        'Customer changed mind',
        cancelUserId,
      );

      // Verify DB was updated
      const inDb = await orderRepository.findById(created.id);
      expect(inDb!.status).toBe(OrderStatus.CANCELLED);
      expect(inDb!.cancellationReason).toBe('Customer changed mind');
    });

    it('should trigger CDP sync cancellation after cancel', async () => {
      const syncUserId = 'fffffffffffffffffffffffF'.toLowerCase();
      const created = await orderRepository.create(
        makeOrderData({ userId: syncUserId, status: OrderStatus.PENDING }),
      );

      await service.cancelOrder(created.id, 'session-x', undefined, syncUserId);

      // Allow fire-and-forget to settle
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockOrderTasksService.queueSyncOrderCancellationCdp).toHaveBeenCalled();
    });
  });

  describe('lookupOrder', () => {
    it('should return order when phone matches', async () => {
      const created = await orderRepository.create(
        makeOrderData({
          customer: { name: 'Test', phone: '0901111111', email: null },
        }),
      );

      const found = await service.lookupOrder(
        created.orderNumber,
        '0901111111',
      );

      expect(found.id).toBe(created.id);
    });

    it('should throw NotFoundException when phone does not match real DB data', async () => {
      const created = await orderRepository.create(
        makeOrderData({
          customer: { name: 'Test', phone: '0901111111', email: null },
        }),
      );

      await expect(
        service.lookupOrder(created.orderNumber, '0999999999'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getByUserIdPaginated', () => {
    it('should paginate user orders from real DB', async () => {
      const paginateUserId = '111111111111111111111111';
      for (let i = 1; i <= 5; i++) {
        await orderRepository.create(
          makeOrderData({
            userId: paginateUserId,
            orderNumber: `ORD-PAG-${i.toString().padStart(3, '0')}`,
          }),
        );
      }

      const page1 = await service.getByUserIdPaginated(paginateUserId, 1, 3);
      expect(page1.docs).toHaveLength(3);
      expect(page1.totalDocs).toBe(5);

      const page2 = await service.getByUserIdPaginated(paginateUserId, 2, 3);
      expect(page2.docs).toHaveLength(2);
    });
  });

  describe('countUnsyncedToNhanh', () => {
    it('should count only orders without nhanh.orderId from real DB', async () => {
      await orderRepository.create(
        makeOrderData({ orderNumber: 'ORD-INT-NS-001', nhanh: null }),
      );
      await orderRepository.create(
        makeOrderData({
          orderNumber: 'ORD-INT-NS-002',
          nhanh: { syncStatus: 'failed', syncError: 'API timeout' },
        }),
      );
      await orderRepository.create(
        makeOrderData({
          orderNumber: 'ORD-INT-NS-003',
          nhanh: { orderId: 7777, syncStatus: 'synced' },
        }),
      );

      const count = await service.countUnsyncedToNhanh();

      expect(count).toBe(2);
    });

    it('should exclude cancelled orders from the count', async () => {
      await orderRepository.create(
        makeOrderData({ orderNumber: 'ORD-INT-NS-CXL-001', nhanh: null }),
      );
      await orderRepository.create(
        makeOrderData({
          orderNumber: 'ORD-INT-NS-CXL-002',
          status: OrderStatus.CANCELLED,
          nhanh: null,
        }),
      );

      const count = await service.countUnsyncedToNhanh();

      expect(count).toBe(1);
    });
  });

  describe('getOrders with nhanhSynced filter', () => {
    it('should return only unsynced orders when nhanhSynced=false', async () => {
      await orderRepository.create(
        makeOrderData({ orderNumber: 'ORD-INT-FNS-001', nhanh: null }),
      );
      await orderRepository.create(
        makeOrderData({
          orderNumber: 'ORD-INT-FNS-002',
          nhanh: { orderId: 8888, syncStatus: 'synced' },
        }),
      );

      const result = await service.getOrders({
        page: 1,
        limit: 10,
        filters: { nhanhSynced: false } as any,
      });

      expect(result.totalDocs).toBe(1);
      expect(result.docs[0].orderNumber).toBe('ORD-INT-FNS-001');
    });
  });
});
