import { Module } from '@nestjs/common';
import { ZaloZnsController } from './zalo-zns.controller';
import { ZaloZnsService } from './zalo-zns.service';
import { ZaloOaAuthModule } from '../oa-auth/zalo-oa-auth.module';

@Module({
  imports: [ZaloOaAuthModule],
  controllers: [ZaloZnsController],
  providers: [ZaloZnsService],
  exports: [ZaloZnsService],
})
export class ZaloZnsModule {}
