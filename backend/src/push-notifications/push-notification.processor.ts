import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { pushNotificationQueueName } from '../utils/env';
import { PushNotificationsService } from './push-notifications.service';
import { PushNotificationRepository } from './domain/push-notification.repository';
import { PushNotificationStatus } from './domain/push-notification-status.enum';

interface NotificationJobData {
  notificationId: string;
}

/**
 * BullMQ processor for push notification background jobs
 *
 * Job types:
 * - send-notification: Scheduled send — verify PENDING then call sendNotification()
 * - create-user-notifications: Create user_notification rows for all users (heavy I/O)
 */
@Processor(pushNotificationQueueName)
export class PushNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(PushNotificationProcessor.name);

  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
    private readonly pushNotificationRepository: PushNotificationRepository,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { notificationId } = job.data;

    switch (job.name) {
      case 'send-notification':
        await this.handleSendNotification(notificationId);
        break;
      case 'create-user-notifications':
        await this.handleCreateUserNotifications(notificationId);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  /**
   * Handle scheduled send — verify still PENDING, then send
   */
  private async handleSendNotification(notificationId: string): Promise<void> {
    this.logger.log(`Processing scheduled notification: ${notificationId}`);

    const notification =
      await this.pushNotificationRepository.findById(notificationId);

    if (!notification) {
      this.logger.warn(`Notification ${notificationId} not found, skipping`);
      return;
    }

    if (notification.status !== PushNotificationStatus.PENDING) {
      this.logger.warn(
        `Notification ${notificationId} status is ${notification.status}, skipping`,
      );
      return;
    }

    await this.pushNotificationsService.sendNotification(notificationId);
    this.logger.log(`Scheduled notification ${notificationId} sent`);
  }

  /**
   * Handle bulk creation of user_notifications — heavy I/O, runs in background
   */
  private async handleCreateUserNotifications(
    notificationId: string,
  ): Promise<void> {
    this.logger.log(
      `Creating user_notifications for notification: ${notificationId}`,
    );

    try {
      await this.pushNotificationsService.createUserNotifications(
        notificationId,
      );
      this.logger.log(
        `Completed user_notifications for notification: ${notificationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create user_notifications for ${notificationId}`,
        error,
      );
      throw error;
    }
  }
}
