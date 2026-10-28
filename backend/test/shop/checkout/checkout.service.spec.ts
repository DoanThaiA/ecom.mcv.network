import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CheckoutService } from '../../../src/shop/checkout/checkout.service';
import { CheckoutUtilsService } from '../../../src/shop/checkout/services/checkout-utils.service';
import { CheckoutShippingService } from '../../../src/shop/checkout/services/checkout-shipping.service';
import { CheckoutVoucherService } from '../../../src/shop/checkout/services/checkout-voucher.service';
import { CheckoutProductDiscountService } from '../../../src/shop/checkout/services/checkout-product-discount.service';
import { CheckoutSessionBuilderService } from '../../../src/shop/checkout/services/checkout-session-builder.service';
import { CheckoutOrderService } from '../../../src/shop/checkout/services/checkout-order.service';
import { CheckoutSessionRepository } from '../../../src/shop/checkout/domain/checkout-session.repository';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { CartRepository } from '../../../src/shop/cart/domain/cart.repository';
import { FlashSaleRepository } from '../../../src/flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../../../src/flash-sale-products/domain/flash-sale-product.repository';
import { ComboRepository } from '../../../src/combos/domain/combo.repository';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import { ShippingService } from '../../../src/shop/shipping/shipping.service';
import { OnepayService } from '../../../src/payment/onepay/onepay.service';
import { InfocmsService } from '../../../src/payment/infocms/infocms.service';
import { GiftValidationService } from '../../../src/shop/cart/gift-validation.service';
import { CdpService } from '../../../src/cdp/cdp.service';
import { OrderService } from '../../../src/shop/order/order.service';
import { UserRepository } from '../../../src/users/domain/user.repository';
import { PromotionRepository } from '../../../src/promotions/domain/promotion.repository';
import { PromotionProductRepository } from '../../../src/promotion-products/domain/promotion-product.repository';
import { AffiliateRepository } from '../../../src/affiliates/domain/affiliate.repository';
import { SystemTasksService } from '../../../src/system-tasks/system-tasks.service';
import { OrderTasksService } from '../../../src/order-tasks/order-tasks.service';
import { CheckoutSessionStatus } from '../../../src/shop/checkout/domain/checkout-session-status.enum';
import { CheckoutSession } from '../../../src/shop/checkout/domain/checkout-session';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ComboStatus } from '../../../src/combos/domain/combo-status.enum';
import { DiscountType } from '../../../src/combos/domain/discount-type.enum';
import { PaymentMethod } from '../../../src/shop/order/domain/order.enums';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let checkoutSessionRepository: jest.Mocked<CheckoutSessionRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let cartRepository: jest.Mocked<CartRepository>;
  let flashSaleRepository: jest.Mocked<FlashSaleRepository>;
  let flashSaleProductRepository: jest.Mocked<FlashSaleProductRepository>;
  let comboRepository: jest.Mocked<ComboRepository>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let shippingService: jest.Mocked<ShippingService>;
  let i18n: jest.Mocked<I18nService>;

  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    code: 'PROD-001',
    prices: { retail: 100000 },
    images: ['http://example.com/image.jpg'],
    status: ProductStatus.ACTIVE,
    inventory: { available: 100, totalQuantity: 100 },
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

  const mockCheckoutSession: CheckoutSession = {
    id: 'session-id-123',
    sessionNumber: 'CS-123456',
    userId: null,
    sessionId: 'browser-session-123',
    items: [
      {
        productId: 'product-123',
        variantId: null,
        code: 'PROD-001',
        name: 'Test Product',
        image: 'http://example.com/image.jpg',
        originalPrice: 100000,
        effectivePrice: 100000,
        quantity: 2,
        subtotal: 200000,
        discount: 0,
        comboInstanceId: null,
        comboId: null,
        comboName: null,
        flashSaleId: null,
        flashSaleName: null,
        isAvailable: true,
        unavailableReason: null,
        discountDetails: null,
      },
    ],
    comboInstances: null,
    discountDetails: null,
    subtotal: 200000,
    discount: 0,
    totalDiscount: 0,
    shippingFee: 30000,
    total: 230000,
    shipping: {
      fee: 30000,
      depotId: 1,
      depotName: 'Main Depot',
      carrierId: 1,
      carrierName: 'Fast Delivery',
    },
    customer: {
      name: 'John Doe',
      phone: '0901234567',
      email: 'john@example.com',
    },
    shippingAddress: {
      address: '123 Test Street',
      ward: 'Ward 1',
      district: 'District 1',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
      cityId: 202,
      districtId: 1442,
      wardId: 21009,
    },
    shippingDiscount: 0,
    affiliateCode: null,
    paymentMethod: PaymentMethod.COD,
    note: null,
    status: CheckoutSessionStatus.ACTIVE,
    orderId: null,
    orderNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  beforeEach(async () => {
    const mockCheckoutSessionRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      markCompleted: jest.fn(),
      delete: jest.fn(),
      generateSessionNumber: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    };

    const mockCartRepository = {
      findBySessionId: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    };

    const mockFlashSaleRepository = {
      findCurrentlyActive: jest.fn().mockResolvedValue(null),
    };

    const mockFlashSaleProductRepository = {
      findActiveForProducts: jest.fn().mockResolvedValue(new Map()),
      incrementSoldCountForItems: jest.fn(),
    };

    const mockComboRepository = {
      findById: jest.fn(),
    };

    const mockOrderRepository = {
      create: jest.fn(),
      generateOrderNumber: jest.fn(),
    };

    const mockShippingService = {
      calculateShipping: jest.fn(),
      calculateFixedShipping: jest.fn(),
    };

    const mockOrderCdpSyncService = {
      syncOrder: jest.fn(),
      syncOrderCancellation: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        CheckoutUtilsService,
        CheckoutShippingService,
        CheckoutVoucherService,
        CheckoutProductDiscountService,
        CheckoutSessionBuilderService,
        CheckoutOrderService,
        {
          provide: CheckoutSessionRepository,
          useValue: mockCheckoutSessionRepository,
        },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: FlashSaleRepository, useValue: mockFlashSaleRepository },
        {
          provide: FlashSaleProductRepository,
          useValue: mockFlashSaleProductRepository,
        },
        { provide: ComboRepository, useValue: mockComboRepository },
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: ShippingService, useValue: mockShippingService },
        {
          provide: OnepayService,
          useValue: { createPaymentUrl: jest.fn() },
        },
        {
          provide: InfocmsService,
          useValue: {
            createPaymentQr: jest.fn(),
          },
        },
        {
          provide: GiftValidationService,
          useValue: {
            validateAndRemoveIneligibleGifts: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: CdpService,
          useValue: {
            useVoucher: jest.fn(),
          },
        },
        {
          provide: OrderService,
          useValue: {
            cleanupAbandonedOrder: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        { provide: I18nService, useValue: mockI18n },
        {
          provide: PromotionRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(null),
            findActiveByType: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PromotionProductRepository,
          useValue: {
            findActiveForProducts: jest.fn().mockResolvedValue(new Map()),
          },
        },
        {
          provide: AffiliateRepository,
          useValue: {
            findByAffiliateCode: jest.fn(),
          },
        },
        {
          provide: SystemTasksService,
          useValue: {
            queueIncrementFlashSaleSoldCount: jest.fn(),
          },
        },
        {
          provide: OrderTasksService,
          useValue: {
            queueIncrementPromotionUsage: jest.fn(),
            queueSyncOrderCdp: jest.fn(),
            queueSyncOrderNhanh: jest.fn(),
            queueCreateOrderConfirmation: jest.fn(),
            queueCreateAffiliateCommission: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    checkoutSessionRepository = module.get(CheckoutSessionRepository);
    productRepository = module.get(ProductRepository);
    cartRepository = module.get(CartRepository);
    flashSaleRepository = module.get(FlashSaleRepository);
    flashSaleProductRepository = module.get(FlashSaleProductRepository);
    comboRepository = module.get(ComboRepository);
    orderRepository = module.get(OrderRepository);
    shippingService = module.get(ShippingService);
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertSession', () => {
    it('should create new checkout session', async () => {
      productRepository.findByIds.mockResolvedValue([mockProduct as any]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      checkoutSessionRepository.generateSessionNumber.mockResolvedValue(
        'CS-123456',
      );
      checkoutSessionRepository.create.mockResolvedValue(mockCheckoutSession);

      const result = await service.upsertSession('browser-session-123', {
        items: [{ productId: 'product-123', quantity: 2 }],
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('sessionNumber', 'CS-123456');
      expect(checkoutSessionRepository.create).toHaveBeenCalled();
    });

    it('should update existing checkout session when id provided', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(mockCheckoutSession);
      productRepository.findByIds.mockResolvedValue([mockProduct as any]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      checkoutSessionRepository.update.mockResolvedValue(mockCheckoutSession);

      const result = await service.upsertSession('browser-session-123', {
        id: 'session-id-123',
        items: [{ productId: 'product-123', quantity: 3 }],
      });

      expect(result).toHaveProperty('id', 'session-id-123');
      expect(checkoutSessionRepository.update).toHaveBeenCalled();
    });

    it('should throw error when no items selected', async () => {
      await expect(
        service.upsertSession('browser-session-123', {
          items: [],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when session not found for update', async () => {
      productRepository.findByIds.mockResolvedValue([mockProduct as any]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      checkoutSessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.upsertSession('browser-session-123', {
          id: 'non-existent-id',
          items: [{ productId: 'product-123', quantity: 1 }],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when session is not active', async () => {
      productRepository.findByIds.mockResolvedValue([mockProduct as any]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        status: CheckoutSessionStatus.COMPLETED,
      });

      await expect(
        service.upsertSession('browser-session-123', {
          id: 'session-id-123',
          items: [{ productId: 'product-123', quantity: 1 }],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should calculate shipping when address provided', async () => {
      productRepository.findByIds.mockResolvedValue([mockProduct as any]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      checkoutSessionRepository.generateSessionNumber.mockResolvedValue(
        'CS-123456',
      );
      shippingService.calculateFixedShipping.mockResolvedValue({
        depot: { id: 12345, name: 'Main Depot' },
        selectedCarrier: {
          carrierId: 2,
          carrierName: 'Viettel Post',
          serviceId: 'STD',
        },
        totalShippingFee: 30000,
      } as any);
      checkoutSessionRepository.create.mockResolvedValue(mockCheckoutSession);

      const result = await service.upsertSession('browser-session-123', {
        items: [{ productId: 'product-123', quantity: 2 }],
        shippingAddress: {
          cityId: 202,
          districtId: 1442,
          address: '123 Test Street',
        },
      });

      expect(shippingService.calculateFixedShipping).toHaveBeenCalled();
      expect(result).toHaveProperty('shippingFee', 30000);
    });

    it('should apply flash sale pricing', async () => {
      const flashSaleMap = new Map();
      flashSaleMap.set('product-123', {
        flashSaleId: 'fs-1',
        flashSaleName: 'Flash Sale',
        productId: 'product-123',
        discountType: DiscountType.FIXED,
        discountValue: 20000,
        promotionalQuantity: 100,
        soldCount: 0,
        isEnabled: true,
      });

      productRepository.findByIds.mockResolvedValue([mockProduct as any]);
      flashSaleRepository.findCurrentlyActive.mockResolvedValue({
        id: 'fs-1',
        name: 'Flash Sale',
      } as any);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        flashSaleMap,
      );
      checkoutSessionRepository.generateSessionNumber.mockResolvedValue(
        'CS-123456',
      );
      checkoutSessionRepository.create.mockResolvedValue({
        ...mockCheckoutSession,
        items: [
          {
            ...mockCheckoutSession.items[0],
            originalPrice: 100000,
            effectivePrice: 80000,
            flashSaleId: 'fs-1',
            flashSaleName: 'Flash Sale',
          },
        ],
      });

      const result = await service.upsertSession('browser-session-123', {
        items: [{ productId: 'product-123', quantity: 2 }],
      });

      expect(result.items[0]).toHaveProperty('flashSaleId', 'fs-1');
      expect(result.items[0]).toHaveProperty('effectivePrice', 80000);
    });

    it('should mark unavailable products', async () => {
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, status: ProductStatus.INACTIVE } as any,
      ]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      checkoutSessionRepository.generateSessionNumber.mockResolvedValue(
        'CS-123456',
      );
      checkoutSessionRepository.create.mockResolvedValue({
        ...mockCheckoutSession,
        items: [
          {
            ...mockCheckoutSession.items[0],
            isAvailable: false,
            unavailableReason: 'shop.product.notAvailable',
          },
        ],
      });

      const result = await service.upsertSession('browser-session-123', {
        items: [{ productId: 'product-123', quantity: 2 }],
      });

      expect(result.hasUnavailableItems).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return checkout session by id', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(mockCheckoutSession);

      const result = await service.getById(
        'session-id-123',
        'browser-session-123',
      );

      expect(result).toHaveProperty('id', 'session-id-123');
      expect(checkoutSessionRepository.findById).toHaveBeenCalledWith(
        'session-id-123',
      );
    });

    it('should throw error when session not found', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.getById('non-existent-id', 'browser-session-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when not authorized', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        sessionId: 'different-session',
      });

      await expect(
        service.getById('session-id-123', 'browser-session-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('applyVoucherToSession', () => {
    const mockVoucher = {
      code: 'DISCOUNT10',
      name: '10% Discount',
      source: 'CMS' as const,
      id: 'voucher-123',
      discountAmount: 10000,
      discountType: 1,
      discountValue: 10000,
    };

    it('should apply voucher to session successfully', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(mockCheckoutSession);
      checkoutSessionRepository.update.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [mockVoucher],
        discount: 10000,
      } as any);

      const result = await service.applyVoucherToSession(
        'session-id-123',
        'browser-session-123',
        mockVoucher,
      );

      expect(result).toBeDefined();
      expect(checkoutSessionRepository.update).toHaveBeenCalledWith(
        'session-id-123',
        expect.objectContaining({
          appliedVouchers: [
            expect.objectContaining({
              code: mockVoucher.code,
              id: mockVoucher.id,
            }),
          ],
        }),
      );
    });

    it('should throw error when session not found', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.applyVoucherToSession(
          'non-existent',
          'browser-session-123',
          mockVoucher,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when session not active', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        status: CheckoutSessionStatus.COMPLETED,
      });

      await expect(
        service.applyVoucherToSession(
          'session-id-123',
          'browser-session-123',
          mockVoucher,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should replace existing voucher with same code', async () => {
      const existingVoucher = {
        ...mockVoucher,
        discountAmount: 5000,
      };
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [existingVoucher],
      });
      checkoutSessionRepository.update.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [mockVoucher],
      } as any);

      await service.applyVoucherToSession(
        'session-id-123',
        'browser-session-123',
        mockVoucher,
      );

      expect(checkoutSessionRepository.update).toHaveBeenCalledWith(
        'session-id-123',
        expect.objectContaining({
          appliedVouchers: [
            expect.objectContaining({
              code: mockVoucher.code,
              id: mockVoucher.id,
            }),
          ],
        }),
      );
    });

    it('should recalculate totals after applying voucher', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(mockCheckoutSession);
      checkoutSessionRepository.update.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [mockVoucher],
      } as any);

      await service.applyVoucherToSession(
        'session-id-123',
        'browser-session-123',
        mockVoucher,
      );

      expect(checkoutSessionRepository.update).toHaveBeenCalledWith(
        'session-id-123',
        expect.objectContaining({
          subtotal: expect.any(Number),
          discount: expect.any(Number),
          totalDiscount: expect.any(Number),
          total: expect.any(Number),
        }),
      );
    });
  });

  describe('removeVoucherFromSession', () => {
    const mockVoucher = {
      code: 'DISCOUNT10',
      name: '10% Discount',
      source: 'CMS' as const,
      id: 'voucher-123',
      discountAmount: 10000,
      discountType: 1,
      discountValue: 10000,
    };

    it('should remove voucher from session successfully', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [mockVoucher],
      });
      checkoutSessionRepository.update.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [],
      } as any);

      const result = await service.removeVoucherFromSession(
        'session-id-123',
        'browser-session-123',
        'DISCOUNT10',
      );

      expect(result).toBeDefined();
      expect(checkoutSessionRepository.update).toHaveBeenCalledWith(
        'session-id-123',
        expect.objectContaining({
          appliedVouchers: [],
        }),
      );
    });

    it('should throw error when session not found', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.removeVoucherFromSession(
          'non-existent',
          'browser-session-123',
          'DISCOUNT10',
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should return unchanged session when voucher code not found', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [mockVoucher],
      });

      const result = await service.removeVoucherFromSession(
        'session-id-123',
        'browser-session-123',
        'NON_EXISTENT_CODE',
      );

      expect(result).toBeDefined();
      expect(checkoutSessionRepository.update).not.toHaveBeenCalled();
    });

    it('should recalculate totals after removing voucher', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [mockVoucher],
      });
      checkoutSessionRepository.update.mockResolvedValue({
        ...mockCheckoutSession,
        appliedVouchers: [],
      } as any);

      await service.removeVoucherFromSession(
        'session-id-123',
        'browser-session-123',
        'DISCOUNT10',
      );

      expect(checkoutSessionRepository.update).toHaveBeenCalledWith(
        'session-id-123',
        expect.objectContaining({
          subtotal: expect.any(Number),
          discount: expect.any(Number),
          totalDiscount: expect.any(Number),
          total: expect.any(Number),
        }),
      );
    });
  });

  describe('placeOrder', () => {
    it('should create order from checkout session', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(mockCheckoutSession);
      productRepository.findByIds.mockResolvedValue([mockProduct as any]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      orderRepository.generateOrderNumber.mockResolvedValue('ORD-123456');
      orderRepository.create.mockResolvedValue({
        id: 'order-123',
        orderNumber: 'ORD-123456',
        total: 230000,
        status: 'pending',
      } as any);
      checkoutSessionRepository.markCompleted.mockResolvedValue(
        mockCheckoutSession,
      );
      cartRepository.findBySessionId.mockResolvedValue(null);

      const result = await service.placeOrder(
        'session-id-123',
        'browser-session-123',
        {},
      );

      expect(result.success).toBe(true);
      expect(result.order).toHaveProperty('orderNumber', 'ORD-123456');
      expect(checkoutSessionRepository.markCompleted).toHaveBeenCalled();
    });

    it('should return validation errors for unavailable products', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(mockCheckoutSession);
      productRepository.findByIds.mockResolvedValue([
        { ...mockProduct, status: ProductStatus.INACTIVE } as any,
      ]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );

      const result = await service.placeOrder(
        'session-id-123',
        'browser-session-123',
        {},
      );

      expect(result.success).toBe(false);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors![0].error).toBe('unavailable');
    });

    it('should return missing fields when customer info incomplete', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        customer: null,
        shippingAddress: null,
        paymentMethod: null,
      });
      productRepository.findByIds.mockResolvedValue([
        {
          ...mockProduct,
          inventory: { available: 100, totalQuantity: 100 },
        } as any,
      ]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );

      const result = await service.placeOrder(
        'session-id-123',
        'browser-session-123',
        {},
      );

      expect(result.success).toBe(false);
      expect(result.missingFields).toContain('customer.name');
      expect(result.missingFields).toContain('customer.phone');
      expect(result.missingFields).toContain('paymentMethod');
    });

    it('should throw error when session not found', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.placeOrder('non-existent-id', 'browser-session-123', {}),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when session already completed', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        status: CheckoutSessionStatus.COMPLETED,
      });

      await expect(
        service.placeOrder('session-id-123', 'browser-session-123', {}),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should clear cart items after order if requested', async () => {
      const mockCart = {
        id: 'cart-123',
        items: [
          {
            productId: 'product-123',
            variantId: null,
            quantity: 5,
          },
          {
            productId: 'product-456',
            variantId: null,
            quantity: 3,
          },
        ],
        comboInstances: [],
      };

      checkoutSessionRepository.findById.mockResolvedValue(mockCheckoutSession);
      productRepository.findByIds.mockResolvedValue([
        {
          ...mockProduct,
          inventory: { available: 100, totalQuantity: 100 },
        } as any,
      ]);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      orderRepository.generateOrderNumber.mockResolvedValue('ORD-123456');
      orderRepository.create.mockResolvedValue({
        id: 'order-123',
        orderNumber: 'ORD-123456',
      } as any);
      checkoutSessionRepository.markCompleted.mockResolvedValue(
        mockCheckoutSession,
      );
      cartRepository.findBySessionId.mockResolvedValue(mockCart as any);
      cartRepository.update.mockResolvedValue({} as any);

      await service.placeOrder('session-id-123', 'browser-session-123', {});

      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ productId: 'product-456' }),
          ]),
        }),
      );
    });

    it('should validate flash sale stock', async () => {
      const sessionWithFlashSale = {
        ...mockCheckoutSession,
        items: [
          {
            ...mockCheckoutSession.items[0],
            flashSaleId: 'fs-1',
            quantity: 10,
          },
        ],
      };

      const flashSaleMap = new Map();
      flashSaleMap.set('product-123', {
        flashSaleId: 'fs-1',
        flashSaleName: 'Flash Sale',
        productId: 'product-123',
        promotionalQuantity: 10,
        soldCount: 5,
        isEnabled: true,
      });

      checkoutSessionRepository.findById.mockResolvedValue(
        sessionWithFlashSale,
      );
      productRepository.findByIds.mockResolvedValue([
        {
          ...mockProduct,
          inventory: { available: 100, totalQuantity: 100 },
        } as any,
      ]);
      flashSaleRepository.findCurrentlyActive.mockResolvedValue({
        id: 'fs-1',
        name: 'Flash Sale',
      } as any);
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        flashSaleMap,
      );

      const result = await service.placeOrder(
        'session-id-123',
        'browser-session-123',
        {},
      );

      expect(result.success).toBe(false);
      expect(result.validationErrors![0].error).toBe('insufficient_stock');
      expect(result.validationErrors![0].availableQuantity).toBe(5);
    });
  });

  describe('cancelSession', () => {
    it('should delete checkout session', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(mockCheckoutSession);
      checkoutSessionRepository.delete.mockResolvedValue(undefined);

      await service.cancelSession('session-id-123', 'browser-session-123');

      expect(checkoutSessionRepository.delete).toHaveBeenCalledWith(
        'session-id-123',
      );
    });

    it('should throw error when session not found', async () => {
      checkoutSessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.cancelSession('non-existent-id', 'browser-session-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when not authorized', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        sessionId: 'different-session',
      });

      await expect(
        service.cancelSession('session-id-123', 'browser-session-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('combo handling', () => {
    it('should create session with combo items', async () => {
      const mockProduct2 = { ...mockProduct, id: 'product-456' };

      comboRepository.findById.mockResolvedValue(mockCombo as any);
      productRepository.findByIds.mockResolvedValue([]);
      productRepository.findById.mockImplementation((id) => {
        if (id === 'product-123') return Promise.resolve(mockProduct as any);
        if (id === 'product-456') return Promise.resolve(mockProduct2 as any);
        return Promise.resolve(null);
      });
      flashSaleProductRepository.findActiveForProducts.mockResolvedValue(
        new Map(),
      );
      checkoutSessionRepository.generateSessionNumber.mockResolvedValue(
        'CS-123456',
      );
      checkoutSessionRepository.create.mockResolvedValue({
        ...mockCheckoutSession,
        comboInstances: [
          {
            comboInstanceId: 'ci-1',
            comboId: 'combo-123',
            comboName: 'Test Combo',
            discountType: DiscountType.FIXED,
            discountValue: 20000,
            originalPrice: 200000,
            discountAmount: 20000,
          },
        ],
      });

      const result = await service.upsertSession('browser-session-123', {
        combos: [
          {
            comboId: 'combo-123',
            items: [{ productId: 'product-123' }, { productId: 'product-456' }],
          },
        ],
      });

      expect(result.comboInstances).toHaveLength(1);
      expect(comboRepository.findById).toHaveBeenCalledWith('combo-123');
    });

    it('should throw error when combo not found', async () => {
      comboRepository.findById.mockResolvedValue(null);

      await expect(
        service.upsertSession('browser-session-123', {
          combos: [
            {
              comboId: 'non-existent',
              items: [{ productId: 'product-123' }],
            },
          ],
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
        service.upsertSession('browser-session-123', {
          combos: [
            {
              comboId: 'combo-123',
              items: [{ productId: 'product-123' }],
            },
          ],
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
        service.upsertSession('browser-session-123', {
          combos: [
            {
              comboId: 'combo-123',
              items: [{ productId: 'product-123' }],
            },
          ],
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('ownership validation', () => {
    it('should allow access by userId when authenticated', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        userId: 'user-123',
        sessionId: 'different-session',
      });

      const result = await service.getById(
        'session-id-123',
        'browser-session-123',
        'user-123',
      );

      expect(result).toHaveProperty('id', 'session-id-123');
    });

    it('should deny access when userId does not match', async () => {
      checkoutSessionRepository.findById.mockResolvedValue({
        ...mockCheckoutSession,
        userId: 'user-123',
        sessionId: 'different-session',
      });

      await expect(
        service.getById('session-id-123', 'browser-session-123', 'user-456'),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });
});
