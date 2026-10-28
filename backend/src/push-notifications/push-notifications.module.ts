import { Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PushNotificationDocumentModule } from './model/push-notification-document.module';
import { UserNotificationDocumentModule } from './model/user-notification-document.module';
import { PushNotificationsService } from './push-notifications.service';
import { PushNotificationProcessor } from './push-notification.processor';
import { CmsPushNotificationsController } from './controllers/cms-push-notifications.controller';
import { ShopPushNotificationsController } from './controllers/shop-push-notifications.controller';
import { AllConfigType } from '../config/config.type';
import { pushNotificationQueueName } from '../utils/env';
import { UserSchemaClass, UserSchema } from '../users/model/user.schema';

const logger = new Logger('PushNotificationsModule');

@Module({
  imports: [
    PushNotificationDocumentModule,
    UserNotificationDocumentModule,
    MongooseModule.forFeature([
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const redisUrl = configService.get('cache.redisUrl', { infer: true });
        return {
          connection: {
            url: redisUrl || 'redis://localhost:6379',
            maxRetriesPerRequest: null,
            retryStrategy: (times: number) => {
              const delay = Math.min(times * 1000, 10000);
              logger.warn(
                `Redis connection attempt ${times} failed. Retrying in ${delay}ms...`,
              );
              return delay;
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: pushNotificationQueueName,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
  ],
  controllers: [
    CmsPushNotificationsController,
    ShopPushNotificationsController,
  ],
  providers: [PushNotificationsService, PushNotificationProcessor],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
