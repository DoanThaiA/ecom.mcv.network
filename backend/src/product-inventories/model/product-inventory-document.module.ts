import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductInventorySchemaClass,
  ProductInventorySchema,
} from './product-inventory.schema';
import { ProductInventoryRepository } from '../domain/product-inventory.repository';
import { ProductInventoryDocumentRepository } from './product-inventory.repository';

/**
 * Mongoose document module for Inventory entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductInventorySchemaClass.name,
        schema: ProductInventorySchema,
      },
    ]),
  ],
  providers: [
    {
      provide: ProductInventoryRepository,
      useClass: ProductInventoryDocumentRepository,
    },
  ],
  exports: [ProductInventoryRepository, MongooseModule],
})
export class ProductInventoriesDocumentModule {}
