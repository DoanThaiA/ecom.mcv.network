import { TrackingEventType } from './tracking-event-type.enum';

export class AffiliateTrackingEvent {
  id: string;
  type: TrackingEventType;
  affiliateId: string;
  affiliateCode: string;
  productId?: string | null;
  sessionId: string;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}
