import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProductViewsController } from './product-views.controller';
import { ProductViewsService } from './product-views.service';
import { ProductViewDocumentModule } from './model/product-view-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';

/**
 * Product views module
 * Provides product view tracking and query capabilities
 */
@Module({
  imports: [ProductViewDocumentModule, ProductDocumentModule, JwtModule],
  controllers: [ProductViewsController],
  providers: [ProductViewsService],
  exports: [ProductViewsService, ProductViewDocumentModule],
})
export class ProductViewsModule {}
