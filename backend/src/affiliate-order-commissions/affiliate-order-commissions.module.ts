import { Module } from '@nestjs/common';
import { AffiliateOrderCommissionsController } from './affiliate-order-commissions.controller';
import { AffiliateOrderCommissionsService } from './affiliate-order-commissions.service';
import { AffiliateOrderCommissionDocumentModule } from './model/affiliate-order-commission-document.module';
import { AffiliateDocumentModule } from '../affiliates/model/affiliate-document.module';
import { ProductCommissionDocumentModule } from '../product-commissions/model/product-commission-document.module';
import { CommissionSettingsDocumentModule } from '../commission-settings/model/commission-settings-document.module';
import { AffiliateTrackingEventDocumentModule } from '../affiliate-tracking/model/affiliate-tracking-event-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';

@Module({
  imports: [
    AffiliateOrderCommissionDocumentModule,
    AffiliateDocumentModule,
    ProductCommissionDocumentModule,
    CommissionSettingsDocumentModule,
    AffiliateTrackingEventDocumentModule,
    ProductDocumentModule,
  ],
  controllers: [AffiliateOrderCommissionsController],
  providers: [AffiliateOrderCommissionsService],
  exports: [
    AffiliateOrderCommissionsService,
    AffiliateOrderCommissionDocumentModule,
  ],
})
export class AffiliateOrderCommissionsModule {}
