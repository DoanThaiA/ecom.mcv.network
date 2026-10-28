import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FlashSaleRepository } from '@app/flash-sales/domain/flash-sale.repository';
import { ProductRepository } from '@app/products/domain/product.repository';
import { FlashSaleProductRepository } from '@app/flash-sale-products/domain/flash-sale-product.repository';
import { FlashSaleProduct as FlashSaleProductEntity } from '@app/flash-sale-products/domain/flash-sale-product';
import { Product } from '@app/products/domain/product';
import { FlashSale } from '@app/flash-sales/domain/flash-sale';
import { calculateRoundedDiscountAmount } from '@app/utils/helpers/round-price';

/**
 * Service responsible for syncing flash sale data to product documents
 * and to the flash_sale_products collection for paginated queries.
 * Runs as a cron job every minute to ensure products have up-to-date pricing
 * Uses in-memory caching to skip unnecessary syncs when data hasn't changed
 */
@Injectable()
export class FlashSaleSyncCron implements OnModuleInit {
  private readonly logger = new Logger(FlashSaleSyncCron.name);
  private readonly syncPageSize = 300;

  /**
   * Cache to track last synced state for optimization
   * Allows skipping sync when flash sale data hasn't changed
   */
  private lastSyncedState: {
    flashSaleId: string | null;
    updatedAt: number | null;
    soldCountHash: string | null;
  } = {
    flashSaleId: null,
    updatedAt: null,
    soldCountHash: null,
  };

  constructor(
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly productRepository: ProductRepository,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
  ) {}

