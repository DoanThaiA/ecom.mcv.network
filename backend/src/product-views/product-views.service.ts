import { Injectable, Logger } from '@nestjs/common';
import { ProductViewRepository } from './domain/product-view.repository';
import { ProductView } from './domain/product-view';
import { ProductRepository } from '../products/domain/product.repository';

/**
 * Service for tracking and querying product views
 */
@Injectable()
export class ProductViewsService {
  private readonly logger = new Logger(ProductViewsService.name);

  constructor(
    private readonly productViewRepository: ProductViewRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Track a product view (fire-and-forget)
   * Denormalizes categoryId from the product for faster queries
   * @param productId - Product ID being viewed
   * @param userId - User ID (if authenticated)
   * @param sessionId - Session ID (always present)
   */
  async trackView(
    productId: string,
    userId?: string,
    sessionId?: string,
    categoryId?: string,
  ): Promise<void> {
    try {
      // Use provided categoryId if available, otherwise fallback to DB lookup
      if (!categoryId) {
        const product = await this.productRepository.findById(productId);
        if (product?.category?.id) {
          categoryId = product.category.id;
        }
      }

      const view: Omit<ProductView, 'id'> = {
        productId,
        userId,
        sessionId: sessionId || '',
        categoryId,
        viewedAt: new Date(),
      };

      await this.productViewRepository.create(view);
    } catch (error) {
      // Fire-and-forget: log but don't throw
      this.logger.warn(`Failed to track product view: ${error.message}`);
    }
  }

  /**
   * Get unique category IDs from user's recent product views
   * @param userId - User ID (if authenticated)
   * @param sessionId - Session ID (for guests)
   * @param limit - Maximum number of views to scan
   * @returns Unique category IDs
   */
  async getUserViewedCategoryIds(
    userId?: string,
    sessionId?: string,
    limit = 50,
  ): Promise<string[]> {
    const views = userId
      ? await this.productViewRepository.findByUserId(userId, limit)
      : sessionId
        ? await this.productViewRepository.findBySessionId(sessionId, limit)
        : [];

    const categoryIds = new Set<string>();
    for (const view of views) {
      if (view.categoryId) {
        categoryIds.add(view.categoryId);
      }
    }

    return Array.from(categoryIds);
  }

  /**
   * Get unique product IDs from user's recent product views
   * @param userId - User ID (if authenticated)
   * @param sessionId - Session ID (for guests)
   * @param limit - Maximum number of views to scan
   * @returns Unique product IDs
   */
  async getUserViewedProductIds(
    userId?: string,
    sessionId?: string,
    limit = 50,
  ): Promise<string[]> {
    const views = userId
      ? await this.productViewRepository.findByUserId(userId, limit)
      : sessionId
        ? await this.productViewRepository.findBySessionId(sessionId, limit)
        : [];

    const productIds = new Set<string>();
    for (const view of views) {
      productIds.add(view.productId);
    }

    return Array.from(productIds);
  }
}
