import { Module } from '@nestjs/common';
import { ShippingSettingsController } from './shipping-settings.controller';
import { ShippingSettingsService } from './shipping-settings.service';
import { ShippingSettingsDocumentModule } from './model/shipping-settings-document.module';

const infrastructurePersistenceModule = ShippingSettingsDocumentModule;

@Module({
  imports: [infrastructurePersistenceModule],
  controllers: [ShippingSettingsController],
  providers: [ShippingSettingsService],
  exports: [ShippingSettingsService, infrastructurePersistenceModule],
})
export class ShippingSettingsModule {}
