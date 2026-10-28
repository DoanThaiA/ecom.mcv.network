import { Module } from '@nestjs/common';
import { ColorVariantDocumentModule } from './model/color-variant-document.module';
import { ColorVariantsService } from './color-variants.service';
import { CmsColorVariantsController } from './controllers/cms-color-variants.controller';
import { ShopColorVariantsController } from './controllers/shop-color-variants.controller';

@Module({
  imports: [ColorVariantDocumentModule],
  controllers: [CmsColorVariantsController, ShopColorVariantsController],
  providers: [ColorVariantsService],
  exports: [ColorVariantsService],
})
export class ColorVariantsModule {}
