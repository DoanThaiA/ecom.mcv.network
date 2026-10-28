import { Module } from '@nestjs/common';
import { ProductBannerDocumentModule } from './model/product-banner-document.module';
import { ProductBannersService } from './product-banners.service';
import { CmsProductBannersController } from './controllers/cms-product-banners.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductBannerDocumentModule, ProductsModule],
  controllers: [CmsProductBannersController],
  providers: [ProductBannersService],
  exports: [ProductBannersService],
})
export class ProductBannersModule {}
