import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShippingSettingsSchema,
  ShippingSettingsSchemaClass,
} from './shipping-settings.schema';
import { ShippingSettingsRepository } from '../domain/shipping-settings.repository';
import { ShippingSettingsDocumentRepository } from './shipping-settings.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ShippingSettingsSchemaClass.name,
        schema: ShippingSettingsSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: ShippingSettingsRepository,
      useClass: ShippingSettingsDocumentRepository,
    },
  ],
  exports: [ShippingSettingsRepository],
})
export class ShippingSettingsDocumentModule {}
