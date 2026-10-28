import { ProductBrand } from '../domain/product-brand';
import { ProductBrandSchemaClass } from './product-brand.schema';

/**
 * Mapper for converting between ProductBrand domain entity and ProductBrandDocument
 */
export class ProductBrandMapper {
  /**
   * Convert domain entity to database document
   * @param domainEntity - ProductBrand domain entity
   * @returns ProductBrand document for MongoDB
   */
  static toDocument(domainEntity: ProductBrand): ProductBrandSchemaClass {
    const persistenceSchema = new ProductBrandSchemaClass();

    persistenceSchema._id = domainEntity.id;
    persistenceSchema.businessId = domainEntity.businessId;
    persistenceSchema.source = domainEntity.source;
    persistenceSchema.snapshot = domainEntity.snapshot ?? undefined;
    persistenceSchema.code = domainEntity.code ?? undefined;
    persistenceSchema.name = domainEntity.name;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.parentId = domainEntity.parentId ?? undefined;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;

    return persistenceSchema;
  }

  /**
   * Convert database document to domain entity
   * @param persistenceDocument - ProductBrand document from MongoDB
   * @returns ProductBrand domain entity
   */
  static toDomain(persistenceDocument: ProductBrandSchemaClass): ProductBrand {
    const domainEntity = new ProductBrand();

    domainEntity.id = persistenceDocument._id.toString();
    domainEntity.businessId = persistenceDocument.businessId;
    domainEntity.source = persistenceDocument.source;
    domainEntity.snapshot = persistenceDocument.snapshot ?? null;
    domainEntity.code = persistenceDocument.code ?? null;
    domainEntity.name = persistenceDocument.name;
    domainEntity.status = persistenceDocument.status;
    domainEntity.parentId = persistenceDocument.parentId ?? null;
    domainEntity.createdAt = persistenceDocument.createdAt;
    domainEntity.updatedAt = persistenceDocument.updatedAt;

    return domainEntity;
  }
}
