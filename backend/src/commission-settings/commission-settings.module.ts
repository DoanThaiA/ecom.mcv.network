import { Module } from '@nestjs/common';
import { CommissionSettingsController } from './commission-settings.controller';
import { CommissionSettingsService } from './commission-settings.service';
import { CommissionSettingsDocumentModule } from './model/commission-settings-document.module';
import { JobsModule } from '../jobs/jobs.module';

const infrastructurePersistenceModule = CommissionSettingsDocumentModule;

@Module({
  imports: [infrastructurePersistenceModule, JobsModule],
  controllers: [CommissionSettingsController],
  providers: [CommissionSettingsService],
  exports: [CommissionSettingsService, infrastructurePersistenceModule],
})
export class CommissionSettingsModule {}
