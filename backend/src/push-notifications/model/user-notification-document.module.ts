import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserNotificationSchemaClass,
  UserNotificationSchema,
} from './user-notification.schema';
import { UserNotificationDocumentRepository } from './user-notification-document.repository';
import { UserNotificationRepository } from '../domain/user-notification.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserNotificationSchemaClass.name,
        schema: UserNotificationSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: UserNotificationRepository,
      useClass: UserNotificationDocumentRepository,
    },
  ],
  exports: [UserNotificationRepository, MongooseModule],
})
export class UserNotificationDocumentModule {}
