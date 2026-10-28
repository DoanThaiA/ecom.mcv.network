import { Module } from '@nestjs/common';
import { SearchKeywordsService } from './search-keywords.service';
import { SearchKeywordDocumentModule } from './model/search-keyword-document.module';

/**
 * Search keywords module
 * Provides keyword tracking and top keywords query capabilities
 */
@Module({
  imports: [SearchKeywordDocumentModule],
  providers: [SearchKeywordsService],
  exports: [SearchKeywordsService],
})
export class SearchKeywordsModule {}
