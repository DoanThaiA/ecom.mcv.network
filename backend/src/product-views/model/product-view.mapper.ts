import mongoose from 'mongoose';
import { ProductView } from '../domain/product-view';
import { ProductViewSchemaClass } from './product-view.schema';

/**
 * Mapper for converting between ProductView domain entity and Mongoose document
 */
export class ProductViewMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns ProductView domain entity
   */
  static toDomain(raw: ProductViewSchemaClass): ProductView {
    const domainEntity = new ProductView();

    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId?.toString() ?? undefined;
    domainEntity.sessionId = raw.sessionId;
    domainEntity.productId = raw.productId.toString();
    domainEntity.categoryId = raw.categoryId?.toString() ?? undefined;
    domainEntity.viewedAt = raw.viewedAt;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   * @param entity - ProductView domain entity
   * @returns Mongoose-compatible document
   */
  static toDocument(
    entity: Omit<ProductView, 'id'>,
  ): Partial<ProductViewSchemaClass> {
    return {
      userId: entity.userId
        ? new mongoose.Types.ObjectId(entity.userId)
        : undefined,
      sessionId: entity.sessionId,
      productId: new mongoose.Types.ObjectId(entity.productId),
      categoryId: entity.categoryId
        ? new mongoose.Types.ObjectId(entity.categoryId)
        : undefined,
      viewedAt: entity.viewedAt,
    };
  }
}
