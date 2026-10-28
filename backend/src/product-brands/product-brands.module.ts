import { Module } from '@nestjs/common';
import { ProductBrandsController } from './product-brands.controller';
import { ProductBrandsService } from './product-brands.service';
import { ProductBrandDocumentModule } from './model/product-brand-document.module';
import { NhanhModule } from '../nhanh/nhanh.module';

/**
 * Product Brands module
 * Provides business logic and API endpoints for product brands
 */
@Module({
  imports: [ProductBrandDocumentModule, NhanhModule],
  controllers: [ProductBrandsController],
  providers: [ProductBrandsService],
  exports: [ProductBrandsService, ProductBrandDocumentModule],
})
export class ProductBrandsModule {}
