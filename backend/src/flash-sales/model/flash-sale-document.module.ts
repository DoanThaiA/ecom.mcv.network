import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashSaleSchemaClass, FlashSaleSchema } from './flash-sale.schema';
import { FlashSaleRepository } from '../domain/flash-sale.repository';
import { FlashSaleDocumentRepository } from './flash-sale.repository';

/**
 * Mongoose document module for FlashSale entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlashSaleSchemaClass.name, schema: FlashSaleSchema },
    ]),
  ],
  providers: [
    {
      provide: FlashSaleRepository,
      useClass: FlashSaleDocumentRepository,
    },
  ],
  exports: [FlashSaleRepository, MongooseModule],
})
export class FlashSaleDocumentModule {}
