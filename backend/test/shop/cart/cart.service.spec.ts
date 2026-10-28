import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CartService } from '../../../src/shop/cart/cart.service';
import { CartRepository } from '../../../src/shop/cart/domain/cart.repository';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { ComboRepository } from '../../../src/combos/domain/combo.repository';
import { FlashSaleRepository } from '../../../src/flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../../../src/flash-sale-products/domain/flash-sale-product.repository';
import { SocketService } from '../../../src/socket/socket.service';
import { GiftValidationService } from '../../../src/shop/cart/gift-validation.service';
import { Cart, CartItem } from '../../../src/shop/cart/domain/cart';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ComboStatus } from '../../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: jest.Mocked<CartRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let comboRepository: jest.Mocked<ComboRepository>;
  let i18n: jest.Mocked<I18nService>;

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    code: 'PROD-001',
    prices: { retail: 100000 },
    images: { avatar: 'http://example.com/image.jpg' },
    status: ProductStatus.ACTIVE,
  };

  const mockCombo = {
    id: 'combo-123',
    name: 'Test Combo',
    items: [
      { productId: 'product-123', quantity: 1 },
      { productId: 'product-456', quantity: 1 },
    ],
    discountType: DiscountType.FIXED,
    discountValue: 20000,
    originalPrice: 200000,
    status: ComboStatus.ACTIVE,
    validFrom: null,
    validTo: null,
  };

  const mockCartItem: CartItem = {
    productId: 'product-123',
    variantId: null,
    code: 'PROD-001',
    name: 'Test Product',
    image: 'http://example.com/image.jpg',
    price: 100000,
    quantity: 1,
    comboInstanceId: null,
  };

  const mockCart: Cart = {
    id: 'cart-123',
    sessionId: 'session-123',
    userId: null,
    items: [mockCartItem],
    comboInstances: [],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockCartRepository = {
      create: jest.fn(),
      findBySessionId: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      mergeGuestCartToUser: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn().mockResolvedValue([]),
    };

    const mockComboRepository = {
      findById: jest.fn(),
    };

    const mockFlashSaleRepository = {
      findCurrentlyActive: jest.fn().mockResolvedValue(null),
    };

    const mockFlashSaleProductRepository = {
      findActiveForProducts: jest.fn().mockResolvedValue(new Map()),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: ComboRepository, useValue: mockComboRepository },
        { provide: FlashSaleRepository, useValue: mockFlashSaleRepository },
        {
          provide: FlashSaleProductRepository,
          useValue: mockFlashSaleProductRepository,
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
    cartRepository = module.get(CartRepository);
    productRepository = module.get(ProductRepository);
    comboRepository = module.get(ComboRepository);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return existing cart for session', async () => {
      cartRepository.findBySessionId.mockResolvedValue(mockCart);

      const result = await service.getCart('session-123');

      expect(result).toHaveProperty('id', mockCart.id);
      expect(result).toHaveProperty('items');
      expect(cartRepository.findBySessionId).toHaveBeenCalledWith(
        'session-123',
      );
    });

    it('should return existing cart for user', async () => {
      cartRepository.findByUserId.mockResolvedValue(mockCart);

      const result = await service.getCart('session-123', 'user-123');

      expect(result).toHaveProperty('id', mockCart.id);
      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should create new cart when none exists', async () => {
      cartRepository.findBySessionId.mockResolvedValue(null);
      cartRepository.create.mockResolvedValue({
        ...mockCart,
        items: [],
        comboInstances: [],
      });

      const result = await service.getCart('session-123');

      expect(cartRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-123',
          userId: null,
          items: [],
        }),
      );
    });

    it('should not set expiration for logged-in user cart', async () => {
      cartRepository.findByUserId.mockResolvedValue(null);
      cartRepository.create.mockResolvedValue({
        ...mockCart,
        items: [],
        expiresAt: null,
      });

      await service.getCart('session-123', 'user-123');

      expect(cartRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: null,
        }),
      );
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      const emptyCart = { ...mockCart, items: [] };
      cartRepository.findBySessionId.mockResolvedValue(emptyCart);
      productRepository.findById.mockResolvedValue(mockProduct as any);
      cartRepository.update.mockResolvedValue({
        ...emptyCart,
        items: [mockCartItem],
      });

      const result = await service.addToCart('session-123', {
        productId: 'product-123',
        quantity: 1,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('product-123');
    });

    it('should increase quantity for existing item', async () => {
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      productRepository.findById.mockResolvedValue(mockProduct as any);
      cartRepository.update.mockResolvedValue({
        ...mockCart,
        items: [{ ...mockCartItem, quantity: 3 }],
      });

      const result = await service.addToCart('session-123', {
        productId: 'product-123',
        quantity: 2,
      });

      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: 'product-123',
              quantity: 3,
            }),
          ]),
        }),
      );
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.addToCart('session-123', {
          productId: 'non-existent',
          quantity: 1,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when product is not active', async () => {
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        status: ProductStatus.INACTIVE,
      } as any);

      await expect(
        service.addToCart('session-123', {
          productId: 'product-123',
          quantity: 1,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should use variant ID when provided', async () => {
      const emptyCart = { ...mockCart, items: [] };
      cartRepository.findBySessionId.mockResolvedValue(emptyCart);
      productRepository.findById.mockResolvedValue({
        ...mockProduct,
        id: 'variant-123',
      } as any);
      cartRepository.update.mockResolvedValue({
        ...emptyCart,
        items: [{ ...mockCartItem, variantId: 'variant-123' }],
      });

      const result = await service.addToCart('session-123', {
        productId: 'product-123',
        variantId: 'variant-123',
        quantity: 1,
      });

      expect(productRepository.findById).toHaveBeenCalledWith('variant-123');
    });
  });

  describe('addComboToCart', () => {
    it('should add combo to cart successfully', async () => {
      const emptyCart = { ...mockCart, items: [], comboInstances: [] };
      cartRepository.findBySessionId.mockResolvedValue(emptyCart);
      comboRepository.findById.mockResolvedValue(mockCombo as any);
      productRepository.findById.mockResolvedValue(mockProduct as any);
      cartRepository.update.mockResolvedValue({
        ...emptyCart,
        items: [
          { ...mockCartItem, comboInstanceId: 'uuid' },
          {
            ...mockCartItem,
            productId: 'product-456',
            comboInstanceId: 'uuid',
          },
        ],
        comboInstances: [
          {
            comboInstanceId: 'uuid',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      });

      const result = await service.addComboToCart('session-123', {
        comboId: 'combo-123',
        items: [
          { productId: 'product-123', variantId: 'variant-a' },
          { productId: 'product-456', variantId: 'variant-b' },
        ],
      });

      expect(result.comboInstances).toHaveLength(1);
      expect(comboRepository.findById).toHaveBeenCalledWith('combo-123');
    });

    it('should throw error when combo not found', async () => {
      comboRepository.findById.mockResolvedValue(null);

      await expect(
        service.addComboToCart('session-123', {
          comboId: 'non-existent',
          items: [],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when combo is not active', async () => {
      comboRepository.findById.mockResolvedValue({
        ...mockCombo,
        status: ComboStatus.INACTIVE,
      } as any);

      await expect(
        service.addComboToCart('session-123', {
          comboId: 'combo-123',
          items: [],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when combo is not yet valid', async () => {
      comboRepository.findById.mockResolvedValue({
        ...mockCombo,
        validFrom: new Date(Date.now() + 86400000), // Tomorrow
      } as any);

      await expect(
        service.addComboToCart('session-123', {
          comboId: 'combo-123',
          items: [],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when combo is expired', async () => {
      comboRepository.findById.mockResolvedValue({
        ...mockCombo,
        validTo: new Date(Date.now() - 86400000), // Yesterday
      } as any);

      await expect(
        service.addComboToCart('session-123', {
          comboId: 'combo-123',
          items: [],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when item count does not match combo', async () => {
      comboRepository.findById.mockResolvedValue(mockCombo as any);

      await expect(
        service.addComboToCart('session-123', {
          comboId: 'combo-123',
          items: [{ productId: 'product-123', variantId: 'variant-a' }],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when variant is required but not provided', async () => {
      const emptyCart = { ...mockCart, items: [], comboInstances: [] };
      cartRepository.findBySessionId.mockResolvedValue(emptyCart);
      comboRepository.findById.mockResolvedValue(mockCombo as any);
      // Mock first product fetch success, won't reach second because variant not found
      productRepository.findById.mockResolvedValue(mockProduct as any);

      // Combo expects products 123 and 456, but we only provide variants for 123 and 789
      await expect(
        service.addComboToCart('session-123', {
          comboId: 'combo-123',
          items: [
            { productId: 'product-123', variantId: 'variant-a' },
            { productId: 'product-789', variantId: 'variant-wrong' }, // Wrong productId
          ],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });

      expect(i18n.t).toHaveBeenCalledWith('combo.variantRequired');
    });

    it('should create cart when adding combo and cart does not exist', async () => {
      cartRepository.findBySessionId.mockResolvedValue(null);
      const newCart = { ...mockCart, items: [], comboInstances: [] };
      cartRepository.create.mockResolvedValue(newCart);
      comboRepository.findById.mockResolvedValue(mockCombo as any);
      productRepository.findById.mockResolvedValue(mockProduct as any);
      const updatedCart = {
        ...newCart,
        items: [
          { ...mockCartItem, comboInstanceId: 'uuid' },
          {
            ...mockCartItem,
            productId: 'product-456',
            comboInstanceId: 'uuid',
          },
        ],
        comboInstances: [
          {
            comboInstanceId: 'uuid',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      };
      cartRepository.update.mockResolvedValue(updatedCart);

      const result = await service.addComboToCart('session-123', {
        comboId: 'combo-123',
        items: [
          { productId: 'product-123', variantId: 'variant-a' },
          { productId: 'product-456', variantId: 'variant-b' },
        ],
      });

      expect(cartRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-123',
          items: [],
          comboInstances: [],
        }),
      );
      expect(result.comboInstances).toHaveLength(1);
    });

    it('should throw error when selected variant does not exist', async () => {
      const emptyCart = { ...mockCart, items: [], comboInstances: [] };
      cartRepository.findBySessionId.mockResolvedValue(emptyCart);
      comboRepository.findById.mockResolvedValue(mockCombo as any);
      // First product found, second product not found
      productRepository.findById
        .mockResolvedValueOnce(mockProduct as any)
        .mockResolvedValueOnce(null);

      await expect(
        service.addComboToCart('session-123', {
          comboId: 'combo-123',
          items: [
            { productId: 'product-123', variantId: 'variant-a' },
            { productId: 'product-456', variantId: 'non-existent-variant' },
          ],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('combo.variantNotFound');
    });

    it('should throw error when combo product is not saleable', async () => {
      const emptyCart = { ...mockCart, items: [], comboInstances: [] };
      cartRepository.findBySessionId.mockResolvedValue(emptyCart);
      comboRepository.findById.mockResolvedValue(mockCombo as any);
      // First product is active, second product is not saleable
      productRepository.findById
        .mockResolvedValueOnce(mockProduct as any)
        .mockResolvedValueOnce({
          ...mockProduct,
          id: 'product-456',
          status: ProductStatus.INACTIVE,
        } as any);

      await expect(
        service.addComboToCart('session-123', {
          comboId: 'combo-123',
          items: [
            { productId: 'product-123', variantId: 'variant-a' },
            { productId: 'product-456', variantId: 'variant-b' },
          ],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });

      expect(i18n.t).toHaveBeenCalledWith('shop.product.notAvailable');
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue({
        ...mockCart,
        items: [{ ...mockCartItem, quantity: 5 }],
      });

      const result = await service.updateItemQuantity(
        'session-123',
        'product-123',
        null,
        5,
      );

      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ quantity: 5 }),
          ]),
        }),
      );
    });

    it('should throw error when cart not found', async () => {
      cartRepository.findBySessionId.mockResolvedValue(null);

      await expect(
        service.updateItemQuantity('session-123', 'product-123', null, 5),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when item not in cart', async () => {
      cartRepository.findBySessionId.mockResolvedValue(mockCart);

      await expect(
        service.updateItemQuantity('session-123', 'product-999', null, 5),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should prioritize standalone items when comboInstanceId not provided', async () => {
      const comboItem: CartItem = {
        ...mockCartItem,
        comboInstanceId: 'combo-instance-1',
        quantity: 1,
      };
      const standaloneItem: CartItem = {
        ...mockCartItem,
        comboInstanceId: null,
        quantity: 2,
      };
      const cartWithBoth: Cart = {
        ...mockCart,
        items: [comboItem, standaloneItem],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithBoth);
      cartRepository.update.mockImplementation((_, data) =>
        Promise.resolve({
          ...cartWithBoth,
          items: data.items ?? cartWithBoth.items,
        }),
      );

      await service.updateItemQuantity(
        'session-123',
        'product-123',
        null,
        5,
        undefined,
      );

      // Should update the standalone item (quantity 2 -> 5), not the combo item
      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              comboInstanceId: 'combo-instance-1',
              quantity: 1,
            }),
            expect.objectContaining({ comboInstanceId: null, quantity: 5 }),
          ]),
        }),
      );
    });

    it('should target specific combo item when comboInstanceId is provided and decrease qty', async () => {
      const comboItem: CartItem = {
        ...mockCartItem,
        comboInstanceId: 'combo-instance-1',
        quantity: 3, // Start with qty 3
      };
      const standaloneItem: CartItem = {
        ...mockCartItem,
        comboInstanceId: null,
        quantity: 2,
      };
      const cartWithBoth: Cart = {
        ...mockCart,
        items: [comboItem, standaloneItem],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithBoth);
      // Mock breakCombo behavior - it removes comboInstanceId and updates quantity
      cartRepository.update.mockImplementation((_, data) =>
        Promise.resolve({
          ...cartWithBoth,
          items: data.items ?? cartWithBoth.items,
          comboInstances: data.comboInstances ?? cartWithBoth.comboInstances,
        }),
      );

      // Decrease combo item quantity (3 -> 1) should break the combo
      await service.updateItemQuantity(
        'session-123',
        'product-123',
        null,
        1,
        undefined,
        'combo-instance-1',
      );

      // breakCombo is called, which removes comboInstanceId from all combo items
      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          comboInstances: [],
        }),
      );
    });

    it('should add additional quantity as standalone when increasing combo item quantity', async () => {
      const comboItem: CartItem = {
        ...mockCartItem,
        productId: 'product-123',
        variantId: null,
        comboInstanceId: 'combo-instance-1',
        quantity: 2, // Start with qty 2
      };
      const cartWithCombo: Cart = {
        ...mockCart,
        items: [comboItem],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithCombo);
      // Mock update to return cart with additional standalone item
      const updatedCart = {
        ...cartWithCombo,
        items: [
          comboItem, // Original combo item stays with qty 2
          {
            ...mockCartItem,
            productId: 'product-123',
            variantId: null,
            comboInstanceId: null,
            quantity: 3, // Additional 3 items as standalone
          },
        ],
      };
      cartRepository.update.mockResolvedValue(updatedCart);

      // Increase combo item quantity (2 -> 5) should add 3 as standalone
      await service.updateItemQuantity(
        'session-123',
        'product-123',
        null,
        5,
        undefined,
        'combo-instance-1',
      );

      // Should update cart with new standalone item
      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          items: expect.arrayContaining([
            // Should create a new standalone item with quantity 3
            expect.objectContaining({
              productId: 'product-123',
              comboInstanceId: null,
              quantity: 3,
            }),
          ]),
        }),
      );
    });

    it('should add to existing standalone item when increasing combo item quantity', async () => {
      const comboItem: CartItem = {
        ...mockCartItem,
        productId: 'product-123',
        variantId: null,
        comboInstanceId: 'combo-instance-1',
        quantity: 1,
      };
      const existingStandaloneItem: CartItem = {
        ...mockCartItem,
        productId: 'product-123',
        variantId: null,
        comboInstanceId: null,
        quantity: 2, // Already have 2 standalone
      };
      const cartWithBoth: Cart = {
        ...mockCart,
        items: [comboItem, existingStandaloneItem],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithBoth);
      const updatedCart = {
        ...cartWithBoth,
        items: [
          comboItem, // Combo item stays with qty 1
          {
            ...existingStandaloneItem,
            quantity: 5, // Standalone updated from 2 to 5 (added 3)
          },
        ],
      };
      cartRepository.update.mockResolvedValue(updatedCart);

      // Increase combo item quantity (1 -> 4) should add 3 to existing standalone
      await service.updateItemQuantity(
        'session-123',
        'product-123',
        null,
        4,
        undefined,
        'combo-instance-1',
      );

      // Should add to existing standalone item
      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: 'product-123',
              comboInstanceId: null,
              quantity: 5, // 2 + 3 = 5
            }),
          ]),
        }),
      );
    });

    it('should return cart response when combo item quantity stays the same', async () => {
      const comboItem: CartItem = {
        ...mockCartItem,
        productId: 'product-123',
        variantId: null,
        comboInstanceId: 'combo-instance-1',
        quantity: 2,
      };
      const cartWithCombo: Cart = {
        ...mockCart,
        items: [comboItem],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithCombo);

      // Update to same quantity (2 -> 2) should do nothing
      const result = await service.updateItemQuantity(
        'session-123',
        'product-123',
        null,
        2,
        undefined,
        'combo-instance-1',
      );

      // Should not call update since quantity is the same
      expect(cartRepository.update).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const emptyCart = {
        ...mockCart,
        items: [],
      };

      // First call to find cart, second call to re-query after removal
      cartRepository.findBySessionId
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(emptyCart);
      cartRepository.update.mockResolvedValue(emptyCart);

      const result = await service.removeItem(
        'session-123',
        'product-123',
        null,
      );

      expect(result.items).toHaveLength(0);
    });

    it('should throw error when cart not found', async () => {
      cartRepository.findBySessionId.mockResolvedValue(null);

      await expect(
        service.removeItem('session-123', 'product-123', null),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when item not in cart', async () => {
      cartRepository.findBySessionId.mockResolvedValue(mockCart);

      await expect(
        service.removeItem('session-123', 'product-999', null),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should prioritize removing standalone items when comboInstanceId not provided', async () => {
      const comboItem: CartItem = {
        ...mockCartItem,
        comboInstanceId: 'combo-instance-1',
        quantity: 1,
      };
      const standaloneItem: CartItem = {
        ...mockCartItem,
        comboInstanceId: null,
        quantity: 2,
      };
      const cartWithBoth: Cart = {
        ...mockCart,
        items: [comboItem, standaloneItem],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithBoth);
      cartRepository.update.mockImplementation((_, data) =>
        Promise.resolve({
          ...cartWithBoth,
          items: data.items ?? cartWithBoth.items,
        }),
      );

      await service.removeItem('session-123', 'product-123', null);

      // Should remove the standalone item, keeping the combo item intact
      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          items: [
            expect.objectContaining({ comboInstanceId: 'combo-instance-1' }),
          ],
        }),
      );
    });

    it('should target specific combo item when comboInstanceId is provided', async () => {
      const comboItem: CartItem = {
        ...mockCartItem,
        comboInstanceId: 'combo-instance-1',
        quantity: 1,
      };
      const standaloneItem: CartItem = {
        ...mockCartItem,
        comboInstanceId: null,
        quantity: 2,
      };
      const cartWithBoth: Cart = {
        ...mockCart,
        items: [comboItem, standaloneItem],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      };

      cartRepository.findBySessionId.mockResolvedValue(cartWithBoth);
      cartRepository.update.mockImplementation((_, data) =>
        Promise.resolve({
          ...cartWithBoth,
          items: data.items ?? cartWithBoth.items,
          comboInstances: data.comboInstances ?? cartWithBoth.comboInstances,
        }),
      );

      // Remove combo item by providing comboInstanceId - should break combo
      await service.removeItem(
        'session-123',
        'product-123',
        null,
        undefined,
        'combo-instance-1',
      );

      // breakCombo is called, which removes the combo instance
      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          comboInstances: [],
        }),
      );
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue({
        ...mockCart,
        items: [],
        comboInstances: [],
      });

      const result = await service.clearCart('session-123');

      expect(result.items).toHaveLength(0);
      expect(result.comboInstances).toHaveLength(0);
      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          items: [],
          comboInstances: [],
        }),
      );
    });

    it('should throw error when cart not found', async () => {
      cartRepository.findBySessionId.mockResolvedValue(null);

      await expect(service.clearCart('session-123')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('mergeGuestCart', () => {
    it('should merge guest cart to user cart', async () => {
      cartRepository.mergeGuestCartToUser.mockResolvedValue(mockCart);

      const result = await service.mergeGuestCart('session-123', 'user-123');

      expect(result).toBeDefined();
      expect(cartRepository.mergeGuestCartToUser).toHaveBeenCalledWith(
        'session-123',
        'user-123',
      );
    });

    it('should return null when no cart to merge', async () => {
      cartRepository.mergeGuestCartToUser.mockResolvedValue(null);

      const result = await service.mergeGuestCart('session-123', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('cart response calculation', () => {
    it('should calculate totals correctly', async () => {
      const cartWithMultipleItems = {
        ...mockCart,
        items: [
          { ...mockCartItem, quantity: 2, price: 100000 },
          {
            ...mockCartItem,
            productId: 'product-456',
            quantity: 1,
            price: 50000,
          },
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithMultipleItems);

      const result = await service.getCart('session-123');

      expect(result.subtotal).toBe(250000); // 100000*2 + 50000
      expect(result.itemCount).toBe(3);
      expect(result.total).toBe(250000); // No combo discount
    });

    it('should apply combo discount to total', async () => {
      const cartWithCombo = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            quantity: 1,
            price: 100000,
            comboInstanceId: 'combo-1',
          },
          {
            ...mockCartItem,
            productId: 'product-456',
            quantity: 1,
            price: 100000,
            comboInstanceId: 'combo-1',
          },
        ],
        comboInstances: [
          {
            comboInstanceId: 'combo-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            originalPrice: 200000,
            discountAmount: 30000,
            discountType: DiscountType.FIXED,
            discountValue: 30000,
          },
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithCombo);

      const result = await service.getCart('session-123');

      expect(result.subtotal).toBe(200000);
      expect(result.comboDiscount).toBe(30000);
      expect(result.total).toBe(170000);
    });
  });

  describe('comboInstanceId in cart item response', () => {
    it('should include comboInstanceId for combo items', async () => {
      const cartWithComboItems = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            productId: 'product-123',
            quantity: 1,
            price: 100000,
            comboInstanceId: 'combo-instance-abc',
          },
          {
            ...mockCartItem,
            productId: 'product-456',
            quantity: 1,
            price: 100000,
            comboInstanceId: 'combo-instance-abc',
          },
        ],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-abc',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            originalPrice: 200000,
            discountAmount: 20000,
            discountType: DiscountType.FIXED,
            discountValue: 20000,
          },
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithComboItems);

      const result = await service.getCart('session-123');

      // All combo items should have comboInstanceId
      expect(result.items).toHaveLength(2);
      expect(result.items[0].comboInstanceId).toBe('combo-instance-abc');
      expect(result.items[1].comboInstanceId).toBe('combo-instance-abc');
    });

    it('should return null comboInstanceId for standalone items', async () => {
      const cartWithStandaloneItem = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            productId: 'product-123',
            quantity: 1,
            price: 100000,
            comboInstanceId: null,
          },
        ],
        comboInstances: [],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithStandaloneItem);

      const result = await service.getCart('session-123');

      // Standalone items should have null comboInstanceId
      expect(result.items).toHaveLength(1);
      expect(result.items[0].comboInstanceId).toBeNull();
    });

    it('should return null comboInstanceId for items without comboInstanceId field', async () => {
      const cartWithLegacyItem = {
        ...mockCart,
        items: [
          {
            productId: 'product-123',
            variantId: null,
            code: 'PROD-001',
            name: 'Test Product',
            image: 'http://example.com/image.jpg',
            price: 100000,
            quantity: 1,
            // No comboInstanceId field (legacy item)
          },
        ],
        comboInstances: [],
      };
      cartRepository.findBySessionId.mockResolvedValue(cartWithLegacyItem);

      const result = await service.getCart('session-123');

      // Legacy items without comboInstanceId should return null
      expect(result.items).toHaveLength(1);
      expect(result.items[0].comboInstanceId).toBeNull();
    });

    it('should correctly distinguish combo items from standalone items in mixed cart', async () => {
      const mixedCart = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            productId: 'standalone-product',
            quantity: 1,
            price: 50000,
            comboInstanceId: null,
          },
          {
            ...mockCartItem,
            productId: 'combo-product-1',
            quantity: 1,
            price: 100000,
            comboInstanceId: 'combo-instance-xyz',
          },
          {
            ...mockCartItem,
            productId: 'combo-product-2',
            quantity: 1,
            price: 100000,
            comboInstanceId: 'combo-instance-xyz',
          },
        ],
        comboInstances: [
          {
            comboInstanceId: 'combo-instance-xyz',
            comboId: 'combo-456',
            comboName: 'Another Combo',
            originalPrice: 200000,
            discountAmount: 25000,
            discountType: DiscountType.FIXED,
            discountValue: 25000,
          },
        ],
      };
      cartRepository.findBySessionId.mockResolvedValue(mixedCart);

      const result = await service.getCart('session-123');

      expect(result.items).toHaveLength(3);

      // Standalone item
      const standaloneItem = result.items.find(
        (i) => i.productId === 'standalone-product',
      );
      expect(standaloneItem?.comboInstanceId).toBeNull();

      // Combo items
      const comboItem1 = result.items.find(
        (i) => i.productId === 'combo-product-1',
      );
      const comboItem2 = result.items.find(
        (i) => i.productId === 'combo-product-2',
      );
      expect(comboItem1?.comboInstanceId).toBe('combo-instance-xyz');
      expect(comboItem2?.comboInstanceId).toBe('combo-instance-xyz');
    });
  });
});
