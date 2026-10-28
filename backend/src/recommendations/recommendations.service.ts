import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { ProductViewsService } from '../product-views/product-views.service';
import { ProductViewRepository } from '../product-views/domain/product-view.repository';
import { ProductRecommendationRepository } from './domain/product-recommendation.repository';
import { OrderRepository } from '../shop/order/domain/order.repository';
import { ProductRepository } from '../products/domain/product.repository';
import { Product } from '../products/domain/product';
import {
  filterActiveVariants,
  hasZeroActiveVariants,
} from '../shop/helpers/filter-active-variants';

/** Max staleness for cached recommendations (6 hours) */
const STALENESS_MS = 6 * 60 * 60 * 1000;

/**
 * Core recommendation algorithms service
 * Provides personalized, cross-sell, and trending recommendations
 */
@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private readonly productViewsService: ProductViewsService,
    private readonly productViewRepository: ProductViewRepository,
    private readonly productRecommendationRepository: ProductRecommendationRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Get personalized recommendations for a user
   * Uses purchase history + view history to find co-purchased and category-based products
   * @param userId - User ID (if authenticated)
   * @param sessionId - Session ID (for guests)
   * @param limit - Maximum number of recommendations
   * @returns Recommended products
   */
  async getPersonalizedRecommendations(
    userId?: string,
    sessionId?: string,
    limit = 8,
  ): Promise<Product[]> {
    // Check cached recommendations for authenticated users
    if (userId) {
      const cached =
        await this.productRecommendationRepository.findPersonalized(userId);

      if (cached && !this.isStale(cached.computedAt)) {
        const products = (
          await this.productRepository.findActiveByIds(
            cached.recommendedProductIds.slice(0, limit),
          )
        )
          .filter((p) => !hasZeroActiveVariants(p))
          .map((p) => filterActiveVariants(p));
        if (products.length > 0) return products;
      }
    }

    // Gather signals in parallel (independent queries)
    const [purchaseHistory, viewedCategoryIds] = await Promise.all([
      userId
        ? this.orderRepository.getUserPurchaseHistory(userId, 6)
        : Promise.resolve({
            productIds: [] as string[],
            categoryIds: [] as string[],
          }),
      this.productViewsService.getUserViewedCategoryIds(userId, sessionId, 50),
    ]);

    const purchasedProductIds = purchaseHistory.productIds;

    // Merge category IDs from purchases and views
    const allCategoryIds = new Set<string>([
      ...purchaseHistory.categoryIds,
      ...viewedCategoryIds,
    ]);

    // If user has purchases, also resolve categories from purchased products
    if (purchasedProductIds.length > 0) {
      const purchasedProducts = await this.productRepository.findActiveByIds(
        purchasedProductIds.slice(0, 20),
      );
      for (const p of purchasedProducts) {
        if (p.category?.id) allCategoryIds.add(p.category.id);
      }
    }

    let resultIds: string[] = [];

    // Co-purchase query
    if (purchasedProductIds.length > 0) {
      const coPurchased = await this.orderRepository.findCoPurchasedProductIds(
        purchasedProductIds,
        purchasedProductIds,
        limit * 2,
      );
      resultIds = coPurchased.map((r) => r.productId);
    }

    // Fill with category-based popular products if not enough
    if (resultIds.length < limit && allCategoryIds.size > 0) {
      const excludeIds = [...purchasedProductIds, ...resultIds];
      const categoryProducts =
        await this.productRepository.findPopularByCategories(
          Array.from(allCategoryIds),
          excludeIds,
          limit - resultIds.length,
        );
      resultIds.push(...categoryProducts.map((p) => p.id));
    }

    // If still not enough, fall back to trending
    if (resultIds.length < limit) {
      const trending = await this.getTrendingProductIds(limit);
      const excludeSet = new Set([...purchasedProductIds, ...resultIds]);
      for (const id of trending) {
        if (!excludeSet.has(id) && resultIds.length < limit) {
          resultIds.push(id);
        }
      }
    }

    // Remove duplicates while preserving order
    resultIds = [...new Set(resultIds)].slice(0, limit);

    // Cache for authenticated users
    if (userId && resultIds.length > 0) {
      try {
        await this.productRecommendationRepository.upsertPersonalized(
          userId,
          resultIds,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to cache personalized recommendations: ${error.message}`,
        );
      }
    }

    // Fetch full product objects
    return (await this.productRepository.findActiveByIds(resultIds))
      .filter((p) => !hasZeroActiveVariants(p))
      .map((p) => filterActiveVariants(p));
  }

  /**
   * Get cross-sell recommendations based on product IDs
   * Finds products frequently bought together with the given products
   * @param productIds - Product IDs to find cross-sell for
   * @param limit - Maximum number of recommendations
   * @returns Recommended products
   */
  async getCrossSellRecommendations(
    productIds: string[],
    limit = 8,
  ): Promise<Product[]> {
    const hash = this.hashProductIds(productIds);

    // Check cached recommendations
    const cached =
      await this.productRecommendationRepository.findCrossSell(hash);

    if (cached && !this.isStale(cached.computedAt)) {
      const products = (
        await this.productRepository.findActiveByIds(
          cached.recommendedProductIds.slice(0, limit),
        )
      )
        .filter((p) => !hasZeroActiveVariants(p))
        .map((p) => filterActiveVariants(p));
      if (products.length > 0) return products;
    }

    // Co-purchase query
    const coPurchased = await this.orderRepository.findCoPurchasedProductIds(
      productIds,
      productIds,
      limit * 2,
    );

    let resultIds = coPurchased.map((r) => r.productId);

    // Fill with category-based products if not enough
    if (resultIds.length < limit) {
      const inputProducts =
        await this.productRepository.findActiveByIds(productIds);
      const categoryIds = inputProducts
        .filter((p) => p.category?.id)
        .map((p) => p.category!.id);

      if (categoryIds.length > 0) {
        const excludeIds = [...productIds, ...resultIds];
        const categoryProducts =
          await this.productRepository.findPopularByCategories(
            categoryIds,
            excludeIds,
            limit - resultIds.length,
          );
        resultIds.push(...categoryProducts.map((p) => p.id));
      }
    }

    resultIds = [...new Set(resultIds)].slice(0, limit);

    // Cache results
    if (resultIds.length > 0) {
      try {
        await this.productRecommendationRepository.upsertCrossSell(
          hash,
          resultIds,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to cache cross-sell recommendations: ${error.message}`,
        );
      }
    }

    return (await this.productRepository.findActiveByIds(resultIds))
      .filter((p) => !hasZeroActiveVariants(p))
      .map((p) => filterActiveVariants(p));
  }

  /**
   * Pre-compute recommendations for all active users
   * Called by BullMQ cron job every 6 hours
   */
  async precomputeRecommendations(): Promise<void> {
    this.logger.log('Starting recommendation pre-computation...');

    // Get all users with orders in last 6 months
    const userIds = await this.orderRepository.getDistinctUserIds(6);
    this.logger.log(`Found ${userIds.length} users to precompute for`);

    const BATCH_SIZE = 100;
    let processed = 0;

    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map((userId) =>
          this.getPersonalizedRecommendations(userId, undefined, 20),
        ),
      );

      for (let j = 0; j < results.length; j++) {
        if (results[j].status === 'fulfilled') {
          processed++;
        } else {
          const reason = (results[j] as PromiseRejectedResult).reason;
          this.logger.warn(
            `Failed to precompute for user ${batch[j]}: ${reason?.message}`,
          );
        }
      }

      this.logger.log(
        `Precomputed ${processed}/${userIds.length} user recommendations`,
      );
    }

    // Compute global trending
    await this.precomputeTrending();

    this.logger.log(
      `Recommendation pre-computation complete. Processed: ${processed} users`,
    );
  }

  /**
   * Pre-compute global trending products
   * Always recomputes fresh (bypasses cache)
   */
  private async precomputeTrending(): Promise<void> {
    try {
      // Get most viewed product IDs in last 30 days
      const trendingIds =
        await this.productViewRepository.getTopViewedProductIds(30, 20);

      if (trendingIds.length > 0) {
        await this.productRecommendationRepository.upsertTrending(trendingIds);
        this.logger.log(`Saved ${trendingIds.length} trending products`);
      }
    } catch (error) {
      this.logger.warn(`Failed to precompute trending: ${error.message}`);
    }
  }

  /**
   * Get trending product IDs
   * Checks cache first, then falls back to most-viewed products live query
   */
  private async getTrendingProductIds(limit: number): Promise<string[]> {
    // Check cached trending first
    const cached = await this.productRecommendationRepository.findTrending();
    if (cached && !this.isStale(cached.computedAt)) {
      return cached.recommendedProductIds.slice(0, limit);
    }

    // Live fallback: top viewed products in last 30 days
    try {
      const topViewed = await this.productViewRepository.getTopViewedProductIds(
        30,
        limit,
      );
      if (topViewed.length > 0) return topViewed;
    } catch (error) {
      this.logger.warn(`Failed to get top viewed products: ${error.message}`);
    }

    return [];
  }

  /**
   * Check if cached data is stale (older than 6 hours)
   */
  private isStale(computedAt: Date): boolean {
    return Date.now() - computedAt.getTime() > STALENESS_MS;
  }

  /**
   * Create a deterministic hash from sorted product IDs
   */
  private hashProductIds(productIds: string[]): string {
    const sorted = [...productIds].sort().join(',');
    return createHash('sha256').update(sorted).digest('hex').slice(0, 16);
  }
}
