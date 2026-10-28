import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Topic, TopicProduct, TopicCategory, TopicBanner } from './topic';
import { TopicStatus } from './topic-status.enum';

/**
 * Filter options for querying topics
 */
export interface FilterTopicDto {
  status?: TopicStatus;
  search?: string;
  businessId?: string;
}

/**
 * Sort options for querying topics
 */
export interface SortTopicDto {
  orderBy: 'createdAt' | 'name' | 'order';
  order: 'asc' | 'desc';
}

/**
 * Abstract repository interface for Topic entity
 * Defines the contract for topic data access operations
 */
export abstract class TopicRepository {
  /**
   * Create a new topic
   * @param data - Topic data
   * @returns Created topic
   */
  abstract create(
    data: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Topic>;

  /**
   * Find topics with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with topics
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTopicDto | null;
    sortOptions?: SortTopicDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Topic>>;

  /**
   * Find topic by ID
   * @param id - Topic ID
   * @returns Topic or null if not found
   */
  abstract findById(id: Topic['id']): Promise<NullableType<Topic>>;

  /**
   * Find topic by slug within a business
   * @param businessId - Business ID
   * @param slug - Topic slug
   * @returns Topic or null if not found
   */
  abstract findBySlug(
    businessId: string,
    slug: string,
  ): Promise<NullableType<Topic>>;

  /**
   * Find active topics by businessId (ordered by 'order' field)
   * @param businessId - Business ID
   * @returns Array of active topics ordered by display order
   */
  abstract findActiveByBusinessId(businessId: string): Promise<Topic[]>;

  /**
   * Find topics containing a specific product
   * @param productId - Product ID
   * @returns Array of topics containing the product
   */
  abstract findByProductId(productId: string): Promise<Topic[]>;

  /**
   * Update existing topic
   * @param id - Topic ID
   * @param payload - Partial topic data to update
   * @returns Updated topic or null if not found
   */
  abstract update(
    id: Topic['id'],
    payload: DeepPartial<Topic>,
  ): Promise<NullableType<Topic>>;

  /**
   * Add products to topic
   * @param id - Topic ID
   * @param products - Products to add with their order
   * @returns Updated topic or null if not found
   */
  abstract addProducts(
    id: Topic['id'],
    products: TopicProduct[],
  ): Promise<NullableType<Topic>>;

  /**
   * Remove products from topic
   * @param id - Topic ID
   * @param productIds - Product IDs to remove
   * @returns Updated topic or null if not found
   */
  abstract removeProducts(
    id: Topic['id'],
    productIds: string[],
  ): Promise<NullableType<Topic>>;

  /**
   * Reorder products within topic
   * @param id - Topic ID
   * @param products - Products with new order values
   * @returns Updated topic or null if not found
   */
  abstract reorderProducts(
    id: Topic['id'],
    products: TopicProduct[],
  ): Promise<NullableType<Topic>>;

  /**
   * Add categories to topic
   * @param id - Topic ID
   * @param categories - Categories to add with their order
   * @returns Updated topic or null if not found
   */
  abstract addCategories(
    id: Topic['id'],
    categories: TopicCategory[],
  ): Promise<NullableType<Topic>>;

  /**
   * Remove categories from topic
   * @param id - Topic ID
   * @param categoryIds - Category IDs to remove
   * @returns Updated topic or null if not found
   */
  abstract removeCategories(
    id: Topic['id'],
    categoryIds: string[],
  ): Promise<NullableType<Topic>>;

  /**
   * Reorder categories within topic
   * @param id - Topic ID
   * @param categories - Categories with new order values
   * @returns Updated topic or null if not found
   */
  abstract reorderCategories(
    id: Topic['id'],
    categories: TopicCategory[],
  ): Promise<NullableType<Topic>>;

  /**
   * Add banners to topic
   * @param id - Topic ID
   * @param banners - Banners to add with their order
   * @returns Updated topic or null if not found
   */
  abstract addBanners(
    id: Topic['id'],
    banners: TopicBanner[],
  ): Promise<NullableType<Topic>>;

  /**
   * Remove banners from topic
   * @param id - Topic ID
   * @param bannerIds - Banner IDs to remove
   * @returns Updated topic or null if not found
   */
  abstract removeBanners(
    id: Topic['id'],
    bannerIds: string[],
  ): Promise<NullableType<Topic>>;

  /**
   * Update a single banner within topic
   * @param id - Topic ID
   * @param bannerId - Banner ID to update
   * @param data - Banner data to update
   * @returns Updated topic or null if not found
   */
  abstract updateBanner(
    id: Topic['id'],
    bannerId: string,
    data: Partial<TopicBanner>,
  ): Promise<NullableType<Topic>>;

  /**
   * Reorder banners within topic
   * @param id - Topic ID
   * @param banners - Banners with new order values
   * @returns Updated topic or null if not found
   */
  abstract reorderBanners(
    id: Topic['id'],
    banners: TopicBanner[],
  ): Promise<NullableType<Topic>>;

  /**
   * Bulk update topic orders
   * @param updates - Array of topic IDs with their new order values
   */
  abstract bulkUpdateOrder(
    updates: Array<{ id: string; order: number }>,
  ): Promise<void>;

  /**
   * Soft delete topic
   * @param id - Topic ID
   */
  abstract remove(id: Topic['id']): Promise<void>;
}
