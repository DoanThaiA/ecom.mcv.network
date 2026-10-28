import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHash } from 'crypto';
import { PaginateResult } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { JobRepository } from './domain/job.repository';
import { Job } from './domain/job';
import { JobType } from './domain/job-type.enum';
import { JobStatus } from './domain/job-status.enum';
import { JobResponseDto, StartJobResponseDto } from './dto/job-response.dto';
import { throwException } from '../utils/errors/throw-exception';
import { formatDateYmdHis } from '../utils/helpers/format-date';
import { jobQueueName } from '../utils/env';

export interface JobData {
  jobId: string;
  type: JobType;
  params?: Record<string, any>;
}

const NHANH_SYNC_TYPES: JobType[] = [
  JobType.NHANH_PRODUCT_LIST_SYNC,
  JobType.NHANH_PRODUCT_DETAIL_SYNC,
  JobType.NHANH_PRODUCT_EMBED_SYNC,
  JobType.NHANH_CATEGORY_SYNC,
  JobType.NHANH_INVENTORY_SYNC,
  JobType.NHANH_BRAND_SYNC,
  JobType.NHANH_DEPOT_SYNC,
];

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Job types that support updatedAtFrom filter for incremental sync
const INCREMENTAL_SYNC_TYPES: JobType[] = [
  JobType.NHANH_PRODUCT_LIST_SYNC,
  JobType.NHANH_PRODUCT_DETAIL_SYNC,
  JobType.NHANH_INVENTORY_SYNC,
];

@Injectable()
export class JobsService {
  constructor(
    private readonly jobRepository: JobRepository,
    @InjectQueue(jobQueueName) private jobsQueue: Queue,
    private readonly i18n: I18nService,
  ) {}

  async startJob(
    type: JobType,
    params?: Record<string, any>,
    triggeredBy?: string,
  ): Promise<StartJobResponseDto> {
    // Auto-inject updatedAtFrom for incremental sync optimization
    const enhancedParams = await this.injectLastSyncTimestamp(type, params);

    // Generate hash from type + sorted params
    const paramsHash = this.generateHash(type, enhancedParams);

    // Check for existing active job
    const existing = await this.jobRepository.findActiveByHash(paramsHash);
    if (existing) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('job.alreadyRunning'),
      });
    }

    // Check cooldown for Nhanh sync jobs
    if (NHANH_SYNC_TYPES.includes(type)) {
      const mostRecent = await this.jobRepository.findMostRecentByType(type);
      if (mostRecent) {
        const elapsed = Date.now() - mostRecent.createdAt.getTime();
        if (elapsed < SYNC_COOLDOWN_MS) {
          throwException({
            status: HttpStatus.CONFLICT,
            message: this.i18n.t('job.syncCooldown'),
          });
        }
      }
    }

    // Create job record
    const job = await this.jobRepository.create({
      type,
      status: JobStatus.PENDING,
      paramsHash,
      params: enhancedParams,
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      jobErrors: [],
      triggeredBy,
    });

    // Add job to BullMQ
    const jobData: JobData = {
      jobId: job.id,
      type,
      params: enhancedParams,
    };

    await this.jobsQueue.add(type, jobData);

    return {
      jobId: job.id,
      message: this.i18n.t('job.started'),
    };
  }

  async getJob(id: string): Promise<JobResponseDto> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('job.notFound'),
      });
    }
    return JobResponseDto.fromDomain(job);
  }

  async cancelJob(id: string): Promise<void> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('job.notFound'),
      });
    }

    if (![JobStatus.PENDING, JobStatus.RUNNING].includes(job.status)) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('job.cannotCancel'),
      });
    }

    await this.jobRepository.updateStatus(id, JobStatus.CANCELLED, {
      completedAt: new Date(),
      resultMessage: 'Cancelled by user',
    });
  }

  async listJobs(
    page: number,
    limit: number,
    type?: JobType,
  ): Promise<PaginateResult<Job>> {
    return this.jobRepository.findManyWithPagination({
      type,
      page,
      limit,
    });
  }

  /**
   * Check if there's an active commission rate recalculation job for a given scope
   * @param scope 'global' or affiliateId string
   */
  async findActiveRecalculationJob(scope: string): Promise<Job | null> {
    const paramsFilter =
      scope === 'global'
        ? { scope: 'global' }
        : { scope: 'affiliate', affiliateId: scope };

    return this.jobRepository.findActiveByTypeAndParams(
      JobType.COMMISSION_RATE_RECALCULATION,
      paramsFilter,
    );
  }

  private generateHash(type: JobType, params?: Record<string, any>): string {
    const sortedParams = params
      ? JSON.stringify(params, Object.keys(params).sort())
      : '{}';
    const normalized = JSON.stringify({ type, params: sortedParams });
    return createHash('sha256')
      .update(normalized)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Inject updatedAtFrom from last successful sync for incremental sync optimization.
   * Only applies to job types that support updatedAtFrom filter.
   * - Product sync: Unix timestamp (seconds)
   * - Inventory sync: Y-m-d H:i:s format string
   */
  private async injectLastSyncTimestamp(
    type: JobType,
    params?: Record<string, any>,
  ): Promise<Record<string, any> | undefined> {
    // Only for job types that support updatedAtFrom
    if (!INCREMENTAL_SYNC_TYPES.includes(type)) {
      return params;
    }

    // If already explicitly set, use as-is
    if (params?.updatedAtFrom) {
      return params;
    }

    // Get last completed sync
    const lastSync =
      await this.jobRepository.findMostRecentCompletedByType(type);

    if (lastSync?.completedAt) {
      // Add 1 day padding to avoid missing products near sync boundary
      const paddedDate = new Date(
        lastSync.completedAt.getTime() - 24 * 60 * 60 * 1000,
      );

      // Different formats per API:
      // - Product list/detail sync: Unix timestamp (seconds)
      // - Inventory sync: Y-m-d H:i:s format string
      const timestamp =
        type === JobType.NHANH_PRODUCT_LIST_SYNC ||
        type === JobType.NHANH_PRODUCT_DETAIL_SYNC
          ? Math.floor(paddedDate.getTime() / 1000)
          : formatDateYmdHis(paddedDate);

      return { ...params, updatedAtFrom: timestamp };
    }

    return params;
  }
}
