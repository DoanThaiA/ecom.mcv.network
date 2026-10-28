import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductDocumentModule } from './model/product-document.module';
import { NhanhModule } from '../nhanh/nhanh.module';

/**
 * Products module
 * Provides business logic and API endpoints for products
 */
@Module({
  imports: [ProductDocumentModule, NhanhModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, ProductDocumentModule],
})
export class ProductsModule {}
