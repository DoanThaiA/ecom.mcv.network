import { JobType } from './job-type.enum';
import { JobStatus } from './job-status.enum';

export interface JobError {
  itemId: string;
  error: string;
  timestamp: Date;
}

export class Job {
  id: string;
  type: JobType;
  status: JobStatus;
  paramsHash: string;
  params?: Record<string, any>;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  jobErrors: JobError[];
  triggeredBy?: string;
  startedAt?: Date;
  completedAt?: Date;
  resultMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
