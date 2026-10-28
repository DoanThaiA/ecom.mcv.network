import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { AuditLogStatus } from '../domain/audit-log-status.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type AuditLogDocument = HydratedDocument<AuditLogSchemaClass>;

/**
 * Mongoose schema for AuditLog entity
 */
@Schema({
  timestamps: false,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'audit_logs',
})
export class AuditLogSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  action: string;

  @Prop({ type: String, index: true })
  category?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, sparse: true, index: true })
  userId?: string;

  @Prop({ type: String })
  userEmail?: string;

  @Prop({
    type: String,
    required: true,
    enum: ['cms', 'system'],
    default: 'system',
    index: true,
  })
  userType: 'cms' | 'system';

  @Prop({
    type: String,
    required: true,
    enum: AuditLogStatus,
    default: AuditLogStatus.SUCCESS,
    index: true,
  })
  status: AuditLogStatus;

  @Prop({ type: String })
  httpMethod?: string;

  @Prop({ type: String })
  endpoint?: string;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  requestId?: string;

  @Prop({ type: Object })
  input?: Record<string, unknown>;

  @Prop({ type: Object })
  output?: Record<string, unknown>;

  @Prop({
    type: {
      message: { type: String, required: true },
      name: { type: String },
      stack: { type: String },
      _id: false,
    },
  })
  error?: {
    message: string;
    name?: string;
    stack?: string;
  };

  @Prop({ type: Number })
  durationMs?: number;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: Date, default: now })
  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLogSchemaClass);

// Compound indexes for efficient queries
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, createdAt: -1 });
AuditLogSchema.index({ status: 1, createdAt: -1 });
AuditLogSchema.index({ userType: 1, createdAt: -1 });

// TTL index for automatic cleanup - 90 days retention
AuditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

AuditLogSchema.plugin(mongoosePaginate);
