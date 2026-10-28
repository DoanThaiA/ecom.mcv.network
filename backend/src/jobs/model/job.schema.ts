import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { JobType } from '../domain/job-type.enum';
import { JobStatus } from '../domain/job-status.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type JobDocument = HydratedDocument<JobSchemaClass>;

export class JobErrorSchema {
  itemId: string;
  error: string;
  timestamp: Date;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'jobs',
})
export class JobSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
    enum: JobType,
    index: true,
  })
  type: JobType;

  @Prop({
    type: String,
    required: true,
    enum: JobStatus,
    default: JobStatus.PENDING,
    index: true,
  })
  status: JobStatus;

  @Prop({ type: String, required: true, index: true })
  paramsHash: string;

  @Prop({ type: Object })
  params?: Record<string, any>;

  @Prop({ type: Number, default: 0 })
  total: number;

  @Prop({ type: Number, default: 0 })
  processed: number;

  @Prop({ type: Number, default: 0 })
  succeeded: number;

  @Prop({ type: Number, default: 0 })
  failed: number;

  @Prop({
    type: [{ itemId: String, error: String, timestamp: Date }],
    default: [],
  })
  jobErrors: JobErrorSchema[];

  @Prop({ type: String })
  triggeredBy?: string;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: String })
  resultMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(JobSchemaClass);

// Indexes
JobSchema.index({ type: 1, status: 1 });
JobSchema.index({ paramsHash: 1, status: 1 }); // For duplicate detection
JobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // TTL: 7 days

JobSchema.plugin(mongoosePaginate);
