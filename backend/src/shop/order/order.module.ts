import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrderController } from './order.controller';
import { CmsOrderController } from './cms-order.controller';
import { OrderService } from './order.service';
import { OrderDocumentModule } from './model/order-document.module';
import { OnepayModule } from '../../payment/onepay/onepay.module';
import { InfocmsModule } from '../../payment/infocms/infocms.module';
import { ShopAuthGuard } from '../guards/shop-auth.guard';
import { OrderConfirmationModule } from '../order-confirmation/order-confirmation.module';
import { NhanhModule } from '../../nhanh/nhanh.module';
import { OrderTasksModule } from '../../order-tasks/order-tasks.module';

/**
 * Order module for order management
 * Note: Order creation is handled through the checkout flow only.
 * CMS order management is read-only. Updates come via webhook from nhanh.vn
 * Post-payment tasks (CDP/Nhanh sync, affiliate) are queued via OrderTasksModule
 */
@Module({
  imports: [
    OrderDocumentModule,
    OrderConfirmationModule,
    NhanhModule,
    OnepayModule,
    InfocmsModule,
    OrderTasksModule,
    JwtModule.register({}),
  ],
  controllers: [OrderController, CmsOrderController],
  providers: [OrderService, ShopAuthGuard],
  exports: [OrderService, OrderDocumentModule],
})
export class OrderModule {}
