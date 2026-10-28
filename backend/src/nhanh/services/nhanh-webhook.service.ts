import { Injectable, Logger, Optional } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  NhanhWebhookPayloadDto,
  NhanhWebhookEvent,
  NhanhInventoryChangeItem,
  NhanhProductWebhookData,
  NhanhOrderWebhookData,
} from '../dto/webhook/nhanh-webhook-payload.dto';
import { NhanhWebhookResponseDto } from '../dto/webhook/nhanh-webhook-response.dto';
import { ProductRepository } from '../../products/domain/product.repository';
import { ProductInventoryRepository } from '../../product-inventories/domain/product-inventory.repository';
import { OrderRepository } from '../../shop/order/domain/order.repository';
import { NhanhSyncStatus } from '../../shop/order/domain/nhanh-sync-status.enum';
import { OrderStatus } from '../../shop/order/domain/order.enums';
import { Order } from '../../shop/order/domain/order';
import { NullableType } from '../../utils/types/nullable.type';
import { OrderCdpSyncService } from '../../cdp/order-cdp-sync.service';
import { NhanhOrderStatus } from '../enums/nhanh-order-status.enum';
import {
  NhanhProductMapper,
  CategoryInfo,
} from '../mappers/nhanh-product.mapper';
import { NhanhProductSnapshot } from '../types/nhanh-snapshots';
import { Product } from '../../products/domain/product';
import { ProductCategoryRepository } from '../../product-categories/domain/product-category.repository';
import { OrderTasksService } from '../../order-tasks/order-tasks.service';
import { CommissionSettingsRepository } from '../../commission-settings/domain/commission-settings.repository';
import { CommissionTrigger } from '../../commission-settings/domain/commission-trigger.enum';
import { TelegramService } from '../../telegram/telegram.service';

