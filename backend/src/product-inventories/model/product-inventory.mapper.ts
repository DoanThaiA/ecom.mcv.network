import { ProductInventory } from '../domain/product-inventory';
import { ProductInventorySchemaClass } from './product-inventory.schema';

/**
 * Mapper for converting between ProductInventory domain entity and Mongoose document
 */
export class ProductInventoryMapper {
  /**
   * Convert Mongoose document to domain entity
   * Note: snapshot is intentionally excluded from the domain entity
   * to prevent it from being exposed in API responses
   */
  static toDomain(raw: ProductInventorySchemaClass): ProductInventory {
    const domainEntity = new ProductInventory();

    domainEntity.id = raw._id.toString();
    domainEntity.businessId = raw.businessId;
    domainEntity.productId = raw.productId;
    domainEntity.source = raw.source;
    // snapshot is intentionally NOT mapped to domain entity
    // It should only exist in the persistence layer
    domainEntity.barcode = raw.barcode ?? null;
    domainEntity.productName = raw.productName ?? null;
    domainEntity.totalRemain = raw.totalRemain;
    domainEntity.totalAvailable = raw.totalAvailable;
    domainEntity.totalShipping = raw.totalShipping;
    domainEntity.totalDamaged = raw.totalDamaged;
    domainEntity.totalHolding = raw.totalHolding;
    domainEntity.prices = raw.prices;
    domainEntity.depots = raw.depots || [];
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   */
  static toDocument(
    domainEntity: ProductInventory,
  ): ProductInventorySchemaClass {
    const persistenceSchema = new ProductInventorySchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.businessId = domainEntity.businessId;
    persistenceSchema.productId = domainEntity.productId;
    persistenceSchema.source = domainEntity.source;
    persistenceSchema.snapshot = domainEntity.snapshot ?? undefined;
    persistenceSchema.barcode = domainEntity.barcode ?? undefined;
    persistenceSchema.productName = domainEntity.productName ?? undefined;
    persistenceSchema.totalRemain = domainEntity.totalRemain;
    persistenceSchema.totalAvailable = domainEntity.totalAvailable;
    persistenceSchema.totalShipping = domainEntity.totalShipping;
    persistenceSchema.totalDamaged = domainEntity.totalDamaged;
    persistenceSchema.totalHolding = domainEntity.totalHolding;
    persistenceSchema.prices = domainEntity.prices;
    persistenceSchema.depots = domainEntity.depots.map((depot) => ({
      ...depot,
    }));
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;

    return persistenceSchema;
  }
}
