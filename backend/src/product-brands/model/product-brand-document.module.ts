import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductBrandSchemaClass,
  ProductBrandSchema,
} from './product-brand.schema';
import { ProductBrandRepository } from '../domain/product-brand.repository';
import { ProductBrandDocumentRepository } from './product-brand.repository';

/**
 * Module for brand persistence layer using MongoDB
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductBrandSchemaClass.name, schema: ProductBrandSchema },
    ]),
  ],
  providers: [
    {
      provide: ProductBrandRepository,
      useClass: ProductBrandDocumentRepository,
    },
  ],
  exports: [ProductBrandRepository, MongooseModule],
})
export class ProductBrandDocumentModule {}
