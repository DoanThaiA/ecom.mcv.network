import { ImportSession } from '../domain/import-session';
import { ImportSessionSchemaClass } from './import-session.schema';

/**
 * Mapper for converting between ImportSession domain entity and Mongoose document
 */
export class ImportSessionMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: ImportSessionSchemaClass): ImportSession {
    const entity = new ImportSession();

    entity.id = raw._id.toString();
    entity.type = raw.type || 'flash_sale';
    entity.flashSaleId = raw.flashSaleId?.toString();
    entity.promotionId = raw.promotionId?.toString();
    entity.topicId = raw.topicId?.toString();
    entity.affiliateId = raw.affiliateId?.toString();
    entity.status = raw.status;
    entity.totalRows = raw.totalRows;
    entity.validCount = raw.validCount;
    entity.invalidCount = raw.invalidCount;
    entity.jobId = raw.jobId;
    entity.createdBy = raw.createdBy;
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;

    return entity;
  }
}
