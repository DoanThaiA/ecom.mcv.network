import { Injectable, Logger } from '@nestjs/common';
import { PromotionRepository } from '@app/promotions/domain/promotion.repository';
import { ProductRepository } from '@app/products/domain/product.repository';
import { Product } from '@app/products/domain/product';
import { Promotion } from '@app/promotions/domain/promotion';
import { PromotionProductRepository } from '@app/promotion-products/domain/promotion-product.repository';
import { PromotionProduct } from '@app/promotion-products/domain/promotion-product';
import { calculateRoundedDiscountAmount } from '@app/utils/helpers/round-price';

/**
 * Cron job for syncing product discount data to product documents
 * Syncs active product discount promotions to product documents
 * These behave like flash sales - displayed on product listing/detail pages
 * Runs every minute to ensure products have up-to-date pricing
 */
@Injectable()
export class ProductDiscountSyncCron {
  private readonly logger = new Logger(ProductDiscountSyncCron.name);

  /**
   * Cache to track last synced state for optimization
   */
  private lastSyncedState: {
    promotionIds: string[];
    updatedAtHash: string | null;
    soldCountHash: string | null;
  } = {
    promotionIds: [],
    updatedAtHash: null,
    soldCountHash: null,
  };

  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly productRepository: ProductRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
  ) {}

  /**
   * Sync product discount data to products.
   * Called by PricingSyncCron before flash sale sync.
   */
  async syncProductDiscountToProducts(): Promise<boolean> {
    try {
      const activePromotions =
        await this.promotionRepository.findActiveProductDiscounts();

      if (activePromotions.length > 0) {
        // Fetch all promotion products from separate collection
        const promotionProductsMap =
          await this.fetchPromotionProducts(activePromotions);

        if (!this.needsSync(activePromotions, promotionProductsMap)) {
          this.logger.debug('Product discounts unchanged, skipping sync');
          return false;
        }

        await this.syncActivePromotions(activePromotions, promotionProductsMap);
        this.updateCache(activePromotions, promotionProductsMap);
        return true;
      } else {
        if (this.lastSyncedState.promotionIds.length === 0) {
          this.logger.debug('No promotions and already cleared, skipping');
          return false;
        }

        await this.clearAllProductDiscountData();
        this.clearCache();
        return true;
      }
    } catch (error) {
      this.logger.error(
        'Failed to sync product discount data to products',
        error,
      );
      return false;
    }
  }

  /**
   * Fetch all enabled promotion products for the given promotions
   */
  private async fetchPromotionProducts(
    promotions: Promotion[],
  ): Promise<Map<string, PromotionProduct[]>> {
    const result = new Map<string, PromotionProduct[]>();

    for (const promotion of promotions) {
      const promoProducts =
        await this.promotionProductRepository.findEnabledByPromotionId(
          promotion.id,
        );
      result.set(promotion.id, promoProducts);
    }

    return result;
  }

  /**
   * Check if sync is needed by comparing current state with cached state
   */
  private needsSync(
    promotions: Promotion[],
    promotionProductsMap: Map<string, PromotionProduct[]>,
  ): boolean {
    const currentIds = promotions.map((p) => p.id).sort();
    const cachedIds = [...this.lastSyncedState.promotionIds].sort();

    if (currentIds.join(',') !== cachedIds.join(',')) {
      return true;
    }

    const currentUpdatedHash = this.computeUpdatedAtHash(promotions);
    if (currentUpdatedHash !== this.lastSyncedState.updatedAtHash) {
      return true;
    }

    const currentSoldHash = this.computeSoldCountHash(promotionProductsMap);
    if (currentSoldHash !== this.lastSyncedState.soldCountHash) {
      return true;
    }

    return false;
  }

  /**
   * Compute hash of updatedAt timestamps
   */
  private computeUpdatedAtHash(promotions: Promotion[]): string {
    return promotions
      .map((p) => `${p.id}:${p.updatedAt.getTime()}`)
      .sort()
      .join(',');
  }

  /**
   * Compute hash of soldCount values from separate collection
   */
  private computeSoldCountHash(
    promotionProductsMap: Map<string, PromotionProduct[]>,
  ): string {
    const pairs: string[] = [];
    for (const [promotionId, products] of promotionProductsMap) {
      for (const p of products) {
        pairs.push(`${promotionId}:${p.productId}:${p.soldCount}`);
      }
    }
    return pairs.sort().join(',');
  }

  /**
   * Update cache after successful sync
   */
  private updateCache(
    promotions: Promotion[],
    promotionProductsMap: Map<string, PromotionProduct[]>,
  ): void {
    this.lastSyncedState = {
      promotionIds: promotions.map((p) => p.id),
      updatedAtHash: this.computeUpdatedAtHash(promotions),
      soldCountHash: this.computeSoldCountHash(promotionProductsMap),
    };
  }

  /**
   * Clear cache
   */
  private clearCache(): void {
    this.lastSyncedState = {
      promotionIds: [],
      updatedAtHash: null,
      soldCountHash: null,
    };
  }

  /**
   * Sync data from active promotions to product documents
   */
  private async syncActivePromotions(
    promotions: Promotion[],
    promotionProductsMap: Map<string, PromotionProduct[]>,
  ): Promise<void> {
    // Collect all enabled products from all promotions
    const productPromotionMap = new Map<
      string,
      { promotion: Promotion; promoProduct: PromotionProduct }
    >();

    for (const promotion of promotions) {
      const products = promotionProductsMap.get(promotion.id) || [];
      for (const promoProduct of products) {
        productPromotionMap.set(promoProduct.productId, {
          promotion,
          promoProduct,
        });
      }
    }

    if (productPromotionMap.size === 0) {
      await this.clearAllProductDiscountData();
      return;
    }

    const productIds = Array.from(productPromotionMap.keys());

    // Fetch product details to get prices
    const products = await this.productRepository.findByIds(productIds);

    if (products.length === 0) {
      this.logger.warn('No products found for product discount sync');
      return;
    }

    // Build product discount data for each product
    const updates: Array<{
      productId: string;
      productDiscount: Product['productDiscount'];
    }> = [];

    for (const product of products) {
      const mapping = productPromotionMap.get(product.id);
      if (!mapping) continue;

      const { promotion, promoProduct } = mapping;

      // Use per-product discount values (not promotion-level config)
      const retail = product.prices?.retail ?? 0;
      const discountAmount = calculateRoundedDiscountAmount(
        retail,
        promoProduct.discountType,
        promoProduct.discountValue,
      );
      const discountedPrice = retail - discountAmount;

      updates.push({
        productId: product.id,
        productDiscount: {
          promotionId: promotion.id,
          promotionName: promotion.name,
          originalPrice: retail,
          discountedPrice,
          discountType: promoProduct.discountType,
          discountValue: promoProduct.discountValue,
          discountAmount,
          discountPercent:
            retail > 0 ? Math.round((discountAmount / retail) * 100) : 0,
          soldCount: promoProduct.soldCount,
          endTime: promotion.endTime,
          effectivePrice: discountedPrice,
        },
      });
    }

    if (updates.length > 0) {
      await this.productRepository.updateProductDiscountData(updates);
      this.logger.debug(
        `Updated product discount data for ${updates.length} products`,
      );
    }

    // Clear product discount data for products not in current promotions
    await this.productRepository.clearProductDiscountData(productIds);
  }

  /**
   * Clear product discount data for all products
   */
  private async clearAllProductDiscountData(): Promise<void> {
    await this.productRepository.clearProductDiscountData([]);
    this.logger.debug('Cleared product discount data for all products');
  }
}
