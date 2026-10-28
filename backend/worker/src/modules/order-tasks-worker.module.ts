import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';

import { orderTaskQueueName } from '@app/utils/env';
import { OrderTasksProcessor } from '../processors/order-tasks.processor';

// Order
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

// User (required by OrderCdpSyncService)
import { UserRepository } from '@app/users/domain/user.repository';
import { UsersDocumentRepository } from '@app/users/model/user.repository';
import { UserSchemaClass, UserSchema } from '@app/users/model/user.schema';

// Secret (required by CdpService, NhanhAuthService, ZaloOaAuthService)
import { SecretRepository } from '@app/secret/secret.repository';
import { SecretSchemaClass, SecretSchema } from '@app/secret/secret.schema';

// Product (required by OrderNhanhSyncService, AffiliateOrderCommissionsService)
import { ProductRepository } from '@app/products/domain/product.repository';
import { ProductDocumentRepository } from '@app/products/model/product.repository';
import {
  ProductSchemaClass,
  ProductSchema,
} from '@app/products/model/product.schema';

// Promotions
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
import { PromotionUsageRecordRepository } from '@app/promotion-usage-records/domain/promotion-usage-record.repository';
import { PromotionUsageRecordDocumentRepository } from '@app/promotion-usage-records/model/promotion-usage-record.repository';
import {
  PromotionUsageRecordSchemaClass,
  PromotionUsageRecordSchema,
} from '@app/promotion-usage-records/model/promotion-usage-record.schema';

// Affiliate
import { AffiliateOrderCommissionRepository } from '@app/affiliate-order-commissions/domain/affiliate-order-commission.repository';
import { AffiliateOrderCommissionDocumentRepository } from '@app/affiliate-order-commissions/model/affiliate-order-commission.repository';
import {
  AffiliateOrderCommissionSchemaClass,
  AffiliateOrderCommissionSchema,
} from '@app/affiliate-order-commissions/model/affiliate-order-commission.schema';
import { AffiliateRepository } from '@app/affiliates/domain/affiliate.repository';
import { AffiliateDocumentRepository } from '@app/affiliates/model/affiliate.repository';
import {
  AffiliateSchemaClass,
  AffiliateSchema,
} from '@app/affiliates/model/affiliate.schema';
import { AffiliateTrackingRepository } from '@app/affiliate-tracking/domain/affiliate-tracking.repository';
import { AffiliateTrackingDocumentRepository } from '@app/affiliate-tracking/model/affiliate-tracking-event.repository';
import {
  AffiliateTrackingEventSchemaClass,
  AffiliateTrackingEventSchema,
} from '@app/affiliate-tracking/model/affiliate-tracking-event.schema';
import { ProductCommissionRepository } from '@app/product-commissions/domain/product-commission.repository';
import { ProductCommissionDocumentRepository } from '@app/product-commissions/model/product-commission.repository';
import {
  ProductCommissionSchemaClass,
  ProductCommissionSchema,
} from '@app/product-commissions/model/product-commission.schema';
import { CommissionSettingsRepository } from '@app/commission-settings/domain/commission-settings.repository';
import { CommissionSettingsDocumentRepository } from '@app/commission-settings/model/commission-settings.repository';
import {
  CommissionSettingsSchemaClass,
  CommissionSettingsSchema,
} from '@app/commission-settings/model/commission-settings.schema';

// Telegram
import { TelegramModule } from '@app/telegram/telegram.module';

// Services
import { CdpService } from '@app/cdp/cdp.service';
import { OrderCdpSyncService } from '@app/cdp/order-cdp-sync.service';
import { NhanhAuthService } from '@app/nhanh/services/nhanh-auth.service';
import { NhanhService } from '@app/nhanh/services/nhanh.service';
import { OrderNhanhSyncService } from '@app/nhanh/services/order-nhanh-sync.service';
import { OrderConfirmationService } from '@app/shop/order-confirmation/order-confirmation.service';
import { ZaloZnsService } from '@app/zalo/zns/zalo-zns.service';
import { ZaloOaAuthService } from '@app/zalo/oa-auth/zalo-oa-auth.service';
import { AffiliateOrderCommissionsService } from '@app/affiliate-order-commissions/affiliate-order-commissions.service';

/**
 * Worker module for processing order post-processing tasks.
 * Provides OrderTasksProcessor and all required dependencies.
 */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: OrderSchemaClass.name, schema: OrderSchema },
      { name: OrderCounterSchemaClass.name, schema: OrderCounterSchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: SecretSchemaClass.name, schema: SecretSchema },
      { name: ProductSchemaClass.name, schema: ProductSchema },
      // Promotions
      { name: PromotionSchemaClass.name, schema: PromotionSchema },
      {
        name: PromotionProductSchemaClass.name,
        schema: PromotionProductSchema,
      },
      {
        name: PromotionUsageRecordSchemaClass.name,
        schema: PromotionUsageRecordSchema,
      },
      // Affiliate
      {
        name: AffiliateOrderCommissionSchemaClass.name,
        schema: AffiliateOrderCommissionSchema,
      },
      { name: AffiliateSchemaClass.name, schema: AffiliateSchema },
      {
        name: AffiliateTrackingEventSchemaClass.name,
        schema: AffiliateTrackingEventSchema,
      },
      {
        name: ProductCommissionSchemaClass.name,
        schema: ProductCommissionSchema,
      },
      {
        name: CommissionSettingsSchemaClass.name,
        schema: CommissionSettingsSchema,
      },
    ]),
    BullModule.registerQueue({ name: orderTaskQueueName }),
    TelegramModule,
  ],
  providers: [
    OrderTasksProcessor,
    // CDP services
    CdpService,
    OrderCdpSyncService,
    SecretRepository,
    { provide: OrderRepository, useClass: OrderDocumentRepository },
    { provide: UserRepository, useClass: UsersDocumentRepository },
    // Nhanh services
    NhanhAuthService,
    NhanhService,
    OrderNhanhSyncService,
    { provide: ProductRepository, useClass: ProductDocumentRepository },
    // Order confirmation + Zalo ZNS
    OrderConfirmationService,
    ZaloZnsService,
    ZaloOaAuthService,
    // Affiliate commissions
    AffiliateOrderCommissionsService,
    {
      provide: AffiliateOrderCommissionRepository,
      useClass: AffiliateOrderCommissionDocumentRepository,
    },
    {
      provide: AffiliateRepository,
      useClass: AffiliateDocumentRepository,
    },
    {
      provide: AffiliateTrackingRepository,
      useClass: AffiliateTrackingDocumentRepository,
    },
    {
      provide: ProductCommissionRepository,
      useClass: ProductCommissionDocumentRepository,
    },
    {
      provide: CommissionSettingsRepository,
      useClass: CommissionSettingsDocumentRepository,
    },
    // Promotions
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
  ],
})
export class OrderTasksWorkerModule {}
