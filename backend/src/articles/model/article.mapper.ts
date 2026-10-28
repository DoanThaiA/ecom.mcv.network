import mongoose from 'mongoose';
import { Article } from '../domain/article';
import { ArticleStatus } from '../domain/article-status.enum';

/**
 * Mapper to convert between domain Article and Mongoose ArticleSchemaClass
 */
export class ArticleMapper {
  /**
   * Convert from Mongoose document to domain entity
   */
  static toDomain(raw: any): Article {
    const article = new Article();
    article.id = raw._id ? raw._id.toString() : '';
    article.title = raw.title;
    article.titleLocalization = raw.titleLocalization || null;
    article.content = raw.content;
    article.contentLocalization = raw.contentLocalization || null;
    article.thumbnail = raw.thumbnail;
    article.status = raw.status ?? ArticleStatus.ACTIVE;
    article.publishedAt = raw.publishedAt;
    article.createdAt = raw.createdAt;
    article.updatedAt = raw.updatedAt;
    article.deletedAt = raw.deletedAt || null;
    return article;
  }

  /**
   * Convert from domain entity to Mongoose document
   */
  static toDocument(article: Article): Record<string, any> {
    const document: Record<string, any> = {
      title: article.title,
      titleLocalization: article.titleLocalization,
      content: article.content,
      contentLocalization: article.contentLocalization,
      thumbnail: article.thumbnail,
      status: article.status,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };

    if (article.id) {
      document._id = new mongoose.Types.ObjectId(article.id);
    }

    if (article.deletedAt !== undefined) {
      document.deletedAt = article.deletedAt;
    }

    return document;
  }
}
