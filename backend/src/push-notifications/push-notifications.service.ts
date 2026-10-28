import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { I18nService } from 'nestjs-i18n';
import { Model, PaginateResult } from 'mongoose';
import { PushNotificationRepository } from './domain/push-notification.repository';
import { UserNotificationRepository } from './domain/user-notification.repository';
import { PushNotification } from './domain/push-notification';
import { PushNotificationStatus } from './domain/push-notification-status.enum';
import { CreatePushNotificationDto } from './dto/create-push-notification.dto';
import { UpdatePushNotificationDto } from './dto/update-push-notification.dto';
import { QueryPushNotificationsDto } from './dto/query-push-notifications.dto';
import { throwException } from '../utils/errors/throw-exception';
import { pushNotificationQueueName } from '../utils/env';
import { UserSchemaClass } from '../users/model/user.schema';
import { SocketService } from '../socket/socket.service';

/**
 * Service for managing push notifications
 */
@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    private readonly pushNotificationRepository: PushNotificationRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly i18n: I18nService,
    private readonly socketService: SocketService,
    @InjectQueue(pushNotificationQueueName) private readonly queue: Queue,
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserSchemaClass>,
  ) {}

  /**
   * Create a new push notification
   */
  async create(
    dto: CreatePushNotificationDto,
    createdBy?: string,
  ): Promise<PushNotification> {
    this.logger.debug(`Creating push notification: ${dto.title}`);

    const notification = await this.pushNotificationRepository.create({
      category: dto.category,
      title: dto.title,
      subtitle: dto.subtitle,
      url: dto.url || null,
      status: dto.status,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      sentAt: null,
      readersCount: 0,
      createdBy: createdBy || null,
      deletedAt: null,
    });

    // If immediate send
    if (dto.status === PushNotificationStatus.SENT) {
      await this.sendNotification(notification.id);
      return (await this.pushNotificationRepository.findById(notification.id))!;
    }

    // If scheduled send
    if (dto.status === PushNotificationStatus.PENDING && dto.scheduledAt) {
      const delay = new Date(dto.scheduledAt).getTime() - Date.now();
      if (delay > 0) {
        const job = await this.queue.add(
          'send-notification',
          { notificationId: notification.id },
          { delay },
        );
        await this.pushNotificationRepository.update(notification.id, {
          queueJobId: String(job.id),
        });
        this.logger.debug(
          `Scheduled notification ${notification.id} with delay ${delay}ms`,
        );
      } else {
        // scheduledAt is in the past, send immediately
        await this.sendNotification(notification.id);
        return (await this.pushNotificationRepository.findById(
          notification.id,
        ))!;
      }
    }

    return notification;
  }

  /**
   * Find all push notifications with filtering and pagination (CMS)
   */
  async findAll(
    dto: QueryPushNotificationsDto,
    page = 1,
    limit = 10,
  ): Promise<PaginateResult<PushNotification>> {
    const filterOptions: Record<string, any> = {};

    if (dto.status !== undefined) filterOptions.status = dto.status;
    if (dto.category !== undefined) filterOptions.category = dto.category;
    if (dto.search) filterOptions.search = dto.search;

    return this.pushNotificationRepository.findManyWithPagination({
      filterOptions:
        Object.keys(filterOptions).length > 0 ? filterOptions : null,
      paginationOptions: { page, limit },
    });
  }

  /**
   * Find a single push notification by ID
   */
  async findOne(id: string): Promise<PushNotification> {
    const notification = await this.pushNotificationRepository.findById(id);

    if (!notification) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('push-notification.notFound'),
      });
    }

    return notification;
  }

  /**
   * Update a draft push notification
   */
  async update(
    id: string,
    dto: UpdatePushNotificationDto,
  ): Promise<PushNotification> {
    const existing = await this.pushNotificationRepository.findById(id);

    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('push-notification.notFound'),
      });
    }

    if (
      existing.status !== PushNotificationStatus.DRAFT &&
      existing.status !== PushNotificationStatus.PENDING
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('push-notification.cannotEditNonDraft'),
      });
    }

    const updatePayload: Record<string, any> = {};
    if (dto.category !== undefined) updatePayload.category = dto.category;
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.subtitle !== undefined) updatePayload.subtitle = dto.subtitle;
    if (dto.url !== undefined) updatePayload.url = dto.url;
    if (dto.scheduledAt !== undefined)
      updatePayload.scheduledAt = new Date(dto.scheduledAt);

    // If PENDING and scheduledAt changed, cancel the old queued job and reschedule
    if (
      existing.status === PushNotificationStatus.PENDING &&
      dto.scheduledAt !== undefined
    ) {
      if (existing.queueJobId) {
        const oldJob = await this.queue.getJob(existing.queueJobId);
        if (oldJob) await oldJob.remove();
        this.logger.debug(
          `Removed old queue job ${existing.queueJobId} for notification ${id}`,
        );
      }

      const newDelay = new Date(dto.scheduledAt).getTime() - Date.now();
      if (newDelay > 0) {
        const newJob = await this.queue.add(
          'send-notification',
          { notificationId: id },
          { delay: newDelay },
        );
        updatePayload.queueJobId = String(newJob.id);
        this.logger.debug(
          `Rescheduled notification ${id} with new delay ${newDelay}ms`,
        );
      } else {
        // New scheduledAt is in the past — clear the job reference
        updatePayload.queueJobId = null;
      }
    }

    const updated = await this.pushNotificationRepository.update(
      id,
      updatePayload,
    );

    if (!updated) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('push-notification.notFound'),
      });
    }

    return updated;
  }

  /**
   * Soft delete a push notification
   */
  async remove(id: string): Promise<void> {
    const existing = await this.pushNotificationRepository.findById(id);

    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('push-notification.notFound'),
      });
    }

    await this.pushNotificationRepository.remove(id);

    // For SENT notifications: broadcast recall event so frontend removes it in real-time
    if (existing.status === PushNotificationStatus.SENT) {
      this.socketService.broadcastNotificationRecalled({ id });
    }
  }

  /**
   * Send a draft notification immediately
   */
  async send(id: string): Promise<PushNotification> {
    const existing = await this.pushNotificationRepository.findById(id);

    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('push-notification.notFound'),
      });
    }

    if (
      existing.status !== PushNotificationStatus.DRAFT &&
      existing.status !== PushNotificationStatus.PENDING
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('push-notification.cannotSendNonDraft'),
      });
    }

    // If scheduledAt is set and in the future, schedule instead of sending immediately
    if (existing.scheduledAt) {
      const delay = existing.scheduledAt.getTime() - Date.now();
      if (delay > 0) {
        const job = await this.queue.add(
          'send-notification',
          { notificationId: id },
          { delay },
        );
        await this.pushNotificationRepository.update(id, {
          status: PushNotificationStatus.PENDING,
          queueJobId: String(job.id),
        });
        this.logger.debug(`Scheduled notification ${id} with delay ${delay}ms`);
        return (await this.pushNotificationRepository.findById(id))!;
      }
    }

    await this.sendNotification(id);
    return (await this.pushNotificationRepository.findById(id))!;
  }

  /**
   * Recall a sent notification
   */
  async recall(id: string): Promise<PushNotification> {
    const existing = await this.pushNotificationRepository.findById(id);

    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('push-notification.notFound'),
      });
    }

    if (existing.status !== PushNotificationStatus.SENT) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('push-notification.cannotRecallNonSent'),
      });
    }

    const updated = await this.pushNotificationRepository.update(id, {
      status: PushNotificationStatus.RECALLED,
    });

    this.socketService.broadcastNotificationRecalled({ id });

    return updated!;
  }

  /**
   * Mark notification as SENT, broadcast via WebSocket, and enqueue
   * background job to create user_notifications in batches.
   */
  async sendNotification(id: string): Promise<void> {
    this.logger.debug(`Sending notification ${id}`);

    // Update status to SENT
    await this.pushNotificationRepository.update(id, {
      status: PushNotificationStatus.SENT,
      sentAt: new Date(),
    });

    const notification = await this.pushNotificationRepository.findById(id);
    if (!notification) return;

    // Broadcast via WebSocket immediately — users see it in real-time
    this.socketService.broadcastNewNotification({
      id: notification.id,
      category: notification.category,
      title: notification.title,
      subtitle: notification.subtitle,
      url: notification.url || undefined,
      sentAt: notification.sentAt!.toISOString(),
    });

    // Enqueue background job for heavy work (creating user_notifications)
    await this.queue.add(
      'create-user-notifications',
      { notificationId: id },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    this.logger.log(
      `Notification ${id} marked as SENT, user_notifications job enqueued`,
    );
  }

  /**
   * Background: create user_notifications for all active users using cursor.
   * Called by BullMQ processor — never in an HTTP request.
   */
  async createUserNotifications(notificationId: string): Promise<void> {
    const BATCH_SIZE = 2000;
    const CONCURRENCY = 3;
    let totalCreated = 0;
    let batch: Array<{ userId: string; notificationId: string }> = [];
    const pendingInserts: Promise<void>[] = [];

    const cursor = this.userModel
      .find({ deletedAt: null }, { _id: 1 })
      .lean()
      .cursor({ batchSize: BATCH_SIZE });

    for await (const user of cursor) {
      batch.push({ userId: user._id.toString(), notificationId });

      if (batch.length >= BATCH_SIZE) {
        const toInsert = batch;
        batch = [];
        pendingInserts.push(
          this.userNotificationRepository.createMany(toInsert),
        );
        totalCreated += toInsert.length;

        // Limit concurrent inserts to avoid overwhelming MongoDB
        if (pendingInserts.length >= CONCURRENCY) {
          await Promise.all(pendingInserts);
          pendingInserts.length = 0;
        }
      }
    }

    // Flush remaining batch
    if (batch.length > 0) {
      pendingInserts.push(this.userNotificationRepository.createMany(batch));
      totalCreated += batch.length;
    }
    if (pendingInserts.length > 0) {
      await Promise.all(pendingInserts);
    }

    this.logger.log(
      `Created user_notifications for notification ${notificationId}: ${totalCreated} users`,
    );
  }

  // ==================== SHOP (Frontend User) ====================

  /**
   * Get user's notifications with push notification data joined
   */
  async findUserNotifications(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: Array<{
      id: string;
      notificationId: string;
      category: number;
      title: string;
      subtitle: string;
      url?: string | null;
      isRead: boolean;
      sentAt: string;
      createdAt: string;
    }>;
    hasNextPage: boolean;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // First get all non-recalled, sent notification IDs
    const sentNotifications =
      await this.pushNotificationRepository.findManyWithPagination({
        filterOptions: { status: PushNotificationStatus.SENT },
        paginationOptions: { page: 1, limit: 100000 },
      });

    const sentIds = sentNotifications.docs.map((n) => n.id);
    const notificationMap = new Map(
      sentNotifications.docs.map((n) => [n.id, n]),
    );

    // Get user's notifications for these sent IDs
    const userNotifications =
      await this.userNotificationRepository.findByUserWithPagination({
        userId,
        notificationIds: sentIds,
        paginationOptions: { page, limit },
      });

    const data = userNotifications.docs
      .map((un) => {
        const pn = notificationMap.get(un.notificationId);
        if (!pn) return null;
        return {
          id: un.id,
          notificationId: un.notificationId,
          category: pn.category,
          title: pn.title,
          subtitle: pn.subtitle,
          url: pn.url,
          isRead: un.isRead,
          sentAt: pn.sentAt
            ? pn.sentAt.toISOString()
            : pn.createdAt.toISOString(),
          createdAt: un.createdAt.toISOString(),
        };
      })
      .filter(Boolean) as any[];

    return {
      data,
      hasNextPage: userNotifications.hasNextPage ?? false,
      total: userNotifications.totalDocs,
      page: userNotifications.page ?? 1,
      limit: userNotifications.limit,
      totalPages: userNotifications.totalPages,
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.userNotificationRepository.countUnread(userId);
  }

  /**
   * Mark a notification as read for a user
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const wasUnread = await this.userNotificationRepository.markAsRead(
      userId,
      notificationId,
    );
    if (wasUnread) {
      await this.pushNotificationRepository.incrementReadersCount(
        notificationId,
      );
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notificationIds =
      await this.userNotificationRepository.markAllAsRead(userId);
    if (notificationIds.length > 0) {
      await this.pushNotificationRepository.incrementReadersCountMany(
        notificationIds,
      );
    }
  }
}
