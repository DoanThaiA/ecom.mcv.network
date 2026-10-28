import mongoose from 'mongoose';
import { PushNotification } from '../domain/push-notification';
import { PushNotificationStatus } from '../domain/push-notification-status.enum';
import { PushNotificationCategory } from '../domain/push-notification-category.enum';

/**
 * Mapper to convert between domain PushNotification and Mongoose document
 */
export class PushNotificationMapper {
  static toDomain(raw: any): PushNotification {
    const entity = new PushNotification();
    entity.id = raw._id ? raw._id.toString() : '';
    entity.category = raw.category ?? PushNotificationCategory.NEWS;
    entity.title = raw.title;
    entity.subtitle = raw.subtitle;
    entity.url = raw.url || null;
    entity.status = raw.status ?? PushNotificationStatus.DRAFT;
    entity.scheduledAt = raw.scheduledAt || null;
    entity.sentAt = raw.sentAt || null;
    entity.readersCount = raw.readersCount ?? 0;
    entity.queueJobId = raw.queueJobId || null;
    entity.createdBy = raw.createdBy || null;
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;
    entity.deletedAt = raw.deletedAt || null;
    return entity;
  }

  static toDocument(entity: PushNotification): Record<string, any> {
    const document: Record<string, any> = {
      category: entity.category,
      title: entity.title,
      subtitle: entity.subtitle,
      url: entity.url,
      status: entity.status,
      scheduledAt: entity.scheduledAt,
      sentAt: entity.sentAt,
      readersCount: entity.readersCount,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    if (entity.id) {
      document._id = new mongoose.Types.ObjectId(entity.id);
    }

    if (entity.deletedAt !== undefined) {
      document.deletedAt = entity.deletedAt;
    }

    return document;
  }
}
