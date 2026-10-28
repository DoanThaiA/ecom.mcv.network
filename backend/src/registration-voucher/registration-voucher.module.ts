import { Module } from '@nestjs/common';
import { RegistrationVoucherService } from './registration-voucher.service';
import { AdminConfigModule } from '../admin-config/admin-config.module';
import { CdpModule } from '../cdp/cdp.module';
import { ZaloZnsModule } from '../zalo/zns/zalo-zns.module';

@Module({
  imports: [AdminConfigModule, CdpModule, ZaloZnsModule],
  providers: [RegistrationVoucherService],
  exports: [RegistrationVoucherService],
})
export class RegistrationVoucherModule {}
