import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FlashSaleProductSchemaClass,
  FlashSaleProductSchema,
} from './flash-sale-product.schema';
import { FlashSaleProductRepository } from '../domain/flash-sale-product.repository';
import { FlashSaleProductDocumentRepository } from './flash-sale-product.repository';

/**
 * Mongoose document module for FlashSaleProduct entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FlashSaleProductSchemaClass.name,
        schema: FlashSaleProductSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: FlashSaleProductRepository,
      useClass: FlashSaleProductDocumentRepository,
    },
  ],
  exports: [FlashSaleProductRepository, MongooseModule],
})
export class FlashSaleProductDocumentModule {}
