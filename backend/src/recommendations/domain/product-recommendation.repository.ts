import { NullableType } from '../../utils/types/nullable.type';
import { ProductRecommendation } from './product-recommendation';

/**
 * Abstract repository interface for ProductRecommendation entity
 */
export abstract class ProductRecommendationRepository {
  /**
   * Upsert personalized recommendations for a user
   * @param userId - User ID
   * @param productIds - Ordered list of recommended product IDs
   */
  abstract upsertPersonalized(
    userId: string,
    productIds: string[],
  ): Promise<void>;

  /**
   * Upsert cross-sell recommendations for a product set
   * @param productIdsHash - SHA hash of sorted input product IDs
   * @param productIds - Ordered list of recommended product IDs
   */
  abstract upsertCrossSell(
    productIdsHash: string,
    productIds: string[],
  ): Promise<void>;

  /**
   * Upsert global trending recommendations
   * @param productIds - Ordered list of trending product IDs
   */
  abstract upsertTrending(productIds: string[]): Promise<void>;

  /**
   * Find personalized recommendations for a user
   * @param userId - User ID
   * @returns Recommendation or null
   */
  abstract findPersonalized(
    userId: string,
  ): Promise<NullableType<ProductRecommendation>>;

  /**
   * Find cross-sell recommendations for a product set
   * @param productIdsHash - SHA hash of sorted input product IDs
   * @returns Recommendation or null
   */
  abstract findCrossSell(
    productIdsHash: string,
  ): Promise<NullableType<ProductRecommendation>>;

  /**
   * Find global trending recommendations
   * @returns Recommendation or null
   */
  abstract findTrending(): Promise<NullableType<ProductRecommendation>>;
}
