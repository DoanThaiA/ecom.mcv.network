import { Module } from '@nestjs/common';
import { ShippingPromotionsController } from './shipping-promotions.controller';
import { ShippingPromotionsService } from './shipping-promotions.service';
import { ShippingPromotionDocumentModule } from './model/shipping-promotion-document.module';

/**
 * Module for managing shipping promotions (freeship and shipping discount)
 */
@Module({
  imports: [ShippingPromotionDocumentModule],
  controllers: [ShippingPromotionsController],
  providers: [ShippingPromotionsService],
  exports: [ShippingPromotionsService, ShippingPromotionDocumentModule],
})
export class ShippingPromotionsModule {}
