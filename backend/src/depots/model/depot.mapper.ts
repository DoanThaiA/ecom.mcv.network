import { Depot } from '../domain/depot';
import { DepotSchemaClass } from './depot.schema';

/**
 * Mapper for converting between Depot domain entity and DepotDocument
 */
export class DepotMapper {
  /**
   * Convert domain entity to database document
   * @param domainEntity - Depot domain entity
   * @returns Depot document for MongoDB
   */
  static toDocument(domainEntity: Depot): DepotSchemaClass {
    const persistenceSchema = new DepotSchemaClass();

    persistenceSchema._id = domainEntity.id;
    persistenceSchema.businessId = domainEntity.businessId;
    persistenceSchema.source = domainEntity.source;
    persistenceSchema.snapshot = domainEntity.snapshot ?? undefined;
    persistenceSchema.name = domainEntity.name;
    persistenceSchema.phone = domainEntity.phone ?? undefined;
    persistenceSchema.address = domainEntity.address ?? undefined;
    persistenceSchema.cityId = domainEntity.cityId ?? undefined;
    persistenceSchema.districtId = domainEntity.districtId ?? undefined;
    persistenceSchema.wardId = domainEntity.wardId ?? undefined;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;

    return persistenceSchema;
  }

  /**
   * Convert database document to domain entity
   * @param persistenceDocument - Depot document from MongoDB
   * @returns Depot domain entity
   */
  static toDomain(persistenceDocument: DepotSchemaClass): Depot {
    const domainEntity = new Depot();

    domainEntity.id = persistenceDocument._id.toString();
    domainEntity.businessId = persistenceDocument.businessId;
    domainEntity.source = persistenceDocument.source;
    domainEntity.snapshot = persistenceDocument.snapshot ?? null;
    domainEntity.name = persistenceDocument.name;
    domainEntity.phone = persistenceDocument.phone ?? null;
    domainEntity.address = persistenceDocument.address ?? null;
    domainEntity.cityId = persistenceDocument.cityId ?? null;
    domainEntity.districtId = persistenceDocument.districtId ?? null;
    domainEntity.wardId = persistenceDocument.wardId ?? null;
    domainEntity.createdAt = persistenceDocument.createdAt;
    domainEntity.updatedAt = persistenceDocument.updatedAt;

    return domainEntity;
  }
}
