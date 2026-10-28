import { Module } from '@nestjs/common';
import { ProductInventoriesController } from './product-inventories.controller';
import { ProductInventoriesService } from './product-inventories.service';
import { ProductInventoriesDocumentModule } from './model/product-inventory-document.module';
import { NhanhModule } from '../nhanh/nhanh.module';
import { ProductsModule } from '../products/products.module';

/**
 * Inventory module
 * Provides business logic and API endpoints for inventory
 */
@Module({
  imports: [ProductInventoriesDocumentModule, NhanhModule, ProductsModule],
  controllers: [ProductInventoriesController],
  providers: [ProductInventoriesService],
  exports: [ProductInventoriesService, ProductInventoriesDocumentModule],
})
export class ProductInventoriesModule {}
