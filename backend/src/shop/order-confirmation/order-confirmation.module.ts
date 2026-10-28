import { Module } from '@nestjs/common';
import { OrderConfirmationController } from './order-confirmation.controller';
import { OrderConfirmationService } from './order-confirmation.service';
import { OrderDocumentModule } from '../order/model/order-document.module';
import { ZaloZnsModule } from '../../zalo/zns/zalo-zns.module';

/**
 * Order confirmation module for ZNS confirmation links
 * Uses compact HMAC tokens with orderId - no database storage needed
 */
@Module({
  imports: [OrderDocumentModule, ZaloZnsModule],
  controllers: [OrderConfirmationController],
  providers: [OrderConfirmationService],
  exports: [OrderConfirmationService],
})
export class OrderConfirmationModule {}
