import { AffiliateTrackingEvent } from '../domain/affiliate-tracking-event';
import { AffiliateTrackingEventSchemaClass } from './affiliate-tracking-event.schema';

export class AffiliateTrackingEventMapper {
  static toDomain(
    raw: AffiliateTrackingEventSchemaClass,
  ): AffiliateTrackingEvent {
    const event = new AffiliateTrackingEvent();
    event.id = raw._id.toString();
    event.type = raw.type;
    event.affiliateId = raw.affiliateId.toString();
    event.affiliateCode = raw.affiliateCode;
    event.productId = raw.productId?.toString() ?? null;
    event.sessionId = raw.sessionId;
    event.ip = raw.ip ?? null;
    event.userAgent = raw.userAgent ?? null;
    event.metadata = raw.metadata ?? null;
    event.createdAt = raw.createdAt;
    return event;
  }
}
