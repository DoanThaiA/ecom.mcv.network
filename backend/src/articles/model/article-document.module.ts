import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleSchemaClass, ArticleSchema } from './article.schema';
import { ArticleDocumentRepository } from './article.repository';
import { ArticleRepository } from '../domain/article.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ArticleSchemaClass.name, schema: ArticleSchema },
    ]),
  ],
  providers: [
    {
      provide: ArticleRepository,
      useClass: ArticleDocumentRepository,
    },
  ],
  exports: [ArticleRepository, MongooseModule],
})
export class ArticleDocumentModule {}
