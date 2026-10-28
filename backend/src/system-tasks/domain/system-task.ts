import { TaskStatus } from './task-status.enum';
import { SystemTaskType } from './system-task-type.enum';

export class SystemTask {
  id: string;
  type: SystemTaskType;
  status: TaskStatus;
  params?: Record<string, any>;
  result?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
