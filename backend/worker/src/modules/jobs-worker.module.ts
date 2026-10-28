import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

// Import from main app
import { JobSchemaClass, JobSchema } from '@app/jobs/model/job.schema';
import { JobRepository } from '@app/jobs/domain/job.repository';
import { JobDocumentRepository } from '@app/jobs/model/job.repository';
import { JobsService } from '@app/jobs/jobs.service';
import { NhanhAuthService } from '@app/nhanh/services/nhanh-auth.service';

// Worker-specific services
import { NhanhSyncService } from '../services/nhanh-sync.service';
import { ProductRepository } from '@app/products/domain/product.repository';
import { ProductDocumentRepository } from '@app/products/model/product.repository';
import {
  ProductSchemaClass,
  ProductSchema,
} from '@app/products/model/product.schema';
import { ProductCategoryRepository } from '@app/product-categories/domain/product-category.repository';
import { ProductCategoryDocumentRepository } from '@app/product-categories/model/product-category.repository';
import {
  ProductCategorySchemaClass,
  ProductCategorySchema,
} from '@app/product-categories/model/product-category.schema';
import { ProductInventoryRepository } from '@app/product-inventories/domain/product-inventory.repository';
import { ProductInventoryDocumentRepository } from '@app/product-inventories/model/product-inventory.repository';
import {
  ProductInventorySchemaClass,
  ProductInventorySchema,
} from '@app/product-inventories/model/product-inventory.schema';
import { ProductBrandRepository } from '@app/product-brands/domain/product-brand.repository';
import { ProductBrandDocumentRepository } from '@app/product-brands/model/product-brand.repository';
import {
  ProductBrandSchemaClass,
  ProductBrandSchema,
} from '@app/product-brands/model/product-brand.schema';
import { DepotRepository } from '@app/depots/domain/depot.repository';
import { DepotDocumentRepository } from '@app/depots/model/depot.repository';
import { DepotSchemaClass, DepotSchema } from '@app/depots/model/depot.schema';
import { SecretRepository } from '@app/secret/secret.repository';
import { SecretSchemaClass, SecretSchema } from '@app/secret/secret.schema';
import { jobQueueName } from '@app/utils/env';

// Flash sale import dependencies
import { ImportSessionRepository } from '@app/import-sessions/domain/import-session.repository';
import { ImportSessionDocumentRepository } from '@app/import-sessions/model/import-session.repository';
import {
  ImportSessionSchemaClass,
  ImportSessionSchema,
} from '@app/import-sessions/model/import-session.schema';
import { ImportSessionRowRepository } from '@app/import-sessions/domain/import-session-row.repository';
import { ImportSessionRowDocumentRepository } from '@app/import-sessions/model/import-session-row.repository';
import {
  ImportSessionRowSchemaClass,
  ImportSessionRowSchema,
} from '@app/import-sessions/model/import-session-row.schema';
import { FlashSalesService } from '@app/flash-sales/flash-sales.service';
import { FlashSaleRepository } from '@app/flash-sales/domain/flash-sale.repository';
import { FlashSaleDocumentRepository } from '@app/flash-sales/model/flash-sale.repository';
import {
  FlashSaleSchemaClass,
  FlashSaleSchema,
} from '@app/flash-sales/model/flash-sale.schema';
import { FlashSaleProductRepository } from '@app/flash-sale-products/domain/flash-sale-product.repository';
import { FlashSaleProductDocumentRepository } from '@app/flash-sale-products/model/flash-sale-product.repository';
import {
  FlashSaleProductSchemaClass,
  FlashSaleProductSchema,
} from '@app/flash-sale-products/model/flash-sale-product.schema';

// Product discount import dependencies
import { PromotionsService } from '@app/promotions/promotions.service';
import { PromotionRepository } from '@app/promotions/domain/promotion.repository';
import { PromotionRepositoryImpl } from '@app/promotions/model/promotion.repository';
import {
  PromotionSchemaClass,
  PromotionSchema,
} from '@app/promotions/model/promotion.schema';
import { PromotionProductRepository } from '@app/promotion-products/domain/promotion-product.repository';
import { PromotionProductDocumentRepository } from '@app/promotion-products/model/promotion-product.repository';
import {
  PromotionProductSchemaClass,
  PromotionProductSchema,
} from '@app/promotion-products/model/promotion-product.schema';
import { BundleDealHandler } from '@app/promotions/handlers/bundle-deal.handler';
import { OrderDiscountHandler } from '@app/promotions/handlers/order-discount.handler';
import { ProductDiscountHandler } from '@app/promotions/handlers/product-discount.handler';
import { PromotionUsageRecordRepository } from '@app/promotion-usage-records/domain/promotion-usage-record.repository';
import { PromotionUsageRecordDocumentRepository } from '@app/promotion-usage-records/model/promotion-usage-record.repository';
import {
  PromotionUsageRecordSchemaClass,
  PromotionUsageRecordSchema,
} from '@app/promotion-usage-records/model/promotion-usage-record.schema';

