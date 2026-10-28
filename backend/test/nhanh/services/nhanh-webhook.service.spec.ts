import { Test, TestingModule } from '@nestjs/testing';
import { NhanhWebhookService } from '../../../src/nhanh/services/nhanh-webhook.service';
import { ProductRepository } from '../../../src/products/domain/product.repository';
import { ProductInventoryRepository } from '../../../src/product-inventories/domain/product-inventory.repository';
import { OrderRepository } from '../../../src/shop/order/domain/order.repository';
import { OrderCdpSyncService } from '../../../src/cdp/order-cdp-sync.service';
import { ProductCategoryRepository } from '../../../src/product-categories/domain/product-category.repository';
import { I18nService } from 'nestjs-i18n';
import { NhanhWebhookEvent } from '../../../src/nhanh/dto/webhook/nhanh-webhook-payload.dto';
import { NhanhProductMapper } from '../../../src/nhanh/mappers/nhanh-product.mapper';
import { OrderStatus } from '../../../src/shop/order/domain/order.enums';
import { NhanhOrderStatus } from '../../../src/nhanh/enums/nhanh-order-status.enum';
import { AffiliateOrderCommissionsService } from '../../../src/affiliate-order-commissions/affiliate-order-commissions.service';

describe('NhanhWebhookService', () => {
  let service: NhanhWebhookService;
  let productRepository: ProductRepository;

  const mockProductRepository = {
    bulkUpsert: jest.fn().mockResolvedValue(1),
    embedVariantsForParent: jest.fn().mockResolvedValue(1),
  };

  const mockProductInventoryRepository = {};

  const mockOrderRepository = {
    findByNhanhOrderId: jest.fn(),
    findByOrderNumber: jest.fn(),
    update: jest.fn(),
    updateNhanhSyncStatus: jest.fn(),
  };

  const mockOrderCdpSyncService = {
    syncOrderCancellation: jest.fn().mockResolvedValue(true),
    syncOrderCompletion: jest.fn().mockResolvedValue(true),
  };

  const mockProductCategoryRepository = {
    findByNhanhId: jest.fn().mockResolvedValue(null),
  };

  const mockI18nService = {
    t: jest.fn().mockResolvedValue('Translated message'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NhanhWebhookService,
        { provide: ProductRepository, useValue: mockProductRepository },
        {
          provide: ProductInventoryRepository,
          useValue: mockProductInventoryRepository,
        },
        { provide: OrderRepository, useValue: mockOrderRepository },
        {
          provide: ProductCategoryRepository,
          useValue: mockProductCategoryRepository,
        },
        { provide: OrderCdpSyncService, useValue: mockOrderCdpSyncService },
        { provide: I18nService, useValue: mockI18nService },
        {
          provide: AffiliateOrderCommissionsService,
          useValue: {
            createFromOrder: jest.fn().mockResolvedValue(undefined),
            updateOrderStatus: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<NhanhWebhookService>(NhanhWebhookService);
    productRepository = module.get<ProductRepository>(ProductRepository);

    // Spy on mapper to avoid complex logic failures with partial data
    jest.spyOn(NhanhProductMapper, 'toDomain').mockImplementation(
      (snapshot, businessId) =>
        ({
          id: 'mock-id',
          businessId: businessId,
          source: 'nhanh',
          snapshot: { id: 123 },
        }) as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleProductAddOrUpdate', () => {
    const businessId = '211417';

    it('should upsert product correctly', async () => {
      const payload = {
        event: NhanhWebhookEvent.PRODUCT_UPDATE,
        businessId: businessId,
        data: {
          id: 97,
          code: 'PROD_TEST',
          name: 'Product Test',
          parentId: -1,
          inventory: {
            remain: 10,
            available: 10,
            warranty: { remain: 5, holding: 2 }, // Test warranty object mapping
          },
        },
      };

      // Mock mapper to verify mapping logic if possible, or just rely on service flow
      // Since mapper is static, we can spy on it or trust it works.
      // Here we mainly test the flow within service.

      await service.handleWebhook(payload as any);

      expect(productRepository.bulkUpsert).toHaveBeenCalledTimes(1);
      expect(productRepository.bulkUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            businessId: businessId,
            // Check if warranty is mapped correctly in domain object would require mocking mapper or deep check
            // For now we check keys flow
          }),
        ]),
      );
    });

    it('should upsert children and refresh parent variants if payload has children', async () => {
      const payload = {
        event: NhanhWebhookEvent.PRODUCT_UPDATE,
        businessId: businessId,
        data: {
          id: 100,
          code: 'PARENT',
          parentId: -1,
          childs: [
            { id: 101, code: 'CHILD_1', parentId: 100 },
            { id: 102, code: 'CHILD_2', parentId: 100 },
          ],
        },
      };

      await service.handleWebhook(payload as any);

      // 1 call for parent, 1 call for children (bulk)
      expect(productRepository.bulkUpsert).toHaveBeenCalledTimes(2);

      // Verify parent variants refresh is called
      expect(productRepository.embedVariantsForParent).toHaveBeenCalledWith(
        100,
        businessId,
        'nhanh',
      );
    });

    it('should refresh parent variants if payload is a child variant', async () => {
      const payload = {
        event: NhanhWebhookEvent.PRODUCT_UPDATE,
        businessId: businessId,
        data: {
          id: 101,
          code: 'CHILD_1',
          parentId: 100, // Valid parentId > 0
        },
      };

      await service.handleWebhook(payload as any);

      expect(productRepository.bulkUpsert).toHaveBeenCalledTimes(1);

      // Verify parent variants refresh is called
      expect(productRepository.embedVariantsForParent).toHaveBeenCalledWith(
        100,
        businessId,
        'nhanh',
      );
    });
  });

  describe('handleOrderAddOrUpdate', () => {
    const businessId = '211417';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update order status to DELIVERED and sync completion to CDP when Nhanh status is SUCCESS', async () => {
      const mockOrder = {
        id: 'order-id-123',
        orderNumber: 'ORD-20251225-0001',
        status: OrderStatus.SHIPPED,
        cdp: {
          syncStatus: 'synced',
          customerId: 'cdp-customer-123',
        },
      };

      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.DELIVERED,
      };

      mockOrderRepository.findByOrderNumber.mockResolvedValue(mockOrder);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);
      mockOrderRepository.updateNhanhSyncStatus.mockResolvedValue(updatedOrder);

      const payload = {
        event: NhanhWebhookEvent.ORDER_UPDATE,
        businessId: businessId,
        data: {
          info: {
            id: 12345,
            status: NhanhOrderStatus.SUCCESS,
            trackingUrl: 'https://tracking.url',
          },
          channel: {
            appOrderId: 'ORD-20251225-0001',
          },
        },
      };

      await service.handleWebhook(payload as any);

      // Verify order status was updated
      expect(mockOrderRepository.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.DELIVERED,
      });

      // Verify completion sync was called
      expect(mockOrderCdpSyncService.syncOrderCompletion).toHaveBeenCalledWith(
        updatedOrder,
      );
      expect(mockOrderCdpSyncService.syncOrderCompletion).toHaveBeenCalledTimes(
        1,
      );

      // Verify cancellation sync was NOT called
      expect(
        mockOrderCdpSyncService.syncOrderCancellation,
      ).not.toHaveBeenCalled();
    });

    it('should update order status to CANCELLED and sync cancellation to CDP when Nhanh status is CANCELLED', async () => {
      const mockOrder = {
        id: 'order-id-456',
        orderNumber: 'ORD-20251225-0002',
        status: OrderStatus.PENDING,
        cdp: {
          syncStatus: 'synced',
          customerId: 'cdp-customer-456',
        },
      };

      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      };

      mockOrderRepository.findByOrderNumber.mockResolvedValue(mockOrder);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);
      mockOrderRepository.updateNhanhSyncStatus.mockResolvedValue(updatedOrder);

      const payload = {
        event: NhanhWebhookEvent.ORDER_UPDATE,
        businessId: businessId,
        data: {
          info: {
            id: 67890,
            status: NhanhOrderStatus.CUSTOMER_CANCELLED,
            trackingUrl: 'https://tracking.url',
          },
          channel: {
            appOrderId: 'ORD-20251225-0002',
          },
        },
      };

      await service.handleWebhook(payload as any);

      // Verify order status was updated
      expect(mockOrderRepository.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.CANCELLED,
      });

      // Verify cancellation sync was called
      expect(
        mockOrderCdpSyncService.syncOrderCancellation,
      ).toHaveBeenCalledWith(updatedOrder);
      expect(
        mockOrderCdpSyncService.syncOrderCancellation,
      ).toHaveBeenCalledTimes(1);

      // Verify completion sync was NOT called
      expect(
        mockOrderCdpSyncService.syncOrderCompletion,
      ).not.toHaveBeenCalled();
    });

    it('should not sync to CDP if order status does not change', async () => {
      const mockOrder = {
        id: 'order-id-789',
        orderNumber: 'ORD-20251225-0003',
        status: OrderStatus.DELIVERED,
        cdp: {
          syncStatus: 'synced',
          customerId: 'cdp-customer-789',
        },
      };

      mockOrderRepository.findByOrderNumber.mockResolvedValue(mockOrder);
      mockOrderRepository.updateNhanhSyncStatus.mockResolvedValue(mockOrder);

      const payload = {
        event: NhanhWebhookEvent.ORDER_UPDATE,
        businessId: businessId,
        data: {
          info: {
            id: 11111,
            status: NhanhOrderStatus.SUCCESS,
            trackingUrl: 'https://tracking.url',
          },
          channel: {
            appOrderId: 'ORD-20251225-0003',
          },
        },
      };

      await service.handleWebhook(payload as any);

      // Verify order update was NOT called (status unchanged)
      expect(mockOrderRepository.update).not.toHaveBeenCalled();

      // Verify no CDP sync was called
      expect(
        mockOrderCdpSyncService.syncOrderCompletion,
      ).not.toHaveBeenCalled();
      expect(
        mockOrderCdpSyncService.syncOrderCancellation,
      ).not.toHaveBeenCalled();
    });

    it('should update Nhanh sync status even if order status does not change', async () => {
      const mockOrder = {
        id: 'order-id-999',
        orderNumber: 'ORD-20251225-0004',
        status: OrderStatus.PROCESSING,
      };

      mockOrderRepository.findByOrderNumber.mockResolvedValue(mockOrder);
      mockOrderRepository.updateNhanhSyncStatus.mockResolvedValue(mockOrder);

      const payload = {
        event: NhanhWebhookEvent.ORDER_UPDATE,
        businessId: businessId,
        data: {
          info: {
            id: 22222,
            status: NhanhOrderStatus.PACKING,
            trackingUrl: 'https://tracking.url',
          },
          channel: {
            appOrderId: 'ORD-20251225-0004',
          },
        },
      };

      await service.handleWebhook(payload as any);

      // Verify Nhanh sync status was updated
      expect(mockOrderRepository.updateNhanhSyncStatus).toHaveBeenCalledWith(
        mockOrder.id,
        expect.anything(),
        22222,
        'https://tracking.url',
      );
    });

    it('should handle order not found gracefully', async () => {
      mockOrderRepository.findByOrderNumber.mockResolvedValue(null);
      mockOrderRepository.findByNhanhOrderId.mockResolvedValue(null);

      const payload = {
        event: NhanhWebhookEvent.ORDER_UPDATE,
        businessId: businessId,
        data: {
          info: {
            id: 99999,
            status: NhanhOrderStatus.SUCCESS,
          },
          channel: {
            appOrderId: 'NON-EXISTENT-ORDER',
          },
        },
      };

      // Should not throw
      await expect(service.handleWebhook(payload as any)).resolves.toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });

      // Verify no updates were made
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
      expect(
        mockOrderCdpSyncService.syncOrderCompletion,
      ).not.toHaveBeenCalled();
      expect(
        mockOrderCdpSyncService.syncOrderCancellation,
      ).not.toHaveBeenCalled();
    });
  });
});
