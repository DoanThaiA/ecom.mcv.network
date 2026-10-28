import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CdpService } from './cdp.service';
import { CdpSyncService } from './cdp-sync.service';
import { OrderCdpSyncService } from './order-cdp-sync.service';
import { SecretModule } from '../secret/secret.module';
import { OrderDocumentModule } from '../shop/order/model/order-document.module';
import { UserDocumentModule } from '../users/model/user-document.module';

@Module({
  imports: [
    ConfigModule,
    SecretModule,
    OrderDocumentModule,
    UserDocumentModule,
  ],
  providers: [CdpService, CdpSyncService, OrderCdpSyncService],
  exports: [CdpService, CdpSyncService, OrderCdpSyncService],
})
export class CdpModule {}
