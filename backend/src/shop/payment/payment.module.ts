import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { OnepayModule } from '../../payment/onepay/onepay.module';
import { InfocmsModule } from '../../payment/infocms/infocms.module';

@Module({
  imports: [OnepayModule, InfocmsModule],
  controllers: [PaymentController],
})
export class PaymentModule {}
