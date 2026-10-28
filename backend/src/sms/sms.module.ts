import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SmsService } from './sms.service';
import { EsmsModule } from './esms/esms.module';

@Module({
  imports: [ConfigModule, EsmsModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
