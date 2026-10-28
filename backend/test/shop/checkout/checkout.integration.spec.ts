import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { CheckoutService } from '../../../src/shop/checkout/checkout.service';
import { CheckoutSessionDocumentRepository } from '../../../src/shop/checkout/model/checkout-session.repository';
import { CheckoutSessionRepository } from '../../../src/shop/checkout/domain/checkout-session.repository';
import {
  CheckoutSessionSchemaClass,
  CheckoutSessionSchema,
} from '../../../src/shop/checkout/model/checkout-session.schema';
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
import { OrderDocumentRepository } from '../../../src/shop/order/model/order.repository';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import {
  OrderSchemaClass,
  OrderSchema,
} from '../../../src/shop/order/model/order.schema';
import { ComboDocumentRepository } from '../../../src/combos/model/combo.repository';
import { ComboRepository } from '../../../src/combos/domain/combo.repository';
import {
  ComboSchemaClass,
  ComboSchema,
} from '../../../src/combos/model/combo.schema';
import { FlashSaleDocumentRepository } from '../../../src/flash-sales/model/flash-sale.repository';
import { FlashSaleRepository } from '../../../src/flash-sales/domain/flash-sale.repository';
import {
  FlashSaleSchemaClass,
  FlashSaleSchema,
} from '../../../src/flash-sales/model/flash-sale.schema';
import { FlashSaleProductDocumentRepository } from '../../../src/flash-sale-products/model/flash-sale-product.repository';
import { FlashSaleProductRepository } from '../../../src/flash-sale-products/domain/flash-sale-product.repository';
import {
  FlashSaleProductSchemaClass,
  FlashSaleProductSchema,
} from '../../../src/flash-sale-products/model/flash-sale-product.schema';
import { PromotionRepository } from '../../../src/promotions/domain/promotion.repository';
import { PromotionProductRepository } from '../../../src/promotion-products/domain/promotion-product.repository';
import { AffiliateRepository } from '../../../src/affiliates/domain/affiliate.repository';
import { AffiliateOrderCommissionsService } from '../../../src/affiliate-order-commissions/affiliate-order-commissions.service';
import { PromotionUsageRecordRepository } from '../../../src/promotion-usage-records/domain/promotion-usage-record.repository';
import { ShippingService } from '../../../src/shop/shipping/shipping.service';
import { OrderCdpSyncService } from '../../../src/cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '../../../src/nhanh/services/order-nhanh-sync.service';
import { OnepayService } from '../../../src/payment/onepay/onepay.service';
import { InfocmsService } from '../../../src/payment/infocms/infocms.service';
import { CheckoutSessionStatus } from '../../../src/shop/checkout/domain/checkout-session-status.enum';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { ComboStatus } from '../../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';
import { FlashSaleStatus } from '../../../src/flash-sales/domain/flash-sale-status.enum';
import {
  PaymentMethod,
  OrderStatus,
} from '../../../src/shop/order/domain/order.enums';
import { GiftValidationService } from '../../../src/shop/cart/gift-validation.service';
import { CdpService } from '../../../src/cdp/cdp.service';
import { OrderService } from '../../../src/shop/order/order.service';
import { UserRepository } from '../../../src/users/domain/user.repository';
import { OrderConfirmationService } from '../../../src/shop/order-confirmation/order-confirmation.service';

/**
 * Integration tests for CheckoutService
 * Tests the full checkout flow:
 * - Items → Checkout Session → Order
 * - Combos → Checkout Session → Order
 * - Flash Sales → Checkout Session → Order
 * - Cart clearing after order
 * - Validation and error handling
 */
