import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AffiliateTrackingEventSchemaClass,
  AffiliateTrackingEventSchema,
} from './affiliate-tracking-event.schema';
import { AffiliateTrackingRepository } from '../domain/affiliate-tracking.repository';
import { AffiliateTrackingDocumentRepository } from './affiliate-tracking-event.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AffiliateTrackingEventSchemaClass.name,
        schema: AffiliateTrackingEventSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: AffiliateTrackingRepository,
      useClass: AffiliateTrackingDocumentRepository,
    },
  ],
  exports: [AffiliateTrackingRepository, MongooseModule],
})
export class AffiliateTrackingEventDocumentModule {}
