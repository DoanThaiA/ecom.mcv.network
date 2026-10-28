import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobType } from '../domain/job-type.enum';
import { JobStatus } from '../domain/job-status.enum';
import { Job, JobError } from '../domain/job';

export class JobErrorDto {
  @ApiProperty({ example: 'product-123' })
  itemId: string;

  @ApiProperty({ example: 'Not found' })
  error: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  timestamp: Date;
}

export class JobResponseDto {
  @ApiProperty({ example: '6750abc123def456' })
  id: string;

  @ApiProperty({ enum: JobType, example: JobType.NHANH_PRODUCT_LIST_SYNC })
  type: JobType;

  @ApiProperty({ enum: JobStatus, example: JobStatus.RUNNING })
  status: JobStatus;

  @ApiProperty({ example: 350, description: 'Total items to process' })
  total: number;

  @ApiProperty({ example: 150, description: 'Items processed so far' })
  processed: number;

  @ApiProperty({ example: 148, description: 'Successfully processed items' })
  succeeded: number;

  @ApiProperty({ example: 2, description: 'Failed items' })
  failed: number;

  @ApiProperty({ example: 43, description: 'Percentage complete (0-100)' })
  percentComplete: number;

  @ApiProperty({ type: [JobErrorDto], description: 'Recent errors' })
  jobErrors: JobErrorDto[];

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  startedAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-15T10:05:00Z' })
  completedAt?: Date;

  @ApiPropertyOptional({ example: 'Completed successfully' })
  resultMessage?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  static fromDomain(job: Job): JobResponseDto {
    const dto = new JobResponseDto();
    dto.id = job.id;
    dto.type = job.type;
    dto.status = job.status;
    dto.total = job.total;
    dto.processed = job.processed;
    dto.succeeded = job.succeeded;
    dto.failed = job.failed;
    // If total is 0 (single-operation job), show 100% when completed, 0% otherwise
    dto.percentComplete =
      job.total > 0
        ? Math.round((job.processed / job.total) * 100)
        : job.status === JobStatus.COMPLETED
          ? 100
          : 0;
    dto.jobErrors = job.jobErrors.map((e: JobError) => ({
      itemId: e.itemId,
      error: e.error,
      timestamp: e.timestamp,
    }));
    dto.startedAt = job.startedAt;
    dto.completedAt = job.completedAt;
    dto.resultMessage = job.resultMessage;
    dto.createdAt = job.createdAt;
    return dto;
  }
}

export class StartJobResponseDto {
  @ApiProperty({ example: '6750abc123def456' })
  jobId: string;

  @ApiProperty({ example: 'Job started' })
  message: string;
}

export class CancelJobResponseDto {
  @ApiProperty({ example: 'Job cancelled' })
  message: string;
}
