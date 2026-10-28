import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { JobRepository } from '../domain/job.repository';
import { Job } from '../domain/job';
import { JobSchemaClass } from './job.schema';
import { JobMapper } from './job.mapper';
import { JobStatus } from '../domain/job-status.enum';
import { JobType } from '../domain/job-type.enum';
import { NullableType } from '../../utils/types/nullable.type';

@Injectable()
export class JobDocumentRepository implements JobRepository {
  constructor(
    @InjectModel(JobSchemaClass.name)
    private readonly jobModel: PaginateModel<JobSchemaClass>,
  ) {}

  async create(
    data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Job> {
    const now = new Date();
    const persistenceModel = JobMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as Job);

    const createdJob = new this.jobModel(persistenceModel);
    const jobDocument = await createdJob.save();
    return JobMapper.toDomain(jobDocument);
  }

  async findById(id: string): Promise<NullableType<Job>> {
    const jobDocument = await this.jobModel.findById(id).lean();
    return jobDocument ? JobMapper.toDomain(jobDocument) : null;
  }

  async findActiveByHash(paramsHash: string): Promise<NullableType<Job>> {
    const jobDocument = await this.jobModel
      .findOne({
        paramsHash,
        status: { $in: [JobStatus.PENDING, JobStatus.RUNNING] },
      })
      .lean();

    return jobDocument ? JobMapper.toDomain(jobDocument) : null;
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    additionalFields?: Partial<Job>,
  ): Promise<NullableType<Job>> {
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date(),
    };

    if (additionalFields) {
      if (additionalFields.startedAt) {
        updateData.startedAt = additionalFields.startedAt;
      }
      if (additionalFields.completedAt) {
        updateData.completedAt = additionalFields.completedAt;
      }
      if (additionalFields.resultMessage) {
        updateData.resultMessage = additionalFields.resultMessage;
      }
    }

    const jobDocument = await this.jobModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return jobDocument ? JobMapper.toDomain(jobDocument) : null;
  }

  async incrementProgress(
    id: string,
    succeeded: number,
    failed: number,
  ): Promise<NullableType<Job>> {
    const jobDocument = await this.jobModel
      .findByIdAndUpdate(
        id,
        {
          $inc: {
            processed: succeeded + failed,
            succeeded,
            failed,
          },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return jobDocument ? JobMapper.toDomain(jobDocument) : null;
  }

  async addError(id: string, itemId: string, error: string): Promise<void> {
    await this.jobModel.updateOne(
      { _id: id },
      {
        $push: {
          jobErrors: { itemId, error, timestamp: new Date() },
        },
        $set: { updatedAt: new Date() },
      },
    );
  }

  async setTotal(id: string, total: number): Promise<void> {
    await this.jobModel.updateOne(
      { _id: id },
      {
        $set: { total, updatedAt: new Date() },
      },
    );
  }

  async findManyWithPagination(options: {
    type?: JobType;
    page: number;
    limit: number;
  }): Promise<PaginateResult<Job>> {
    const filter: Record<string, any> = {};

    if (options.type) {
      filter.type = options.type;
    }

    const result = await this.jobModel.paginate(filter, {
      page: options.page,
      limit: options.limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => JobMapper.toDomain(doc)),
    };
  }

  async findMostRecentByType(type: JobType): Promise<NullableType<Job>> {
    const jobDocument = await this.jobModel
      .findOne({ type })
      .sort({ createdAt: -1 })
      .lean();

    return jobDocument ? JobMapper.toDomain(jobDocument) : null;
  }

  async findMostRecentCompletedByType(
    type: JobType,
  ): Promise<NullableType<Job>> {
    const jobDocument = await this.jobModel
      .findOne({ type, status: JobStatus.COMPLETED })
      .sort({ completedAt: -1 })
      .lean();

    return jobDocument ? JobMapper.toDomain(jobDocument) : null;
  }

  async findActiveByTypeAndParams(
    type: JobType,
    paramsFilter: Record<string, any>,
  ): Promise<NullableType<Job>> {
    const filter: Record<string, any> = {
      type,
      status: { $in: [JobStatus.PENDING, JobStatus.RUNNING] },
    };

    // Match params fields (e.g., 'params.scope': 'global')
    for (const [key, value] of Object.entries(paramsFilter)) {
      filter[`params.${key}`] = value;
    }

    const jobDocument = await this.jobModel.findOne(filter).lean();
    return jobDocument ? JobMapper.toDomain(jobDocument) : null;
  }
}
