import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import { UserNotificationRepository } from '../domain/user-notification.repository';
import { UserNotification } from '../domain/user-notification';
import { UserNotificationSchemaClass } from './user-notification.schema';
import { UserNotificationMapper } from './user-notification.mapper';
import { IPaginationOptions } from '../../utils/types/pagination-options';

/**
 * Mongoose implementation of UserNotificationRepository
 */
@Injectable()
export class UserNotificationDocumentRepository
  implements UserNotificationRepository
{
  constructor(
    @InjectModel(UserNotificationSchemaClass.name)
    private readonly model: PaginateModel<UserNotificationSchemaClass>,
  ) {}

  async createMany(
    entries: Array<{ userId: string; notificationId: string }>,
  ): Promise<void> {
    if (entries.length === 0) return;

    const docs = entries.map((e) => ({
      userId: e.userId,
      notificationId: e.notificationId,
      isRead: false,
      createdAt: new Date(),
    }));

    await this.model.insertMany(docs, { ordered: false }).catch(() => {
      // Ignore duplicate key errors (user already has this notification)
    });
  }

  async findByUserWithPagination(params: {
    userId: string;
    notificationIds: string[];
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<UserNotification>> {
    const filter: FilterQuery<UserNotificationSchemaClass> = {
      userId: params.userId,
    };

    if (params.notificationIds.length > 0) {
      filter.notificationId = { $in: params.notificationIds };
    }

    const result = await this.model.paginate(filter, {
      page: params.paginationOptions.page,
      limit: params.paginationOptions.limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => UserNotificationMapper.toDomain(doc)),
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const result = await this.model.findOneAndUpdate(
      { userId, notificationId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );
    return !!result;
  }

  async markAllAsRead(userId: string): Promise<string[]> {
    const unreadNotificationIds = await this.model.distinct('notificationId', {
      userId,
      isRead: false,
    });

    if (unreadNotificationIds.length === 0) return [];

    await this.model.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    return unreadNotificationIds.map(String);
  }

  async countUnread(userId: string): Promise<number> {
    return this.model.countDocuments({ userId, isRead: false });
  }

  async countReaders(notificationId: string): Promise<number> {
    return this.model.countDocuments({ notificationId, isRead: true });
  }

  async deleteByNotificationId(notificationId: string): Promise<void> {
    await this.model.deleteMany({ notificationId });
  }
}
