import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
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
import { GiftValidationService } from '../../../src/shop/cart/gift-validation.service';
import { CdpService } from '../../../src/cdp/cdp.service';
import { OrderService } from '../../../src/shop/order/order.service';
import { UserRepository } from '../../../src/users/domain/user.repository';
import { OrderConfirmationService } from '../../../src/shop/order-confirmation/order-confirmation.service';
import { CheckoutSessionDiscountDetailType } from '../../../src/shop/checkout/domain/checkout-session';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';

/**
 * Integration tests for flash sales on parent products applying to variants in checkout
 *
 * Scenario: CMS creates flash sale on parent product "Tanya"
 * Expected: When customer creates checkout session with variant "Tanya - Black - S",
 *           flash sale discount is applied in the session
 */
describe('Checkout Parent-Variant Flash Sale Integration', () => {
  let service: CheckoutService;
  let checkoutSessionModel: PaginateModel<CheckoutSessionSchemaClass>;
  let productModel: PaginateModel<ProductSchemaClass>;
  let flashSaleModel: PaginateModel<FlashSaleSchemaClass>;
  let flashSaleProductModel: PaginateModel<FlashSaleProductSchemaClass>;
  let productRepository: ProductDocumentRepository;
  let flashSaleRepository: FlashSaleDocumentRepository;
  let flashSaleProductRepository: FlashSaleProductDocumentRepository;
  let module: TestingModule;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  // Mock shipping service
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
  };

  // Mock OrderCdpSyncService
  const mockOrderCdpSyncService = {
    syncOrder: jest
      .fn()
      .mockResolvedValue({ cdpCustomerId: null, success: true }),
  };

  // Helper to create a parent product with variants
  const createParentWithVariants = async () => {
    const businessId = '110668';
    const source = 'nhanh' as const;
    const parentSnapshotId = 2001;

    // Create parent product (snapshot.parentId = -2 means it has variants)
    const parentProduct = await productRepository.create({
      businessId,
      source,
      code: 'DRESS-A',
      name: 'Dress A',
      description: 'Beautiful dress',
      prices: { retail: 600000 },
      images: ['http://example.com/dress-a.jpg'],
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      inventory: { remain: 100, available: 100 },
      snapshot: {
        id: parentSnapshotId,
        parentId: -2, // Parent product marker
      },
    } as any);

    // Create variant 1: Dress A - Red - S
    const variant1 = await productRepository.create({
      businessId,
      source,
      code: 'DRESS-A-RED-S',
      name: 'Dress A - Red - S',
      description: 'Beautiful dress - Red - Size S',
      prices: { retail: 600000 },
      images: ['http://example.com/dress-a-red-s.jpg'],
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      inventory: { remain: 100, available: 100 },
      attributes: [
        { id: 1, name: 'Color', value: 'Red' },
        { id: 2, name: 'Size', value: 'S' },
      ],
      snapshot: {
        id: 2002,
        parentId: parentSnapshotId,
      },
    } as any);

    // Create variant 2: Dress A - Blue - M
    const variant2 = await productRepository.create({
      businessId,
      source,
      code: 'DRESS-A-BLUE-M',
      name: 'Dress A - Blue - M',
      description: 'Beautiful dress - Blue - Size M',
      prices: { retail: 600000 },
      images: ['http://example.com/dress-a-blue-m.jpg'],
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      inventory: { remain: 100, available: 100 },
      attributes: [
        { id: 1, name: 'Color', value: 'Blue' },
        { id: 2, name: 'Size', value: 'M' },
      ],
      snapshot: {
        id: 2003,
        parentId: parentSnapshotId,
      },
    } as any);

    // Populate parent metadata for variants
    await productRepository.populateParentMetadata(businessId, source);

    // Reload variants to get updated parentProductId
    const updatedVariant1 = await productRepository.findById(variant1.id);
    const updatedVariant2 = await productRepository.findById(variant2.id);

    return {
      parent: parentProduct,
      variant1: updatedVariant1!,
      variant2: updatedVariant2!,
    };
  };

  // Helper to create an active flash sale on a product
  const createFlashSaleOnProduct = async (
    productId: string,
    discountType: DiscountType = DiscountType.PERCENTAGE,
    discountValue: number = 25,
  ) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const promotionalQuantity = 50;
    const soldCount = 0;

    const flashSale = await flashSaleModel.create({
      name: 'Checkout Flash Sale',
      startTime: oneHourAgo,
      endTime: oneHourLater,
      isEnabled: true,
      products: [],
      deletedAt: null,
    } as any);

    // Look up the product to get its price
    const product = await productRepository.findById(productId);
    const originalPrice = product?.prices?.retail ?? 600000;
    const discountAmount =
      discountType === DiscountType.PERCENTAGE
        ? Math.round((originalPrice * discountValue) / 100)
        : discountValue;
    const flashSalePrice = originalPrice - discountAmount;
    const discountPercent = Math.round((discountAmount / originalPrice) * 100);

    // Create flash_sale_products record
    await flashSaleProductRepository.createOne({
      flashSaleId: flashSale._id.toString(),
      flashSaleName: 'Checkout Flash Sale',
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
      endTime: oneHourLater,
      isEnabled: true,
    });

    return flashSale;
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
            validateGiftEligibility: jest.fn(),
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
    flashSaleModel = module.get<PaginateModel<FlashSaleSchemaClass>>(
      getModelToken(FlashSaleSchemaClass.name),
    );
    productRepository = module.get<ProductDocumentRepository>(
      ProductDocumentRepository,
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
    await flashSaleModel.deleteMany({});
    await flashSaleProductModel.deleteMany({});
    const cartModel = module.get<PaginateModel<CartSchemaClass>>(
      getModelToken(CartSchemaClass.name),
    );
    await cartModel.deleteMany({});
    const orderModel = module.get<PaginateModel<OrderSchemaClass>>(
      getModelToken(OrderSchemaClass.name),
    );
    await orderModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('Checkout session with flash sale on parent product', () => {
    it('should apply flash sale discount to variant when parent has flash sale', async () => {
      const { parent, variant1 } = await createParentWithVariants();

      // Create flash sale on PARENT product with 25% discount
      await createFlashSaleOnProduct(parent.id, DiscountType.PERCENTAGE, 25);

      const sessionId = 'checkout-session-123';

      // Create checkout session with VARIANT
      const session = await service.upsertSession(sessionId, {
        items: [
          {
            productId: parent.id,
            variantId: variant1.id,
            quantity: 1,
          },
        ],
      });

      // Verify flash sale is applied
      expect(session.items).toHaveLength(1);
      const item = session.items[0];

      expect(item.originalPrice).toBe(600000);
      // 25% off 600000 = 150000 discount, so effective price = 450000
      expect(item.effectivePrice).toBe(450000);
      expect(item.flashSaleId).not.toBeNull();
      expect(item.flashSaleName).toBe('Checkout Flash Sale');
    });

    it('should include flash sale discount in discount details', async () => {
      const { parent, variant1 } = await createParentWithVariants();

      // Create flash sale with fixed 100000 discount
      await createFlashSaleOnProduct(parent.id, DiscountType.FIXED, 100000);

      const sessionId = 'checkout-session-456';

      const session = await service.upsertSession(sessionId, {
        items: [
          {
            productId: parent.id,
            variantId: variant1.id,
            quantity: 2,
          },
        ],
      });

      // Check item-level discount field
      expect(session.items[0].discount).toBe(200000); // 100000 per unit * 2

      // Check item-level discount details (flash sales are now at item level)
      expect(session.items[0].discountDetails).toBeDefined();
      expect(session.items[0].discountDetails!.length).toBeGreaterThan(0);

      const flashSaleDiscount = session.items[0].discountDetails!.find(
        (d) => d.type === CheckoutSessionDiscountDetailType.FLASH_SALE,
      );
      expect(flashSaleDiscount).toBeDefined();
      // Discount per unit is 100000, quantity is 2, so total discount is 200000
      expect(flashSaleDiscount!.discountAmountPerUnit).toBe(100000);
      expect(flashSaleDiscount!.discountAmount).toBe(200000);

      // Session-level discountDetails should be empty (only combo discounts go there)
      expect(session.discountDetails?.length ?? 0).toBe(0);
      expect(session.discount).toBe(0); // No order-level (combo) discounts

      // totalDiscount should reflect item-level discounts
      expect(session.totalDiscount).toBe(200000);
    });

    it('should calculate session totals correctly with parent flash sale', async () => {
      const { parent, variant1, variant2 } = await createParentWithVariants();

      // Create flash sale with 20% discount on parent
      await createFlashSaleOnProduct(parent.id, DiscountType.PERCENTAGE, 20);

      const sessionId = 'checkout-session-789';

      const session = await service.upsertSession(sessionId, {
        items: [
          {
            productId: parent.id,
            variantId: variant1.id,
            quantity: 1,
          },
          {
            productId: parent.id,
            variantId: variant2.id,
            quantity: 1,
          },
        ],
      });

      // Both variants should have flash sale applied
      // Original: 600000 each, 20% off = 480000 each, discount = 120000 each
      expect(session.items[0].effectivePrice).toBe(480000);
      expect(session.items[0].discount).toBe(120000);
      expect(session.items[1].effectivePrice).toBe(480000);
      expect(session.items[1].discount).toBe(120000);

      // Subtotal should be 480000 * 2 = 960000
      expect(session.subtotal).toBe(960000);

      // Total discount should be 120000 * 2 = 240000
      expect(session.totalDiscount).toBe(240000);
      expect(session.discount).toBe(0); // No combo discounts
    });

    it('should apply flash sale to variant even without explicit variantId in DTO', async () => {
      const { parent, variant1 } = await createParentWithVariants();

      // Create flash sale on parent
      await createFlashSaleOnProduct(parent.id, DiscountType.FIXED, 50000);

      const sessionId = 'checkout-direct-variant';

      // Add variant directly (productId is the variant's ID)
      const session = await service.upsertSession(sessionId, {
        items: [
          {
            productId: variant1.id, // Using variant ID directly
            quantity: 1,
          },
        ],
      });

      // Flash sale should still apply because variant has parentProductId
      expect(session.items[0].effectivePrice).toBe(550000); // 600000 - 50000
    });
  });

  describe('No flash sale scenarios', () => {
    it('should NOT apply flash sale when product has no parent and no direct flash sale', async () => {
      // Create standalone product
      const standaloneProduct = await productRepository.create({
        businessId: '110668',
        source: 'nhanh' as const,
        code: 'STANDALONE-CHECKOUT',
        name: 'Standalone Product',
        prices: { retail: 400000 },
        images: ['http://example.com/standalone.jpg'],
        status: ProductStatus.ACTIVE,
        type: ProductType.REGULAR,
        inventory: { remain: 100, available: 100 },
        snapshot: {
          id: 8888,
          parentId: -1, // Standalone
        },
      } as any);

      // Create flash sale on a DIFFERENT product
      const { parent } = await createParentWithVariants();
      await createFlashSaleOnProduct(parent.id, DiscountType.PERCENTAGE, 30);

      const sessionId = 'checkout-standalone';

      const session = await service.upsertSession(sessionId, {
        items: [
          {
            productId: standaloneProduct.id,
            quantity: 1,
          },
        ],
      });

      // No flash sale should be applied
      expect(session.items[0].flashSaleId).toBeNull();
      expect(session.items[0].effectivePrice).toBe(400000); // Original price
    });
  });

  describe('Mixed cart - some products with flash sale, some without', () => {
    it('should apply flash sale only to products/variants with active flash sale', async () => {
      const { parent, variant1 } = await createParentWithVariants();

      // Create another product without flash sale
      const regularProduct = await productRepository.create({
        businessId: '110668',
        source: 'nhanh' as const,
        code: 'REGULAR-PRODUCT',
        name: 'Regular Product',
        prices: { retail: 200000 },
        images: ['http://example.com/regular.jpg'],
        status: ProductStatus.ACTIVE,
        type: ProductType.REGULAR,
        inventory: { remain: 100, available: 100 },
      } as any);

      // Create flash sale only on parent
      await createFlashSaleOnProduct(parent.id, DiscountType.PERCENTAGE, 10);

      const sessionId = 'checkout-mixed';

      const session = await service.upsertSession(sessionId, {
        items: [
          {
            productId: parent.id,
            variantId: variant1.id,
            quantity: 1,
          },
          {
            productId: regularProduct.id,
            quantity: 1,
          },
        ],
      });

      // Variant should have flash sale
      const variantItem = session.items.find(
        (i) => i.variantId === variant1.id,
      );
      expect(variantItem!.flashSaleId).not.toBeNull();
      expect(variantItem!.effectivePrice).toBe(540000); // 600000 - 10% = 540000

      // Regular product should NOT have flash sale
      const regularItem = session.items.find(
        (i) => i.productId === regularProduct.id && !i.variantId,
      );
      expect(regularItem!.flashSaleId).toBeNull();
      expect(regularItem!.effectivePrice).toBe(200000); // Original price
    });
  });
});
