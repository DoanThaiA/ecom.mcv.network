import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { JobsService } from '../../src/jobs/jobs.service';
import { JobRepository } from '../../src/jobs/domain/job.repository';
import { Job } from '../../src/jobs/domain/job';
import { JobType } from '../../src/jobs/domain/job-type.enum';
import { JobStatus } from '../../src/jobs/domain/job-status.enum';
import { jobQueueName } from '../../src/utils/env';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: jest.Mocked<JobRepository>;
  let jobsQueue: jest.Mocked<Queue>;
  let i18n: jest.Mocked<I18nService>;

  const mockJob: Job = {
    id: 'job-123',
    type: JobType.NHANH_PRODUCT_LIST_SYNC,
    status: JobStatus.PENDING,
    paramsHash: 'hash-123',
    params: { page: 1 },
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    jobErrors: [],
    triggeredBy: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Job;

  beforeEach(async () => {
    const mockJobRepository = {
      findActiveByHash: jest.fn(),
      findMostRecentByType: jest.fn(),
      findMostRecentCompletedByType: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findManyWithPagination: jest.fn(),
    };

    const mockJobsQueue = {
      add: jest.fn(),
    };

    const mockI18n = {
      t: jest.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: JobRepository, useValue: mockJobRepository },
        { provide: getQueueToken(jobQueueName), useValue: mockJobsQueue },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobRepository = module.get(JobRepository);
    jobsQueue = module.get(getQueueToken(jobQueueName));
    i18n = module.get(I18nService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startJob', () => {
    it('should start a new job successfully', async () => {
      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(null);
      jobRepository.findMostRecentCompletedByType.mockResolvedValue(null);
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      const result = await service.startJob(
        JobType.NHANH_PRODUCT_LIST_SYNC,
        { page: 1 },
        'user-123',
      );

      expect(result).toEqual({
        jobId: 'job-123',
        message: 'job.started',
      });
      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: JobType.NHANH_PRODUCT_LIST_SYNC,
          status: JobStatus.PENDING,
          params: { page: 1 },
          triggeredBy: 'user-123',
        }),
      );
      expect(jobsQueue.add).toHaveBeenCalledWith(
        JobType.NHANH_PRODUCT_LIST_SYNC,
        {
          jobId: 'job-123',
          type: JobType.NHANH_PRODUCT_LIST_SYNC,
          params: { page: 1 },
        },
      );
    });

    it('should throw error when job with same hash is already running', async () => {
      const activeJob = { ...mockJob, status: JobStatus.RUNNING };
      jobRepository.findActiveByHash.mockResolvedValue(activeJob);

      await expect(
        service.startJob(JobType.NHANH_PRODUCT_LIST_SYNC, { page: 1 }),
      ).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });

      expect(i18n.t).toHaveBeenCalledWith('job.alreadyRunning');
      expect(jobRepository.create).not.toHaveBeenCalled();
    });

    it('should enforce cooldown for Nhanh sync jobs', async () => {
      const recentJob = {
        ...mockJob,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      };

      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(recentJob as Job);

      await expect(
        service.startJob(JobType.NHANH_PRODUCT_LIST_SYNC, { page: 1 }),
      ).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });

      expect(i18n.t).toHaveBeenCalledWith('job.syncCooldown');
      expect(jobRepository.create).not.toHaveBeenCalled();
    });

    it('should allow job after cooldown period has passed', async () => {
      const oldJob = {
        ...mockJob,
        createdAt: new Date(Date.now() - 6 * 60 * 1000), // 6 minutes ago (past 5min cooldown)
      };

      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(oldJob as Job);
      jobRepository.findMostRecentCompletedByType.mockResolvedValue(null);
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      const result = await service.startJob(JobType.NHANH_PRODUCT_LIST_SYNC, {
        page: 1,
      });

      expect(result.jobId).toBe('job-123');
      expect(jobRepository.create).toHaveBeenCalled();
    });

    it('should enforce cooldown for all Nhanh sync job types', async () => {
      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(null);
      jobRepository.findMostRecentCompletedByType.mockResolvedValue(null);
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      // All JobType enum values are Nhanh sync types, so cooldown applies to all
      const result = await service.startJob(JobType.NHANH_BRAND_SYNC);

      expect(result.jobId).toBe('job-123');
      expect(jobRepository.findMostRecentByType).toHaveBeenCalled();
    });

    it('should inject updatedAtFrom timestamp for incremental sync types', async () => {
      const lastSync = {
        ...mockJob,
        completedAt: new Date('2026-01-01T00:00:00Z'),
      };

      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(null);
      jobRepository.findMostRecentCompletedByType.mockResolvedValue(
        lastSync as Job,
      );
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      await service.startJob(JobType.NHANH_PRODUCT_LIST_SYNC, { page: 1 });

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            updatedAtFrom: expect.any(Number), // Unix timestamp for product sync
          }),
        }),
      );
    });

    it('should not override explicitly set updatedAtFrom', async () => {
      const lastSync = {
        ...mockJob,
        completedAt: new Date('2026-01-01T00:00:00Z'),
      };

      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(null);
      jobRepository.findMostRecentCompletedByType.mockResolvedValue(
        lastSync as Job,
      );
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      const explicitTimestamp = 1234567890;
      await service.startJob(JobType.NHANH_PRODUCT_LIST_SYNC, {
        page: 1,
        updatedAtFrom: explicitTimestamp,
      });

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            updatedAtFrom: explicitTimestamp, // Should use explicit value
          }),
        }),
      );
    });

    it('should use Y-m-d H:i:s format for inventory sync', async () => {
      const lastSync = {
        ...mockJob,
        type: JobType.NHANH_INVENTORY_SYNC,
        completedAt: new Date('2026-01-01T12:30:45Z'),
      };

      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(null);
      jobRepository.findMostRecentCompletedByType.mockResolvedValue(
        lastSync as Job,
      );
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      await service.startJob(JobType.NHANH_INVENTORY_SYNC, {});

      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            updatedAtFrom: expect.stringMatching(
              /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
            ),
          }),
        }),
      );
    });

    it('should generate consistent hash for same type and params', async () => {
      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(null);
      jobRepository.findMostRecentCompletedByType.mockResolvedValue(null);
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      await service.startJob(JobType.NHANH_PRODUCT_LIST_SYNC, {
        page: 1,
        limit: 10,
      });

      const firstCallHash = (jobRepository.create.mock.calls[0][0] as any)
        .paramsHash;

      jobRepository.create.mockClear();
      jobRepository.create.mockResolvedValue(mockJob);

      await service.startJob(JobType.NHANH_PRODUCT_LIST_SYNC, {
        limit: 10,
        page: 1, // Different order, same params
      });

      const secondCallHash = (jobRepository.create.mock.calls[0][0] as any)
        .paramsHash;

      expect(firstCallHash).toBe(secondCallHash);
    });

    it('should start job without params', async () => {
      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentByType.mockResolvedValue(null);
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      const result = await service.startJob(JobType.NHANH_BRAND_SYNC);

      expect(result.jobId).toBe('job-123');
      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          params: undefined,
        }),
      );
    });

    it('should start job without triggeredBy', async () => {
      jobRepository.findActiveByHash.mockResolvedValue(null);
      jobRepository.findMostRecentCompletedByType.mockResolvedValue(null);
      jobRepository.create.mockResolvedValue(mockJob);
      jobsQueue.add.mockResolvedValue({} as any);

      const result = await service.startJob(JobType.NHANH_PRODUCT_LIST_SYNC);

      expect(result.jobId).toBe('job-123');
      expect(jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          triggeredBy: undefined,
        }),
      );
    });
  });

  describe('getJob', () => {
    it('should return job by id', async () => {
      jobRepository.findById.mockResolvedValue(mockJob);

      const result = await service.getJob('job-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('job-123');
      expect(jobRepository.findById).toHaveBeenCalledWith('job-123');
    });

    it('should throw error when job not found', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.getJob('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('job.notFound');
    });
  });

  describe('cancelJob', () => {
    it('should cancel pending job successfully', async () => {
      const pendingJob = { ...mockJob, status: JobStatus.PENDING };
      jobRepository.findById.mockResolvedValue(pendingJob as Job);
      jobRepository.updateStatus.mockResolvedValue(null);

      await service.cancelJob('job-123');

      expect(jobRepository.updateStatus).toHaveBeenCalledWith(
        'job-123',
        JobStatus.CANCELLED,
        {
          completedAt: expect.any(Date),
          resultMessage: 'Cancelled by user',
        },
      );
    });

    it('should cancel running job successfully', async () => {
      const runningJob = { ...mockJob, status: JobStatus.RUNNING };
      jobRepository.findById.mockResolvedValue(runningJob as Job);
      jobRepository.updateStatus.mockResolvedValue(null);

      await service.cancelJob('job-123');

      expect(jobRepository.updateStatus).toHaveBeenCalledWith(
        'job-123',
        JobStatus.CANCELLED,
        expect.any(Object),
      );
    });

    it('should throw error when job not found', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.cancelJob('non-existent')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(i18n.t).toHaveBeenCalledWith('job.notFound');
      expect(jobRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to cancel completed job', async () => {
      const completedJob = { ...mockJob, status: JobStatus.COMPLETED };
      jobRepository.findById.mockResolvedValue(completedJob as Job);

      await expect(service.cancelJob('job-123')).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });

      expect(i18n.t).toHaveBeenCalledWith('job.cannotCancel');
      expect(jobRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to cancel failed job', async () => {
      const failedJob = { ...mockJob, status: JobStatus.FAILED };
      jobRepository.findById.mockResolvedValue(failedJob as Job);

      await expect(service.cancelJob('job-123')).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });

      expect(jobRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to cancel cancelled job', async () => {
      const cancelledJob = { ...mockJob, status: JobStatus.CANCELLED };
      jobRepository.findById.mockResolvedValue(cancelledJob as Job);

      await expect(service.cancelJob('job-123')).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });

      expect(jobRepository.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('listJobs', () => {
    it('should return paginated jobs list', async () => {
      const paginatedResult = {
        docs: [mockJob],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };

      jobRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.listJobs(1, 10);

      expect(result).toEqual(paginatedResult);
      expect(jobRepository.findManyWithPagination).toHaveBeenCalledWith({
        type: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('should filter jobs by type', async () => {
      const paginatedResult = {
        docs: [mockJob],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };

      jobRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.listJobs(1, 10, JobType.NHANH_PRODUCT_LIST_SYNC);

      expect(jobRepository.findManyWithPagination).toHaveBeenCalledWith({
        type: JobType.NHANH_PRODUCT_LIST_SYNC,
        page: 1,
        limit: 10,
      });
    });

    it('should handle different page and limit values', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 50,
        page: 3,
        totalPages: 0,
      };

      jobRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.listJobs(3, 50);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
      expect(jobRepository.findManyWithPagination).toHaveBeenCalledWith({
        type: undefined,
        page: 3,
        limit: 50,
      });
    });

    it('should return empty list when no jobs found', async () => {
      const emptyResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
      };

      jobRepository.findManyWithPagination.mockResolvedValue(
        emptyResult as any,
      );

      const result = await service.listJobs(1, 10);

      expect(result.docs).toHaveLength(0);
      expect(result.totalDocs).toBe(0);
    });
  });
});
