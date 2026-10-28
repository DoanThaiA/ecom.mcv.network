import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchemaClass, ProductSchema } from './product.schema';
import { ProductRepository } from '../domain/product.repository';
import { ProductDocumentRepository } from './product.repository';

/**
 * Mongoose document module for Product entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductSchemaClass.name, schema: ProductSchema },
    ]),
  ],
  providers: [
    {
      provide: ProductRepository,
      useClass: ProductDocumentRepository,
    },
  ],
  exports: [ProductRepository, MongooseModule],
})
export class ProductDocumentModule {}
