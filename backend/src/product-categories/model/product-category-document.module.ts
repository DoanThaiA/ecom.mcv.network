import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductCategorySchemaClass,
  ProductCategorySchema,
} from './product-category.schema';
import { ProductCategoryRepository } from '../domain/product-category.repository';
import { ProductCategoryDocumentRepository } from './product-category.repository';

/**
 * Mongoose document module for ProductCategory entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductCategorySchemaClass.name, schema: ProductCategorySchema },
    ]),
  ],
  providers: [
    {
      provide: ProductCategoryRepository,
      useClass: ProductCategoryDocumentRepository,
    },
  ],
  exports: [ProductCategoryRepository, MongooseModule],
})
export class ProductCategoryDocumentModule {}
