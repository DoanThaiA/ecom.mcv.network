import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Import from main app
import { FlashSaleRepository } from '@app/flash-sales/domain/flash-sale.repository';
import { FlashSaleDocumentRepository } from '@app/flash-sales/model/flash-sale.repository';
import {
  FlashSaleSchemaClass,
  FlashSaleSchema,
} from '@app/flash-sales/model/flash-sale.schema';
import { ProductRepository } from '@app/products/domain/product.repository';
import { ProductDocumentRepository } from '@app/products/model/product.repository';
import {
  ProductSchemaClass,
  ProductSchema,
} from '@app/products/model/product.schema';
import { PromotionRepository } from '@app/promotions/domain/promotion.repository';
import { PromotionRepositoryImpl } from '@app/promotions/model/promotion.repository';
import {
  PromotionSchemaClass,
  PromotionSchema,
} from '@app/promotions/model/promotion.schema';
import { FlashSaleProductRepository } from '@app/flash-sale-products/domain/flash-sale-product.repository';
import { FlashSaleProductDocumentRepository } from '@app/flash-sale-products/model/flash-sale-product.repository';
import {
  FlashSaleProductSchemaClass,
  FlashSaleProductSchema,
} from '@app/flash-sale-products/model/flash-sale-product.schema';
import { PromotionProductRepository } from '@app/promotion-products/domain/promotion-product.repository';
import { PromotionProductDocumentRepository } from '@app/promotion-products/model/promotion-product.repository';
import {
  PromotionProductSchemaClass,
  PromotionProductSchema,
} from '@app/promotion-products/model/promotion-product.schema';
import { ProductCommissionRepository } from '@app/product-commissions/domain/product-commission.repository';
import { ProductCommissionDocumentRepository } from '@app/product-commissions/model/product-commission.repository';
import {
  ProductCommissionSchemaClass,
  ProductCommissionSchema,
} from '@app/product-commissions/model/product-commission.schema';
import { AffiliateRepository } from '@app/affiliates/domain/affiliate.repository';
import { AffiliateDocumentRepository } from '@app/affiliates/model/affiliate.repository';
import {
  AffiliateSchemaClass,
  AffiliateSchema,
} from '@app/affiliates/model/affiliate.schema';
import { CommissionSettingsRepository } from '@app/commission-settings/domain/commission-settings.repository';
import { CommissionSettingsDocumentRepository } from '@app/commission-settings/model/commission-settings.repository';
import {
  CommissionSettingsSchemaClass,
  CommissionSettingsSchema,
} from '@app/commission-settings/model/commission-settings.schema';
import { AffiliateOrderCommissionRepository } from '@app/affiliate-order-commissions/domain/affiliate-order-commission.repository';
import { AffiliateOrderCommissionDocumentRepository } from '@app/affiliate-order-commissions/model/affiliate-order-commission.repository';
import {
  AffiliateOrderCommissionSchemaClass,
  AffiliateOrderCommissionSchema,
} from '@app/affiliate-order-commissions/model/affiliate-order-commission.schema';
import { WithdrawalRequestRepository } from '@app/withdrawal-requests/domain/withdrawal-request.repository';
import { WithdrawalRequestDocumentRepository } from '@app/withdrawal-requests/model/withdrawal-request.repository';
import {
  WithdrawalRequestSchemaClass,
  WithdrawalRequestSchema,
} from '@app/withdrawal-requests/model/withdrawal-request.schema';

// Recommendation pre-computation dependencies
import { RecommendationsService } from '@app/recommendations/recommendations.service';
import { ProductViewsService } from '@app/product-views/product-views.service';
import { ProductViewRepository } from '@app/product-views/domain/product-view.repository';
import { ProductViewDocumentRepository } from '@app/product-views/model/product-view.repository';
import {
  ProductViewSchemaClass,
  ProductViewSchema,
} from '@app/product-views/model/product-view.schema';
import { ProductRecommendationRepository } from '@app/recommendations/domain/product-recommendation.repository';
import { ProductRecommendationDocumentRepository } from '@app/recommendations/model/product-recommendation.repository';
import {
  ProductRecommendationSchemaClass,
  ProductRecommendationSchema,
} from '@app/recommendations/model/product-recommendation.schema';
import { OrderRepository } from '@app/shop/order/domain/order.repository';
import { OrderDocumentRepository } from '@app/shop/order/model/order.repository';
import {
  OrderSchemaClass,
  OrderSchema,
} from '@app/shop/order/model/order.schema';
import {
  OrderCounterSchemaClass,
  OrderCounterSchema,
} from '@app/shop/order/model/order-counter.schema';

