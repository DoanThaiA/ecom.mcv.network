import { Module } from '@nestjs/common';
import { ShopComboController } from './shop-combo.controller';
import { ShopComboService } from './shop-combo.service';
import { ComboDocumentModule } from '../../combos/model/combo-document.module';
import { ProductDocumentModule } from '../../products/model/product-document.module';

/**
 * Shop combo module for public combo endpoints
 */
@Module({
  imports: [ComboDocumentModule, ProductDocumentModule],
  controllers: [ShopComboController],
  providers: [ShopComboService],
  exports: [ShopComboService],
})
export class ShopComboModule {}
