import { Module } from '@nestjs/common';
import { PromotionDocumentModule } from './model/promotion-document.module';
import { PromotionRepository } from './domain/promotion.repository';
import { PromotionRepositoryImpl } from './model/promotion.repository';
import { BundleDealHandler } from './handlers/bundle-deal.handler';
import { OrderDiscountHandler } from './handlers/order-discount.handler';
import { ProductDiscountHandler } from './handlers/product-discount.handler';
import { PromotionsService } from './promotions.service';
import { PromotionStatsService } from './promotion-stats.service';
import { PromotionsController } from './promotions.controller';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { FlashSaleDocumentModule } from '../flash-sales/model/flash-sale-document.module';
import { FlashSaleProductDocumentModule } from '../flash-sale-products/model/flash-sale-product-document.module';
import { PromotionProductDocumentModule } from '../promotion-products/model/promotion-product-document.module';
import { OrderDocumentModule } from '../shop/order/model/order-document.module';
import { PromotionUsageRecordDocumentModule } from '../promotion-usage-records/model/promotion-usage-record-document.module';

@Module({
  imports: [
    PromotionDocumentModule,
    ProductDocumentModule,
    FlashSaleDocumentModule,
    FlashSaleProductDocumentModule,
    PromotionProductDocumentModule,
    OrderDocumentModule,
    PromotionUsageRecordDocumentModule,
  ],
  controllers: [PromotionsController],
  providers: [
    {
      provide: PromotionRepository,
      useClass: PromotionRepositoryImpl,
    },
    BundleDealHandler,
    OrderDiscountHandler,
    ProductDiscountHandler,
    PromotionsService,
    PromotionStatsService,
  ],
  exports: [
    PromotionsService,
    OrderDiscountHandler,
    ProductDiscountHandler,
    PromotionRepository,
  ],
})
export class PromotionsModule {}
