import { AuditLog } from '../domain/audit-log';
import { AuditLogSchemaClass } from './audit-log.schema';

/**
 * Mapper for converting between AuditLog domain entity and Mongoose document
 */
export class AuditLogMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns AuditLog domain entity
   */
  static toDomain(raw: AuditLogSchemaClass): AuditLog {
    const domainEntity = new AuditLog();

    domainEntity.id = raw._id.toString();
    domainEntity.action = raw.action;
    domainEntity.category = raw.category ?? null;
    domainEntity.description = raw.description ?? null;
    domainEntity.userId = raw.userId ?? null;
    domainEntity.userEmail = raw.userEmail ?? null;
    domainEntity.userType = raw.userType;
    domainEntity.status = raw.status;
    domainEntity.httpMethod = raw.httpMethod ?? null;
    domainEntity.endpoint = raw.endpoint ?? null;
    domainEntity.ipAddress = raw.ipAddress ?? null;
    domainEntity.userAgent = raw.userAgent ?? null;
    domainEntity.requestId = raw.requestId ?? null;
    domainEntity.input = raw.input ?? null;
    domainEntity.output = raw.output ?? null;
    domainEntity.error = raw.error ?? null;
    domainEntity.durationMs = raw.durationMs ?? null;
    domainEntity.metadata = raw.metadata ?? null;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   * @param domainEntity - AuditLog domain entity
   * @returns Mongoose document
   */
  static toDocument(domainEntity: AuditLog): AuditLogSchemaClass {
    const persistenceSchema = new AuditLogSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.action = domainEntity.action;
    persistenceSchema.category = domainEntity.category ?? undefined;
    persistenceSchema.description = domainEntity.description ?? undefined;
    persistenceSchema.userId = domainEntity.userId ?? undefined;
    persistenceSchema.userEmail = domainEntity.userEmail ?? undefined;
    persistenceSchema.userType = domainEntity.userType;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.httpMethod = domainEntity.httpMethod ?? undefined;
    persistenceSchema.endpoint = domainEntity.endpoint ?? undefined;
    persistenceSchema.ipAddress = domainEntity.ipAddress ?? undefined;
    persistenceSchema.userAgent = domainEntity.userAgent ?? undefined;
    persistenceSchema.requestId = domainEntity.requestId ?? undefined;
    persistenceSchema.input = domainEntity.input ?? undefined;
    persistenceSchema.output = domainEntity.output ?? undefined;
    persistenceSchema.error = domainEntity.error ?? undefined;
    persistenceSchema.durationMs = domainEntity.durationMs ?? undefined;
    persistenceSchema.metadata = domainEntity.metadata ?? undefined;
    persistenceSchema.createdAt = domainEntity.createdAt;

    return persistenceSchema;
  }
}
