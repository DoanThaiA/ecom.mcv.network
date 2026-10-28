import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ShopShippingPromotionsController } from './shop-shipping-promotions.controller';
import { ShopShippingPromotionsService } from './shop-shipping-promotions.service';
import { CheckoutModule } from '../checkout/checkout.module';
import { ShopAuthGuard } from '../guards/shop-auth.guard';

/**
 * Shop shipping promotions module
 * Handles shipping promotion operations for checkout sessions
 */
@Module({
  imports: [CheckoutModule, JwtModule.register({})],
  controllers: [ShopShippingPromotionsController],
  providers: [ShopShippingPromotionsService, ShopAuthGuard],
  exports: [ShopShippingPromotionsService],
})
export class ShopShippingPromotionsModule {}
