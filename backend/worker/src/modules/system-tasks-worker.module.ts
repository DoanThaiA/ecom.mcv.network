import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { ReviewRepository } from '@app/reviews/domain/review.repository';
import { ReviewRepositoryImpl } from '@app/reviews/model/review.repository';
import {
  ReviewSchemaClass,
  ReviewSchema,
} from '@app/reviews/model/review.schema';
import { FlashSaleProductDocumentModule } from '@app/flash-sale-products/model/flash-sale-product-document.module';
import { systemTaskQueueName } from '@app/utils/env';

import { TelegramModule } from '@app/telegram/telegram.module';
import { SystemTasksProcessor } from '../processors/system-tasks.processor';
import { ThumbnailService } from '../services/thumbnail.service';

/**
 * Module for processing system background tasks.
 * Contains SystemTasksProcessor and all required dependencies.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewSchemaClass.name, schema: ReviewSchema },
    ]),
    BullModule.registerQueue({
      name: systemTaskQueueName,
    }),
    FlashSaleProductDocumentModule,
    TelegramModule,
  ],
  providers: [
    SystemTasksProcessor,
    ThumbnailService,
    {
      provide: ReviewRepository,
      useClass: ReviewRepositoryImpl,
    },
  ],
})
export class SystemTasksWorkerModule {}
