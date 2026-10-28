import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CheckoutUtilsService } from './services/checkout-utils.service';
import { CheckoutShippingService } from './services/checkout-shipping.service';
import { CheckoutVoucherService } from './services/checkout-voucher.service';
import { CheckoutProductDiscountService } from './services/checkout-product-discount.service';
import { CheckoutSessionBuilderService } from './services/checkout-session-builder.service';
import { CheckoutOrderService } from './services/checkout-order.service';
import { CheckoutSessionDocumentModule } from './model/checkout-session-document.module';
import { ProductDocumentModule } from '../../products/model/product-document.module';
import { CartModule } from '../cart/cart.module';
import { CartDocumentModule } from '../cart/model/cart-document.module';
import { FlashSaleDocumentModule } from '../../flash-sales/model/flash-sale-document.module';
import { FlashSaleProductDocumentModule } from '../../flash-sale-products/model/flash-sale-product-document.module';
import { OrderDocumentModule } from '../order/model/order-document.module';
import { ComboDocumentModule } from '../../combos/model/combo-document.module';
import { CdpModule } from '../../cdp/cdp.module';
import { OnepayModule } from '../../payment/onepay/onepay.module';
import { InfocmsModule } from '../../payment/infocms/infocms.module';
import { ShopAuthGuard } from '../guards/shop-auth.guard';
import { ShippingModule } from '../shipping/shipping.module';
import { OrderModule } from '../order/order.module';
import { UserDocumentModule } from '../../users/model/user-document.module';
import { PromotionsModule } from '../../promotions/promotions.module';
import { PromotionProductDocumentModule } from '../../promotion-products/model/promotion-product-document.module';
import { ShippingSettingsDocumentModule } from '../../shipping-settings/model/shipping-settings-document.module';
import { ShippingPromotionsModule } from '../../shipping-promotions/shipping-promotions.module';
import { AffiliateDocumentModule } from '../../affiliates/model/affiliate-document.module';
import { SystemTasksModule } from '../../system-tasks/system-tasks.module';
import { OrderTasksModule } from '../../order-tasks/order-tasks.module';
import { CommissionSettingsDocumentModule } from '../../commission-settings/model/commission-settings-document.module';
import { TelegramModule } from '../../telegram/telegram.module';

/**
 * Checkout module for single-page checkout/session management
 * Provides checkout session stage between cart and order
 *
 * Flow: Cart -> Checkout Session -> Order
 * Post-payment tasks (CDP/Nhanh sync, ZNS, affiliate) are queued via OrderTasksModule
 */
@Module({
  imports: [
    CheckoutSessionDocumentModule,
    ProductDocumentModule,
    CartModule,
    CartDocumentModule,
    FlashSaleDocumentModule,
    FlashSaleProductDocumentModule,
    OrderDocumentModule,
    ComboDocumentModule,
    CdpModule,
    OnepayModule,
    InfocmsModule,
    JwtModule.register({}),
    ShippingModule,
    OrderModule,
    UserDocumentModule,
    PromotionsModule,
    PromotionProductDocumentModule,
    ShippingSettingsDocumentModule,
    ShippingPromotionsModule,
    AffiliateDocumentModule,
    SystemTasksModule,
    OrderTasksModule,
    CommissionSettingsDocumentModule,
    TelegramModule,
  ],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    CheckoutUtilsService,
    CheckoutShippingService,
    CheckoutVoucherService,
    CheckoutProductDiscountService,
    CheckoutSessionBuilderService,
    CheckoutOrderService,
    ShopAuthGuard,
  ],
  exports: [CheckoutService, CheckoutSessionDocumentModule],
})
export class CheckoutModule {}
