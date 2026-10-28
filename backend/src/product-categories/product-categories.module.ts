import { Module } from '@nestjs/common';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoryDocumentModule } from './model/product-category-document.module';
import { NhanhModule } from '../nhanh/nhanh.module';

/**
 * ProductCategories module
 * Provides business logic and API endpoints for categories
 */
@Module({
  imports: [ProductCategoryDocumentModule, NhanhModule],
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesService],
  exports: [ProductCategoriesService, ProductCategoryDocumentModule],
})
export class ProductCategoriesModule {}
