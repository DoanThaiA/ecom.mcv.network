import { PromotionUsageRecord } from '../domain/promotion-usage-record';
import { PromotionUsageRecordSchemaClass } from './promotion-usage-record.schema';

/**
 * Mapper between MongoDB documents and domain entities for promotion usage records
 */
export class PromotionUsageRecordMapper {
  static toDomain(raw: PromotionUsageRecordSchemaClass): PromotionUsageRecord {
    const entity = new PromotionUsageRecord();
    entity.id = raw._id.toString();
    entity.promotionId = raw.promotionId.toString();
    entity.userId = raw.userId.toString();
    entity.usedAt = raw.usedAt;
    entity.createdAt = raw.createdAt;
    return entity;
  }
}
