import { Module } from '@nestjs/common';
import { AffiliatePortalController } from './affiliate-portal.controller';
import { AffiliatesModule } from '../affiliates/affiliates.module';
import { AffiliateOrderCommissionsModule } from '../affiliate-order-commissions/affiliate-order-commissions.module';
import { WithdrawalRequestsModule } from '../withdrawal-requests/withdrawal-requests.module';
import { ProductCommissionsModule } from '../product-commissions/product-commissions.module';

@Module({
  imports: [
    AffiliatesModule,
    AffiliateOrderCommissionsModule,
    WithdrawalRequestsModule,
    ProductCommissionsModule,
  ],
  controllers: [AffiliatePortalController],
})
export class AffiliatePortalModule {}
