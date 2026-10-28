import { SystemTask } from './system-task';
import { TaskStatus } from './task-status.enum';
import { NullableType } from '../../utils/types/nullable.type';

export abstract class SystemTaskRepository {
  abstract create(
    data: Omit<SystemTask, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<SystemTask>;

  abstract findById(id: string): Promise<NullableType<SystemTask>>;

  abstract updateStatus(
    id: string,
    status: TaskStatus,
    additionalFields?: Partial<SystemTask>,
  ): Promise<NullableType<SystemTask>>;
}
