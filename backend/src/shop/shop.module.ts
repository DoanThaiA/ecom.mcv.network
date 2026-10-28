import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { ProductCategoryDocumentModule } from '../product-categories/model/product-category-document.module';
import { TopicDocumentModule } from '../topics/model/topic-document.module';
import { BannerDocumentModule } from '../banners/model/banner-document.module';
import { PopupAdsDocumentModule } from '../popup-ads/model/popup-ads-document.module';
import { NhanhModule } from '../nhanh/nhanh.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { CheckoutModule } from './checkout/checkout.module';
import { ShopComboModule } from './combo/shop-combo.module';
import { ShopTopicModule } from './topic/shop-topic.module';
import { ShopFlashSaleModule } from './flash-sale/shop-flash-sale.module';
import { ShippingModule } from './shipping/shipping.module';
import { PaymentModule } from './payment/payment.module';
import { ShopPromotionModule } from './promotion/shop-promotion.module';
import { ShopShippingPromotionsModule } from './shipping-promotions/shop-shipping-promotions.module';
import { SearchKeywordsModule } from '../search-keywords/search-keywords.module';

/**
 * Shop module
 * Provides public endpoints for the storefront/shopping client
 * Includes cart, checkout, order, shipping, combo, flash sale, and promotion functionality
 */
@Module({
  imports: [
    ProductDocumentModule,
    ProductCategoryDocumentModule,
    TopicDocumentModule,
    BannerDocumentModule,
    PopupAdsDocumentModule,
    NhanhModule,
    SearchKeywordsModule,
    CartModule,
    OrderModule,
    CheckoutModule,
    ShopComboModule,
    ShopTopicModule,
    ShopFlashSaleModule,
    ShippingModule,
    PaymentModule,
    ShopPromotionModule,
    ShopShippingPromotionsModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [
    ShopService,
    CartModule,
    OrderModule,
    CheckoutModule,
    ShopComboModule,
    ShopTopicModule,
    ShopFlashSaleModule,
    ShippingModule,
    PaymentModule,
    ShopPromotionModule,
    ShopShippingPromotionsModule,
  ],
})
export class ShopModule {}
