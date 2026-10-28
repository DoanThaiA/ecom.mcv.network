import { Module } from '@nestjs/common';
import { InfocmsService } from './infocms.service';
import { InfocmsWebhookController } from './infocms-webhook.controller';
import { OrderDocumentModule } from '../../shop/order/model/order-document.module';
import { CheckoutPaymentHandlerModule } from '../../shop/checkout/checkout-payment-handler.module';
import { TelegramModule } from '../../telegram/telegram.module';

@Module({
  imports: [OrderDocumentModule, CheckoutPaymentHandlerModule, TelegramModule],
  controllers: [InfocmsWebhookController],
  providers: [InfocmsService],
  exports: [InfocmsService],
})
export class InfocmsModule {}
