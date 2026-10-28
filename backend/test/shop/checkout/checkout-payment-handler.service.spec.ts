import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CheckoutPaymentHandlerService } from '../../../src/shop/checkout/checkout-payment-handler.service';
import { CheckoutSessionRepository } from '../../../src/shop/checkout/domain/checkout-session.repository';
import { CartRepository } from '../../../src/shop/cart/domain/cart.repository';
import { FlashSaleProductRepository } from '../../../src/flash-sale-products/domain/flash-sale-product.repository';
import { OrderCdpSyncService } from '../../../src/cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '../../../src/nhanh/services/order-nhanh-sync.service';
import { SocketService } from '../../../src/socket/socket.service';
import { OrderConfirmationService } from '../../../src/shop/order-confirmation/order-confirmation.service';
import { PromotionRepository } from '../../../src/promotions/domain/promotion.repository';
import { PromotionProductRepository } from '../../../src/promotion-products/domain/promotion-product.repository';
import { PromotionUsageRecordRepository } from '../../../src/promotion-usage-records/domain/promotion-usage-record.repository';
import { PaymentStatus } from '../../../src/shop/order/domain/order.enums';

describe('CheckoutPaymentHandlerService', () => {
  let service: CheckoutPaymentHandlerService;
  let checkoutSessionRepository: jest.Mocked<CheckoutSessionRepository>;
  let cartRepository: jest.Mocked<CartRepository>;
  let flashSaleProductRepository: jest.Mocked<FlashSaleProductRepository>;
  let orderCdpSyncService: jest.Mocked<OrderCdpSyncService>;
  let orderNhanhSyncService: jest.Mocked<OrderNhanhSyncService>;
  let socketService: jest.Mocked<SocketService>;

  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-001',
    total: 250000,
    userId: 'user-123',
    sessionId: 'session-456',
    paymentStatus: PaymentStatus.PAID,
  };

  const mockCheckoutSession = {
    id: 'checkout-session-123',
    sessionNumber: 'CS-001',
    userId: 'user-123',
    sessionId: 'session-456',
    items: [
      {
        productId: 'product-1',
        variantId: null,
        code: 'PROD-001',
        name: 'Test Product 1',
        quantity: 2,
        originalPrice: 100000,
        effectivePrice: 90000,
      },
      {
        productId: 'product-2',
        variantId: 'variant-1',
        code: 'PROD-002-VAR1',
        name: 'Test Product 2 Variant',
        quantity: 1,
        originalPrice: 50000,
        effectivePrice: 45000,
      },
    ],
    comboInstances: [
      {
        comboInstanceId: 'combo-inst-1',
        comboId: 'combo-1',
        comboName: 'Test Combo',
      },
    ],
    shipping: {
      fee: 30000,
      depotId: 1,
      depotName: 'Depot A',
    },
  };

  const mockCart = {
    id: 'cart-123',
    userId: 'user-123',
    sessionId: 'session-456',
    items: [
      {
        productId: 'product-1',
        variantId: null,
        quantity: 2,
        price: 90000,
      },
      {
        productId: 'product-2',
        variantId: 'variant-1',
        quantity: 1,
        price: 45000,
      },
      {
        productId: 'product-3',
        variantId: null,
        quantity: 1,
        price: 30000,
      },
    ],
    comboInstances: [
      {
        comboInstanceId: 'combo-inst-1',
        comboId: 'combo-1',
      },
      {
        comboInstanceId: 'combo-inst-2',
        comboId: 'combo-2',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutPaymentHandlerService,
        {
          provide: CheckoutSessionRepository,
          useValue: {
            findByOrderId: jest.fn(),
            markCompleted: jest.fn(),
          },
        },
        {
          provide: CartRepository,
          useValue: {
            findByUserId: jest.fn(),
            findBySessionId: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: FlashSaleProductRepository,
          useValue: {
            incrementSoldCountForItems: jest.fn(),
          },
        },
        {
          provide: OrderCdpSyncService,
          useValue: {
            syncOrder: jest.fn(),
          },
        },
        {
          provide: OrderNhanhSyncService,
          useValue: {
            syncOrder: jest.fn(),
          },
        },
        {
          provide: SocketService,
          useValue: {
            notifyOrderRefetch: jest.fn(),
            notifyCartRefetch: jest.fn(),
          },
        },
        {
          provide: OrderConfirmationService,
          useValue: {
            sendConfirmation: jest.fn(),
            createOrderConfirmationToken: jest.fn(),
          },
        },
        {
          provide: PromotionRepository,
          useValue: {
            incrementProductDiscountUsage: jest.fn(),
            incrementOrderDiscountUsage: jest.fn(),
            incrementProductDiscountSoldCount: jest.fn(),
          },
        },
        {
          provide: PromotionProductRepository,
          useValue: {
            incrementSoldCount: jest.fn(),
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

    service = module.get<CheckoutPaymentHandlerService>(
      CheckoutPaymentHandlerService,
    );
    checkoutSessionRepository = module.get(
      CheckoutSessionRepository,
    ) as jest.Mocked<CheckoutSessionRepository>;
    cartRepository = module.get(CartRepository) as jest.Mocked<CartRepository>;
    flashSaleProductRepository = module.get(
      FlashSaleProductRepository,
    ) as jest.Mocked<FlashSaleProductRepository>;
    orderCdpSyncService = module.get(
      OrderCdpSyncService,
    ) as jest.Mocked<OrderCdpSyncService>;
    orderNhanhSyncService = module.get(
      OrderNhanhSyncService,
    ) as jest.Mocked<OrderNhanhSyncService>;
    socketService = module.get(SocketService) as jest.Mocked<SocketService>;

    // Suppress logger output
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePaymentSuccess', () => {
    beforeEach(() => {
      checkoutSessionRepository.findByOrderId.mockResolvedValue(
        mockCheckoutSession as any,
      );
      checkoutSessionRepository.markCompleted.mockResolvedValue({} as any);
      cartRepository.findByUserId.mockResolvedValue(mockCart as any);
      cartRepository.update.mockResolvedValue(mockCart as any);
      flashSaleProductRepository.incrementSoldCountForItems.mockReturnValue(
        undefined,
      );
      orderCdpSyncService.syncOrder.mockResolvedValue({
        success: true,
        cdpCustomerId: 'cdp-123',
      } as any);
      orderNhanhSyncService.syncOrder.mockResolvedValue({
        success: true,
      } as any);
      socketService.notifyOrderRefetch.mockReturnValue(undefined);
      socketService.notifyCartRefetch.mockReturnValue(undefined);
    });

    it('should find checkout session by order ID', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      expect(checkoutSessionRepository.findByOrderId).toHaveBeenCalledWith(
        'order-123',
      );
    });

    it('should mark session as completed', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      expect(checkoutSessionRepository.markCompleted).toHaveBeenCalledWith(
        'checkout-session-123',
        'order-123',
        'ORD-001',
      );
    });

    it('should clear cart items for user', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(cartRepository.update).toHaveBeenCalledWith('cart-123', {
        items: [
          {
            productId: 'product-3',
            variantId: null,
            quantity: 1,
            price: 30000,
          },
        ],
        comboInstances: [
          {
            comboInstanceId: 'combo-inst-2',
            comboId: 'combo-2',
          },
        ],
      });
    });

    it('should clear cart items for guest user', async () => {
      const guestSession = {
        ...mockCheckoutSession,
        userId: null,
      };
      const guestOrder = {
        ...mockOrder,
        userId: null,
      };

      checkoutSessionRepository.findByOrderId.mockResolvedValue(
        guestSession as any,
      );
      cartRepository.findBySessionId.mockResolvedValue(mockCart as any);

      await service.handlePaymentSuccess(guestOrder as any);

      expect(cartRepository.findBySessionId).toHaveBeenCalledWith(
        'session-456',
      );
      expect(cartRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should increment flash sale sold counts', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      expect(
        flashSaleProductRepository.incrementSoldCountForItems,
      ).toHaveBeenCalledWith(mockCheckoutSession.items);
    });

    it('should sync order to CDP', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      expect(orderCdpSyncService.syncOrder).toHaveBeenCalledWith(mockOrder);
    });

    it('should sync order to Nhanh with shipping info', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      expect(orderNhanhSyncService.syncOrder).toHaveBeenCalledWith(
        mockOrder,
        mockCheckoutSession.shipping,
      );
    });

    it('should notify client to refetch order data', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      expect(socketService.notifyOrderRefetch).toHaveBeenCalledWith({
        id: 'order-123',
        orderNumber: 'ORD-001',
        userId: 'user-123',
        sessionId: 'session-456',
      });
    });

    it('should notify client to refetch cart data', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      expect(socketService.notifyCartRefetch).toHaveBeenCalledWith(
        'cart-123',
        'user-123',
        'session-456',
      );
    });

    it('should handle missing checkout session gracefully', async () => {
      checkoutSessionRepository.findByOrderId.mockResolvedValue(null);

      await service.handlePaymentSuccess(mockOrder as any);

      // Should not mark completed or clear cart
      expect(checkoutSessionRepository.markCompleted).not.toHaveBeenCalled();
      expect(cartRepository.update).not.toHaveBeenCalled();

      // Should still sync to CDP/Nhanh
      expect(orderCdpSyncService.syncOrder).toHaveBeenCalledWith(mockOrder);
      expect(orderNhanhSyncService.syncOrder).toHaveBeenCalledWith(mockOrder);
    });

    it('should log warning when checkout session not found', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      checkoutSessionRepository.findByOrderId.mockResolvedValue(null);

      await service.handlePaymentSuccess(mockOrder as any);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Checkout session not found'),
      );
    });

    it('should handle missing cart gracefully', async () => {
      cartRepository.findByUserId.mockResolvedValue(null);

      await service.handlePaymentSuccess(mockOrder as any);

      // Should not update cart
      expect(cartRepository.update).not.toHaveBeenCalled();
      // Should still notify cart refetch (socket will handle missing cart)
      expect(socketService.notifyCartRefetch).not.toHaveBeenCalled();
    });

    it('should remove only ordered items from cart', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      const updateCall = cartRepository.update.mock.calls[0]!;
      const updateParams = updateCall[1]!;
      expect(updateParams.items).toHaveLength(1);
      expect(updateParams.items![0]!.productId).toBe('product-3');
    });

    it('should remove only ordered combo instances from cart', async () => {
      await service.handlePaymentSuccess(mockOrder as any);

      const updateCall = cartRepository.update.mock.calls[0]!;
      expect(updateCall[1].comboInstances).toHaveLength(1);
      expect(updateCall[1].comboInstances?.[0]?.comboInstanceId).toBe(
        'combo-inst-2',
      );
    });

    it('should handle cart with no combo instances', async () => {
      const cartWithoutCombos = {
        ...mockCart,
        comboInstances: undefined,
      };
      cartRepository.findByUserId.mockResolvedValue(cartWithoutCombos as any);

      await service.handlePaymentSuccess(mockOrder as any);

      expect(cartRepository.update).toHaveBeenCalledWith(
        'cart-123',
        expect.objectContaining({
          comboInstances: [],
        }),
      );
    });

    it('should handle session with no combo instances', async () => {
      const sessionWithoutCombos = {
        ...mockCheckoutSession,
        comboInstances: undefined,
      };
      checkoutSessionRepository.findByOrderId.mockResolvedValue(
        sessionWithoutCombos as any,
      );

      await service.handlePaymentSuccess(mockOrder as any);

      const updateCall = cartRepository.update.mock.calls[0]!;
      expect(updateCall[1].comboInstances).toEqual(mockCart.comboInstances);
    });

    it('should match items by product ID and variant ID', async () => {
      const cartWithVariants = {
        ...mockCart,
        items: [
          { productId: 'product-1', variantId: null, quantity: 1, price: 100 },
          {
            productId: 'product-1',
            variantId: 'variant-a',
            quantity: 1,
            price: 100,
          },
          {
            productId: 'product-2',
            variantId: 'variant-1',
            quantity: 1,
            price: 100,
          },
        ],
      };
      cartRepository.findByUserId.mockResolvedValue(cartWithVariants as any);

      await service.handlePaymentSuccess(mockOrder as any);

      const updateCall = cartRepository.update.mock.calls[0]!;
      const updateParams = updateCall[1]!;
      // Should keep product-1 with variant-a (different variant)
      expect(updateParams.items).toHaveLength(1);
      expect(updateParams.items![0]!.productId).toBe('product-1');
      expect(updateParams.items![0]!.variantId).toBe('variant-a');
    });

    it('should log completion message', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await service.handlePaymentSuccess(mockOrder as any);

      expect(logSpy).toHaveBeenCalledWith(
        'Payment success handling completed for order ORD-001',
      );
    });
  });

  describe('handlePaymentFailed', () => {
    it('should notify client to refetch order data', () => {
      service.handlePaymentFailed(mockOrder as any);

      expect(socketService.notifyOrderRefetch).toHaveBeenCalledWith({
        id: 'order-123',
        orderNumber: 'ORD-001',
        userId: 'user-123',
        sessionId: 'session-456',
      });
    });

    it('should not modify checkout session', () => {
      service.handlePaymentFailed(mockOrder as any);

      expect(checkoutSessionRepository.markCompleted).not.toHaveBeenCalled();
      expect(cartRepository.update).not.toHaveBeenCalled();
    });

    it('should not sync to CDP or Nhanh', () => {
      service.handlePaymentFailed(mockOrder as any);

      expect(orderCdpSyncService.syncOrder).not.toHaveBeenCalled();
      expect(orderNhanhSyncService.syncOrder).not.toHaveBeenCalled();
    });

    it('should not increment flash sale counts', () => {
      service.handlePaymentFailed(mockOrder as any);

      expect(
        flashSaleProductRepository.incrementSoldCountForItems,
      ).not.toHaveBeenCalled();
    });

    it('should log processing and completion messages', () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      service.handlePaymentFailed(mockOrder as any);

      expect(logSpy).toHaveBeenCalledWith(
        'Processing payment failure for order ORD-001',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Payment failure handling completed for order ORD-001',
      );
    });

    it('should handle guest user order', () => {
      const guestOrder = {
        ...mockOrder,
        userId: null,
      };

      service.handlePaymentFailed(guestOrder as any);

      expect(socketService.notifyOrderRefetch).toHaveBeenCalledWith({
        id: 'order-123',
        orderNumber: 'ORD-001',
        userId: null,
        sessionId: 'session-456',
      });
    });
  });

  describe('integration scenarios', () => {
    it('should complete full payment success flow', async () => {
      checkoutSessionRepository.findByOrderId.mockResolvedValue(
        mockCheckoutSession as any,
      );
      cartRepository.findByUserId.mockResolvedValue(mockCart as any);

      await service.handlePaymentSuccess(mockOrder as any);

      // Verify all steps executed
      expect(checkoutSessionRepository.findByOrderId).toHaveBeenCalled();
      expect(checkoutSessionRepository.markCompleted).toHaveBeenCalled();
      expect(cartRepository.update).toHaveBeenCalled();
      expect(
        flashSaleProductRepository.incrementSoldCountForItems,
      ).toHaveBeenCalled();
      expect(orderCdpSyncService.syncOrder).toHaveBeenCalled();
      expect(orderNhanhSyncService.syncOrder).toHaveBeenCalled();
      expect(socketService.notifyOrderRefetch).toHaveBeenCalled();
      expect(socketService.notifyCartRefetch).toHaveBeenCalled();
    });

    it('should update cart with empty arrays when all items are ordered', async () => {
      // Setup cart that has exactly the same items as the session
      const cartWithOnlyOrderedItems = {
        id: 'cart-123',
        userId: 'user-123',
        sessionId: 'session-456',
        items: [
          {
            productId: 'product-1',
            variantId: null,
            quantity: 2,
            price: 90000,
          },
          {
            productId: 'product-2',
            variantId: 'variant-1',
            quantity: 1,
            price: 45000,
          },
        ],
        comboInstances: [
          {
            comboInstanceId: 'combo-inst-1',
            comboId: 'combo-1',
          },
        ],
      };

      // Setup fresh session with same items
      const sessionWithMatchingItems = {
        ...mockCheckoutSession,
        items: [
          {
            productId: 'product-1',
            variantId: null,
            code: 'PROD-001',
            name: 'Test Product 1',
          },
          {
            productId: 'product-2',
            variantId: 'variant-1',
            code: 'PROD-002',
            name: 'Test Product 2',
          },
        ],
        comboInstances: [
          {
            comboInstanceId: 'combo-inst-1',
            comboId: 'combo-1',
          },
        ],
      };

      checkoutSessionRepository.findByOrderId.mockResolvedValueOnce(
        sessionWithMatchingItems as any,
      );
      cartRepository.findByUserId.mockResolvedValueOnce(
        cartWithOnlyOrderedItems as any,
      );

      await service.handlePaymentSuccess(mockOrder as any);

      // Verify cart was cleared completely
      const updateCalls = cartRepository.update.mock.calls;
      expect(updateCalls.length).toBeGreaterThan(0);
      const lastCall = updateCalls[updateCalls.length - 1];
      expect(lastCall![0]).toBe('cart-123');
      expect(lastCall![1]!.items).toEqual([]);
      expect(lastCall![1]!.comboInstances).toEqual([]);
    });
  });
});
