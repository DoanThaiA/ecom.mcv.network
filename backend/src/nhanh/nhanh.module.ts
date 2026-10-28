import { Module } from '@nestjs/common';
import { NhanhController } from './nhanh.controller';
import { NhanhAuthService } from './services/nhanh-auth.service';
import { NhanhService } from './services/nhanh.service';
import { NhanhLocationService } from './services/nhanh-location.service';
import { NhanhShippingService } from './services/nhanh-shipping.service';
import { OrderNhanhSyncService } from './services/order-nhanh-sync.service';
import { SecretModule } from '../secret/secret.module';
import { OrderDocumentModule } from '../shop/order/model/order-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { JobsModule } from '../jobs/jobs.module';
import { WebhookHealthModule } from '../webhook-health/webhook-health.module';

@Module({
  imports: [
    WebhookHealthModule,
    SecretModule,
    OrderDocumentModule,
    ProductDocumentModule,
    JobsModule,
  ],
  controllers: [NhanhController],
  providers: [
    NhanhAuthService,
    NhanhService,
    NhanhLocationService,
    NhanhShippingService,
    OrderNhanhSyncService,
  ],
  exports: [
    NhanhAuthService,
    NhanhService,
    NhanhLocationService,
    NhanhShippingService,
    OrderNhanhSyncService,
  ],
})
export class NhanhModule {}
