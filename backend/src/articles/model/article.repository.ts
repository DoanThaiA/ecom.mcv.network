import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  ArticleRepository,
  FilterArticleDto,
  SortArticleDto,
} from '../domain/article.repository';
import { Article } from '../domain/article';
import { ArticleSchemaClass } from './article.schema';
import { ArticleMapper } from './article.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { ArticleStatus } from '../domain/article-status.enum';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of ArticleRepository
 */
@Injectable()
export class ArticleDocumentRepository implements ArticleRepository {
  constructor(
    @InjectModel(ArticleSchemaClass.name)
    private readonly articleModel: PaginateModel<ArticleSchemaClass>,
  ) {}

  /**
   * Create a new article
   */
  async create(
    data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Article> {
    const now = new Date();
    const persistenceModel = ArticleMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as Article);

    const createdArticle = new this.articleModel(persistenceModel);
    const articleDocument = await createdArticle.save();
    const leanArticle = articleDocument.toObject();
    return ArticleMapper.toDomain(leanArticle);
  }

  /**
   * Find articles with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterArticleDto | null;
    sortOptions?: SortArticleDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Article>> {
    const filter: FilterQuery<ArticleSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }

      if (filterOptions.search) {
        filter.title = { $regex: escapeRegex(filterOptions.search), $options: 'i' };
      }
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      // Default sort by publishedAt descending
      sort.publishedAt = -1;
    }

    const result = await this.articleModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ArticleMapper.toDomain(doc)),
    };
  }

  /**
   * Find article by ID
   */
  async findById(id: Article['id']): Promise<NullableType<Article>> {
    const articleDocument = await this.articleModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    return articleDocument ? ArticleMapper.toDomain(articleDocument) : null;
  }

  /**
   * Find active articles with pagination (for shop frontend)
   */
  async findActiveWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<PaginateResult<Article>> {
    const filter: FilterQuery<ArticleSchemaClass> = {
      status: ArticleStatus.ACTIVE,
      deletedAt: null,
    };

    const result = await this.articleModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort: { publishedAt: -1 },
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ArticleMapper.toDomain(doc)),
    };
  }

  /**
   * Update existing article
   */
  async update(
    id: Article['id'],
    payload: DeepPartial<Article>,
  ): Promise<NullableType<Article>> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.titleLocalization !== undefined)
      updateData.titleLocalization = payload.titleLocalization;
    if (payload.content !== undefined) updateData.content = payload.content;
    if (payload.contentLocalization !== undefined)
      updateData.contentLocalization = payload.contentLocalization;
    if (payload.thumbnail !== undefined)
      updateData.thumbnail = payload.thumbnail;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.publishedAt !== undefined)
      updateData.publishedAt = payload.publishedAt;

    const updatedArticle = await this.articleModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return updatedArticle ? ArticleMapper.toDomain(updatedArticle) : null;
  }

  /**
   * Soft delete article
   */
  async remove(id: Article['id']): Promise<void> {
    await this.articleModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }
}
