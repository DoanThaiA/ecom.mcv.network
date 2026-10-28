import { Module } from '@nestjs/common';
import { CheckoutPaymentHandlerService } from './checkout-payment-handler.service';
import { CheckoutSessionDocumentModule } from './model/checkout-session-document.module';
import { CartDocumentModule } from '../cart/model/cart-document.module';
import { SystemTasksModule } from '../../system-tasks/system-tasks.module';
import { OrderTasksModule } from '../../order-tasks/order-tasks.module';
import { CommissionSettingsDocumentModule } from '../../commission-settings/model/commission-settings-document.module';
import { TelegramModule } from '../../telegram/telegram.module';

/**
 * Module for CheckoutPaymentHandlerService
 * Separated to avoid circular dependency between CheckoutModule and OnepayModule
 */
@Module({
  imports: [
    CheckoutSessionDocumentModule,
    CartDocumentModule,
    SystemTasksModule,
    OrderTasksModule,
    CommissionSettingsDocumentModule,
    TelegramModule,
  ],
  providers: [CheckoutPaymentHandlerService],
  exports: [CheckoutPaymentHandlerService],
})
export class CheckoutPaymentHandlerModule {}
