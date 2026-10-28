import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OrderService } from '../../../src/shop/order/order.service';
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
  createMockOrderRepository,
  createMockI18nService,
  createMockOnepayService,
  createMockInfocmsService,
  createMockOrderCdpSyncService,
  createMockOrderNhanhSyncService,
  createMockOrderTasksService,
} from '../../helpers/mock-factories';
import { OrderTasksService } from '../../../src/order-tasks/order-tasks.service';
import {
  createOrder,
  resetFactoryCounters,
} from '../../helpers/domain-factories';

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderRepository = createMockOrderRepository();
  const mockI18nService = createMockI18nService();
  const mockOnepayService = createMockOnepayService();
  const mockInfocmsService = createMockInfocmsService();
  const mockOrderCdpSyncService = createMockOrderCdpSyncService();
  const mockOrderNhanhSyncService = createMockOrderNhanhSyncService();
  const mockOrderTasksService = createMockOrderTasksService();

  beforeEach(async () => {
    resetFactoryCounters();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: I18nService, useValue: mockI18nService },
        { provide: OnepayService, useValue: mockOnepayService },
        { provide: InfocmsService, useValue: mockInfocmsService },
        { provide: OrderTasksService, useValue: mockOrderTasksService },
        { provide: OrderCdpSyncService, useValue: mockOrderCdpSyncService },
        { provide: OrderNhanhSyncService, useValue: mockOrderNhanhSyncService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('getById', () => {
    it('should return the order when found', async () => {
      const order = createOrder();
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.getById(order.id);

      expect(result).toBe(order);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(order.id);
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(service.getById('nonexistent-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getByIdWithOwnership', () => {
    it('should return order when authenticated user owns it', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        sessionId: 'session-abc',
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.getByIdWithOwnership(
        order.id,
        'different-session',
        'user-id-1',
      );

      expect(result).toBe(order);
    });

    it('should return order when guest session matches', async () => {
      const order = createOrder({
        userId: null,
        sessionId: 'guest-session-123',
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.getByIdWithOwnership(
        order.id,
        'guest-session-123',
      );

      expect(result).toBe(order);
    });

    it('should throw ForbiddenException when neither userId nor sessionId matches', async () => {
      const order = createOrder({
        userId: 'owner-id',
        sessionId: 'owner-session',
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.getByIdWithOwnership(order.id, 'wrong-session', 'wrong-user'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should fall through to sessionId check when userId provided but mismatched', async () => {
      const order = createOrder({
        userId: 'actual-owner',
        sessionId: 'matching-session',
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      // userId doesn't match, but sessionId does - should succeed
      const result = await service.getByIdWithOwnership(
        order.id,
        'matching-session',
        'different-user',
      );

      expect(result).toBe(order);
    });
  });

  describe('countUnsyncedToNhanh', () => {
    it('should delegate to the repository and return its count', async () => {
      mockOrderRepository.countUnsyncedToNhanh.mockResolvedValue(7);

      const count = await service.countUnsyncedToNhanh();

      expect(count).toBe(7);
      expect(mockOrderRepository.countUnsyncedToNhanh).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when there are no unsynced orders', async () => {
      mockOrderRepository.countUnsyncedToNhanh.mockResolvedValue(0);

      const count = await service.countUnsyncedToNhanh();

      expect(count).toBe(0);
    });
  });

  describe('lookupOrder', () => {
    it('should return order when order number and phone match', async () => {
      const order = createOrder();
      order.customer.phone = '0901234567';
      mockOrderRepository.findByOrderNumber.mockResolvedValue(order);

      const result = await service.lookupOrder(order.orderNumber, '0901234567');

      expect(result).toBe(order);
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findByOrderNumber.mockResolvedValue(null);

      await expect(
        service.lookupOrder('ORD-NOTEXIST', '0901234567'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw NotFoundException when phone does not match', async () => {
      const order = createOrder();
      order.customer.phone = '0901234567';
      mockOrderRepository.findByOrderNumber.mockResolvedValue(order);

      await expect(
        service.lookupOrder(order.orderNumber, '0999999999'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a PENDING order owned by authenticated user', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        sessionId: 'session-abc',
        status: OrderStatus.PENDING,
      });
      const cancelled = {
        ...order,
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      };
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(cancelled);

      const result = await service.cancelOrder(
        order.id,
        'session-abc',
        'Changed mind',
        'user-id-1',
      );

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(
        order.id,
        expect.objectContaining({ status: OrderStatus.CANCELLED }),
      );
    });

    it('should cancel a CONFIRMED order owned by guest session', async () => {
      const order = createOrder({
        userId: null,
        sessionId: 'guest-session',
        status: OrderStatus.CONFIRMED,
      });
      const cancelled = { ...order, status: OrderStatus.CANCELLED };
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(cancelled);

      const result = await service.cancelOrder(order.id, 'guest-session');

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw ForbiddenException when user does not own the order', async () => {
      const order = createOrder({
        userId: 'owner-id',
        sessionId: 'owner-session',
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.cancelOrder(order.id, 'wrong-session', undefined, 'wrong-user'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw BadRequestException when order is SHIPPED', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        status: OrderStatus.SHIPPED,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.cancelOrder(order.id, 'any-session', undefined, 'user-id-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw BadRequestException when order is DELIVERED', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        status: OrderStatus.DELIVERED,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.cancelOrder(order.id, 'any-session', undefined, 'user-id-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw BadRequestException when order is already CANCELLED', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        status: OrderStatus.CANCELLED,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.cancelOrder(order.id, 'any-session', undefined, 'user-id-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('updatePaymentMethod', () => {
    it('should return paymentUrl for OnePay intercard method', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
      });
      const updatedOrder = {
        ...order,
        paymentMethod: PaymentMethod.ONEPAY_INTERCARD,
      };
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);
      mockOnepayService.createPaymentUrl.mockResolvedValue(
        'https://onepay.vn/pay?token=abc',
      );

      const result = await service.updatePaymentMethod(
        order.id,
        'session-abc',
        'user-id-1',
        PaymentMethod.ONEPAY_INTERCARD,
        '127.0.0.1',
      );

      expect(result.success).toBe(true);
      expect(result.paymentUrl).toBe('https://onepay.vn/pay?token=abc');
      expect(mockOnepayService.createPaymentUrl).toHaveBeenCalled();
    });

    it('should return qrUrl and qrData for InfoCMS VietQR method', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
      });
      const updatedOrder = {
        ...order,
        paymentMethod: PaymentMethod.INFOCMS_VIETQR,
      };
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);
      mockInfocmsService.createPaymentQr.mockResolvedValue({
        success: true,
        qrUrl: 'https://vietqr.com/qr',
        qrData: 'qr-data-string',
        transactionUuid: 'tx-uuid-123',
        ecollectionCd: 'ecol-123',
      });

      const result = await service.updatePaymentMethod(
        order.id,
        'session-abc',
        'user-id-1',
        PaymentMethod.INFOCMS_VIETQR,
        '127.0.0.1',
      );

      expect(result.success).toBe(true);
      expect(result.qrUrl).toBe('https://vietqr.com/qr');
      expect(result.qrData).toBe('qr-data-string');
    });

    it('should trigger CDP and Nhanh sync for COD payment', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
      });
      const updatedOrder = { ...order, paymentMethod: PaymentMethod.COD };
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);

      const result = await service.updatePaymentMethod(
        order.id,
        'session-abc',
        'user-id-1',
        PaymentMethod.COD,
        '127.0.0.1',
      );

      expect(result.success).toBe(true);
      expect(mockOrderTasksService.queueSyncOrderCdp).toHaveBeenCalled();
      expect(mockOrderTasksService.queueSyncOrderNhanh).toHaveBeenCalled();
    });

    it('should throw BadRequestException when payment is already PAID', async () => {
      const order = createOrder({
        userId: 'user-id-1',
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PENDING,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.updatePaymentMethod(
          order.id,
          'session-abc',
          'user-id-1',
          PaymentMethod.COD,
          '127.0.0.1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw ForbiddenException when user does not own order', async () => {
      const order = createOrder({
        userId: 'owner-id',
        paymentStatus: PaymentStatus.PENDING,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.updatePaymentMethod(
          order.id,
          'wrong-session',
          'wrong-user',
          PaymentMethod.COD,
          '127.0.0.1',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