// Commission rate recalculation dependencies
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

// Topic import dependencies
import { TopicsService } from '@app/topics/topics.service';
import { TopicRepository } from '@app/topics/domain/topic.repository';
import { TopicDocumentRepository } from '@app/topics/model/topic.repository';
import { TopicSchemaClass, TopicSchema } from '@app/topics/model/topic.schema';

// Telegram
import { TelegramModule } from '@app/telegram/telegram.module';

// Worker processor
import { JobsProcessor } from '../processors/jobs.processor';

/**
 * Module for processing jobs from the job queue
 * Contains JobsProcessor and all required dependencies
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobSchemaClass.name, schema: JobSchema },
      { name: ProductSchemaClass.name, schema: ProductSchema },
      { name: ProductCategorySchemaClass.name, schema: ProductCategorySchema },
      {
        name: ProductInventorySchemaClass.name,
        schema: ProductInventorySchema,
      },
      { name: ProductBrandSchemaClass.name, schema: ProductBrandSchema },
      { name: DepotSchemaClass.name, schema: DepotSchema },
      { name: SecretSchemaClass.name, schema: SecretSchema },
      // Flash sale import schemas
      { name: ImportSessionSchemaClass.name, schema: ImportSessionSchema },
      {
        name: ImportSessionRowSchemaClass.name,
        schema: ImportSessionRowSchema,
      },
      { name: FlashSaleSchemaClass.name, schema: FlashSaleSchema },
      {
        name: FlashSaleProductSchemaClass.name,
        schema: FlashSaleProductSchema,
      },
      // Product discount import schemas
      { name: PromotionSchemaClass.name, schema: PromotionSchema },
      {
        name: PromotionUsageRecordSchemaClass.name,
        schema: PromotionUsageRecordSchema,
      },
      {
        name: PromotionProductSchemaClass.name,
        schema: PromotionProductSchema,
      },
      // Commission rate recalculation schemas
      {
        name: ProductCommissionSchemaClass.name,
        schema: ProductCommissionSchema,
      },
      { name: AffiliateSchemaClass.name, schema: AffiliateSchema },
      {
        name: CommissionSettingsSchemaClass.name,
        schema: CommissionSettingsSchema,
      },
      // Recommendation pre-computation schemas
      { name: ProductViewSchemaClass.name, schema: ProductViewSchema },
      {
        name: ProductRecommendationSchemaClass.name,
        schema: ProductRecommendationSchema,
      },
      { name: OrderSchemaClass.name, schema: OrderSchema },
      { name: OrderCounterSchemaClass.name, schema: OrderCounterSchema },
      // Topic import schema
      { name: TopicSchemaClass.name, schema: TopicSchema },
    ]),
    BullModule.registerQueue({
      name: jobQueueName,
    }),
    TelegramModule,
  ],
  providers: [
    JobsProcessor,
    JobsService,
    NhanhSyncService,
    NhanhAuthService,
    {
      provide: JobRepository,
      useClass: JobDocumentRepository,
    },
    {
      provide: ProductRepository,
      useClass: ProductDocumentRepository,
    },
    {
      provide: ProductCategoryRepository,
      useClass: ProductCategoryDocumentRepository,
    },
    {
      provide: ProductInventoryRepository,
      useClass: ProductInventoryDocumentRepository,
    },
    {
      provide: ProductBrandRepository,
      useClass: ProductBrandDocumentRepository,
    },
    {
      provide: DepotRepository,
      useClass: DepotDocumentRepository,
    },
    SecretRepository,
    // Flash sale import providers
    FlashSalesService,
    {
      provide: ImportSessionRepository,
      useClass: ImportSessionDocumentRepository,
    },
    {
      provide: ImportSessionRowRepository,
      useClass: ImportSessionRowDocumentRepository,
    },
    {
      provide: FlashSaleRepository,
      useClass: FlashSaleDocumentRepository,
    },
    {
      provide: FlashSaleProductRepository,
      useClass: FlashSaleProductDocumentRepository,
    },
    // Product discount import providers
    PromotionsService,
    BundleDealHandler,
    OrderDiscountHandler,
    ProductDiscountHandler,
    {
      provide: PromotionRepository,
      useClass: PromotionRepositoryImpl,
    },
    {
      provide: PromotionProductRepository,
      useClass: PromotionProductDocumentRepository,
    },
    {
      provide: PromotionUsageRecordRepository,
      useClass: PromotionUsageRecordDocumentRepository,
    },
    // Commission rate recalculation providers
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
    // Topic import providers
    TopicsService,
    {
      provide: TopicRepository,
      useClass: TopicDocumentRepository,
    },
  ],
})
export class JobsWorkerModule {}
