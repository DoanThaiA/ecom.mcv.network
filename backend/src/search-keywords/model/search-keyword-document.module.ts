import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SearchKeywordSchemaClass,
  SearchKeywordSchema,
} from './search-keyword.schema';
import { SearchKeywordRepository } from '../domain/search-keyword.repository';
import { SearchKeywordDocumentRepository } from './search-keyword.repository';

/**
 * Mongoose document module for SearchKeyword entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SearchKeywordSchemaClass.name, schema: SearchKeywordSchema },
    ]),
  ],
  providers: [
    {
      provide: SearchKeywordRepository,
      useClass: SearchKeywordDocumentRepository,
    },
  ],
  exports: [SearchKeywordRepository],
})
export class SearchKeywordDocumentModule {}
