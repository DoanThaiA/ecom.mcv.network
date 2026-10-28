import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EsmsService } from './esms.service';
import { EsmsController } from './esms.controller';

@Module({
  imports: [ConfigModule],
  controllers: [EsmsController],
  providers: [EsmsService],
  exports: [EsmsService],
})
export class EsmsModule {}
