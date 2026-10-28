import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import mongoose, { PaginateModel } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { HttpStatus } from '@nestjs/common';
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
import { FlashSaleRepository } from '../../../src/flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../../../src/flash-sale-products/domain/flash-sale-product.repository';
import { SocketService } from '../../../src/socket/socket.service';
import { GiftValidationService } from '../../../src/shop/cart/gift-validation.service';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { ComboStatus } from '../../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';

/**
 * Integration tests for CartService + CartDocumentRepository + ProductRepository + ComboRepository
 * Tests the full flow from service through repositories to in-memory MongoDB
 */
describe('CartService Integration', () => {
  let service: CartService;
  let cartModel: PaginateModel<CartSchemaClass>;
  let productRepository: ProductDocumentRepository;
  let comboRepository: ComboDocumentRepository;
  let module: TestingModule;

  const mockI18n = {
    t: jest.fn((key: string) => key),
  };

  // Helper to create test products
  const createTestProduct = async (
    overrides: Partial<{
      code: string;
      name: string;
      prices: { retail: number };
      status: ProductStatus;
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

  // Helper to create test combos
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

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: CartSchemaClass.name, schema: CartSchema },
          { name: ProductSchemaClass.name, schema: ProductSchema },
          { name: ComboSchemaClass.name, schema: ComboSchema },
        ]),
      ],
      providers: [
        CartService,
        CartDocumentRepository,
        ProductDocumentRepository,
        ComboDocumentRepository,
        { provide: CartRepository, useExisting: CartDocumentRepository },
        { provide: ProductRepository, useExisting: ProductDocumentRepository },
        { provide: ComboRepository, useExisting: ComboDocumentRepository },
        {
          provide: FlashSaleRepository,
          useValue: {
            findCurrentlyActive: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: FlashSaleProductRepository,
          useValue: {
            findActiveForProducts: jest.fn().mockResolvedValue(new Map()),
          },
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
    productRepository = module.get<ProductDocumentRepository>(
      ProductDocumentRepository,
    );
    comboRepository = module.get<ComboDocumentRepository>(
      ComboDocumentRepository,
    );
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await cartModel.deleteMany({});
    const productModel = module.get<PaginateModel<ProductSchemaClass>>(
      getModelToken(ProductSchemaClass.name),
    );
    await productModel.deleteMany({});
    const comboModel = module.get<PaginateModel<ComboSchemaClass>>(
      getModelToken(ComboSchemaClass.name),
    );
    await comboModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('getCart flow', () => {
    it('should create new cart for guest session', async () => {
      const sessionId = 'guest-session-123';

      const cart = await service.getCart(sessionId);

      expect(cart.id).toBeDefined();
      expect(cart.items).toHaveLength(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.total).toBe(0);

      // Verify persisted to database
      const dbCart = await cartModel.findById(cart.id);
      expect(dbCart).not.toBeNull();
      expect(dbCart?.sessionId).toBe(sessionId);
    });

    it('should create new cart for logged-in user', async () => {
      const sessionId = 'user-session-456';
      const userId = new mongoose.Types.ObjectId().toString();

      const cart = await service.getCart(sessionId, userId);

      expect(cart.id).toBeDefined();

      // Verify persisted with userId
      const dbCart = await cartModel.findById(cart.id);
      expect(dbCart?.userId?.toString()).toBe(userId);
    });

    it('should return existing cart for session', async () => {
      const sessionId = 'existing-session';

      // First call creates cart
      const cart1 = await service.getCart(sessionId);

      // Second call returns same cart
      const cart2 = await service.getCart(sessionId);

      expect(cart1.id).toBe(cart2.id);
    });
  });

  describe('addToCart flow', () => {
    it('should add product to cart and persist', async () => {
      const product = await createTestProduct({
        name: 'Cart Product',
        prices: { retail: 150000 },
      });
      const sessionId = 'add-to-cart-session';

      const cart = await service.addToCart(sessionId, {
        productId: product.id,
        quantity: 2,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(product.id);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.items[0].price).toBe(150000);
      expect(cart.items[0].subtotal).toBe(300000);
      expect(cart.itemCount).toBe(2);
      expect(cart.total).toBe(300000);
    });

    it('should update quantity for existing item', async () => {
      const product = await createTestProduct();
      const sessionId = 'update-qty-session';

      await service.addToCart(sessionId, {
        productId: product.id,
        quantity: 1,
      });

      const cart = await service.addToCart(sessionId, {
        productId: product.id,
        quantity: 3,
      });

      // Should have single item with quantity 4
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(4);
    });

    it('should reject inactive product', async () => {
      const product = await createTestProduct({
        status: ProductStatus.INACTIVE,
      });
      const sessionId = 'inactive-product-session';

      await expect(
        service.addToCart(sessionId, {
          productId: product.id,
          quantity: 1,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject non-existent product', async () => {
      await expect(
        service.addToCart('some-session', {
          productId: '507f1f77bcf86cd799439011',
          quantity: 1,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('addComboToCart flow', () => {
    it('should add combo to cart with all products', async () => {
      const product1 = await createTestProduct({
        code: 'COMBO-PROD-1',
        prices: { retail: 100000 },
      });
      const product2 = await createTestProduct({
        code: 'COMBO-PROD-2',
        prices: { retail: 200000 },
      });

      const combo = await createTestCombo(
        [
          { productId: product1.id, quantity: 1 },
          { productId: product2.id, quantity: 2 },
        ],
        {
          originalPrice: 500000,
          discountType: DiscountType.PERCENTAGE,
          discountValue: 20,
        },
      );

      const sessionId = 'combo-cart-session';

      const cart = await service.addComboToCart(sessionId, {
        comboId: combo.id,
        items: [
          { productId: product1.id, variantId: product1.id },
          { productId: product2.id, variantId: product2.id },
        ],
      });

      // Should have 2 items from the combo
      expect(cart.items).toHaveLength(2);

      // Should have 1 combo instance with 2 items
      expect(cart.comboInstances).toHaveLength(1);
      expect(cart.comboInstances[0].discountAmount).toBe(100000); // 20% of 500000
    });

    it('should reject inactive combo', async () => {
      const product = await createTestProduct();
      const combo = await createTestCombo(
        [{ productId: product.id, quantity: 1 }],
        { status: ComboStatus.INACTIVE },
      );

      await expect(
        service.addComboToCart('some-session', {
          comboId: combo.id,
          items: [{ productId: product.id, variantId: product.id }],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should reject combo not yet valid', async () => {
      const product = await createTestProduct();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const combo = await createTestCombo(
        [{ productId: product.id, quantity: 1 }],
        { validFrom: futureDate },
      );

      await expect(
        service.addComboToCart('some-session', {
          comboId: combo.id,
          items: [{ productId: product.id, variantId: product.id }],
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

      await expect(
        service.addComboToCart('some-session', {
          comboId: combo.id,
          items: [{ productId: product.id, variantId: product.id }],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('updateItemQuantity flow', () => {
    it('should update quantity for standalone item', async () => {
      const product = await createTestProduct({ prices: { retail: 50000 } });
      const sessionId = 'update-qty-session';

      await service.addToCart(sessionId, {
        productId: product.id,
        quantity: 2,
      });

      const cart = await service.updateItemQuantity(
        sessionId,
        product.id,
        null,
        5,
      );

      expect(cart.items[0].quantity).toBe(5);
      expect(cart.total).toBe(250000); // 5 * 50000
    });

    it('should throw when cart not found', async () => {
      await expect(
        service.updateItemQuantity('non-existent', 'product-id', null, 1),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw when item not in cart', async () => {
      const product = await createTestProduct();
      const sessionId = 'no-item-session';
      await service.getCart(sessionId); // Create empty cart

      await expect(
        service.updateItemQuantity(sessionId, product.id, null, 1),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('removeItem flow', () => {
    it('should remove standalone item from cart', async () => {
      const product = await createTestProduct();
      const sessionId = 'remove-item-session';

      await service.addToCart(sessionId, {
        productId: product.id,
        quantity: 3,
      });

      const cart = await service.removeItem(sessionId, product.id, null);

      expect(cart.items).toHaveLength(0);
      expect(cart.itemCount).toBe(0);
    });

    it('should break combo when removing combo item', async () => {
      const product1 = await createTestProduct({ code: 'BREAK-P1' });
      const product2 = await createTestProduct({ code: 'BREAK-P2' });
      const combo = await createTestCombo([
        { productId: product1.id, quantity: 1 },
        { productId: product2.id, quantity: 1 },
      ]);

      const sessionId = 'break-combo-session';
      await service.addComboToCart(sessionId, {
        comboId: combo.id,
        items: [
          { productId: product1.id, variantId: product1.id },
          { productId: product2.id, variantId: product2.id },
        ],
      });

      // Remove one combo item
      const cart = await service.removeItem(
        sessionId,
        product1.id,
        product1.id,
      );

      // Product 1 removed, product 2 remains as standalone
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(product2.id);

      expect(cart.comboInstances).toHaveLength(0);
    });
  });

  describe('clearCart flow', () => {
    it('should remove all items and combo instances', async () => {
      const product1 = await createTestProduct({ code: 'CLEAR-P1' });
      const product2 = await createTestProduct({ code: 'CLEAR-P2' });
      const combo = await createTestCombo([
        { productId: product1.id, quantity: 1 },
      ]);

      const sessionId = 'clear-cart-session';

      // Add standalone item
      await service.addToCart(sessionId, {
        productId: product2.id,
        quantity: 2,
      });

      // Add combo
      await service.addComboToCart(sessionId, {
        comboId: combo.id,
        items: [{ productId: product1.id, variantId: product1.id }],
      });

      const cart = await service.clearCart(sessionId);

      expect(cart.items).toHaveLength(0);
      expect(cart.comboInstances).toHaveLength(0);
      expect(cart.itemCount).toBe(0);
      expect(cart.total).toBe(0);
    });
  });

  describe('mergeGuestCart flow', () => {
    it('should merge guest cart items to user cart', async () => {
      const product1 = await createTestProduct({ code: 'GUEST-P' });
      const product2 = await createTestProduct({ code: 'USER-P' });

      const guestSessionId = 'guest-merge-session';
      const userId = new mongoose.Types.ObjectId().toString();
      const userSessionId = 'user-merge-session';

      // Create guest cart with item
      await service.addToCart(guestSessionId, {
        productId: product1.id,
        quantity: 2,
      });

      // Create user cart with different item
      await service.addToCart(
        userSessionId,
        {
          productId: product2.id,
          quantity: 1,
        },
        userId,
      );

      // Merge guest cart to user
      const mergedCart = await service.mergeGuestCart(guestSessionId, userId);

      // Should have both items
      expect(mergedCart?.items).toHaveLength(2);
      expect(
        mergedCart?.items.find((i) => i.productId === product1.id),
      ).toBeDefined();
      expect(
        mergedCart?.items.find((i) => i.productId === product2.id),
      ).toBeDefined();
    });

    it('should combine quantities for same product', async () => {
      const product = await createTestProduct();

      const guestSessionId = 'guest-same-product';
      const userId = new mongoose.Types.ObjectId().toString();
      const userSessionId = 'user-session-same';

      // Guest has 2 of product
      await service.addToCart(guestSessionId, {
        productId: product.id,
        quantity: 2,
      });

      // User has 3 of same product
      await service.addToCart(
        userSessionId,
        {
          productId: product.id,
          quantity: 3,
        },
        userId,
      );

      // Merge
      const mergedCart = await service.mergeGuestCart(guestSessionId, userId);

      // Should have 5 total
      expect(mergedCart?.items).toHaveLength(1);
      expect(mergedCart?.items[0].quantity).toBe(5);
    });
  });

  describe('data integrity', () => {
    it('should maintain cart totals correctly', async () => {
      const product1 = await createTestProduct({ prices: { retail: 100000 } });
      const product2 = await createTestProduct({ prices: { retail: 150000 } });
      const sessionId = 'totals-session';

      await service.addToCart(sessionId, {
        productId: product1.id,
        quantity: 2,
      });

      const cart = await service.addToCart(sessionId, {
        productId: product2.id,
        quantity: 3,
      });

      // 2 * 100000 + 3 * 150000 = 650000
      expect(cart.subtotal).toBe(650000);
      expect(cart.total).toBe(650000);
      expect(cart.itemCount).toBe(5);
    });

    it('should calculate combo discount in total', async () => {
      const product = await createTestProduct({ prices: { retail: 100000 } });
      const combo = await createTestCombo(
        [{ productId: product.id, quantity: 2 }],
        {
          originalPrice: 200000,
          discountType: DiscountType.FIXED,
          discountValue: 50000,
        },
      );

      const sessionId = 'combo-discount-session';
      const cart = await service.addComboToCart(sessionId, {
        comboId: combo.id,
        items: [{ productId: product.id, variantId: product.id }],
      });

      // Items subtotal: 2 * 100000 = 200000
      // Combo discount: 50000
      // Total: 200000 - 50000 = 150000
      expect(cart.subtotal).toBe(200000);
      expect(cart.comboDiscount).toBe(50000);
      expect(cart.total).toBe(150000);
    });
  });
});
