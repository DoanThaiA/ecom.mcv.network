import { Module } from '@nestjs/common';
import { FlashSalesController } from './flash-sales.controller';
import { FlashSalesService } from './flash-sales.service';
import { FlashSaleDocumentModule } from './model/flash-sale-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { FlashSaleProductDocumentModule } from '../flash-sale-products/model/flash-sale-product-document.module';

/**
 * Module for managing flash sales
 * Flash sale sync cron runs in worker
 */
@Module({
  imports: [
    FlashSaleDocumentModule,
    ProductDocumentModule,
    FlashSaleProductDocumentModule,
  ],
  controllers: [FlashSalesController],
  providers: [FlashSalesService],
  exports: [FlashSalesService, FlashSaleDocumentModule],
})
export class FlashSalesModule {}
