import { ProductView } from './product-view';

/**
 * Abstract repository interface for ProductView entity
 */
export abstract class ProductViewRepository {
  /**
   * Create a new product view record
   * @param view - Partial product view data
   * @returns Created product view
   */
  abstract create(view: Omit<ProductView, 'id'>): Promise<ProductView>;

  /**
   * Find recent product views by user ID
   * @param userId - User ID
   * @param limit - Maximum number of results
   * @returns List of product views ordered by viewedAt desc
   */
  abstract findByUserId(userId: string, limit: number): Promise<ProductView[]>;

  /**
   * Find recent product views by session ID
   * @param sessionId - Session ID
   * @param limit - Maximum number of results
   * @returns List of product views ordered by viewedAt desc
   */
  abstract findBySessionId(
    sessionId: string,
    limit: number,
  ): Promise<ProductView[]>;

  /**
   * Get top viewed product IDs globally within a time range
   * @param days - Number of days to look back
   * @param limit - Maximum number of product IDs
   * @returns List of product IDs sorted by view count desc
   */
  abstract getTopViewedProductIds(
    days: number,
    limit: number,
  ): Promise<string[]>;
}
