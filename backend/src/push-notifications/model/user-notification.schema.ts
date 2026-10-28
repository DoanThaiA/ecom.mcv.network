import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type UserNotificationDocument =
  HydratedDocument<UserNotificationSchemaClass>;

/**
 * Mongoose schema for UserNotification entity
 * Tracks per-user read status for push notifications
 */
@Schema({
  timestamps: false,
  toJSON: { virtuals: true, getters: true },
  collection: 'user_notifications',
})
export class UserNotificationSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true })
  notificationId: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt?: Date;

  @Prop({ type: Date, default: now })
  createdAt: Date;
}

export const UserNotificationSchema = SchemaFactory.createForClass(
  UserNotificationSchemaClass,
);

UserNotificationSchema.index({ userId: 1, createdAt: -1 });
UserNotificationSchema.index(
  { notificationId: 1, userId: 1 },
  { unique: true },
);
UserNotificationSchema.index({ userId: 1, isRead: 1 });

UserNotificationSchema.plugin(mongoosePaginate);