describe('Checkout Integration', () => {
  let service: CheckoutService;
  let checkoutSessionModel: PaginateModel<CheckoutSessionSchemaClass>;
  let productModel: PaginateModel<ProductSchemaClass>;
  let cartModel: PaginateModel<CartSchemaClass>;
  let orderModel: PaginateModel<OrderSchemaClass>;
  let comboModel: PaginateModel<ComboSchemaClass>;
  let flashSaleModel: PaginateModel<FlashSaleSchemaClass>;
  let flashSaleProductModel: PaginateModel<FlashSaleProductSchemaClass>;
  let productRepository: ProductDocumentRepository;
  let cartRepository: CartDocumentRepository;
  let comboRepository: ComboDocumentRepository;
  let flashSaleRepository: FlashSaleDocumentRepository;
  let flashSaleProductRepository: FlashSaleProductDocumentRepository;
  let module: TestingModule;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  // Mock shipping service - returns fixed shipping fee for testing
  const mockShippingService = {
    calculateShipping: jest.fn().mockResolvedValue({
      depot: { id: 12345, name: 'Main Depot' },
      items: [],
      totalWeight: 400,
      totalValue: 100000,
      selectedCarrier: {
        carrierId: 2,
        carrierName: 'Viettel Post',
        carrierLogo: 'https://example.com/logo.png',
        serviceName: 'Standard',
        serviceCode: 'STD',
        shipFee: 30000,
        codFee: 0,
        customerShipFee: 30000,
      },
      totalShippingFee: 30000,
    }),
    calculateFixedShipping: jest.fn().mockResolvedValue({
      depot: { id: 12345, name: 'Main Depot' },
      selectedCarrier: {
        carrierId: 2,
        carrierName: 'Viettel Post',
        serviceId: 1,
      },
      totalShippingFee: 30000,
    }),
  };

  // Mock OrderCdpSyncService - fire-and-forget sync
  const mockOrderCdpSyncService = {
    syncOrder: jest
      .fn()
      .mockResolvedValue({ cdpCustomerId: null, success: true }),
  };

  // Helper to create test product
  const createTestProduct = async (
    overrides: Partial<{
      code: string;
      name: string;
      prices: { retail: number };
      status: ProductStatus;
      inventory: { remain: number; available: number };
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
      images: ['http://example.com/image.jpg'],
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      inventory: { remain: 100, available: 100, ...overrides.inventory },
      ...overrides,
    };
    return productRepository.create(productData as any);
  };

  // Helper to create test combo
  const createTestCombo = async (
    items: Array<{ productId: string; quantity: number }>,
    overrides: Partial<{
      name: string;
      discountType: DiscountType;
      discountValue: number;
      status: ComboStatus;
      originalPrice: number;
      validFrom: Date | null;
      validTo: Date | null;
    }> = {},
  ) => {
    const timestamp = Date.now() + Math.random();
    const comboData = {
      name: `Test Combo ${timestamp}`,
      description: 'Test combo',
      items,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      originalPrice: 200000,
      status: ComboStatus.ACTIVE,
      validFrom: null,
      validTo: null,
      deletedAt: null,
      ...overrides,
    };
    return comboRepository.create(comboData as any);
  };

  // Helper to create test flash sale with flash_sale_products record
  const createTestFlashSale = async (
    productId: string,
    overrides: Partial<{
      name: string;
      discountType: DiscountType;
      discountValue: number;
      promotionalQuantity: number;
      soldCount: number;
      limit: number;
      startTime: Date;
      endTime: Date;
    }> = {},
  ) => {
    const now = new Date();
    const endTime =
      overrides.endTime ?? new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const timestamp = Date.now() + Math.random();
    const flashSaleName = overrides.name ?? `Flash Sale ${timestamp}`;

    const discountType = overrides.discountType ?? DiscountType.FIXED;
    const discountValue = overrides.discountValue ?? 20000;
    const promotionalQuantity = overrides.promotionalQuantity ?? 100;
    const soldCount = overrides.soldCount ?? 0;

    const flashSaleData = {
      name: flashSaleName,
      startTime: overrides.startTime ?? now,
      endTime,
      status: FlashSaleStatus.ACTIVE,
      products: [],
      ...overrides,
    };
    const flashSale = await flashSaleModel.create(flashSaleData as any);

    // Look up the product to get its price
    const product = await productRepository.findById(productId);
    const originalPrice = product?.prices?.retail ?? 100000;
    const discountAmount =
      discountType === DiscountType.PERCENTAGE
        ? Math.round((originalPrice * discountValue) / 100)
        : discountValue;
    const flashSalePrice = originalPrice - discountAmount;
    const discountPercent = Math.round((discountAmount / originalPrice) * 100);

    // Create flash_sale_products record
    await flashSaleProductRepository.createOne({
      flashSaleId: flashSale._id.toString(),
      flashSaleName,
      productId,
      name: product?.name ?? 'Test Product',
      code: product?.code ?? 'PROD',
      status: ProductStatus.ACTIVE,
      hide: false,
      discountType,
      discountValue,
      originalPrice,
      flashSalePrice,
      discountAmount,
      discountPercent,
      promotionalQuantity,
      soldCount,
      remainingStock: promotionalQuantity - soldCount,
      effectivePrice: flashSalePrice,
      endTime,
      isEnabled: true,
    });

    return flashSale;
  };

  // Helper to create cart with items
  const createCartWithItems = (
    sessionId: string,
    userId: string | null,
    items: Array<{
      productId: string;
      variantId?: string | null;
      code: string;
      name: string;
      price: number;
      quantity: number;
      image?: string | null;
      comboInstanceId?: string | null;
    }>,
    comboInstances?: Array<{
      comboInstanceId: string;
      comboId: string;
      comboName: string;
      discountType: DiscountType;
      discountValue: number;
      originalPrice: number;
      discountAmount: number;
    }>,
  ) => {
    const cartItems = items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      code: item.code,
      name: item.name,
      image: item.image ?? null,
      price: item.price,
      quantity: item.quantity,
      comboInstanceId: item.comboInstanceId ?? null,
    }));

    return cartRepository.create({
      userId,
      sessionId,
      items: cartItems,
      comboInstances: comboInstances || [],
      expiresAt: null,
    } as any);
  };

  // Standard shipping address for testing
  const testShippingAddress = {
    address: '123 Nguyen Hue Street',
    ward: 'Ben Nghe',
    district: 'District 1',
    city: 'Ho Chi Minh City',
    cityId: 79,
    districtId: 769,
    wardId: 26740,
  };

  // Standard customer info for testing
  const testCustomer = {
    name: 'Nguyen Van A',
    phone: '0901234567',
    email: 'test@example.com',
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: CheckoutSessionSchemaClass.name,
            schema: CheckoutSessionSchema,
          },
          { name: ProductSchemaClass.name, schema: ProductSchema },
          { name: CartSchemaClass.name, schema: CartSchema },
          { name: OrderSchemaClass.name, schema: OrderSchema },
          { name: ComboSchemaClass.name, schema: ComboSchema },
          { name: FlashSaleSchemaClass.name, schema: FlashSaleSchema },
          {
            name: FlashSaleProductSchemaClass.name,
            schema: FlashSaleProductSchema,
          },
        ]),
      ],
      providers: [
        CheckoutService,
        CheckoutSessionDocumentRepository,
        ProductDocumentRepository,
        CartDocumentRepository,
        OrderDocumentRepository,
        ComboDocumentRepository,
        FlashSaleDocumentRepository,
        FlashSaleProductDocumentRepository,
        {
          provide: CheckoutSessionRepository,
          useExisting: CheckoutSessionDocumentRepository,
        },
        { provide: ProductRepository, useExisting: ProductDocumentRepository },
        { provide: CartRepository, useExisting: CartDocumentRepository },
        { provide: OrderRepository, useExisting: OrderDocumentRepository },
        { provide: ComboRepository, useExisting: ComboDocumentRepository },
        {
          provide: FlashSaleRepository,
          useExisting: FlashSaleDocumentRepository,
        },
        {
          provide: FlashSaleProductRepository,
          useExisting: FlashSaleProductDocumentRepository,
        },
        { provide: ShippingService, useValue: mockShippingService },
        { provide: OrderCdpSyncService, useValue: mockOrderCdpSyncService },
        {
          provide: OrderNhanhSyncService,
          useValue: { syncOrder: jest.fn() },
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
          provide: GiftValidationService,
          useValue: {
            validateGift: jest.fn(),
            validateAndRemoveIneligibleGifts: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: CdpService,
          useValue: {
            getCustomer: jest.fn(),
            createOrUpdateCustomer: jest.fn(),
          },
        },
        {
          provide: OrderService,
          useValue: {
            getById: jest.fn(),
            getByNumber: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            findByPhone: jest.fn(),
          },
        },
        {
          provide: OrderConfirmationService,
          useValue: {
            sendConfirmation: jest.fn(),
            createOrderConfirmationToken: jest.fn(),
          },
        },
        { provide: I18nService, useValue: mockI18n },
        {
          provide: PromotionRepository,
          useValue: {
            findActiveByType: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PromotionProductRepository,
          useValue: {
            incrementSoldCount: jest.fn(),
          },
        },
        {
          provide: AffiliateRepository,
          useValue: {
            findByAffiliateCode: jest.fn(),
          },
        },
        {
          provide: AffiliateOrderCommissionsService,
          useValue: {
            createFromOrder: jest.fn(),
            updateOrderStatus: jest.fn(),
          },
        },
        {
          provide: PromotionUsageRecordRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    checkoutSessionModel = module.get<
      PaginateModel<CheckoutSessionSchemaClass>
    >(getModelToken(CheckoutSessionSchemaClass.name));
    productModel = module.get<PaginateModel<ProductSchemaClass>>(
      getModelToken(ProductSchemaClass.name),
    );
    cartModel = module.get<PaginateModel<CartSchemaClass>>(
      getModelToken(CartSchemaClass.name),
    );
    orderModel = module.get<PaginateModel<OrderSchemaClass>>(
      getModelToken(OrderSchemaClass.name),
    );
    comboModel = module.get<PaginateModel<ComboSchemaClass>>(
      getModelToken(ComboSchemaClass.name),
    );
    flashSaleModel = module.get<PaginateModel<FlashSaleSchemaClass>>(
      getModelToken(FlashSaleSchemaClass.name),
    );
    productRepository = module.get<ProductDocumentRepository>(
      ProductDocumentRepository,
    );
    cartRepository = module.get<CartDocumentRepository>(CartDocumentRepository);
    comboRepository = module.get<ComboDocumentRepository>(
      ComboDocumentRepository,
    );
    flashSaleRepository = module.get<FlashSaleDocumentRepository>(
      FlashSaleDocumentRepository,
    );
    flashSaleProductRepository = module.get<FlashSaleProductDocumentRepository>(
      FlashSaleProductDocumentRepository,
    );
    flashSaleProductModel = module.get<
      PaginateModel<FlashSaleProductSchemaClass>
    >(getModelToken(FlashSaleProductSchemaClass.name));
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await checkoutSessionModel.deleteMany({});
    await productModel.deleteMany({});
    await cartModel.deleteMany({});
    await orderModel.deleteMany({});
    await comboModel.deleteMany({});
    await flashSaleModel.deleteMany({});
    await flashSaleProductModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('Direct Items Checkout Flow', () => {
    it('should create checkout session with items', async () => {
      const product = await createTestProduct({
        name: 'Checkout Product',
        prices: { retail: 150000 },
      });
      const sessionId = 'direct-checkout-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 2 }],
      });

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.sessionNumber).toBeDefined(); // UUID format
      expect(session.items).toHaveLength(1);
      expect(session.items[0].productId).toBe(product.id);
      expect(session.items[0].quantity).toBe(2);
      expect(session.items[0].originalPrice).toBe(150000);
      expect(session.items[0].effectivePrice).toBe(150000);
      expect(session.items[0].subtotal).toBe(300000);
      expect(session.items[0].isAvailable).toBe(true);
      expect(session.subtotal).toBe(300000);
      expect(session.status).toBe(CheckoutSessionStatus.ACTIVE);
      expect(session.canPlaceOrder).toBe(false); // Missing customer info
      expect(session.missingFields).toContain('customer.name');
    });

    it('should update checkout session with customer info', async () => {
      const product = await createTestProduct();
      const sessionId = 'update-checkout-session';

      // Create session
      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
      });

      // Update with customer info
      const updated = await service.upsertSession(sessionId, {
        id: session.id,
        items: [{ productId: product.id, quantity: 1 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      expect(updated.customer?.name).toBe(testCustomer.name);
      expect(updated.customer?.phone).toBe(testCustomer.phone);
      expect(updated.shippingAddress?.address).toBe(
        testShippingAddress.address,
      );
      expect(updated.shippingAddress?.cityId).toBe(testShippingAddress.cityId);
      expect(updated.paymentMethod).toBe(PaymentMethod.COD);
      expect(updated.shippingFee).toBe(30000); // Mocked
      expect(updated.canPlaceOrder).toBe(true);
      expect(updated.missingFields).toHaveLength(0);
    });

    it('should place order from checkout session', async () => {
      const product = await createTestProduct({
        name: 'Order Product',
        prices: { retail: 100000 },
      });
      const sessionId = 'place-order-session';

      // Create session with full info
      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 2 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      // Place order
      const result = await service.placeOrder(session.id, sessionId, {});

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order.orderNumber).toMatch(/^ORD-/);
      expect(result.order.total).toBe(230000); // 200000 + 30000 shipping
      expect(result.order.status).toBe(OrderStatus.PENDING);

      // Verify session is completed
      const updatedSession = await checkoutSessionModel.findById(session.id);
      expect(updatedSession?.status).toBe(CheckoutSessionStatus.COMPLETED);
      expect(updatedSession?.orderId?.toString()).toBe(result.order.id);
    });

    it('should create order for guest user', async () => {
      const product = await createTestProduct();
      const sessionId = 'guest-order-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
      });

      const result = await service.placeOrder(session.id, sessionId, {});

      expect(result.success).toBe(true);
      expect(result.order.userId).toBeNull();
      expect(result.order.sessionId).toBe(sessionId);
      expect(result.order.paymentMethod).toBe(PaymentMethod.BANK_TRANSFER);
    });

    it('should create order for authenticated user', async () => {
      const product = await createTestProduct();
      const sessionId = 'user-order-session';
      const userId = new mongoose.Types.ObjectId().toString();

      const session = await service.upsertSession(
        sessionId,
        {
          items: [{ productId: product.id, quantity: 1 }],
          customer: testCustomer,
          shippingAddress: testShippingAddress,
          paymentMethod: PaymentMethod.COD,
        },
        userId,
      );

      const result = await service.placeOrder(
        session.id,
        sessionId,
        {},
        userId,
      );

      expect(result.success).toBe(true);
      expect(result.order.userId).toBe(userId);
    });
  });

  describe('Cart to Checkout to Order Flow', () => {
    it('should create checkout session from cart items', async () => {
      const product = await createTestProduct({
        prices: { retail: 150000 },
      });
      const sessionId = 'cart-checkout-session';

      // Create cart with items
      await createCartWithItems(sessionId, null, [
        {
          productId: product.id,
          code: product.code,
          name: product.name,
          price: 150000,
          quantity: 2,
        },
      ]);

      // Create checkout session using cart items
      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 2 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      expect(session.items).toHaveLength(1);
      expect(session.items[0].productId).toBe(product.id);
      expect(session.subtotal).toBe(300000);
      expect(session.canPlaceOrder).toBe(true);
    });

    it('should clear cart items after order', async () => {
      const product = await createTestProduct();
      const sessionId = 'clear-cart-session';

      // Create cart with items
      const cart = await createCartWithItems(sessionId, null, [
        {
          productId: product.id,
          code: product.code,
          name: product.name,
          price: 100000,
          quantity: 2,
        },
      ]);

      // Create and place order
      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 2 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      await service.placeOrder(session.id, sessionId, {});

      // Verify cart was cleared
      const updatedCart = await cartModel.findById(cart.id);
      expect(updatedCart?.items).toHaveLength(0);
    });

    it('should keep remaining cart items when only partial checkout', async () => {
      const product1 = await createTestProduct({
        code: 'KEEP-1',
        prices: { retail: 100000 },
      });
      const product2 = await createTestProduct({
        code: 'KEEP-2',
        prices: { retail: 200000 },
      });
      const sessionId = 'partial-checkout-session';

      // Create cart with both items
      const cart = await createCartWithItems(sessionId, null, [
        {
          productId: product1.id,
          code: product1.code,
          name: product1.name,
          price: 100000,
          quantity: 1,
        },
        {
          productId: product2.id,
          code: product2.code,
          name: product2.name,
          price: 200000,
          quantity: 1,
        },
      ]);

      // Checkout only product1
      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product1.id, quantity: 1 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      await service.placeOrder(session.id, sessionId, {});

      // Cart should still have product2
      const updatedCart = await cartModel.findById(cart.id);
      expect(updatedCart?.items).toHaveLength(1);
      expect(updatedCart?.items[0].productId.toString()).toBe(product2.id);
    });
  });

  describe('Combo Checkout Flow', () => {
    it('should create checkout session with combo', async () => {
      const product1 = await createTestProduct({
        code: 'COMBO-P1',
        prices: { retail: 100000 },
      });
      const product2 = await createTestProduct({
        code: 'COMBO-P2',
        prices: { retail: 150000 },
      });

      const combo = await createTestCombo(
        [
          { productId: product1.id, quantity: 1 },
          { productId: product2.id, quantity: 1 },
        ],
        {
          originalPrice: 250000,
          discountType: DiscountType.FIXED,
          discountValue: 50000,
        },
      );

      const sessionId = 'combo-checkout-session';

      const session = await service.upsertSession(sessionId, {
        combos: [
          {
            comboId: combo.id,
            items: [
              { productId: product1.id, variantId: product1.id },
              { productId: product2.id, variantId: product2.id },
            ],
          },
        ],
      });

      expect(session.items).toHaveLength(2);
      expect(session.comboInstances).toHaveLength(1);
      expect(session.comboInstances![0].comboId).toBe(combo.id);
      expect(session.comboInstances![0].discountAmount).toBe(50000);
      expect(session.subtotal).toBe(250000); // 100000 + 150000
      expect(session.discount).toBe(50000); // Combo discount (order-level)
      expect(session.total).toBe(200000); // 250000 - 50000

      // Combo items should NOT have item-level discounts
      expect(session.items[0].discount).toBe(0);
      expect(session.items[0].discountDetails).toBeNull();
      expect(session.items[1].discount).toBe(0);
      expect(session.items[1].discountDetails).toBeNull();

      // totalDiscount should equal order-level discount for combos
      expect(session.totalDiscount).toBe(50000);
    });

    it('should place order with combo discount', async () => {
      const product1 = await createTestProduct({
        code: 'ORDER-COMBO-P1',
        prices: { retail: 100000 },
      });
      const product2 = await createTestProduct({
        code: 'ORDER-COMBO-P2',
        prices: { retail: 100000 },
      });

      const combo = await createTestCombo(
        [
          { productId: product1.id, quantity: 1 },
          { productId: product2.id, quantity: 1 },
        ],
        {
          originalPrice: 200000,
          discountType: DiscountType.PERCENTAGE,
          discountValue: 20,
        },
      );

      const sessionId = 'combo-order-session';

      const session = await service.upsertSession(sessionId, {
        combos: [
          {
            comboId: combo.id,
            items: [
              { productId: product1.id, variantId: product1.id },
              { productId: product2.id, variantId: product2.id },
            ],
          },
        ],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      const result = await service.placeOrder(session.id, sessionId, {});

      expect(result.success).toBe(true);
      expect(result.order.subtotal).toBe(200000);
      expect(result.order.discount).toBe(40000); // 20% of 200000
      expect(result.order.shippingFee).toBe(30000);
      expect(result.order.total).toBe(190000); // 200000 + 30000 - 40000
      expect(result.order.discountDetails).toHaveLength(1);
      expect(result.order.discountDetails![0].type).toBe('combo');

      // Combo items should NOT have item-level discounts
      expect(result.order.items[0].discount).toBe(0);
      expect(result.order.items[0].discountDetails).toBeNull();
      expect(result.order.items[1].discount).toBe(0);
      expect(result.order.items[1].discountDetails).toBeNull();

      // totalDiscount should equal order-level discount for combos
      expect(result.order.totalDiscount).toBe(40000);
    });

    it('should reject inactive combo', async () => {
      const product = await createTestProduct();
      const combo = await createTestCombo(
        [{ productId: product.id, quantity: 1 }],
        { status: ComboStatus.INACTIVE },
      );

      const sessionId = 'inactive-combo-session';

      await expect(
        service.upsertSession(sessionId, {
          combos: [
            {
              comboId: combo.id,
              items: [{ productId: product.id, variantId: product.id }],
            },
          ],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject expired combo', async () => {
      const product = await createTestProduct();
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      const combo = await createTestCombo(
        [{ productId: product.id, quantity: 1 }],
        { validTo: pastDate },
      );

      const sessionId = 'expired-combo-session';

      await expect(
        service.upsertSession(sessionId, {
          combos: [
            {
              comboId: combo.id,
              items: [{ productId: product.id, variantId: product.id }],
            },
          ],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('Flash Sale Checkout Flow', () => {
    it('should apply flash sale pricing in checkout session', async () => {
      const product = await createTestProduct({
        prices: { retail: 100000 },
      });

      // Create active flash sale
      await createTestFlashSale(product.id, {
        discountType: DiscountType.FIXED,
        discountValue: 20000,
        promotionalQuantity: 100,
        soldCount: 0,
      });

      const sessionId = 'flash-sale-checkout';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 2 }],
      });

      expect(session.items[0].originalPrice).toBe(100000);
      expect(session.items[0].effectivePrice).toBe(80000); // 100000 - 20000
      expect(session.items[0].flashSaleId).toBeDefined();
      expect(session.items[0].subtotal).toBe(160000); // 80000 * 2

      // Verify item-level discount field
      expect(session.items[0].discount).toBe(40000); // 20000 per unit * 2

      // Verify item-level discountDetails
      expect(session.items[0].discountDetails).toBeDefined();
      expect(session.items[0].discountDetails!.length).toBe(1);
      expect(session.items[0].discountDetails![0].type).toBe('flash_sale');
      expect(session.items[0].discountDetails![0].discountAmountPerUnit).toBe(
        20000,
      );
      expect(session.items[0].discountDetails![0].discountAmount).toBe(40000);

      // Verify session-level fields
      expect(session.subtotal).toBe(160000);
      expect(session.discount).toBe(0); // No combo discounts
      expect(session.totalDiscount).toBe(40000); // Item-level discount only
    });

    it('should place order with flash sale pricing', async () => {
      const product = await createTestProduct({
        prices: { retail: 100000 },
      });

      await createTestFlashSale(product.id, {
        discountType: DiscountType.PERCENTAGE,
        discountValue: 30,
        promotionalQuantity: 50,
        soldCount: 0,
      });

      const sessionId = 'flash-sale-order';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      const result = await service.placeOrder(session.id, sessionId, {});

      expect(result.success).toBe(true);
      expect(result.order.items[0].price).toBe(70000); // 100000 - 30%
      expect(result.order.items[0].originalPrice).toBe(100000);

      // Verify item-level discount on order
      expect(result.order.items[0].discount).toBe(30000); // 30% of 100000

      // Verify item-level discountDetails on order
      expect(result.order.items[0].discountDetails).toBeDefined();
      expect(result.order.items[0].discountDetails!.length).toBe(1);
      expect(result.order.items[0].discountDetails![0].type).toBe('flash_sale');
      expect(
        result.order.items[0].discountDetails![0].discountAmountPerUnit,
      ).toBe(30000);

      // Verify order totals
      expect(result.order.subtotal).toBe(70000);
      expect(result.order.discount).toBe(0); // No combo discounts
      expect(result.order.totalDiscount).toBe(30000); // Item-level discount only
      expect(result.order.total).toBe(100000); // 70000 + 30000 shipping
    });

    it('should return validation error when flash sale stock insufficient', async () => {
      const product = await createTestProduct({
        prices: { retail: 100000 },
      });

      // Flash sale with limited stock
      await createTestFlashSale(product.id, {
        promotionalQuantity: 5,
        soldCount: 3, // Only 2 left
      });

      const sessionId = 'flash-sale-stock-session';

      // Create session requesting 5 items
      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 5 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      const result = await service.placeOrder(session.id, sessionId, {});

      expect(result.success).toBe(false);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors![0].error).toBe('insufficient_stock');
      expect(result.validationErrors![0].availableQuantity).toBe(2);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should mark unavailable products in session', async () => {
      const product = await createTestProduct({
        status: ProductStatus.INACTIVE,
      });
      const sessionId = 'unavailable-product-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
      });

      expect(session.items[0].isAvailable).toBe(false);
      expect(session.items[0].unavailableReason).toBeDefined();
      expect(session.hasUnavailableItems).toBe(true);
    });

    it('should return validation errors for unavailable products on place order', async () => {
      const product = await createTestProduct();
      const sessionId = 'validation-error-session';

      // Create session while product is active
      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      // Deactivate product
      await productModel.findByIdAndUpdate(product.id, {
        status: ProductStatus.INACTIVE,
      });

      // Try to place order
      const result = await service.placeOrder(session.id, sessionId, {});

      expect(result.success).toBe(false);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors![0].error).toBe('unavailable');
    });

    it('should return missing fields when required info not provided', async () => {
      const product = await createTestProduct();
      const sessionId = 'missing-fields-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
      });

      const result = await service.placeOrder(session.id, sessionId, {});

      expect(result.success).toBe(false);
      expect(result.missingFields).toContain('customer.name');
      expect(result.missingFields).toContain('customer.phone');
      expect(result.missingFields).toContain('shippingAddress.address');
      expect(result.missingFields).toContain('paymentMethod');
    });

    it('should throw error when session not found', async () => {
      await expect(
        service.getById('507f1f77bcf86cd799439011', 'some-session'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when session already completed', async () => {
      const product = await createTestProduct();
      const sessionId = 'completed-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      // Place order first time
      await service.placeOrder(session.id, sessionId, {});

      // Try to place order again
      await expect(
        service.placeOrder(session.id, sessionId, {}),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when no items provided', async () => {
      const sessionId = 'no-items-session';

      await expect(
        service.upsertSession(sessionId, {
          items: [],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('Ownership Validation', () => {
    it('should allow guest access with matching sessionId', async () => {
      const product = await createTestProduct();
      const sessionId = 'guest-access-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
      });

      const fetched = await service.getById(session.id, sessionId);

      expect(fetched.id).toBe(session.id);
    });

    it('should allow authenticated user access with matching userId', async () => {
      const product = await createTestProduct();
      const sessionId = 'user-access-session';
      const userId = new mongoose.Types.ObjectId().toString();

      const session = await service.upsertSession(
        sessionId,
        {
          items: [{ productId: product.id, quantity: 1 }],
        },
        userId,
      );

      const fetched = await service.getById(
        session.id,
        'different-session', // Different session, but matching user
        userId,
      );

      expect(fetched.id).toBe(session.id);
    });

    it('should reject access with wrong sessionId for guest', async () => {
      const product = await createTestProduct();
      const sessionId = 'original-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
      });

      await expect(
        service.getById(session.id, 'wrong-session'),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should reject access with wrong userId for authenticated user', async () => {
      const product = await createTestProduct();
      const sessionId = 'user-session';
      const userId = new mongoose.Types.ObjectId().toString();
      const wrongUserId = new mongoose.Types.ObjectId().toString();

      const session = await service.upsertSession(
        sessionId,
        {
          items: [{ productId: product.id, quantity: 1 }],
        },
        userId,
      );

      await expect(
        service.getById(session.id, sessionId, wrongUserId),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('Cancel Session', () => {
    it('should cancel checkout session', async () => {
      const product = await createTestProduct();
      const sessionId = 'cancel-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
      });

      await service.cancelSession(session.id, sessionId);

      // Session should be deleted
      const deleted = await checkoutSessionModel.findById(session.id);
      expect(deleted).toBeNull();
    });

    it('should reject cancel with wrong owner', async () => {
      const product = await createTestProduct();
      const sessionId = 'cancel-wrong-owner';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
      });

      await expect(
        service.cancelSession(session.id, 'wrong-session'),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('Mixed Items and Combos', () => {
    it('should checkout with both standalone items and combos', async () => {
      const product1 = await createTestProduct({
        code: 'STANDALONE',
        prices: { retail: 50000 },
      });
      const product2 = await createTestProduct({
        code: 'COMBO-A',
        prices: { retail: 100000 },
      });
      const product3 = await createTestProduct({
        code: 'COMBO-B',
        prices: { retail: 100000 },
      });

      const combo = await createTestCombo(
        [
          { productId: product2.id, quantity: 1 },
          { productId: product3.id, quantity: 1 },
        ],
        {
          originalPrice: 200000,
          discountType: DiscountType.FIXED,
          discountValue: 40000,
        },
      );

      const sessionId = 'mixed-checkout-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product1.id, quantity: 2 }],
        combos: [
          {
            comboId: combo.id,
            items: [
              { productId: product2.id, variantId: product2.id },
              { productId: product3.id, variantId: product3.id },
            ],
          },
        ],
        customer: testCustomer,
        shippingAddress: testShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      expect(session.items).toHaveLength(3); // 1 standalone + 2 combo
      expect(session.comboInstances).toHaveLength(1);
      expect(session.subtotal).toBe(300000); // 50000*2 + 100000 + 100000
      expect(session.discount).toBe(40000); // Combo discount
      expect(session.total).toBe(290000); // 300000 + 30000 shipping - 40000 combo

      const result = await service.placeOrder(session.id, sessionId, {});

      expect(result.success).toBe(true);
      expect(result.order.items).toHaveLength(3);
      expect(result.order.discount).toBe(40000);
    });
  });

  describe('Session Number Generation', () => {
    it('should generate unique session numbers', async () => {
      const product = await createTestProduct();
      const sessionNumbers: string[] = [];

      for (let i = 0; i < 5; i++) {
        const sessionId = `unique-session-${i}`;
        const session = await service.upsertSession(sessionId, {
          items: [{ productId: product.id, quantity: 1 }],
        });
        sessionNumbers.push(session.sessionNumber);
      }

      // All session numbers should be unique
      const uniqueNumbers = new Set(sessionNumbers);
      expect(uniqueNumbers.size).toBe(5);

      // All should be defined (UUID format)
      sessionNumbers.forEach((num) => {
        expect(num).toBeDefined();
        expect(num.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Shipping Calculation', () => {
    it('should calculate shipping when address provided', async () => {
      const product = await createTestProduct();
      const sessionId = 'shipping-calc-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: testShippingAddress,
      });

      expect(mockShippingService.calculateFixedShipping).toHaveBeenCalled();
      expect(session.shippingFee).toBe(30000);
    });

    it('should not calculate shipping when address incomplete', async () => {
      const product = await createTestProduct();
      const sessionId = 'no-shipping-session';

      const session = await service.upsertSession(sessionId, {
        items: [{ productId: product.id, quantity: 1 }],
        shippingAddress: {
          address: '123 Test Street',
          city: 'Ho Chi Minh City',
          // Missing cityId and districtId - shipping should not be calculated
        },
      });

      // Shipping fee should be 0 when address is incomplete (no cityId/districtId)
      expect(session.shippingFee).toBe(0);
      expect(session.shipping).toBeNull();
    });
  });
});
