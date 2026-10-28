import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { GiftValidationService } from './gift-validation.service';
import { CartDocumentModule } from './model/cart-document.module';
import { ProductDocumentModule } from '../../products/model/product-document.module';
import { ComboDocumentModule } from '../../combos/model/combo-document.module';
import { FlashSaleDocumentModule } from '../../flash-sales/model/flash-sale-document.module';
import { FlashSaleProductDocumentModule } from '../../flash-sale-products/model/flash-sale-product-document.module';
import { ShopAuthGuard } from '../guards/shop-auth.guard';
import { PromotionsModule } from '../../promotions/promotions.module';
import { SocketModule } from '../../socket/socket.module';

/**
 * Cart module for shopping cart functionality
 * Includes GiftValidationService for validating gift eligibility
 */
@Module({
  imports: [
    CartDocumentModule,
    ProductDocumentModule,
    ComboDocumentModule,
    FlashSaleDocumentModule,
    FlashSaleProductDocumentModule,
    PromotionsModule,
    SocketModule,
    JwtModule.register({}),
  ],
  controllers: [CartController],
  providers: [CartService, GiftValidationService, ShopAuthGuard],
  exports: [CartService, GiftValidationService, CartDocumentModule],
})
export class CartModule {}
