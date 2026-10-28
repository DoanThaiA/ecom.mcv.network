import { FlashSale } from '../domain/flash-sale';
import { FlashSaleSchemaClass } from './flash-sale.schema';

/**
 * Mapper for converting between FlashSale domain entity and Mongoose document
 */
export class FlashSaleMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns FlashSale domain entity
   */
  static toDomain(raw: FlashSaleSchemaClass): FlashSale {
    const domainEntity = new FlashSale();

    domainEntity.id = raw._id.toString();
    domainEntity.name = raw.name;
    domainEntity.startTime = raw.startTime;
    domainEntity.endTime = raw.endTime;
    domainEntity.isEnabled = raw.isEnabled;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt ?? null;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   * @param domainEntity - FlashSale domain entity
   * @returns Mongoose document
   */
  static toDocument(domainEntity: FlashSale): FlashSaleSchemaClass {
    const persistenceSchema = new FlashSaleSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.name = domainEntity.name;
    persistenceSchema.startTime = domainEntity.startTime;
    persistenceSchema.endTime = domainEntity.endTime;
    persistenceSchema.isEnabled = domainEntity.isEnabled;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt ?? undefined;

    return persistenceSchema;
  }
}
