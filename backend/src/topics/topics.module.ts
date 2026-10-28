import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { TopicDocumentModule } from './model/topic-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { ProductCategoryDocumentModule } from '../product-categories/model/product-category-document.module';
import { NhanhModule } from '../nhanh/nhanh.module';

/**
 * Module for topic management (CMS)
 */
@Module({
  imports: [
    TopicDocumentModule,
    ProductDocumentModule,
    ProductCategoryDocumentModule,
    NhanhModule,
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService, TopicDocumentModule],
})
export class TopicsModule {}