@Injectable()
export class NhanhWebhookService {
  private readonly logger = new Logger(NhanhWebhookService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productInventoryRepository: ProductInventoryRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productCategoryRepository: ProductCategoryRepository,
    private readonly i18n: I18nService,
    private readonly orderCdpSyncService: OrderCdpSyncService,
    private readonly orderTasksService: OrderTasksService,
    @Optional()
    private readonly commissionSettingsRepository?: CommissionSettingsRepository,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {}

  async handleWebhook(
    payload: NhanhWebhookPayloadDto,
  ): Promise<NhanhWebhookResponseDto> {
    const businessId = String(payload.businessId);

    this.logger.log(
      `[WEBHOOK] Event: ${payload.event}, Business: ${businessId}`,
    );
    this.logger.debug(`[WEBHOOK] Full payload: ${JSON.stringify(payload)}`);

    try {
      switch (payload.event) {
        case NhanhWebhookEvent.PRODUCT_ADD:
        case NhanhWebhookEvent.PRODUCT_UPDATE:
          this.logger.log(`[WEBHOOK] Processing product add/update...`);
          await this.handleProductAddOrUpdate(
            payload.data as NhanhProductWebhookData,
            businessId,
          );
          break;

        case NhanhWebhookEvent.PRODUCT_DELETE:
          this.logger.log(`[WEBHOOK] Processing product delete...`);
          await this.handleProductDelete(payload.data as number[], businessId);
          break;

        case NhanhWebhookEvent.INVENTORY_CHANGE:
          this.logger.log(`[WEBHOOK] Processing inventory change...`);
          await this.handleInventoryChange(
            payload.data as NhanhInventoryChangeItem[],
            businessId,
          );
          break;

        case NhanhWebhookEvent.ORDER_ADD:
        case NhanhWebhookEvent.ORDER_UPDATE:
          this.logger.log(`[WEBHOOK] Processing order add/update...`);
          await this.handleOrderAddOrUpdate(
            payload.data as NhanhOrderWebhookData,
            businessId,
          );
          break;

        case NhanhWebhookEvent.ORDER_DELETE:
          this.logger.log(`[WEBHOOK] Processing order delete...`);
          await this.handleOrderDelete(payload.data as number[], businessId);
          break;

        case NhanhWebhookEvent.WEBHOOKS_ENABLED:
          this.logger.log(`[WEBHOOK] Setting up webhooks...`);
          break;

        default:
          this.logger.warn(`[WEBHOOK] Unknown event: ${payload.event}`);
          return { success: false, message: `Unknown event: ${payload.event}` };
      }

      this.logger.log(`[WEBHOOK] ✓ Processing completed successfully`);
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(
        `[WEBHOOK] ✗ Processing failed: ${error.message}`,
        error.stack,
      );
      void this.telegramService?.sendErrorAlert(
        `NhanhWebhook.${payload.event}`,
        error as Error,
        { businessId },
      );
      return {
        success: true,
        message: 'Webhook received but processing failed',
      };
    }
  }

  private async handleProductAddOrUpdate(
    productData: NhanhProductWebhookData,
    businessId: string,
  ): Promise<void> {
    this.logger.debug(
      `[PRODUCT] Received productData type: ${typeof productData}`,
    );
    this.logger.debug(
      `[PRODUCT] productData keys: ${Object.keys(productData || {}).join(', ')}`,
    );
    this.logger.debug(`[PRODUCT] productData.id: ${productData?.id}`);

    if (!productData?.id) {
      this.logger.warn('[PRODUCT] No product data in payload');
      this.logger.warn(
        `[PRODUCT] Full productData: ${JSON.stringify(productData)}`,
      );
      return;
    }

    this.logger.log(
      `[PRODUCT] Processing ID: ${productData.id}, Code: ${productData.code}`,
    );

    try {
      const categoryMapping = await this.buildCategoryMapping(
        productData.categoryId,
      );
      const snapshot = this.convertToSnapshot(productData);
      const product = NhanhProductMapper.toDomain(
        snapshot,
        businessId,
        categoryMapping,
      );

      const upserted = await this.productRepository.bulkUpsert([product]);
      this.logger.log(
        `[PRODUCT] ✓ Upserted product ${productData.id}, affected: ${upserted}`,
      );

      if (productData.childs?.length) {
        this.logger.log(
          `[PRODUCT] Processing ${productData.childs.length} child variants...`,
        );
        const childProducts = productData.childs.map((child) =>
          NhanhProductMapper.toDomain(
            this.convertToSnapshot(child),
            businessId,
            categoryMapping,
          ),
        );
        const childUpserted =
          await this.productRepository.bulkUpsert(childProducts);
        this.logger.log(
          `[PRODUCT] ✓ Upserted ${childUpserted} variants for ${productData.id}`,
        );

        // Refresh parent's embedded variants after upserting children
        if (childUpserted > 0) {
          await this.productRepository.embedVariantsForParent(
            productData.id,
            businessId,
            'nhanh',
          );
        }
      }

      // If this is a child variant, refresh parent's variants
      if (productData.parentId && productData.parentId > 0) {
        await this.productRepository.embedVariantsForParent(
          productData.parentId,
          businessId,
          'nhanh',
        );
      }
    } catch (error) {
      this.logger.error(
        `[PRODUCT] ✗ Failed product ${productData.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleProductDelete(
    productIds: number[],
    businessId: string,
  ): Promise<void> {
    if (!productIds?.length) {
      this.logger.warn('No product IDs in delete payload');
      return;
    }

    this.logger.log(`Deleting ${productIds.length} products`);

    for (const productId of productIds) {
      try {
        if (typeof productId !== 'number' || isNaN(productId)) continue;

        const product =
          await this.productRepository.findByBusinessIdSourceAndSnapshotId(
            businessId,
            'nhanh',
            productId,
          );

        if (!product) {
          this.logger.debug(`Product ${productId} not found, skip`);
          continue;
        }

        await this.productRepository.remove(product.id);
        this.logger.log(`Deleted product ${productId}`);
      } catch (error) {
        this.logger.error(`Failed delete ${productId}: ${error.message}`);
      }
    }
  }

  private async handleInventoryChange(
    inventoryItems: NhanhInventoryChangeItem[],
    businessId: string,
  ): Promise<void> {
    if (!inventoryItems?.length) {
      this.logger.warn('No inventory items in payload');
      return;
    }

    this.logger.log(`Processing ${inventoryItems.length} inventory changes`);

    for (const item of inventoryItems) {
      try {
        if (!item.id || typeof item.id !== 'number') continue;

        const product =
          await this.productRepository.findByBusinessIdSourceAndSnapshotId(
            businessId,
            'nhanh',
            item.id,
          );

        if (!product) {
          this.logger.debug(
            `Product ${item.id} not found, skipping inventory update. Will be synced by scheduled job.`,
          );
          continue;
        }

        const inventoryUpdate: Product['inventory'] = {
          remain: item.remain,
          available: item.available,
          shipping: item.shipping,
          damaged: item.damaged,
          holding: item.holding,
          warranty: item.warranty?.remain,
          warrantyHolding: item.warranty?.holding,
        };

        await this.productRepository.update(product.id, {
          inventory: inventoryUpdate,
          stock: item.available, // Also update stock to match inventory.available
        });
        this.logger.log(
          `Updated inventory ${item.id}: remain=${item.remain}, stock=${item.available}`,
        );

        await this.updateProductInventory(product, item, businessId);

        // If this is a variant, refresh parent's embedded variants to update stock
        const parentId = (product.snapshot as any)?.parentId;
        if (parentId && parentId > 0) {
          await this.productRepository.embedVariantsForParent(
            parentId,
            businessId,
            'nhanh',
          );
          this.logger.debug(
            `Refreshed parent ${parentId} variants after inventory change`,
          );
        }
      } catch (error) {
        this.logger.error(`Failed inventory ${item.id}: ${error.message}`);
      }
    }
  }

  private async updateProductInventory(
    product: Product,
    inventoryItem: NhanhInventoryChangeItem,
    businessId: string,
  ): Promise<void> {
    try {
      const depots =
        inventoryItem.depots?.map((depot) => ({
          depotId: String(depot.id),
          remain: depot.remain,
          available: depot.available,
          shipping: depot.shipping,
          damaged: depot.damaged,
          holding: depot.holding,
          warranty: depot.warranty,
        })) || [];

      await this.productInventoryRepository.upsert({
        businessId,
        productId: product.id,
        source: 'nhanh' as const,
        snapshot: {
          productId: inventoryItem.id,
          name: product.name,
          inventory: {
            remain: inventoryItem.remain,
            shipping: inventoryItem.shipping,
            damaged: inventoryItem.damaged,
            holding: inventoryItem.holding,
            available: inventoryItem.available,
            depots: inventoryItem.depots || [],
          },
        },
        totalRemain: inventoryItem.remain,
        totalAvailable: inventoryItem.available,
        totalShipping: inventoryItem.shipping,
        totalDamaged: inventoryItem.damaged,
        totalHolding: inventoryItem.holding,
        depots,
      });
    } catch (error) {
      this.logger.error(`ProductInventory update failed: ${error.message}`);
    }
  }

  private convertToSnapshot(
    data: NhanhProductWebhookData,
  ): NhanhProductSnapshot {
    return {
      id: data.id,
      parentId: data.parentId,
      code: data.code,
      barcode: data.barcode,
      name: data.name,
      otherName: data.otherName,
      status: data.status,
      categoryId: data.categoryId,
      category: data.category,
      internalCategory: data.internalCategory,
      prices: data.prices,
      vat: data.vat,
      images: data.images,
      description: data.description,
      content: data.content,
      brand: data.brand,
      type: data.type,
      shipping: data.shipping,
      inventory: data.inventory
        ? {
            remain: data.inventory.remain,
            shipping: data.inventory.shipping,
            damaged: data.inventory.damaged,
            holding: data.inventory.holding,
            warranty: data.inventory.warranty
              ? {
                  remain: data.inventory.warranty.remain,
                  holding: data.inventory.warranty.holding,
                }
              : undefined,
            holdingNew: data.inventory.holdingNew,
            shippingExport: data.inventory.shippingExport,
            available: data.inventory.available,
            depots: data.inventory.depots?.map((depot) => ({
              id: depot.id,
              remain: depot.remain,
              shipping: depot.shipping,
              damaged: depot.damaged,
              holding: depot.holding,
              warranty: depot.warranty
                ? {
                    remain: depot.warranty.remain,
                    holding: depot.warranty.holding,
                  }
                : undefined,
              holdingNew: depot.holdingNew,
              shippingExport: depot.shippingExport,
              available: depot.available,
            })),
          }
        : undefined,
      attributes: data.attributes,
      updatedAt: data.updatedAt || Math.floor(Date.now() / 1000),
      createdAt: data.createdAt || Math.floor(Date.now() / 1000),
    };
  }

  private async buildCategoryMapping(
    categoryId: number | undefined,
  ): Promise<Map<string, CategoryInfo>> {
    const mapping = new Map<string, CategoryInfo>();
    if (!categoryId) {
      return mapping;
    }

    try {
      const category = await this.productCategoryRepository.findBySnapshotId(
        categoryId,
        'nhanh',
      );

      if (category) {
        mapping.set(String(categoryId), {
          id: category.id,
          name: category.name,
        });
        this.logger.debug(
          `[PRODUCT] Resolved category ${categoryId} -> ${category.name}`,
        );
      } else {
        this.logger.debug(`[PRODUCT] Category ${categoryId} not found`);
      }
    } catch (error) {
      this.logger.warn('Category lookup failed: ' + error.message);
    }
    return mapping;
  }

  private async handleOrderAddOrUpdate(
    orderData: NhanhOrderWebhookData,
    businessId: string,
  ): Promise<void> {
    if (!orderData?.info?.id) {
      this.logger.warn('[ORDER] No order data in payload');
      return;
    }

    const nhanhId = orderData.info.id;
    const appOrderId = orderData.channel?.appOrderId;

    this.logger.log(
      `[ORDER] Processing Nhanh ID: ${nhanhId}, App ID: ${appOrderId}`,
    );

    try {
      let order: NullableType<Order> = null;

      // 1. Try finding by appOrderId (our order number)
      if (appOrderId) {
        order = await this.orderRepository.findByOrderNumber(appOrderId);
      }

      // 2. If not found, try finding by Nhanh ID
      if (!order) {
        order = await this.orderRepository.findByNhanhOrderId(nhanhId);
      }

      if (!order) {
        this.logger.warn(
          `[ORDER] Order not found in system. NhanhID: ${nhanhId}, AppID: ${appOrderId}`,
        );
        // For now just skip for external orders
        return;
      }

      // Update Nhanh sync info
      await this.orderRepository.updateNhanhSyncStatus(
        order.id,
        NhanhSyncStatus.SYNCED,
        nhanhId,
        orderData.info.trackingUrl,
      );

      // Update Order Status
      const newStatus = this.mapNhanhStatusToOrderStatus(orderData.info.status);
      if (newStatus && newStatus !== order.status) {
        const updatedOrder = await this.orderRepository.update(order.id, {
          status: newStatus,
        });
        this.logger.log(
          `[ORDER] Updated status to ${newStatus} for order ${order.orderNumber}`,
        );

        // Sync to CDP based on order status
        if (newStatus === OrderStatus.DELIVERED && updatedOrder) {
          // Sync completion to CDP when order is delivered (updates pay_status to paid)
          await this.orderCdpSyncService.syncOrderCompletion(updatedOrder);
          this.logger.log(
            `[ORDER] Synced completion to CDP for order ${order.orderNumber}`,
          );
        } else if (newStatus === OrderStatus.CANCELLED && updatedOrder) {
          // Sync cancellation to CDP when order is cancelled (deducts spending from customer)
          await this.orderCdpSyncService.syncOrderCancellation(updatedOrder);
          this.logger.log(
            `[ORDER] Synced cancellation to CDP for order ${order.orderNumber}`,
          );
        }

        // Handle affiliate commission based on trigger setting
        if (
          newStatus === OrderStatus.DELIVERED &&
          order.affiliateId &&
          order.affiliateCode
        ) {
          const settings =
            await this.commissionSettingsRepository?.getOrCreate();
          if (
            settings?.commissionTrigger === CommissionTrigger.ORDER_COMPLETION
          ) {
            // ORDER_COMPLETION mode: create commission now (doesn't exist yet)
            void this.orderTasksService.queueCreateAffiliateCommission(
              updatedOrder!,
              order.affiliateId,
              order.affiliateCode,
            );
          } else {
            // ORDER_CREATION mode: commission already exists, update its status
            void this.orderTasksService.queueUpdateAffiliateCommissionStatus(
              order.id,
              order.orderNumber,
              newStatus,
            );
          }
        } else if (order.affiliateId) {
          // Non-DELIVERED status with affiliate: update existing commission status
          void this.orderTasksService.queueUpdateAffiliateCommissionStatus(
            order.id,
            order.orderNumber,
            newStatus,
          );
        }
      }

      this.logger.log(`[ORDER] ✓ Updated info for order ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(
        `[ORDER] ✗ Failed to process order ${nhanhId}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleOrderDelete(
    orderIds: number[],
    businessId: string,
  ): Promise<void> {
    if (!orderIds?.length) {
      this.logger.warn('[ORDER] No order IDs in delete payload');
      return;
    }

    this.logger.log(`[ORDER] Processing delete for ${orderIds.length} orders`);

    for (const nhanhId of orderIds) {
      try {
        const order = await this.orderRepository.findByNhanhOrderId(nhanhId);

        if (!order) {
          this.logger.debug(`[ORDER] Order ${nhanhId} not found, skip delete`);
          continue;
        }

        this.logger.log(
          `[ORDER] Cancelling order ${order.orderNumber} because it was deleted on Nhanh.vn`,
        );

        const updatedOrder = await this.orderRepository.update(order.id, {
          status: OrderStatus.CANCELLED,
          cancellationReason: 'Deleted on Nhanh.vn',
        });

        // Sync cancellation to CDP (deducts spending from customer)
        if (updatedOrder) {
          await this.orderCdpSyncService.syncOrderCancellation(updatedOrder);
        }

        // Queue affiliate commission status update
        if (order.affiliateId) {
          void this.orderTasksService.queueUpdateAffiliateCommissionStatus(
            order.id,
            order.orderNumber,
            OrderStatus.CANCELLED,
          );
        }

        this.logger.log(
          `[ORDER] ✓ Cancelled order ${order.orderNumber} and synced to CDP`,
        );
      } catch (error) {
        this.logger.error(
          `[ORDER] Failed to process delete for ${nhanhId}: ${error.message}`,
        );
      }
    }
  }

  private mapNhanhStatusToOrderStatus(nhanhStatus: number): OrderStatus | null {
    switch (nhanhStatus) {
      case NhanhOrderStatus.NEW:
      case NhanhOrderStatus.CONFIRMING:
      case NhanhOrderStatus.WAITING_CUSTOMER_CONFIRMATION:
        return OrderStatus.PENDING;

      case NhanhOrderStatus.CONFIRMED:
        return OrderStatus.CONFIRMED;

      case NhanhOrderStatus.PACKING:
      case NhanhOrderStatus.PACKED:
      case NhanhOrderStatus.WAITING_FOR_PICKUP:
      case NhanhOrderStatus.CHANGING_WAREHOUSE:
        return OrderStatus.PROCESSING;

      case NhanhOrderStatus.SHIPPING:
      case NhanhOrderStatus.RETURNING:
        return OrderStatus.SHIPPED;

      case NhanhOrderStatus.SUCCESS:
        return OrderStatus.DELIVERED;

      case NhanhOrderStatus.FAILED:
      case NhanhOrderStatus.CARRIER_CANCELLED:
      case NhanhOrderStatus.CUSTOMER_CANCELLED:
      case NhanhOrderStatus.SYSTEM_CANCELLED:
      case NhanhOrderStatus.OUT_OF_STOCK:
        return OrderStatus.CANCELLED;

      case NhanhOrderStatus.RETURNED:
      case NhanhOrderStatus.RETURN_CONFIRMED:
        return OrderStatus.REFUNDED;

      default:
        return null;
    }
  }
}
