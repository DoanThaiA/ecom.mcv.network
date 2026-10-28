import { PromotionUsageRecord } from './promotion-usage-record';

/**
 * Abstract repository for promotion usage records
 */
export abstract class PromotionUsageRecordRepository {
  /**
   * Create a new usage record
   */
  abstract create(
    data: Omit<PromotionUsageRecord, 'id' | 'createdAt'>,
  ): Promise<PromotionUsageRecord>;

  /**
   * Count usage records for a specific promotion and user
   */
  abstract countByPromotionIdAndUserId(
    promotionId: string,
    userId: string,
  ): Promise<number>;

  /**
   * Check if a usage record exists for a specific promotion and user
   */
  abstract existsByPromotionIdAndUserId(
    promotionId: string,
    userId: string,
  ): Promise<boolean>;

  /**
   * Delete all usage records for a promotion (used when promotion is deleted)
   */
  abstract deleteByPromotionId(promotionId: string): Promise<void>;
}