  /**
   * Initialize flash sale defaults for products on app startup
   * Ensures all products have flashSale.effectivePrice for sorting
   */
  async onModuleInit(): Promise<void> {
    try {
      const count = await this.productRepository.initializeFlashSaleDefaults();
      if (count > 0) {
        this.logger.log(`Initialized flashSale defaults for ${count} products`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize flash sale defaults', error);
    }
  }

  /**
   * Sync flash sale data to products.
   * Updates effectivePrice, discountAmount, and discountPercent
   * for all products based on the currently active flash sale.
   * Skips sync if flash sale data hasn't changed since last run.
   * Called by PricingSyncCron after product discount sync completes.
   */
  async syncFlashSaleToProducts(): Promise<void> {
    try {
      const activeFlashSale =
        await this.flashSaleRepository.findCurrentlyActive();

      if (activeFlashSale) {
        const soldCountHash = await this.computeSoldCountHashForFlashSale(
          activeFlashSale.id,
        );

        // Check if sync is needed
        if (!this.needsSync(activeFlashSale, soldCountHash)) {
          this.logger.debug('Flash sale unchanged, skipping sync');
          return;
        }

        await this.syncActiveFlashSale(activeFlashSale);
        this.updateCache(activeFlashSale, soldCountHash);
      } else {
        // Check if we need to clear (only if last state had a flash sale)
        if (this.lastSyncedState.flashSaleId === null) {
          this.logger.debug('No flash sale and already cleared, skipping');
          return;
        }

        await this.clearAllFlashSaleData();
        this.clearCache();
      }
    } catch (error) {
      this.logger.error('Failed to sync flash sale data to products', error);
    }
  }

  /**
   * Check if sync is needed by comparing current state with cached state
   */
  private needsSync(flashSale: FlashSale, soldCountHash: string): boolean {
    // Different flash sale
    if (flashSale.id !== this.lastSyncedState.flashSaleId) {
      return true;
    }

    // Flash sale was updated (admin changed settings)
    const updatedAtTs = flashSale.updatedAt.getTime();
    if (updatedAtTs !== this.lastSyncedState.updatedAt) {
      return true;
    }

    // Check if any soldCount changed
    if (soldCountHash !== this.lastSyncedState.soldCountHash) {
      return true;
    }

    return false;
  }

  /**
   * Compute a hash of productId:soldCount pairs for change detection
   */
  private async computeSoldCountHashForFlashSale(
    flashSaleId: string,
  ): Promise<string> {
    const pairs: string[] = [];
    let page = 1;

    while (true) {
      const result =
        await this.flashSaleProductRepository.findByFlashSaleIdWithPagination({
          flashSaleId,
          paginationOptions: { page, limit: this.syncPageSize },
        });

      if (result.docs.length === 0) {
        break;
      }

      for (const product of result.docs) {
        if (product.isEnabled) {
          pairs.push(`${product.productId}:${product.soldCount}`);
        }
      }

      if (!result.hasNextPage) {
        break;
      }

      page += 1;
    }

    return pairs.sort().join(',');
  }

  /**
   * Update cache after successful sync
   */
  private updateCache(flashSale: FlashSale, soldCountHash: string): void {
    this.lastSyncedState = {
      flashSaleId: flashSale.id,
      updatedAt: flashSale.updatedAt.getTime(),
      soldCountHash,
    };
  }

  /**
   * Invalidate cache so that the next sync run is forced to re-sync.
   * Called by PricingSyncCron when product discounts have changed.
   */
  invalidateCache(): void {
    this.lastSyncedState.updatedAt = null;
  }

  /**
   * Clear cache after clearing flash sale data
   */
  private clearCache(): void {
    this.lastSyncedState = {
      flashSaleId: null,
      updatedAt: null,
      soldCountHash: null,
    };
  }

  /**
   * Sync data from an active flash sale to product documents
   * and update the flash_sale_products collection
   */
  private async syncActiveFlashSale(activeFlashSale: FlashSale): Promise<void> {
    const enabledProductIds: string[] = [];
    let page = 1;
    let updatedCount = 0;

    while (true) {
      const result =
        await this.flashSaleProductRepository.findByFlashSaleIdWithPagination({
          flashSaleId: activeFlashSale.id,
          paginationOptions: { page, limit: this.syncPageSize },
        });

      if (result.docs.length === 0) {
        break;
      }

      const enabledProducts = result.docs.filter((p) => p.isEnabled);
      if (enabledProducts.length > 0) {
        const productIds = enabledProducts.map((p) => p.productId);
        enabledProductIds.push(...productIds);

        const products = await this.productRepository.findByIds(productIds);
        if (products.length === 0) {
          this.logger.warn('No products found for flash sale sync batch');
        } else {
          const flashSaleProductMap = new Map(
            enabledProducts.map((p) => [p.productId, p]),
          );

          const updates: Array<{
            productId: string;
            flashSale: Product['flashSale'];
          }> = [];

          const flashSaleProductUpdates: Omit<
            FlashSaleProductEntity,
            'id' | 'createdAt' | 'updatedAt' | 'remainingStock'
          >[] = [];

          for (const product of products) {
            const fsProduct = flashSaleProductMap.get(product.id);
            if (!fsProduct) continue;

            const retail = product.prices?.retail ?? 0;

            // Stacking: use product-discounted price as base if available
            const basePrice =
              product.productDiscount?.discountedPrice != null &&
              product.productDiscount.promotionId != null
                ? product.productDiscount.discountedPrice
                : retail;

            const fsDiscountAmount = calculateRoundedDiscountAmount(
              basePrice,
              fsProduct.discountType,
              fsProduct.discountValue,
            );
            const flashSalePrice = basePrice - fsDiscountAmount;
            const totalDiscountFromRetail = retail - flashSalePrice;
            const remainingStock = Math.max(
              0,
              fsProduct.promotionalQuantity - fsProduct.soldCount,
            );

            updates.push({
              productId: product.id,
              flashSale: {
                flashSaleId: activeFlashSale.id,
                flashSaleName: activeFlashSale.name,
                originalPrice: retail,
                flashSalePrice,
                discountType: fsProduct.discountType,
                discountValue: fsProduct.discountValue,
                discountAmount: totalDiscountFromRetail,
                discountPercent:
                  retail > 0
                    ? Math.round((totalDiscountFromRetail / retail) * 100)
                    : 0,
                promotionalQuantity: fsProduct.promotionalQuantity,
                soldCount: fsProduct.soldCount,
                remainingStock,
                endTime: activeFlashSale.endTime,
                effectivePrice: flashSalePrice,
              },
            });

            flashSaleProductUpdates.push({
              flashSaleId: activeFlashSale.id,
              flashSaleName: activeFlashSale.name,
              productId: product.id,
              name: product.name,
              code: product.code,
              category: product.category ?? null,
              status: product.status,
              stock: product.stock ?? 0,
              hide: product.hide ?? false,
              images: product.images,
              discountType: fsProduct.discountType,
              discountValue: fsProduct.discountValue,
              originalPrice: retail,
              productDiscountPrice: basePrice,
              flashSalePrice,
              discountAmount: totalDiscountFromRetail,
              discountPercent:
                retail > 0
                  ? Math.round((totalDiscountFromRetail / retail) * 100)
                  : 0,
              promotionalQuantity: fsProduct.promotionalQuantity,
              soldCount: fsProduct.soldCount,
              effectivePrice: flashSalePrice,
              endTime: activeFlashSale.endTime,
              isEnabled: fsProduct.isEnabled,
              order: fsProduct.order ?? 0,
              deletedAt: null,
            });
          }

          if (updates.length > 0) {
            await this.productRepository.updateFlashSaleData(updates);
            updatedCount += updates.length;
          }

          if (flashSaleProductUpdates.length > 0) {
            await this.flashSaleProductRepository.upsertMany(
              flashSaleProductUpdates,
            );
          }
        }
      }

      if (!result.hasNextPage) {
        break;
      }

      page += 1;
    }

    if (enabledProductIds.length === 0) {
      await this.clearAllFlashSaleData();
      return;
    }

    await this.productRepository.clearFlashSaleData(enabledProductIds);

    if (updatedCount > 0) {
      this.logger.debug(`Updated flash sale data for ${updatedCount} products`);
    }
  }

  /**
   * Clear flash sale data for all products when no flash sale is active
   */
  private async clearAllFlashSaleData(): Promise<void> {
    await this.productRepository.setDefaultFlashSaleForAll();
    this.logger.debug('Cleared flash sale data for all products');
  }
}
