import { PaginateResult } from 'mongoose';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { UserNotification } from './user-notification';

/**
 * Abstract repository interface for UserNotification entity
 */
export abstract class UserNotificationRepository {
  abstract createMany(
    entries: Array<{ userId: string; notificationId: string }>,
  ): Promise<void>;

  abstract findByUserWithPagination(params: {
    userId: string;
    notificationIds: string[];
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<UserNotification>>;

  abstract markAsRead(userId: string, notificationId: string): Promise<boolean>;

  abstract markAllAsRead(userId: string): Promise<string[]>;

  abstract countUnread(userId: string): Promise<number>;

  abstract countReaders(notificationId: string): Promise<number>;

  abstract deleteByNotificationId(notificationId: string): Promise<void>;
}
