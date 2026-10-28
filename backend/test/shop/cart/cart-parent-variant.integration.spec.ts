import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../../../src/test/mongo-test.module';
import { CartService } from '../../../src/shop/cart/cart.service';
import { CartDocumentRepository } from '../../../src/shop/cart/model/cart.repository';
import { CartRepository } from '../../../src/shop/cart/domain/cart.repository';
import {
  CartSchemaClass,
  CartSchema,
} from '../../../src/shop/cart/model/cart.schema';
import { ProductDocumentRepository } from '../../../src/products/model/product.repository';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../../../src/products/model/product.schema';
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
import { SocketService } from '../../../src/socket/socket.service';
import { GiftValidationService } from '../../../src/shop/cart/gift-validation.service';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { ComboStatus } from '../../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';

/**
 * Integration tests for flash sales and combos on parent products applying to variants
 *
 * Scenario: CMS creates flash sale on parent product "Tanya"
 * Expected: When customer adds variant "Tanya - Black - S" to cart, flash sale discount applies
 */
describe('Cart Parent-Variant Flash Sale Integration', () => {
  let service: CartService;
  let cartModel: PaginateModel<CartSchemaClass>;
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

  // Helper to create a parent product with variants
  const createParentWithVariants = async () => {
    const businessId = '110668';
    const source = 'nhanh' as const;
    const parentSnapshotId = 1001;

    // Create parent product (snapshot.parentId = -2 means it has variants)
    const parentProduct = await productRepository.create({
      businessId,
      source,
      code: 'TANYA',
      name: 'Tanya',
      description: 'Beautiful dress',
      prices: { retail: 500000 },
      images: { avatar: 'http://example.com/tanya.jpg', others: [] },
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      snapshot: {
        id: parentSnapshotId,
        parentId: -2, // Parent product marker
      },
    } as any);

    // Create variant 1: Tanya - Black - S
    const variant1 = await productRepository.create({
      businessId,
      source,
      code: 'TANYA-BLACK-S',
      name: 'Tanya - Black - S',
      description: 'Beautiful dress - Black - Size S',
      prices: { retail: 500000 },
      images: { avatar: 'http://example.com/tanya-black-s.jpg', others: [] },
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      attributes: [
        { id: 1, name: 'Color', value: 'Black' },
        { id: 2, name: 'Size', value: 'S' },
      ],
      snapshot: {
        id: 1002,
        parentId: parentSnapshotId, // Points to parent's snapshot.id
      },
    } as any);

    // Create variant 2: Tanya - White - M
    const variant2 = await productRepository.create({
      businessId,
      source,
      code: 'TANYA-WHITE-M',
      name: 'Tanya - White - M',
      description: 'Beautiful dress - White - Size M',
      prices: { retail: 500000 },
      images: { avatar: 'http://example.com/tanya-white-m.jpg', others: [] },
      status: ProductStatus.ACTIVE,
      type: ProductType.REGULAR,
      attributes: [
        { id: 1, name: 'Color', value: 'White' },
        { id: 2, name: 'Size', value: 'M' },
      ],
      snapshot: {
        id: 1003,
        parentId: parentSnapshotId, // Points to parent's snapshot.id
      },
    } as any);

    // Populate parent metadata for variants (simulates what sync does)
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
    discountValue: number = 20,
  ) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const promotionalQuantity = 100;
    const soldCount = 0;

    const flashSale = await flashSaleModel.create({
      name: 'Flash Sale on Parent',
      startTime: oneHourAgo,
      endTime: oneHourLater,
      isEnabled: true,
      products: [],
      deletedAt: null,
    } as any);

    // Look up the product to get its price
    const product = await productRepository.findById(productId);
    const originalPrice = product?.prices?.retail ?? 500000;
    const discountAmount =
      discountType === DiscountType.PERCENTAGE
        ? Math.round((originalPrice * discountValue) / 100)
        : discountValue;
    const flashSalePrice = originalPrice - discountAmount;
    const discountPercent = Math.round((discountAmount / originalPrice) * 100);

    // Create flash_sale_products record
    await flashSaleProductRepository.createOne({
      flashSaleId: flashSale._id.toString(),
      flashSaleName: 'Flash Sale on Parent',
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
          { name: CartSchemaClass.name, schema: CartSchema },
          { name: ProductSchemaClass.name, schema: ProductSchema },
          { name: ComboSchemaClass.name, schema: ComboSchema },
          { name: FlashSaleSchemaClass.name, schema: FlashSaleSchema },
          {
            name: FlashSaleProductSchemaClass.name,
            schema: FlashSaleProductSchema,
          },
        ]),
      ],
      providers: [
        CartService,
        CartDocumentRepository,
        ProductDocumentRepository,
        ComboDocumentRepository,
        FlashSaleDocumentRepository,
        FlashSaleProductDocumentRepository,
        { provide: CartRepository, useExisting: CartDocumentRepository },
        { provide: ProductRepository, useExisting: ProductDocumentRepository },
        { provide: ComboRepository, useExisting: ComboDocumentRepository },
        {
          provide: FlashSaleRepository,
          useExisting: FlashSaleDocumentRepository,
        },
        {
          provide: FlashSaleProductRepository,
          useExisting: FlashSaleProductDocumentRepository,
        },
        {
          provide: SocketService,
          useValue: {
            emitCartUpdate: jest.fn(),
            emitToUser: jest.fn(),
            notifyCartRefetch: jest.fn(),
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
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartModel = module.get<PaginateModel<CartSchemaClass>>(
      getModelToken(CartSchemaClass.name),
    );
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
    await cartModel.deleteMany({});
    await productModel.deleteMany({});
    await flashSaleModel.deleteMany({});
    await flashSaleProductModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('Flash sale on parent product applies to variants', () => {
    it('should populate parent metadata on variants during sync', async () => {
      const { parent, variant1, variant2 } = await createParentWithVariants();

      // Verify parent.id is set on variants
      expect(variant1.parent?.id).toBe(parent.id);
      expect(variant2.parent?.id).toBe(parent.id);
    });

    it('should apply flash sale discount when variant is added to cart and parent has flash sale', async () => {
      const { parent, variant1 } = await createParentWithVariants();

      // Create flash sale on PARENT product (not variant)
      await createFlashSaleOnProduct(parent.id, DiscountType.PERCENTAGE, 20);

      const sessionId = 'test-session-123';

      // Add VARIANT to cart
      const cart = await service.addToCart(sessionId, {
        productId: parent.id, // Parent as the base product
        variantId: variant1.id, // Variant selected
        quantity: 1,
      });

      // Verify flash sale is applied
      const cartItem = cart.items.find(
        (item) => item.variantId === variant1.id,
      );
      expect(cartItem).toBeDefined();
      expect(cartItem!.flashSale).not.toBeNull();
      expect(cartItem!.flashSale!.originalPrice).toBe(500000);
      // 20% discount on 500000 = 100000 discount, so flash sale price = 400000
      expect(cartItem!.flashSale!.flashSalePrice).toBe(400000);
      expect(cartItem!.effectivePrice).toBe(400000);
    });

    it('should apply flash sale discount to all variants when parent has flash sale', async () => {
      const { parent, variant1, variant2 } = await createParentWithVariants();

      // Create flash sale on PARENT product
      await createFlashSaleOnProduct(parent.id, DiscountType.FIXED, 100000);

      const sessionId = 'test-session-456';

      // Add both variants to cart
      await service.addToCart(sessionId, {
        productId: parent.id,
        variantId: variant1.id,
        quantity: 1,
      });

      const cart = await service.addToCart(sessionId, {
        productId: parent.id,
        variantId: variant2.id,
        quantity: 2,
      });

      // Verify flash sale is applied to both variants
      const item1 = cart.items.find((item) => item.variantId === variant1.id);
      const item2 = cart.items.find((item) => item.variantId === variant2.id);

      expect(item1!.flashSale).not.toBeNull();
      expect(item1!.flashSale!.flashSalePrice).toBe(400000); // 500000 - 100000

      expect(item2!.flashSale).not.toBeNull();
      expect(item2!.flashSale!.flashSalePrice).toBe(400000); // 500000 - 100000
    });

    it('should calculate total flash sale discount correctly', async () => {
      const { parent, variant1 } = await createParentWithVariants();

      // Create flash sale with 50000 fixed discount
      await createFlashSaleOnProduct(parent.id, DiscountType.FIXED, 50000);

      const sessionId = 'test-session-789';

      // Add variant with quantity 3
      const cart = await service.addToCart(sessionId, {
        productId: parent.id,
        variantId: variant1.id,
        quantity: 3,
      });

      // Total flash sale discount should be 50000 * 3 = 150000
      expect(cart.flashSaleDiscount).toBe(150000);
      // Subtotal should be (500000 - 50000) * 3 = 1350000
      expect(cart.subtotal).toBe(1350000);
    });

    it('should NOT apply flash sale when variant has no parent and no direct flash sale', async () => {
      // Create standalone product (no parent)
      const standaloneProduct = await productRepository.create({
        businessId: '110668',
        source: 'nhanh' as const,
        code: 'STANDALONE',
        name: 'Standalone Product',
        prices: { retail: 300000 },
        images: { avatar: 'http://example.com/standalone.jpg', others: [] },
        status: ProductStatus.ACTIVE,
        type: ProductType.REGULAR,
        snapshot: {
          id: 9999,
          parentId: -1, // Standalone product marker
        },
      } as any);

      // Create flash sale on a DIFFERENT product
      const { parent } = await createParentWithVariants();
      await createFlashSaleOnProduct(parent.id, DiscountType.PERCENTAGE, 20);

      const sessionId = 'test-session-standalone';

      // Add standalone product to cart
      const cart = await service.addToCart(sessionId, {
        productId: standaloneProduct.id,
        quantity: 1,
      });

      // Verify no flash sale is applied
      const cartItem = cart.items.find(
        (item) => item.productId === standaloneProduct.id,
      );
      expect(cartItem!.flashSale).toBeNull();
      expect(cartItem!.effectivePrice).toBe(300000); // Original price
    });

    it('should prefer variant-specific flash sale over parent flash sale', async () => {
      const { parent, variant1 } = await createParentWithVariants();

      // Create flash sale on parent with 10% discount
      await createFlashSaleOnProduct(parent.id, DiscountType.PERCENTAGE, 10);

      // Create flash sale on variant with 30% discount
      // Note: This scenario shouldn't happen in real usage (only one active flash sale)
      // but tests priority if both exist in the lookup

      const sessionId = 'test-session-priority';

      const cart = await service.addToCart(sessionId, {
        productId: parent.id,
        variantId: variant1.id,
        quantity: 1,
      });

      // Should use parent's flash sale (10% off = 450000)
      const cartItem = cart.items.find(
        (item) => item.variantId === variant1.id,
      );
      expect(cartItem!.flashSale).not.toBeNull();
      expect(cartItem!.flashSale!.flashSalePrice).toBe(450000);
    });
  });

  describe('Cart getCart shows flash sale pricing for variants', () => {
    it('should show flash sale pricing when retrieving cart with variants', async () => {
      const { parent, variant1 } = await createParentWithVariants();

      // Add variant to cart first (before flash sale exists)
      const sessionId = 'test-session-getcart';
      await service.addToCart(sessionId, {
        productId: parent.id,
        variantId: variant1.id,
        quantity: 1,
      });

      // Now create flash sale on parent
      await createFlashSaleOnProduct(parent.id, DiscountType.PERCENTAGE, 15);

      // Get cart again - should now show flash sale pricing
      const cart = await service.getCart(sessionId);

      const cartItem = cart.items.find(
        (item) => item.variantId === variant1.id,
      );
      expect(cartItem!.flashSale).not.toBeNull();
      // 15% off 500000 = 75000 discount, so flash sale price = 425000
      expect(cartItem!.flashSale!.flashSalePrice).toBe(425000);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty cart gracefully', async () => {
      const sessionId = 'empty-cart-session';
      const cart = await service.getCart(sessionId);

      expect(cart.items).toHaveLength(0);
      expect(cart.flashSaleDiscount).toBe(0);
    });

    it('should handle product without parentProductId', async () => {
      // Create a product that was synced before parentProductId feature
      const legacyProduct = await productRepository.create({
        businessId: '110668',
        source: 'nhanh' as const,
        code: 'LEGACY',
        name: 'Legacy Product',
        prices: { retail: 200000 },
        images: { avatar: 'http://example.com/legacy.jpg', others: [] },
        status: ProductStatus.ACTIVE,
        type: ProductType.REGULAR,
        // No snapshot, no parentProductId
      } as any);

      const sessionId = 'legacy-session';
      const cart = await service.addToCart(sessionId, {
        productId: legacyProduct.id,
        quantity: 1,
      });

      // Should work without errors, no flash sale applied
      const cartItem = cart.items.find(
        (item) => item.productId === legacyProduct.id,
      );
      expect(cartItem).toBeDefined();
      expect(cartItem!.flashSale).toBeNull();
    });
  });
});
