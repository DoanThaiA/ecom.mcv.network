import { SystemTask } from '../domain/system-task';
import { SystemTaskSchemaClass } from './system-task.schema';

export class SystemTaskMapper {
  static toDomain(raw: SystemTaskSchemaClass): SystemTask {
    const domainEntity = new SystemTask();

    domainEntity.id = raw._id.toString();
    domainEntity.type = raw.type;
    domainEntity.status = raw.status;
    domainEntity.params = raw.params ?? undefined;
    domainEntity.result = raw.result ?? undefined;
    domainEntity.startedAt = raw.startedAt ?? undefined;
    domainEntity.completedAt = raw.completedAt ?? undefined;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toDocument(domainEntity: SystemTask): SystemTaskSchemaClass {
    const persistenceSchema = new SystemTaskSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.type = domainEntity.type;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.params = domainEntity.params ?? undefined;
    persistenceSchema.result = domainEntity.result ?? undefined;
    persistenceSchema.startedAt = domainEntity.startedAt ?? undefined;
    persistenceSchema.completedAt = domainEntity.completedAt ?? undefined;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;

    return persistenceSchema;
  }
}
