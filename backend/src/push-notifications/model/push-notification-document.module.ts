import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PushNotificationSchemaClass,
  PushNotificationSchema,
} from './push-notification.schema';
import { PushNotificationDocumentRepository } from './push-notification-document.repository';
import { PushNotificationRepository } from '../domain/push-notification.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PushNotificationSchemaClass.name,
        schema: PushNotificationSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: PushNotificationRepository,
      useClass: PushNotificationDocumentRepository,
    },
  ],
  exports: [PushNotificationRepository, MongooseModule],
})
export class PushNotificationDocumentModule {}
