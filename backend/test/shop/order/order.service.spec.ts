import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { OrderService } from '../../../src/shop/order/order.service';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import { Order } from '../../../src/shop/order/domain/order';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../../../src/shop/order/domain/order.enums';
import { OnepayService } from '../../../src/payment/onepay/onepay.service';
import { InfocmsService } from '../../../src/payment/infocms/infocms.service';
import { OrderCdpSyncService } from '../../../src/cdp/order-cdp-sync.service';
import { OrderNhanhSyncService } from '../../../src/nhanh/services/order-nhanh-sync.service';
import { AffiliateOrderCommissionsService } from '../../../src/affiliate-order-commissions/affiliate-order-commissions.service';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: jest.Mocked<OrderRepository>;
  let i18nService: jest.Mocked<I18nService>;
  let onepayService: jest.Mocked<OnepayService>;
  let infocmsService: jest.Mocked<InfocmsService>;
  let orderCdpSyncService: jest.Mocked<OrderCdpSyncService>;
  let orderNhanhSyncService: jest.Mocked<OrderNhanhSyncService>;

  const mockOrder: Order = {
    id: 'order-123',
    orderNumber: 'ORD-20260107-001',
    userId: 'user-123',
    sessionId: 'session-456',
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.COD,
    customer: {
      phone: '0901234567',
      fullName: 'John Doe',
      email: 'john@test.com',
      address: '123 Test Street',
    },
    items: [
      {
        productId: 'product-123',
        code: 'PROD-001',
        name: 'Test Product',
        price: 100000,
        quantity: 1,
      },
    ],
    subtotal: 100000,
    shippingFee: 30000,
    totalAmount: 130000,
    createdAt: new Date('2026-01-07T00:00:00Z'),
    updatedAt: new Date('2026-01-07T00:00:00Z'),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn(),
            findByOrderNumber: jest.fn(),
            findByUserId: jest.fn(),
            findBySessionId: jest.fn(),
            findManyWithPagination: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn((key: string) => key),
          },
        },
        {
          provide: OnepayService,
          useValue: {
            createPaymentUrl: jest.fn(),
          },
        },
        {
          provide: InfocmsService,
          useValue: {
            createPaymentQr: jest.fn(),
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
          useValue: {
            syncOrder: jest.fn(),
          },
        },
        {
          provide: AffiliateOrderCommissionsService,
          useValue: {
            createFromOrder: jest.fn().mockResolvedValue(undefined),
            updateOrderStatus: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get(OrderRepository);
    i18nService = module.get(I18nService);
    onepayService = module.get(OnepayService);
    infocmsService = module.get(InfocmsService);
    orderCdpSyncService = module.get(OrderCdpSyncService);
    orderNhanhSyncService = module.get(OrderNhanhSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return order by id', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.getById('order-123');

      expect(orderRepository.findById).toHaveBeenCalledWith('order-123');
      expect(result).toEqual(mockOrder);
    });

    it('should throw error when order not found', async () => {
      orderRepository.findById.mockResolvedValue(null);

      await expect(service.getById('nonexistent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18nService.t).toHaveBeenCalledWith('shop.order.notFound');
    });
  });

  describe('getByOrderNumber', () => {
    it('should return order by order number', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue(mockOrder);

      const result = await service.getByOrderNumber('ORD-20260107-001');

      expect(orderRepository.findByOrderNumber).toHaveBeenCalledWith(
        'ORD-20260107-001',
      );
      expect(result).toEqual(mockOrder);
    });

    it('should throw error when order not found', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue(null);

      await expect(
        service.getByOrderNumber('NONEXISTENT'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18nService.t).toHaveBeenCalledWith('shop.order.notFound');
    });
  });

  describe('lookupOrder', () => {
    it('should return order when order number and phone match', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue(mockOrder);

      const result = await service.lookupOrder(
        'ORD-20260107-001',
        '0901234567',
      );

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findByOrderNumber).toHaveBeenCalledWith(
        'ORD-20260107-001',
      );
    });

    it('should throw error when order not found', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue(null);

      await expect(
        service.lookupOrder('NONEXISTENT', '0901234567'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when phone does not match', async () => {
      orderRepository.findByOrderNumber.mockResolvedValue(mockOrder);

      await expect(
        service.lookupOrder('ORD-20260107-001', '0909999999'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18nService.t).toHaveBeenCalledWith('shop.order.notFound');
    });
  });

  describe('getByUserId', () => {
    it('should return all orders for user', async () => {
      const userOrders = [mockOrder, { ...mockOrder, id: 'order-456' }];
      orderRepository.findByUserId.mockResolvedValue(userOrders as any);

      const result = await service.getByUserId('user-123');

      expect(orderRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no orders', async () => {
      orderRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getByUserId('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getBySessionId', () => {
    it('should return all orders for session', async () => {
      const sessionOrders = [mockOrder];
      orderRepository.findBySessionId.mockResolvedValue(sessionOrders as any);

      const result = await service.getBySessionId('session-456');

      expect(orderRepository.findBySessionId).toHaveBeenCalledWith(
        'session-456',
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array when session has no orders', async () => {
      orderRepository.findBySessionId.mockResolvedValue([]);

      const result = await service.getBySessionId('session-456');

      expect(result).toEqual([]);
    });
  });

  describe('getOrders', () => {
    it('should get orders with default pagination', async () => {
      const mockPaginateResult = {
        docs: [mockOrder],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
      };
      orderRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );

      const result = await service.getOrders({});

      expect(orderRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: undefined,
        sortOptions: undefined,
        paginationOptions: {
          page: 1,
          limit: 10,
        },
      });
      expect(result.docs).toHaveLength(1);
    });

    it('should apply custom pagination and sorting', async () => {
      const mockPaginateResult = {
        docs: [],
        totalDocs: 0,
        limit: 20,
        page: 2,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
      };
      orderRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );

      await service.getOrders({
        page: 2,
        limit: 20,
        sort: {
          orderBy: 'orderNumber',
          order: 'asc',
        },
      });

      expect(orderRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: undefined,
        sortOptions: {
          orderBy: 'orderNumber',
          order: 'asc',
        },
        paginationOptions: {
          page: 2,
          limit: 20,
        },
      });
    });

    it('should apply filters', async () => {
      const mockPaginateResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
      };
      orderRepository.findManyWithPagination.mockResolvedValue(
        mockPaginateResult as any,
      );

      await service.getOrders({
        filters: {
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      expect(orderRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: {
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
        },
        sortOptions: undefined,
        paginationOptions: {
          page: 1,
          limit: 10,
        },
      });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order for authenticated user', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);
      const cancelledOrder = {
        ...mockOrder,
        status: OrderStatus.CANCELLED,
        cancelledAt: expect.any(Date),
        cancellationReason: 'Test reason',
      };
      orderRepository.update.mockResolvedValue(cancelledOrder as any);

      const result = await service.cancelOrder(
        'order-123',
        'session-456',
        'Test reason',
        'user-123',
      );

      expect(orderRepository.update).toHaveBeenCalledWith('order-123', {
        status: OrderStatus.CANCELLED,
        cancelledAt: expect.any(Date),
        cancellationReason: 'Test reason',
      });
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should cancel order for guest user with session', async () => {
      const guestOrder = { ...mockOrder, userId: null };
      orderRepository.findById.mockResolvedValue(guestOrder as any);
      const cancelledOrder = {
        ...guestOrder,
        status: OrderStatus.CANCELLED,
      };
      orderRepository.update.mockResolvedValue(cancelledOrder as any);

      const result = await service.cancelOrder(
        'order-123',
        'session-456',
        undefined,
        undefined,
      );

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should use default cancellation reason when not provided', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);
      orderRepository.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      } as any);

      await service.cancelOrder(
        'order-123',
        'session-456',
        undefined,
        'user-123',
      );

      expect(orderRepository.update).toHaveBeenCalledWith(
        'order-123',
        expect.objectContaining({
          cancellationReason: 'Cancelled by customer',
        }),
      );
    });

    it('should throw error when user does not own order', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        service.cancelOrder(
          'order-123',
          'session-456',
          undefined,
          'other-user',
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });

      expect(i18nService.t).toHaveBeenCalledWith('shop.order.notAuthorized');
    });

    it('should throw error when session does not own order', async () => {
      const guestOrder = { ...mockOrder, userId: null };
      orderRepository.findById.mockResolvedValue(guestOrder as any);

      await expect(
        service.cancelOrder('order-123', 'other-session', undefined, undefined),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw error when trying to cancel PROCESSING order', async () => {
      const processingOrder = {
        ...mockOrder,
        status: OrderStatus.PROCESSING,
      };
      orderRepository.findById.mockResolvedValue(processingOrder as any);

      await expect(
        service.cancelOrder('order-123', 'session-456', undefined, 'user-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });

      expect(i18nService.t).toHaveBeenCalledWith('shop.order.cannotCancel');
    });

    it('should throw error when trying to cancel DELIVERED order', async () => {
      const deliveredOrder = {
        ...mockOrder,
        status: OrderStatus.DELIVERED,
      };
      orderRepository.findById.mockResolvedValue(deliveredOrder as any);

      await expect(
        service.cancelOrder('order-123', 'session-456', undefined, 'user-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should allow cancelling CONFIRMED order', async () => {
      const confirmedOrder = {
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      };
      orderRepository.findById.mockResolvedValue(confirmedOrder as any);
      orderRepository.update.mockResolvedValue({
        ...confirmedOrder,
        status: OrderStatus.CANCELLED,
      } as any);

      const result = await service.cancelOrder(
        'order-123',
        'session-456',
        undefined,
        'user-123',
      );

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('updatePaymentMethod', () => {
    describe('COD and Bank Transfer', () => {
      it('should update payment method to COD and sync to CDP/Nhanh', async () => {
        orderRepository.findById.mockResolvedValue(mockOrder);
        const updatedOrder = {
          ...mockOrder,
          paymentMethod: PaymentMethod.COD,
        };
        orderRepository.update.mockResolvedValue(updatedOrder as any);

        const result = await service.updatePaymentMethod(
          'order-123',
          'session-456',
          'user-123',
          PaymentMethod.COD,
          '192.168.1.1',
        );

        expect(orderRepository.update).toHaveBeenCalledWith('order-123', {
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
        });
        expect(orderCdpSyncService.syncOrder).toHaveBeenCalledWith(
          updatedOrder,
        );
        expect(orderNhanhSyncService.syncOrder).toHaveBeenCalledWith(
          updatedOrder,
        );
        expect(result).toEqual({ success: true, order: updatedOrder });
      });

      it('should update payment method to BANK_TRANSFER', async () => {
        orderRepository.findById.mockResolvedValue(mockOrder);
        const updatedOrder = {
          ...mockOrder,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
        };
        orderRepository.update.mockResolvedValue(updatedOrder as any);

        const result = await service.updatePaymentMethod(
          'order-123',
          'session-456',
          'user-123',
          PaymentMethod.BANK_TRANSFER,
          '192.168.1.1',
        );

        expect(orderCdpSyncService.syncOrder).toHaveBeenCalled();
        expect(orderNhanhSyncService.syncOrder).toHaveBeenCalled();
        expect(result.success).toBe(true);
      });
    });

    describe('OnePay payment methods', () => {
      it('should create payment URL for ONEPAY_DOMESTIC', async () => {
        orderRepository.findById.mockResolvedValue(mockOrder);
        const updatedOrder = {
          ...mockOrder,
          paymentMethod: PaymentMethod.ONEPAY_DOMESTIC,
        };
        orderRepository.update.mockResolvedValue(updatedOrder as any);
        onepayService.createPaymentUrl.mockResolvedValue(
          'https://onepay.test/payment',
        );

        const result = await service.updatePaymentMethod(
          'order-123',
          'session-456',
          'user-123',
          PaymentMethod.ONEPAY_DOMESTIC,
          '192.168.1.1',
        );

        expect(onepayService.createPaymentUrl).toHaveBeenCalledWith(
          updatedOrder,
          '192.168.1.1',
        );
        expect(result).toEqual({
          success: true,
          order: updatedOrder,
          paymentUrl: 'https://onepay.test/payment',
        });
        expect(orderCdpSyncService.syncOrder).not.toHaveBeenCalled();
        expect(orderNhanhSyncService.syncOrder).not.toHaveBeenCalled();
      });

      it('should create payment URL for ONEPAY_INTERCARD', async () => {
        orderRepository.findById.mockResolvedValue(mockOrder);
        const updatedOrder = {
          ...mockOrder,
          paymentMethod: PaymentMethod.ONEPAY_INTERCARD,
        };
        orderRepository.update.mockResolvedValue(updatedOrder as any);
        onepayService.createPaymentUrl.mockResolvedValue(
          'https://onepay.test/payment',
        );

        const result = await service.updatePaymentMethod(
          'order-123',
          'session-456',
          'user-123',
          PaymentMethod.ONEPAY_INTERCARD,
          '192.168.1.1',
        );

        expect(onepayService.createPaymentUrl).toHaveBeenCalled();
        expect(result.paymentUrl).toBeDefined();
      });
    });

    describe('InfoCMS VietQR payment', () => {
      it('should create QR code for INFOCMS_VIETQR', async () => {
        orderRepository.findById.mockResolvedValue(mockOrder);
        const updatedOrder = {
          ...mockOrder,
          paymentMethod: PaymentMethod.INFOCMS_VIETQR,
        };
        orderRepository.update
          .mockResolvedValueOnce(updatedOrder as any)
          .mockResolvedValueOnce({
            ...updatedOrder,
            infocms: {
              transactionUuid: 'uuid-123',
              ecollectionCd: 'EC123',
            },
          } as any);

        infocmsService.createPaymentQr.mockResolvedValue({
          success: true,
          transactionUuid: 'uuid-123',
          ecollectionCd: 'EC123',
          qrUrl: 'https://qr.test/image.png',
          qrData: 'QR_DATA_STRING',
        } as any);

        const result = await service.updatePaymentMethod(
          'order-123',
          'session-456',
          'user-123',
          PaymentMethod.INFOCMS_VIETQR,
          '192.168.1.1',
        );

        expect(infocmsService.createPaymentQr).toHaveBeenCalledWith(
          updatedOrder,
        );
        expect(orderRepository.update).toHaveBeenCalledWith('order-123', {
          infocms: {
            transactionUuid: 'uuid-123',
            ecollectionCd: 'EC123',
          },
        });
        expect(result).toEqual({
          success: true,
          order: updatedOrder,
          qrUrl: 'https://qr.test/image.png',
          qrData: 'QR_DATA_STRING',
        });
      });

      it('should throw error when QR creation fails', async () => {
        orderRepository.findById.mockResolvedValue(mockOrder);
        const updatedOrder = {
          ...mockOrder,
          paymentMethod: PaymentMethod.INFOCMS_VIETQR,
        };
        orderRepository.update.mockResolvedValue(updatedOrder as any);
        infocmsService.createPaymentQr.mockResolvedValue({
          success: false,
          errorMessage: 'QR generation failed',
        } as any);

        await expect(
          service.updatePaymentMethod(
            'order-123',
            'session-456',
            'user-123',
            PaymentMethod.INFOCMS_VIETQR,
            '192.168.1.1',
          ),
        ).rejects.toMatchObject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      });
    });

    describe('Authorization checks', () => {
      it('should throw error when user does not own order', async () => {
        orderRepository.findById.mockResolvedValue(mockOrder);

        await expect(
          service.updatePaymentMethod(
            'order-123',
            'session-456',
            'other-user',
            PaymentMethod.COD,
            '192.168.1.1',
          ),
        ).rejects.toMatchObject({
          status: HttpStatus.FORBIDDEN,
        });

        expect(i18nService.t).toHaveBeenCalledWith('shop.order.notAuthorized');
      });

      it('should throw error when session does not own order', async () => {
        const guestOrder = { ...mockOrder, userId: null };
        orderRepository.findById.mockResolvedValue(guestOrder as any);

        await expect(
          service.updatePaymentMethod(
            'order-123',
            'other-session',
            undefined,
            PaymentMethod.COD,
            '192.168.1.1',
          ),
        ).rejects.toMatchObject({
          status: HttpStatus.FORBIDDEN,
        });
      });

      it('should allow guest user to update payment with correct session', async () => {
        const guestOrder = {
          ...mockOrder,
          userId: null,
          sessionId: 'session-456',
        };
        orderRepository.findById.mockResolvedValue(guestOrder as any);
        orderRepository.update.mockResolvedValue({
          ...guestOrder,
          paymentMethod: PaymentMethod.COD,
        } as any);

        const result = await service.updatePaymentMethod(
          'order-123',
          'session-456',
          undefined,
          PaymentMethod.COD,
          '192.168.1.1',
        );

        expect(result.success).toBe(true);
      });
    });

    describe('Payment status validation', () => {
      it('should throw error when payment is already PAID', async () => {
        const paidOrder = {
          ...mockOrder,
          paymentStatus: PaymentStatus.PAID,
        };
        orderRepository.findById.mockResolvedValue(paidOrder as any);

        await expect(
          service.updatePaymentMethod(
            'order-123',
            'session-456',
            'user-123',
            PaymentMethod.COD,
            '192.168.1.1',
          ),
        ).rejects.toMatchObject({
          status: HttpStatus.BAD_REQUEST,
        });

        expect(i18nService.t).toHaveBeenCalledWith(
          'shop.order.paymentAlreadyProcessed',
        );
      });

      it('should allow updating payment when status is FAILED', async () => {
        const failedOrder = {
          ...mockOrder,
          paymentStatus: PaymentStatus.FAILED,
        };
        orderRepository.findById.mockResolvedValue(failedOrder as any);
        orderRepository.update.mockResolvedValue({
          ...failedOrder,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
        } as any);

        const result = await service.updatePaymentMethod(
          'order-123',
          'session-456',
          'user-123',
          PaymentMethod.COD,
          '192.168.1.1',
        );

        expect(result.success).toBe(true);
      });
    });

    describe('Order status validation', () => {
      it('should throw error when order is CANCELLED', async () => {
        const cancelledOrder = {
          ...mockOrder,
          status: OrderStatus.CANCELLED,
        };
        orderRepository.findById.mockResolvedValue(cancelledOrder as any);

        await expect(
          service.updatePaymentMethod(
            'order-123',
            'session-456',
            'user-123',
            PaymentMethod.COD,
            '192.168.1.1',
          ),
        ).rejects.toMatchObject({
          status: HttpStatus.BAD_REQUEST,
        });

        expect(i18nService.t).toHaveBeenCalledWith(
          'shop.order.cannotChangePayment',
        );
      });

      it('should throw error when order is DELIVERED', async () => {
        const deliveredOrder = {
          ...mockOrder,
          status: OrderStatus.DELIVERED,
        };
        orderRepository.findById.mockResolvedValue(deliveredOrder as any);

        await expect(
          service.updatePaymentMethod(
            'order-123',
            'session-456',
            'user-123',
            PaymentMethod.COD,
            '192.168.1.1',
          ),
        ).rejects.toMatchObject({
          status: HttpStatus.BAD_REQUEST,
        });
      });

      it('should allow updating payment when order is CONFIRMED', async () => {
        const confirmedOrder = {
          ...mockOrder,
          status: OrderStatus.CONFIRMED,
        };
        orderRepository.findById.mockResolvedValue(confirmedOrder as any);
        orderRepository.update.mockResolvedValue({
          ...confirmedOrder,
          paymentMethod: PaymentMethod.COD,
        } as any);

        const result = await service.updatePaymentMethod(
          'order-123',
          'session-456',
          'user-123',
          PaymentMethod.COD,
          '192.168.1.1',
        );

        expect(result.success).toBe(true);
      });
    });

    describe('Error handling', () => {
      it('should throw error when update fails', async () => {
        orderRepository.findById.mockResolvedValue(mockOrder);
        orderRepository.update.mockResolvedValue(null);

        await expect(
          service.updatePaymentMethod(
            'order-123',
            'session-456',
            'user-123',
            PaymentMethod.COD,
            '192.168.1.1',
          ),
        ).rejects.toMatchObject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });

        expect(i18nService.t).toHaveBeenCalledWith('shop.order.updateFailed');
      });
    });
  });
});
