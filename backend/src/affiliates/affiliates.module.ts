import { Module } from '@nestjs/common';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { AffiliateDocumentModule } from './model/affiliate-document.module';
import { CommissionSettingsModule } from '../commission-settings/commission-settings.module';

const infrastructurePersistenceModule = AffiliateDocumentModule;

@Module({
  imports: [infrastructurePersistenceModule, CommissionSettingsModule],
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
  exports: [AffiliatesService, infrastructurePersistenceModule],
})
export class AffiliatesModule {}
