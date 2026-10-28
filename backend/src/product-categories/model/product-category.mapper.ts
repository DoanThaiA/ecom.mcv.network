import mongoose from 'mongoose';
import { ProductCategory } from '../domain/product-category';
import { ProductCategorySchemaClass } from './product-category.schema';

/**
 * Mapper for converting between ProductCategory domain entity and Mongoose document
 */
export class ProductCategoryMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: ProductCategorySchemaClass): ProductCategory {
    const domainEntity = new ProductCategory();

    domainEntity.id = raw._id.toString();
    domainEntity.businessId = raw.businessId;
    domainEntity.source = raw.source;
    domainEntity.snapshot = raw.snapshot ?? null;
    domainEntity.slug = raw.slug ?? null;
    domainEntity.code = raw.code;
    domainEntity.name = raw.name;
    domainEntity.nameLocalization = raw.nameLocalization ?? null;
    // Convert ObjectId to string for domain layer
    domainEntity.parentId = raw.parentId?.toString() ?? null;
    domainEntity.order = raw.order ?? null;
    domainEntity.image = raw.image ?? null;
    domainEntity.content = raw.content ?? null;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   */
  static toDocument(domainEntity: ProductCategory): ProductCategorySchemaClass {
    const persistenceSchema = new ProductCategorySchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.businessId = domainEntity.businessId;
    persistenceSchema.source = domainEntity.source;
    persistenceSchema.snapshot = domainEntity.snapshot ?? undefined;
    persistenceSchema.slug = domainEntity.slug ?? undefined;
    persistenceSchema.code = domainEntity.code;
    persistenceSchema.name = domainEntity.name;
    persistenceSchema.nameLocalization =
      domainEntity.nameLocalization ?? undefined;
    // Convert string to ObjectId for persistence layer
    persistenceSchema.parentId = domainEntity.parentId
      ? new mongoose.Types.ObjectId(domainEntity.parentId)
      : undefined;
    persistenceSchema.order = domainEntity.order ?? undefined;
    persistenceSchema.image = domainEntity.image ?? undefined;
    persistenceSchema.content = domainEntity.content ?? undefined;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;

    return persistenceSchema;
  }
}
