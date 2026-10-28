import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { ArticleRepository } from './domain/article.repository';
import { Article } from './domain/article';
import { ArticleStatus } from './domain/article-status.enum';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { throwException } from '../utils/errors/throw-exception';
import { sanitizeRichText } from '../utils/sanitize';

/**
 * Service for managing articles
 */
@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new article
   */
  async create(dto: CreateArticleDto): Promise<Article> {
    this.logger.debug(`Creating article: ${dto.title}`);

    // Sanitize HTML content to prevent XSS
    const sanitizedContent = sanitizeRichText(dto.content);
    const sanitizedContentLocalization = dto.contentLocalization
      ? {
          vi: dto.contentLocalization.vi
            ? sanitizeRichText(dto.contentLocalization.vi)
            : undefined,
          en: dto.contentLocalization.en
            ? sanitizeRichText(dto.contentLocalization.en)
            : undefined,
        }
      : null;

    const article = await this.articleRepository.create({
      title: dto.title,
      titleLocalization: dto.titleLocalization || null,
      content: sanitizedContent,
      contentLocalization: sanitizedContentLocalization,
      thumbnail: dto.thumbnail,
      status: dto.status ?? ArticleStatus.ACTIVE,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      deletedAt: null,
    });

    return article;
  }

  /**
   * Find all articles with filtering and pagination (CMS)
   */
  async findAll(
    dto: QueryArticlesDto,
    page = 1,
    limit = 10,
  ): Promise<PaginateResult<Article>> {
    this.logger.debug(`Finding articles with filters: ${JSON.stringify(dto)}`);

    const filterOptions: { status?: ArticleStatus; search?: string } = {};

    if (dto.status !== undefined) {
      filterOptions.status = dto.status;
    }
    if (dto.search) {
      filterOptions.search = dto.search;
    }

    const result = await this.articleRepository.findManyWithPagination({
      filterOptions:
        Object.keys(filterOptions).length > 0 ? filterOptions : null,
      sortOptions: [{ orderBy: 'publishedAt', order: 'desc' }],
      paginationOptions: { page, limit },
    });

    return result;
  }

  /**
   * Find a single article by ID (CMS)
   */
  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('article.notFound'),
      });
    }

    return article;
  }

  /**
   * Update an existing article (CMS)
   */
  async update(id: string, dto: UpdateArticleDto): Promise<Article> {
    this.logger.debug(`Updating article ${id}`);

    const existingArticle = await this.articleRepository.findById(id);
    if (!existingArticle) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('article.notFound'),
      });
    }

    const updatePayload: Record<string, any> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.titleLocalization !== undefined)
      updatePayload.titleLocalization = dto.titleLocalization;
    if (dto.content !== undefined)
      updatePayload.content = sanitizeRichText(dto.content);
    if (dto.contentLocalization !== undefined)
      updatePayload.contentLocalization = {
        vi: dto.contentLocalization?.vi
          ? sanitizeRichText(dto.contentLocalization.vi)
          : dto.contentLocalization?.vi,
        en: dto.contentLocalization?.en
          ? sanitizeRichText(dto.contentLocalization.en)
          : dto.contentLocalization?.en,
      };
    if (dto.thumbnail !== undefined) updatePayload.thumbnail = dto.thumbnail;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.publishedAt !== undefined)
      updatePayload.publishedAt = new Date(dto.publishedAt);

    const updatedArticle = await this.articleRepository.update(
      id,
      updatePayload,
    );

    if (!updatedArticle) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('article.notFound'),
      });
    }

    return updatedArticle;
  }

  /**
   * Soft delete an article (CMS)
   */
  async remove(id: string): Promise<void> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('article.notFound'),
      });
    }

    await this.articleRepository.remove(id);
    this.logger.debug(`Deleted article ${id}`);
  }

  /**
   * Find active articles with pagination (Shop - public)
   */
  async findActiveArticles(
    page = 1,
    limit = 10,
  ): Promise<PaginateResult<Article>> {
    return this.articleRepository.findActiveWithPagination({ page, limit });
  }

  /**
   * Find a single active article by ID (Shop - public)
   */
  async findActiveById(id: string): Promise<Article> {
    const article = await this.articleRepository.findById(id);

    if (!article || article.status !== ArticleStatus.ACTIVE) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('article.notFound'),
      });
    }

    return article;
  }
}