// Telegram
import { TelegramModule } from '@app/telegram/telegram.module';

// Cron jobs
import { FlashSaleSyncCron } from '../crons/flash-sale-sync.cron';
import { ProductDiscountSyncCron } from '../crons/product-discount-sync.cron';
import { PricingSyncCron } from '../crons/pricing-sync.cron';
import { CommissionProductSyncCron } from '../crons/commission-product-sync.cron';
import { AffiliateBalanceAuditCron } from '../crons/affiliate-balance-audit.cron';
import { RecommendationPrecomputeCron } from '../crons/recommendation-precompute.cron';

/**
 * Module chua cac cron job cho worker
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlashSaleSchemaClass.name, schema: FlashSaleSchema },
      { name: ProductSchemaClass.name, schema: ProductSchema },
      { name: PromotionSchemaClass.name, schema: PromotionSchema },
      {
        name: FlashSaleProductSchemaClass.name,
        schema: FlashSaleProductSchema,
      },
      {
        name: PromotionProductSchemaClass.name,
        schema: PromotionProductSchema,
      },
      {
        name: ProductCommissionSchemaClass.name,
        schema: ProductCommissionSchema,
      },
      { name: AffiliateSchemaClass.name, schema: AffiliateSchema },
      {
        name: CommissionSettingsSchemaClass.name,
        schema: CommissionSettingsSchema,
      },
      {
        name: AffiliateOrderCommissionSchemaClass.name,
        schema: AffiliateOrderCommissionSchema,
      },
      {
        name: WithdrawalRequestSchemaClass.name,
        schema: WithdrawalRequestSchema,
      },
      // Recommendation pre-computation schemas
      { name: ProductViewSchemaClass.name, schema: ProductViewSchema },
      {
        name: ProductRecommendationSchemaClass.name,
        schema: ProductRecommendationSchema,
      },
      { name: OrderSchemaClass.name, schema: OrderSchema },
      { name: OrderCounterSchemaClass.name, schema: OrderCounterSchema },
    ]),
    TelegramModule,
  ],
  providers: [
    FlashSaleSyncCron,
    ProductDiscountSyncCron,
    PricingSyncCron,
    CommissionProductSyncCron,
    AffiliateBalanceAuditCron,
    RecommendationPrecomputeCron,
    {
      provide: FlashSaleRepository,
      useClass: FlashSaleDocumentRepository,
    },
    {
      provide: ProductRepository,
      useClass: ProductDocumentRepository,
    },
    {
      provide: PromotionRepository,
      useClass: PromotionRepositoryImpl,
    },
    {
      provide: FlashSaleProductRepository,
      useClass: FlashSaleProductDocumentRepository,
    },
    {
      provide: PromotionProductRepository,
      useClass: PromotionProductDocumentRepository,
    },
    {
      provide: ProductCommissionRepository,
      useClass: ProductCommissionDocumentRepository,
    },
    {
      provide: AffiliateRepository,
      useClass: AffiliateDocumentRepository,
    },
    {
      provide: CommissionSettingsRepository,
      useClass: CommissionSettingsDocumentRepository,
    },
    {
      provide: AffiliateOrderCommissionRepository,
      useClass: AffiliateOrderCommissionDocumentRepository,
    },
    {
      provide: WithdrawalRequestRepository,
      useClass: WithdrawalRequestDocumentRepository,
    },
    // Recommendation pre-computation providers
    RecommendationsService,
    ProductViewsService,
    {
      provide: ProductViewRepository,
      useClass: ProductViewDocumentRepository,
    },
    {
      provide: ProductRecommendationRepository,
      useClass: ProductRecommendationDocumentRepository,
    },
    {
      provide: OrderRepository,
      useClass: OrderDocumentRepository,
    },
  ],
})
export class CronsModule {}
