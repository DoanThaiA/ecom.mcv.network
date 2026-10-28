import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PromotionUsageRecordSchemaClass,
  PromotionUsageRecordSchema,
} from './promotion-usage-record.schema';
import { PromotionUsageRecordRepository } from '../domain/promotion-usage-record.repository';
import { PromotionUsageRecordDocumentRepository } from './promotion-usage-record.repository';

/**
 * Mongoose document module for PromotionUsageRecord entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PromotionUsageRecordSchemaClass.name,
        schema: PromotionUsageRecordSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: PromotionUsageRecordRepository,
      useClass: PromotionUsageRecordDocumentRepository,
    },
  ],
  exports: [PromotionUsageRecordRepository, MongooseModule],
})
export class PromotionUsageRecordDocumentModule {}
