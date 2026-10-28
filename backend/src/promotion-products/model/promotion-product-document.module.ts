import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PromotionProductSchemaClass,
  PromotionProductSchema,
} from './promotion-product.schema';
import { PromotionProductRepository } from '../domain/promotion-product.repository';
import { PromotionProductDocumentRepository } from './promotion-product.repository';

/**
 * Mongoose document module for PromotionProduct entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PromotionProductSchemaClass.name,
        schema: PromotionProductSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: PromotionProductRepository,
      useClass: PromotionProductDocumentRepository,
    },
  ],
  exports: [PromotionProductRepository, MongooseModule],
})
export class PromotionProductDocumentModule {}
