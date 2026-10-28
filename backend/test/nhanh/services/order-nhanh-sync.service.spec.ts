import { Test, TestingModule } from '@nestjs/testing';
import { OrderNhanhSyncService } from '../../../src/nhanh/services/order-nhanh-sync.service';
import { NhanhService } from '../../../src/nhanh/services/nhanh.service';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { Order } from '../../../src/shop/order/domain/order';
import { NhanhSyncStatus } from '../../../src/shop/order/domain/nhanh-sync-status.enum';
import { OrderNhanhMapper } from '../../../src/nhanh/mappers/order-nhanh.mapper';
import { NhanhRateLimitException } from '../../../src/nhanh/exceptions/nhanh-rate-limit.exception';

describe('OrderNhanhSyncService', () => {
  let service: OrderNhanhSyncService;

  const mockNhanhService = {
    addOrder: jest.fn(),
    findExistingOrder: jest.fn(),
  };

  const mockOrderRepository = {
    updateNhanhSyncStatus: jest.fn(),
  };

  const mockProductRepository = {
    findByIds: jest.fn(),
  };

  const order = {
    id: 'order-1',
    orderNumber: 'ORD-20260614-0052',
    createdAt: new Date('2026-06-14T10:00:00Z'),
    customer: { name: 'Phượng', phone: '+84357688246' },
    total: 288000,
    items: [{ productId: 'prod-1' }],
  } as unknown as Order;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderNhanhSyncService,
        { provide: NhanhService, useValue: mockNhanhService },
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<OrderNhanhSyncService>(OrderNhanhSyncService);

    // The order has one product mapped to a Nhanh product id, and the mapper
    // produces a payload with at least one product so the sync reaches the API.
    mockProductRepository.findByIds.mockResolvedValue([
      { id: 'prod-1', code: 'P1', snapshot: { id: 123 } },
    ]);
    jest.spyOn(OrderNhanhMapper, 'toNhanhRequest').mockReturnValue({
      channel: { appOrderId: order.orderNumber },
      shippingAddress: { name: 'A', mobile: '0900000000' },
      products: [{ id: 123, price: 1000, quantity: 1 }],
    } as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should mark the order SYNCED when Nhanh accepts the order', async () => {
    mockNhanhService.addOrder.mockResolvedValue({
      code: 1,
      data: { id: 999, trackingUrl: 'https://nhanh.vn/999' },
    });

    const result = await service.syncOrder(order);

    expect(result).toEqual({
      nhanhOrderId: 999,
      trackingUrl: 'https://nhanh.vn/999',
      success: true,
      error: null,
    });
    expect(mockOrderRepository.updateNhanhSyncStatus).toHaveBeenCalledWith(
      'order-1',
      NhanhSyncStatus.SYNCED,
      999,
      'https://nhanh.vn/999',
    );
    // A clean success must not trigger the recovery lookup.
    expect(mockNhanhService.findExistingOrder).not.toHaveBeenCalled();
  });

  it('should recover the Nhanh id via lookup when add fails but the order already exists', async () => {
    mockNhanhService.addOrder.mockRejectedValue(
      new Error(
        '{"channel.appOrderId":"Đơn hàng: ORD-20260614-0052 đã tồn tại"}',
      ),
    );
    mockNhanhService.findExistingOrder.mockResolvedValue({
      id: 555,
      trackingUrl: 'https://nhanh.vn/555',
    });

    const result = await service.syncOrder(order);

    expect(mockNhanhService.findExistingOrder).toHaveBeenCalledWith(
      order.customer.phone,
      order.createdAt,
      order.total,
    );
    expect(mockOrderRepository.updateNhanhSyncStatus).toHaveBeenCalledWith(
      'order-1',
      NhanhSyncStatus.SYNCED,
      555,
      'https://nhanh.vn/555',
    );
    expect(result).toEqual({
      nhanhOrderId: 555,
      trackingUrl: 'https://nhanh.vn/555',
      success: true,
      error: null,
    });
  });

  it('should mark the order FAILED when add fails and the order is not found on Nhanh', async () => {
    mockNhanhService.addOrder.mockRejectedValue(new Error('Some Nhanh error'));
    mockNhanhService.findExistingOrder.mockResolvedValue(null);

    const result = await service.syncOrder(order);

    expect(mockNhanhService.findExistingOrder).toHaveBeenCalled();
    expect(mockOrderRepository.updateNhanhSyncStatus).toHaveBeenCalledWith(
      'order-1',
      NhanhSyncStatus.FAILED,
      undefined,
      undefined,
      'Some Nhanh error',
    );
    expect(result.success).toBe(false);
    expect(result.nhanhOrderId).toBeNull();
    expect(result.error).toBe('Some Nhanh error');
  });

  it('should not attempt a lookup on transient rate-limit errors', async () => {
    mockNhanhService.addOrder.mockRejectedValue(
      new NhanhRateLimitException('rate limited', {
        lockedSeconds: 10,
        unlockedAt: 999999,
      }),
    );

    const result = await service.syncOrder(order);

    expect(mockNhanhService.findExistingOrder).not.toHaveBeenCalled();
    expect(mockOrderRepository.updateNhanhSyncStatus).toHaveBeenCalledWith(
      'order-1',
      NhanhSyncStatus.FAILED,
      undefined,
      undefined,
      'rate limited',
    );
    expect(result.success).toBe(false);
  });

  it('should mark the order FAILED when the recovery lookup itself throws', async () => {
    mockNhanhService.addOrder.mockRejectedValue(new Error('add failed'));
    mockNhanhService.findExistingOrder.mockRejectedValue(
      new Error('lookup down'),
    );

    const result = await service.syncOrder(order);

    expect(mockOrderRepository.updateNhanhSyncStatus).toHaveBeenCalledWith(
      'order-1',
      NhanhSyncStatus.FAILED,
      undefined,
      undefined,
      'add failed',
    );
    expect(result.success).toBe(false);
    expect(result.error).toBe('add failed');
  });
});
