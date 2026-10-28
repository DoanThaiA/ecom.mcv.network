/**
 * Domain entity for promotion usage record
 * Tracks individual usage of promotions by customers
 */
export class PromotionUsageRecord {
  id: string;
  promotionId: string;
  userId: string;
  usedAt: Date;
  createdAt: Date;
}
