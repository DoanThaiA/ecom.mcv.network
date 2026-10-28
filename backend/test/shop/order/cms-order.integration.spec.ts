import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
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
import { ProductDocumentRepository } from '../../../src/products/model/product.repository';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../../../src/products/model/product.schema';
import { CartDocumentRepository } from '../../../src/shop/cart/model/cart.repository';
import { CartRepository } from '../../../src/shop/cart/domain/cart.repository';
import {
  CartSchemaClass,
  CartSchema,
} from '../../../src/shop/cart/model/cart.schema';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../../../src/shop/order/domain/order.enums';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { ShippingService } from '../../../src/shop/shipping/shipping.service';
import { FlashSaleRepository } from '../../../src/flash-sales/domain/flash-sale.repository';
import { OnepayService } from '../../../src/payment/onepay/onepay.service';
import { InfocmsService } from '../../../src/payment/infocms/infocms.service';
import { OrderCdpSyncService } from '../../../src/cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '../../../src/nhanh/services/order-nhanh-sync.service';

/**
 * Integration tests for CMS Order functionality (read-only)
 * Tests OrderService read methods that are exposed via CmsOrderController
 * Note: Write operations (updateStatus, updatePaymentStatus) have been removed
 * All order updates are now synced via webhook from nhanh.vn
 */
