import mongoose from 'mongoose';
import { ProductRecommendation } from '../domain/product-recommendation';
import { ProductRecommendationSchemaClass } from './product-recommendation.schema';

/**
 * Mapper for converting between ProductRecommendation domain entity and Mongoose document
 */
export class ProductRecommendationMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns ProductRecommendation domain entity
   */
  static toDomain(
    raw: ProductRecommendationSchemaClass,
  ): ProductRecommendation {
    const domainEntity = new ProductRecommendation();

    domainEntity.id = raw._id.toString();
    domainEntity.type = raw.type as ProductRecommendation['type'];
    domainEntity.userId = raw.userId?.toString() ?? undefined;
    domainEntity.productIdsHash = raw.productIdsHash ?? undefined;
    domainEntity.recommendedProductIds = (raw.recommendedProductIds || []).map(
      (id) => id.toString(),
    );
    domainEntity.computedAt = raw.computedAt;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   * @param entity - ProductRecommendation domain entity
   * @returns Mongoose-compatible document
   */
  static toDocument(
    entity: Partial<ProductRecommendation>,
  ): Partial<ProductRecommendationSchemaClass> {
    return {
      type: entity.type,
      userId: entity.userId
        ? new mongoose.Types.ObjectId(entity.userId)
        : undefined,
      productIdsHash: entity.productIdsHash,
      recommendedProductIds: (entity.recommendedProductIds || []).map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
      computedAt: entity.computedAt ?? new Date(),
    };
  }
}
