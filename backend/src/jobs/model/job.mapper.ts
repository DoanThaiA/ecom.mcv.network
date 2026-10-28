import { Job } from '../domain/job';
import { JobSchemaClass } from './job.schema';

export class JobMapper {
  static toDomain(raw: JobSchemaClass): Job {
    const domainEntity = new Job();

    domainEntity.id = raw._id.toString();
    domainEntity.type = raw.type;
    domainEntity.status = raw.status;
    domainEntity.paramsHash = raw.paramsHash;
    domainEntity.params = raw.params ?? undefined;
    domainEntity.total = raw.total;
    domainEntity.processed = raw.processed;
    domainEntity.succeeded = raw.succeeded;
    domainEntity.failed = raw.failed;
    domainEntity.jobErrors = raw.jobErrors ?? [];
    domainEntity.triggeredBy = raw.triggeredBy ?? undefined;
    domainEntity.startedAt = raw.startedAt ?? undefined;
    domainEntity.completedAt = raw.completedAt ?? undefined;
    domainEntity.resultMessage = raw.resultMessage ?? undefined;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toDocument(domainEntity: Job): JobSchemaClass {
    const persistenceSchema = new JobSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.type = domainEntity.type;
    persistenceSchema.status = domainEntity.status;
    persistenceSchema.paramsHash = domainEntity.paramsHash;
    persistenceSchema.params = domainEntity.params ?? undefined;
    persistenceSchema.total = domainEntity.total;
    persistenceSchema.processed = domainEntity.processed;
    persistenceSchema.succeeded = domainEntity.succeeded;
    persistenceSchema.failed = domainEntity.failed;
    persistenceSchema.jobErrors = domainEntity.jobErrors ?? [];
    persistenceSchema.triggeredBy = domainEntity.triggeredBy ?? undefined;
    persistenceSchema.startedAt = domainEntity.startedAt ?? undefined;
    persistenceSchema.completedAt = domainEntity.completedAt ?? undefined;
    persistenceSchema.resultMessage = domainEntity.resultMessage ?? undefined;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;

    return persistenceSchema;
  }
}