describe('CMS Order Integration', () => {
  let service: OrderService;
  let orderModel: PaginateModel<OrderSchemaClass>;
  let productRepository: ProductDocumentRepository;
  let module: TestingModule;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  // Mock shipping service - CMS tests don't need shipping calculation
  const mockShippingService = {
    calculateShipping: jest.fn().mockResolvedValue({
      depot: { id: 12345, name: 'Main Depot' },
      items: [],
      totalWeight: 0,
      totalValue: 0,
      selectedCarrier: {
        carrierId: 2,
        carrierName: 'Viettel Post',
        carrierLogo: '',
        serviceName: 'Standard',
        serviceCode: 'STD',
        shipFee: 0,
        codFee: 0,
        customerShipFee: 0,
      },
      totalShippingFee: 0,
    }),
  };

  // Mock flash sale repository - returns empty map (no active flash sales)
  const mockFlashSaleRepository = {
    findActiveForProducts: jest.fn().mockResolvedValue(new Map()),
    incrementSoldCount: jest.fn().mockResolvedValue(undefined),
  };

  // Helper to create test product
  const createTestProduct = async (
    overrides: Partial<{
      code: string;
      name: string;
      prices: { retail: number };
    }> = {},
  ) => {
    const timestamp = Date.now() + Math.random();
    const productData = {
      businessId: '110668',
      source: 'nhanh' as const,
      code: `PROD-${timestamp}`,
      name: `Test Product ${timestamp}`,
      description: 'Test product description',
      prices: { retail: 100000, ...overrides.prices },
      images: { avatar: 'http://example.com/image.jpg', others: [] },
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      ...overrides,
    };
    return productRepository.create(productData as any);
  };

  // Helper to create test order
  const createTestOrder = async (
    overrides: Partial<{
      status: OrderStatus;
      paymentStatus: PaymentStatus;
      paymentMethod: PaymentMethod;
    }> = {},
  ) => {
    const product = await createTestProduct();
    const orderRepo = module.get<OrderDocumentRepository>(
      OrderDocumentRepository,
    );

    return orderRepo.create({
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`,
      userId: null,
      sessionId: `session-${Date.now()}`,
      customer: {
        name: 'Test Customer',
        phone: '0901234567',
        email: 'test@example.com',
      },
      shippingAddress: {
        address: '123 Test Street',
        ward: 'Ward 1',
        district: 'District 1',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
      },
      items: [
        {
          productId: product.id,
          variantId: null,
          code: product.code,
          name: product.name,
          image: product.images?.avatar ?? null,
          price: product.prices.retail,
          quantity: 2,
          subtotal: product.prices.retail * 2,
        },
      ],
      subtotal: product.prices.retail * 2,
      shippingFee: 0,
      discount: 0,
      total: product.prices.retail * 2,
      status: overrides.status ?? OrderStatus.PENDING,
      paymentStatus: overrides.paymentStatus ?? PaymentStatus.PENDING,
      paymentMethod: overrides.paymentMethod ?? PaymentMethod.COD,
      note: null,
      cancelledAt: null,
      cancellationReason: null,
    } as any);
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: OrderSchemaClass.name, schema: OrderSchema },
          { name: ProductSchemaClass.name, schema: ProductSchema },
          { name: CartSchemaClass.name, schema: CartSchema },
        ]),
      ],
      providers: [
        OrderService,
        OrderDocumentRepository,
        ProductDocumentRepository,
        CartDocumentRepository,
        { provide: OrderRepository, useExisting: OrderDocumentRepository },
        { provide: ProductRepository, useExisting: ProductDocumentRepository },
        { provide: CartRepository, useExisting: CartDocumentRepository },
        { provide: FlashSaleRepository, useValue: mockFlashSaleRepository },
        { provide: I18nService, useValue: mockI18n },
        { provide: ShippingService, useValue: mockShippingService },
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
          useValue: { syncOrder: jest.fn() },
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
    productRepository = module.get<ProductDocumentRepository>(
      ProductDocumentRepository,
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await orderModel.deleteMany({});
    const productModel = module.get<PaginateModel<ProductSchemaClass>>(
      getModelToken(ProductSchemaClass.name),
    );
    await productModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('getOrders (CMS list orders)', () => {
    beforeEach(async () => {
      // Create 15 orders with various statuses
      for (let i = 0; i < 5; i++) {
        await createTestOrder({ status: OrderStatus.PENDING });
      }
      for (let i = 0; i < 5; i++) {
        await createTestOrder({ status: OrderStatus.CONFIRMED });
      }
      for (let i = 0; i < 5; i++) {
        await createTestOrder({ status: OrderStatus.CANCELLED });
      }
    });

    it('should return paginated orders', async () => {
      const result = await service.getOrders({
        page: 1,
        limit: 10,
      });

      expect(result.docs).toHaveLength(10);
      expect(result.totalDocs).toBe(15);
      expect(result.totalPages).toBe(2);
      expect(result.hasNextPage).toBe(true);
    });

    it('should filter by order status', async () => {
      const result = await service.getOrders({
        page: 1,
        limit: 20,
        filters: { status: OrderStatus.CONFIRMED },
      });

      expect(result.totalDocs).toBe(5);
      result.docs.forEach((order) => {
        expect(order.status).toBe(OrderStatus.CONFIRMED);
      });
    });

    it('should filter by payment status', async () => {
      // Create an order with PAID status
      await createTestOrder({ paymentStatus: PaymentStatus.PAID });

      const result = await service.getOrders({
        page: 1,
        limit: 20,
        filters: { paymentStatus: PaymentStatus.PAID },
      });

      expect(result.totalDocs).toBe(1);
      expect(result.docs[0].paymentStatus).toBe(PaymentStatus.PAID);
    });

    it('should sort by createdAt descending by default', async () => {
      const result = await service.getOrders({
        page: 1,
        limit: 10,
      });

      const dates = result.docs.map((o) => o.createdAt.getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });

    it('should return correct page', async () => {
      const page1 = await service.getOrders({ page: 1, limit: 10 });
      const page2 = await service.getOrders({ page: 2, limit: 10 });

      const page1Ids = page1.docs.map((o) => o.id);
      const page2Ids = page2.docs.map((o) => o.id);

      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });

  describe('getById (CMS get order detail)', () => {
    it('should return order by id', async () => {
      const created = await createTestOrder();

      const found = await service.getById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.orderNumber).toBe(created.orderNumber);
    });

    it('should throw NOT_FOUND when order does not exist', async () => {
      await expect(
        service.getById('507f1f77bcf86cd799439011'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  // Note: updateStatus and updatePaymentStatus tests have been removed
  // Order status updates are now synced via webhook from nhanh.vn
  // CDP sync happens immediately after order creation in checkout
});
