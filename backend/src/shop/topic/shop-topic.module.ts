import { Module } from '@nestjs/common';
import { ShopTopicController } from './shop-topic.controller';
import { ShopTopicService } from './shop-topic.service';
import { TopicDocumentModule } from '../../topics/model/topic-document.module';
import { ProductDocumentModule } from '../../products/model/product-document.module';
import { ProductCategoryDocumentModule } from '../../product-categories/model/product-category-document.module';
import { NhanhModule } from '../../nhanh/nhanh.module';

/**
 * Shop topic module for public topic endpoints
 */
@Module({
  imports: [
    TopicDocumentModule,
    ProductDocumentModule,
    ProductCategoryDocumentModule,
    NhanhModule,
  ],
  controllers: [ShopTopicController],
  providers: [ShopTopicService],
  exports: [ShopTopicService],
})
export class ShopTopicModule {}
