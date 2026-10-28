import { Module } from '@nestjs/common';
import { MenusController } from './menus.controller';
import { ShopMenusController } from './shop-menus.controller';
import { MenusService } from './menus.service';
import { MenuDocumentModule } from './model/menu-document.module';
import { ProductCategoryDocumentModule } from '../product-categories/model/product-category-document.module';
import { TopicDocumentModule } from '../topics/model/topic-document.module';

/**
 * Module for menu management (CMS + Shop)
 */
@Module({
  imports: [
    MenuDocumentModule,
    ProductCategoryDocumentModule,
    TopicDocumentModule,
  ],
  controllers: [MenusController, ShopMenusController],
  providers: [MenusService],
  exports: [MenusService, MenuDocumentModule],
})
export class MenusModule {}
