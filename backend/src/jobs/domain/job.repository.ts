import { PaginateResult } from 'mongoose';
import { Job } from './job';
import { JobStatus } from './job-status.enum';
import { JobType } from './job-type.enum';
import { NullableType } from '../../utils/types/nullable.type';

export abstract class JobRepository {
  abstract create(
    data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Job>;

  abstract findById(id: string): Promise<NullableType<Job>>;

  abstract findActiveByHash(paramsHash: string): Promise<NullableType<Job>>;

  abstract updateStatus(
    id: string,
    status: JobStatus,
    additionalFields?: Partial<Job>,
  ): Promise<NullableType<Job>>;

  abstract incrementProgress(
    id: string,
    succeeded: number,
    failed: number,
  ): Promise<NullableType<Job>>;

  abstract addError(id: string, itemId: string, error: string): Promise<void>;

  abstract setTotal(id: string, total: number): Promise<void>;

  abstract findManyWithPagination(options: {
    type?: JobType;
    page: number;
    limit: number;
  }): Promise<PaginateResult<Job>>;

  abstract findMostRecentByType(type: JobType): Promise<NullableType<Job>>;

  abstract findMostRecentCompletedByType(
    type: JobType,
  ): Promise<NullableType<Job>>;

  abstract findActiveByTypeAndParams(
    type: JobType,
    paramsFilter: Record<string, any>,
  ): Promise<NullableType<Job>>;
}
