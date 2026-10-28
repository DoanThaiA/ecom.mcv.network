import { Module } from '@nestjs/common';
import { ShopFlashSaleController } from './shop-flash-sale.controller';
import { ShopFlashSaleService } from './shop-flash-sale.service';
import { FlashSaleDocumentModule } from '../../flash-sales/model/flash-sale-document.module';
import { FlashSaleProductDocumentModule } from '../../flash-sale-products/model/flash-sale-product-document.module';
import { ProductDocumentModule } from '../../products/model/product-document.module';
import { TopicDocumentModule } from '../../topics/model/topic-document.module';

/**
 * Shop flash sale module for public flash sale endpoints
 */
@Module({
  imports: [
    FlashSaleDocumentModule,
    FlashSaleProductDocumentModule,
    ProductDocumentModule,
    TopicDocumentModule,
  ],
  controllers: [ShopFlashSaleController],
  providers: [ShopFlashSaleService],
  exports: [ShopFlashSaleService],
})
export class ShopFlashSaleModule {}
