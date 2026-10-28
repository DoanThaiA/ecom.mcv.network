import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemTaskRepository } from '../domain/system-task.repository';
import { SystemTask } from '../domain/system-task';
import { SystemTaskSchemaClass } from './system-task.schema';
import { SystemTaskMapper } from './system-task.mapper';
import { TaskStatus } from '../domain/task-status.enum';
import { NullableType } from '../../utils/types/nullable.type';

@Injectable()
export class SystemTaskDocumentRepository implements SystemTaskRepository {
  constructor(
    @InjectModel(SystemTaskSchemaClass.name)
    private readonly systemTaskModel: Model<SystemTaskSchemaClass>,
  ) {}

  async create(
    data: Omit<SystemTask, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<SystemTask> {
    const now = new Date();
    const persistenceModel = SystemTaskMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as SystemTask);

    const createdTask = new this.systemTaskModel(persistenceModel);
    const taskDocument = await createdTask.save();
    return SystemTaskMapper.toDomain(taskDocument);
  }

  async findById(id: string): Promise<NullableType<SystemTask>> {
    const taskDocument = await this.systemTaskModel.findById(id).lean();
    return taskDocument ? SystemTaskMapper.toDomain(taskDocument) : null;
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    additionalFields?: Partial<SystemTask>,
  ): Promise<NullableType<SystemTask>> {
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
      if (additionalFields.result !== undefined) {
        updateData.result = additionalFields.result;
      }
    }

    const taskDocument = await this.systemTaskModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return taskDocument ? SystemTaskMapper.toDomain(taskDocument) : null;
  }
}
