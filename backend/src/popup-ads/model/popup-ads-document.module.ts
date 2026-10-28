import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PopupAdsSchemaClass, PopupAdsSchema } from './popup-ads.schema';
import { PopupAdsDocumentRepository } from './popup-ads.repository';
import { PopupAdsRepository } from '../domain/popup-ads.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PopupAdsSchemaClass.name, schema: PopupAdsSchema },
    ]),
  ],
  providers: [
    {
      provide: PopupAdsRepository,
      useClass: PopupAdsDocumentRepository,
    },
  ],
  exports: [PopupAdsRepository, MongooseModule],
})
export class PopupAdsDocumentModule {}
