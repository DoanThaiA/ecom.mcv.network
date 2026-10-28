import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Article } from './article';
import { ArticleStatus } from './article-status.enum';

/**
 * Filter options for querying articles
 */
export interface FilterArticleDto {
  status?: ArticleStatus;
  search?: string;
}

/**
 * Sort options for querying articles
 */
export interface SortArticleDto {
  orderBy: 'publishedAt' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for Article entity
 * Defines the contract for article data access operations
 */
export abstract class ArticleRepository {
  /**
   * Create a new article
   * @param data - Article data
   * @returns Created article
   */
  abstract create(
    data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Article>;

  /**
   * Find articles with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with articles
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterArticleDto | null;
    sortOptions?: SortArticleDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Article>>;

  /**
   * Find article by ID
   * @param id - Article ID
   * @returns Article or null if not found
   */
  abstract findById(id: Article['id']): Promise<NullableType<Article>>;

  /**
   * Find active articles with pagination (for shop frontend)
   * @param paginationOptions - Pagination options
   * @returns Paginated result with active articles sorted by publishedAt desc
   */
  abstract findActiveWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<PaginateResult<Article>>;

  /**
   * Update existing article
   * @param id - Article ID
   * @param payload - Partial article data to update
   * @returns Updated article or null if not found
   */
  abstract update(
    id: Article['id'],
    payload: DeepPartial<Article>,
  ): Promise<NullableType<Article>>;

  /**
   * Soft delete article
   * @param id - Article ID
   */
  abstract remove(id: Article['id']): Promise<void>;
}
