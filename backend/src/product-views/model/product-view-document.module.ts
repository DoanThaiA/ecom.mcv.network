import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductViewSchemaClass,
  ProductViewSchema,
} from './product-view.schema';
import { ProductViewRepository } from '../domain/product-view.repository';
import { ProductViewDocumentRepository } from './product-view.repository';

/**
 * Mongoose document module for ProductView entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductViewSchemaClass.name, schema: ProductViewSchema },
    ]),
  ],
  providers: [
    {
      provide: ProductViewRepository,
      useClass: ProductViewDocumentRepository,
    },
  ],
  exports: [ProductViewRepository, MongooseModule],
})
export class ProductViewDocumentModule {}
