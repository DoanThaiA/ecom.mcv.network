import { PromotionProduct } from '../domain/promotion-product';
import { PromotionProductSchemaClass } from './promotion-product.schema';

/**
 * Mapper for converting between PromotionProduct domain entity and Mongoose document
 */
export class PromotionProductMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: PromotionProductSchemaClass): PromotionProduct {
    const entity = new PromotionProduct();

    entity.id = raw._id.toString();
    entity.promotionId = raw.promotionId.toString();
    entity.promotionName = raw.promotionName;

    const productId =
      typeof raw.productId === 'object' && (raw.productId as any)?._id
        ? (raw.productId as any)._id
        : raw.productId;
    entity.productId = productId.toString();

    // Stored fields
    entity.name = raw.name;
    entity.code = raw.code;
    entity.category = raw.category ?? null;
    entity.stock = raw.stock ?? 0;
    entity.images = raw.images;

    // Discount pricing
    entity.discountType = raw.discountType;
    entity.discountValue = raw.discountValue;
    entity.originalPrice = raw.originalPrice;
    entity.discountedPrice = raw.discountedPrice;
    entity.discountAmount = raw.discountAmount;
    entity.discountPercent = raw.discountPercent;
    entity.effectivePrice = raw.effectivePrice;
    entity.soldCount = raw.soldCount;
    entity.isEnabled = raw.isEnabled;
    entity.endTime = raw.endTime;

    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;

    return entity;
  }
}
