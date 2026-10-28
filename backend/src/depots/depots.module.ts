import { Module } from '@nestjs/common';
import { DepotDocumentModule } from './model/depot-document.module';
import { DepotsController } from './depots.controller';
import { DepotsService } from './depots.service';
import { NhanhModule } from '../nhanh/nhanh.module';

/**
 * Module for depot management
 * Provides depot repository, service, and controller
 */
@Module({
  imports: [DepotDocumentModule, NhanhModule],
  controllers: [DepotsController],
  providers: [DepotsService],
  exports: [DepotDocumentModule, DepotsService],
})
export class DepotsModule {}
