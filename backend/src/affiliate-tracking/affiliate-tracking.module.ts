import { Module } from '@nestjs/common';
import { AffiliateTrackingController } from './affiliate-tracking.controller';
import { AffiliateTrackingService } from './affiliate-tracking.service';
import { AffiliateTrackingEventDocumentModule } from './model/affiliate-tracking-event-document.module';
import { AffiliateDocumentModule } from '../affiliates/model/affiliate-document.module';

@Module({
  imports: [AffiliateTrackingEventDocumentModule, AffiliateDocumentModule],
  controllers: [AffiliateTrackingController],
  providers: [AffiliateTrackingService],
  exports: [AffiliateTrackingService, AffiliateTrackingEventDocumentModule],
})
export class AffiliateTrackingModule {}
