import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShippingPromotionSchemaClass,
  ShippingPromotionSchema,
} from './shipping-promotion.schema';
import { ShippingPromotionRepository } from '../domain/shipping-promotion.repository';
import { ShippingPromotionDocumentRepository } from './shipping-promotion.repository';

/**
 * Mongoose document module for ShippingPromotion entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ShippingPromotionSchemaClass.name,
        schema: ShippingPromotionSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: ShippingPromotionRepository,
      useClass: ShippingPromotionDocumentRepository,
    },
  ],
  exports: [ShippingPromotionRepository, MongooseModule],
})
export class ShippingPromotionDocumentModule {}
