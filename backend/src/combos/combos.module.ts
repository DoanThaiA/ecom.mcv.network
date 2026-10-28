import { Module } from '@nestjs/common';
import { CombosController } from './combos.controller';
import { CombosService } from './combos.service';
import { ComboDocumentModule } from './model/combo-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';

/**
 * Module for combo management
 */
@Module({
  imports: [ComboDocumentModule, ProductDocumentModule],
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService, ComboDocumentModule],
})
export class CombosModule {}
