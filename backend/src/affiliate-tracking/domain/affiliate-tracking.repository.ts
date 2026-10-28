import { AffiliateTrackingEvent } from './affiliate-tracking-event';
import { TrackingEventType } from './tracking-event-type.enum';

export abstract class AffiliateTrackingRepository {
  /**
   * Create a new tracking event
   */
  abstract create(
    data: Omit<AffiliateTrackingEvent, 'id'>,
  ): Promise<AffiliateTrackingEvent>;

  /**
   * Find recent duplicate event for deduplication (within 30 minutes)
   */
  abstract findRecentDuplicate(
    affiliateCode: string,
    sessionId: string,
    productId: string | null,
    type: TrackingEventType,
  ): Promise<AffiliateTrackingEvent | null>;

  /**
   * Count events by affiliate within date range
   */
  abstract countByAffiliate(
    affiliateId: string,
    type: TrackingEventType,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<number>;

  /**
   * Count events grouped by product for a given affiliate
   */
  abstract countByProducts(
    affiliateId: string,
    productIds: string[],
    type: TrackingEventType,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<Map<string, number>>;
}
