import { Module } from '@nestjs/common';

import { NhanhWebhookService } from '@app/nhanh/services/nhanh-webhook.service';
import { OrderCdpSyncService } from '@app/cdp/order-cdp-sync.service';
import { CdpService } from '@app/cdp/cdp.service';
import { ProductDocumentModule } from '@app/products/model/product-document.module';
import { ProductCategoryDocumentModule } from '@app/product-categories/model/product-category-document.module';
import { ProductInventoriesDocumentModule } from '@app/product-inventories/model/product-inventory-document.module';
import { OrderDocumentModule } from '@app/shop/order/model/order-document.module';
import { UserDocumentModule } from '@app/users/model/user-document.module';
import { SecretModule } from '@app/secret/secret.module';
import { OrderTasksModule } from '@app/order-tasks/order-tasks.module';
import { CommissionSettingsDocumentModule } from '@app/commission-settings/model/commission-settings-document.module';
import { TelegramModule } from '@app/telegram/telegram.module';
import { WebhookHealthModule } from '@app/webhook-health/webhook-health.module';

import { NhanhWebhookController } from './nhanh-webhook.controller';

/**
 * Module for handling Nhanh webhook requests in the worker.
 * Receives and processes webhook HTTP requests directly.
 */
@Module({
  imports: [
    WebhookHealthModule,
    ProductDocumentModule,
    ProductCategoryDocumentModule,
    ProductInventoriesDocumentModule,
    OrderDocumentModule,
    UserDocumentModule,
    SecretModule,
    OrderTasksModule,
    CommissionSettingsDocumentModule,
    TelegramModule,
  ],
  controllers: [NhanhWebhookController],
  providers: [NhanhWebhookService, OrderCdpSyncService, CdpService],
})
export class WebhookModule {}
