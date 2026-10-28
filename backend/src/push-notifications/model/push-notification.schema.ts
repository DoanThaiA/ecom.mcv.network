import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { PushNotificationStatus } from '../domain/push-notification-status.enum';
import { PushNotificationCategory } from '../domain/push-notification-category.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type PushNotificationDocument =
  HydratedDocument<PushNotificationSchemaClass>;

/**
 * Mongoose schema for PushNotification entity
 */
@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'push_notifications',
})
export class PushNotificationSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Number,
    required: true,
    enum: [PushNotificationCategory.NEWS, PushNotificationCategory.PROMOTION],
  })
  category: PushNotificationCategory;

  @Prop({ type: String, required: true, maxlength: 100 })
  title: string;

  @Prop({ type: String, required: true, maxlength: 250 })
  subtitle: string;

  @Prop({ type: String, default: null })
  url?: string;

  @Prop({
    type: Number,
    required: true,
    enum: [
      PushNotificationStatus.DRAFT,
      PushNotificationStatus.PENDING,
      PushNotificationStatus.SENT,
      PushNotificationStatus.RECALLED,
    ],
    default: PushNotificationStatus.DRAFT,
    index: true,
  })
  status: PushNotificationStatus;

  @Prop({ type: Date, default: null })
  scheduledAt?: Date;

  @Prop({ type: Date, default: null })
  sentAt?: Date;

  @Prop({ type: Number, default: 0 })
  readersCount: number;

  @Prop({ type: String, default: null })
  queueJobId?: string;

  @Prop({ type: String, default: null })
  createdBy?: string;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const PushNotificationSchema = SchemaFactory.createForClass(
  PushNotificationSchemaClass,
);

PushNotificationSchema.index({ status: 1, createdAt: -1 });
PushNotificationSchema.index({ status: 1, scheduledAt: 1 });

PushNotificationSchema.plugin(mongoosePaginate);
