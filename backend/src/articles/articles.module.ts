import { Module } from '@nestjs/common';
import { ArticleDocumentModule } from './model/article-document.module';
import { ArticlesService } from './articles.service';
import { CmsArticlesController } from './controllers/cms-articles.controller';
import { ShopArticlesController } from './controllers/shop-articles.controller';

@Module({
  imports: [ArticleDocumentModule],
  controllers: [CmsArticlesController, ShopArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
