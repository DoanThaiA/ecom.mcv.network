import { UserNotification } from '../domain/user-notification';

/**
 * Mapper to convert between domain UserNotification and Mongoose document
 */
export class UserNotificationMapper {
  static toDomain(raw: any): UserNotification {
    const entity = new UserNotification();
    entity.id = raw._id ? raw._id.toString() : '';
    entity.userId = raw.userId;
    entity.notificationId = raw.notificationId;
    entity.isRead = raw.isRead ?? false;
    entity.readAt = raw.readAt || null;
    entity.createdAt = raw.createdAt;
    return entity;
  }
}
