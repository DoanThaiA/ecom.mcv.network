import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CommissionSettingsSchema,
  CommissionSettingsSchemaClass,
} from './commission-settings.schema';
import { CommissionSettingsRepository } from '../domain/commission-settings.repository';
import { CommissionSettingsDocumentRepository } from './commission-settings.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CommissionSettingsSchemaClass.name,
        schema: CommissionSettingsSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: CommissionSettingsRepository,
      useClass: CommissionSettingsDocumentRepository,
    },
  ],
  exports: [CommissionSettingsRepository],
})
export class CommissionSettingsDocumentModule {}
