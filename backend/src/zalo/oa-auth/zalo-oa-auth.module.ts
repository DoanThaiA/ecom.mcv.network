import { Module } from '@nestjs/common';
import { ZaloOaAuthController } from './zalo-oa-auth.controller';
import { ZaloOaAuthService } from './zalo-oa-auth.service';
import { SecretModule } from '../../secret/secret.module';

@Module({
  imports: [SecretModule],
  controllers: [ZaloOaAuthController],
  providers: [ZaloOaAuthService],
  exports: [ZaloOaAuthService],
})
export class ZaloOaAuthModule {}
