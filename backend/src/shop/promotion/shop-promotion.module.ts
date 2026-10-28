import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ShopPromotionController } from './shop-promotion.controller';
import { ShopPromotionService } from './shop-promotion.service';
import { PromotionsModule } from '../../promotions/promotions.module';
import { ProductDocumentModule } from '../../products/model/product-document.module';
import { CartModule } from '../cart/cart.module';
import { ShopAuthGuard } from '../guards/shop-auth.guard';
import { CdpModule } from '../../cdp/cdp.module';
import { CheckoutModule } from '../checkout/checkout.module';
import { UserDocumentModule } from '../../users/model/user-document.module';
import { PromotionProductDocumentModule } from '../../promotion-products/model/promotion-product-document.module';
import { PromotionUsageRecordDocumentModule } from '../../promotion-usage-records/model/promotion-usage-record-document.module';
import { ShippingPromotionDocumentModule } from '../../shipping-promotions/model/shipping-promotion-document.module';
import { ProductPromotionHighlightsController } from './product-promotion-highlights.controller';
import { ProductPromotionHighlightsService } from './product-promotion-highlights.service';

/**
 * Shop promotion module for gift promotion functionality
 * Handles "Mua để nhận quà" (Buy to Get Gift) flow
 */
@Module({
  imports: [
    PromotionsModule,
    ProductDocumentModule,
    CartModule,
    JwtModule.register({}),
    CdpModule,
    CheckoutModule,
    UserDocumentModule,
    PromotionProductDocumentModule,
    PromotionUsageRecordDocumentModule,
    ShippingPromotionDocumentModule,
  ],
  controllers: [ShopPromotionController, ProductPromotionHighlightsController],
  providers: [
    ShopPromotionService,
    ProductPromotionHighlightsService,
    ShopAuthGuard,
  ],
  exports: [ShopPromotionService, ProductPromotionHighlightsService],
})
export class ShopPromotionModule {}
