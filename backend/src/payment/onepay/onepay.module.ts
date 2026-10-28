import { Module } from '@nestjs/common';
import { OnepayService } from './onepay.service';
import { OnepayWebhookController } from './onepay-webhook.controller';
import { OrderDocumentModule } from '../../shop/order/model/order-document.module';
import { CheckoutPaymentHandlerModule } from '../../shop/checkout/checkout-payment-handler.module';
import { TelegramModule } from '../../telegram/telegram.module';

@Module({
  imports: [OrderDocumentModule, CheckoutPaymentHandlerModule, TelegramModule],
  controllers: [OnepayWebhookController],
  providers: [OnepayService],
  exports: [OnepayService],
})
export class OnepayModule {}
