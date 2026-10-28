import { Module } from '@nestjs/common';
import { GlobalProductCommissionsController } from './global-product-commissions.controller';
import { AffiliateProductCommissionsController } from './affiliate-product-commissions.controller';
import { ProductCommissionsService } from './product-commissions.service';
import { ProductCommissionDocumentModule } from './model/product-commission-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { CommissionSettingsDocumentModule } from '../commission-settings/model/commission-settings-document.module';
import { AffiliateDocumentModule } from '../affiliates/model/affiliate-document.module';

const infrastructurePersistenceModule = ProductCommissionDocumentModule;

@Module({
  imports: [
    infrastructurePersistenceModule,
    ProductDocumentModule,
    CommissionSettingsDocumentModule,
    AffiliateDocumentModule,
  ],
  controllers: [
    GlobalProductCommissionsController,
    AffiliateProductCommissionsController,
  ],
  providers: [ProductCommissionsService],
  exports: [ProductCommissionsService, infrastructurePersistenceModule],
})
export class ProductCommissionsModule {}
