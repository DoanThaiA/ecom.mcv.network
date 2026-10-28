import { ImportSessionRow } from '../domain/import-session-row';
import { ImportSessionRowSchemaClass } from './import-session-row.schema';

/**
 * Mapper for converting between ImportSessionRow domain entity and Mongoose document
 */
export class ImportSessionRowMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: ImportSessionRowSchemaClass): ImportSessionRow {
    const entity = new ImportSessionRow();

    entity.id = raw._id.toString();
    entity.sessionId = raw.sessionId.toString();
    entity.rowNumber = raw.rowNumber;
    entity.productId = raw.productId;
    entity.code = raw.code;
    entity.name = raw.name;
    entity.actualName = raw.actualName;
    entity.image = raw.image;
    entity.originalPrice = raw.originalPrice;
    entity.discountType = raw.discountType;
    entity.discountValue = raw.discountValue;
    entity.flashSalePrice = raw.flashSalePrice;
    entity.promotionalQuantity = raw.promotionalQuantity;
    entity.stock = raw.stock;
    entity.commissionRate = raw.commissionRate;
    entity.isValid = raw.isValid;
    entity.errors = raw.errors;
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;

    return entity;
  }
}
