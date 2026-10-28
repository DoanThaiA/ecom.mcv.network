import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductBannerSchemaClass,
  ProductBannerSchema,
} from './product-banner.schema';
import { ProductBannerDocumentRepository } from './product-banner.repository';
import { ProductBannerRepository } from '../domain/product-banner.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductBannerSchemaClass.name, schema: ProductBannerSchema },
    ]),
  ],
  providers: [
    {
      provide: ProductBannerRepository,
      useClass: ProductBannerDocumentRepository,
    },
  ],
  exports: [ProductBannerRepository, MongooseModule],
})
export class ProductBannerDocumentModule {}
