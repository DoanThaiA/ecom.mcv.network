import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SystemTaskType } from '../domain/system-task-type.enum';
import { TaskStatus } from '../domain/task-status.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type SystemTaskDocument = HydratedDocument<SystemTaskSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'system_tasks',
})
export class SystemTaskSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
    enum: SystemTaskType,
    index: true,
  })
  type: SystemTaskType;

  @Prop({
    type: String,
    required: true,
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    index: true,
  })
  status: TaskStatus;

  @Prop({ type: Object })
  params?: Record<string, any>;

  @Prop({ type: String })
  result?: string;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const SystemTaskSchema = SchemaFactory.createForClass(
  SystemTaskSchemaClass,
);

SystemTaskSchema.index({ type: 1, status: 1 });
SystemTaskSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 3 * 24 * 60 * 60 },
); // TTL: 3 days
