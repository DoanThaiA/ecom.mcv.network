import mongoose from 'mongoose';
import { Combo, ComboItem } from '../domain/combo';
import { ComboSchemaClass, ComboItemSchemaClass } from './combo.schema';

/**
 * Mapper for converting between Combo domain entity and Mongoose document
 */
export class ComboMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns Combo domain entity
   */
  static toDomain(raw: ComboSchemaClass): Combo {
    const domainEntity = new Combo();

    domainEntity.id = raw._id.toString();
    domainEntity.name = raw.name;
    domainEntity.description = raw.description ?? null;
    domainEntity.image = raw.image ?? null;
    domainEntity.items = raw.items.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
    }));
    domainEntity.discountType = raw.discountType;
    domainEntity.discountValue = raw.discountValue;
    domainEntity.originalPrice = raw.originalPrice;
    domainEntity.status = raw.status;
    domainEntity.validFrom = raw.validFrom ?? null;
    domainEntity.validTo = raw.validTo ?? null;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt ?? null;
    domainEntity.nameLocalization = raw.nameLocalization ?? null;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   * @param domainEntity - Combo domain entity
   * @returns Mongoose document
   */
  static toDocument(domainEntity: Combo): ComboSchemaClass {
    const persistenceSchema = new ComboSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.name = domainEntity.name;
    persistenceSchema.description = domainEntity.description ?? undefined;
    persistenceSchema.image = domainEntity.image ?? undefined;
    persistenceSchema.items = domainEntity.items.map((item) => {
      const schemaItem = new ComboItemSchemaClass();
      schemaItem.productId = new mongoose.Types.ObjectId(item.productId);
      schemaItem.quantity = item.quantity;
      return schemaItem;
    });
    persistenceSchema.discountType = domainEntity.discountType;
    persistenceSchema.discountValue = domainEntity.discountValue;
    persistenceSchema.originalPrice = domainEntity.originalPrice;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.validFrom = domainEntity.validFrom ?? undefined;
    persistenceSchema.validTo = domainEntity.validTo ?? undefined;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt ?? undefined;
    persistenceSchema.nameLocalization =
      domainEntity.nameLocalization ?? undefined;

    return persistenceSchema;
  }

  /**
   * Convert ComboItem domain to schema class
   */
  static toDocumentItem(item: ComboItem): ComboItemSchemaClass {
    const schemaItem = new ComboItemSchemaClass();
    schemaItem.productId = new mongoose.Types.ObjectId(item.productId);
    schemaItem.quantity = item.quantity;
    return schemaItem;
  }
}
