import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Product } from './product';
import { ProductBadge } from './product-badge.enum';
import type { ProductDescriptionMedia } from './product-description-media';
import { ProductStatus } from './product-status.enum';
import { FilterProductDto, SortProductDto } from '../dto/query-product.dto';
import { PaginateResult } from 'mongoose';
import { ProductBannerPosition } from '../../product-banners/domain/product-banner-position.enum';

/** Live child-variant fields needed to decide PDP gift availability. */
export interface PromotionVariantAvailability {
  parentProductId: string;
  variantId: string;
  hide: boolean;
  status: ProductStatus;
  available: number;
}

/**
 * Abstract repository interface for Product entity
 * Defines the contract for product data access operations
 */
export abstract class ProductRepository {
  /**
   * Create a new product
   * @param data - Partial product data
   * @returns Created product
   */
  abstract create(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product>;

  /**
   * Find products with filtering, sorting and pagination
   * @param filterOptions - Filter options
   * @param sortOptions - Sort options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with products
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductDto | null;
    sortOptions?: SortProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Product>>;

  /**
   * Find product by ID
   * @param id - Product ID
   * @returns Product or null if not found
   */
  abstract findById(id: Product['id']): Promise<NullableType<Product>>;

  /**
   * Find product by snapshot ID (source ID) and source
   * @param snapshotId - Snapshot ID from source system
   * @param source - Source system identifier
   * @returns Product or null if not found
   */
  abstract findBySnapshotId(
    snapshotId: number,
    source: Product['source'],
  ): Promise<NullableType<Product>>;

  /**
   * Find product by businessId, source, and snapshot.id
   * @param businessId - Business ID
   * @param source - Source system identifier
   * @param snapshotId - Snapshot ID from source system
   * @returns Product or null if not found
   */
  abstract findByBusinessIdSourceAndSnapshotId(
    businessId: string,
    source: Product['source'],
    snapshotId: number,
  ): Promise<NullableType<Product>>;

  /**
   * Find product by code
   * @param code - Product code/SKU
   * @returns Product or null if not found
   */
  abstract findByCode(code: string): Promise<NullableType<Product>>;

  /**
   * Find product by slug within a business
   * @param businessId - Business ID
   * @param slug - SEO-friendly URL slug
   * @returns Product or null if not found
   */
  abstract findBySlug(
    businessId: string,
    slug: string,
  ): Promise<NullableType<Product>>;

  /**
   * Find product by businessId and code
   * @param businessId - Business ID
   * @param code - Product code/SKU
   * @returns Product or null if not found
   */
  abstract findByBusinessIdAndCode(
    businessId: string,
    code: string,
  ): Promise<NullableType<Product>>;

  /**
   * Find multiple products by IDs
   * @param ids - Array of product IDs
   * @returns Array of products found
   */
  abstract findByIds(ids: string[]): Promise<Product[]>;

  /**
   * Find lightweight product records used to render promotion references.
   * Excludes content, snapshots, and unrelated merchandising fields.
   */
  abstract findPromotionDisplayByIds(ids: string[]): Promise<Product[]>;

  /**
   * Batch-load current child-variant visibility and stock for parent products.
   * Uses the parent.id index and deliberately excludes deleted variants.
   */
  abstract findPromotionVariantAvailabilityByParentIds(
    parentIds: string[],
  ): Promise<PromotionVariantAvailability[]>;

  /**
   * Find multiple products by codes
   * @param codes - Array of product codes
   * @returns Array of products found
   */
  abstract findByCodes(codes: string[]): Promise<Product[]>;

  /**
   * Update existing product
   * @param id - Product ID
   * @param payload - Partial product data to update
   * @returns Updated product or null if not found
   */
  abstract update(
    id: Product['id'],
    payload: DeepPartial<Product>,
  ): Promise<NullableType<Product>>;

  /**
   * Soft delete product
   * @param id - Product ID
   */
  abstract remove(id: Product['id']): Promise<void>;

  /**
   * Bulk upsert products (create or update by snapshot.id)
   * Uses MongoDB bulkWrite for optimal performance
   * @param products - Array of product data
   * @returns Number of products upserted
   */
  abstract bulkUpsert(
    products: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<number>;

  /**
   * Find products that need description/content sync from Nhanh detail API
   * Returns products with null/undefined description or content from Nhanh source
   * @param filters - Optional additional filters
   * @returns Array of product IDs and their snapshot IDs
   */
  abstract findProductsNeedingDetailSync(
    filters?: Record<string, any>,
  ): Promise<Array<{ id: string; snapshotId: number }>>;

  /**
   * Update only description and content fields for a product
   * @param id - Product ID
   * @param description - New description
   * @param content - New content
   */
  abstract updateDescriptionContent(
    id: string,
    description?: string,
    content?: string,
  ): Promise<void>;

  /**
   * Find child variant products by parent's snapshot ID
   * @param businessId - Business ID
   * @param source - Source system identifier
   * @param parentSnapshotId - Parent product's snapshot.id
   * @returns Array of child variant products
   */
  abstract findVariantsByParentSnapshotId(
    businessId: string,
    source: Product['source'],
    parentSnapshotId: number,
  ): Promise<Product[]>;

  /**
   * Embed variants into parent products for a business
   * Finds all child variants and embeds them into their parent products
   * Uses bulk operations for efficiency
   * @param businessId - Business ID
   * @param source - Source system identifier
   * @returns Number of parent products updated
   */
  abstract embedVariantsInParents(
    businessId: string,
    source: Product['source'],
  ): Promise<number>;

  /**
   * Embed variants into a specific parent product
   * @param parentSnapshotId - Parent product's snapshot.id
   * @param businessId - Business ID
   * @param source - Source system identifier
   * @returns True if parent was updated, false if not found
   */
  abstract embedVariantsForParent(
    parentSnapshotId: number,
    businessId: string,
    source: Product['source'],
  ): Promise<boolean>;

  /**
   * Populate parent metadata for all variant products
   * Links variants to their parent products with full metadata
   * This enables efficient parent lookup in shopping flow (cart, checkout)
   * @param businessId - Business ID
   * @param source - Source system identifier
   * @returns Number of variants updated
   */
  abstract populateParentMetadata(
    businessId: string,
    source: Product['source'],
  ): Promise<number>;

  /**
   * Update flash sale data for specific products
   * Used by the flash sale sync cron job
   * @param updates - Array of product IDs and their flash sale data
   */
  abstract updateFlashSaleData(
    updates: Array<{ productId: string; flashSale: Product['flashSale'] }>,
  ): Promise<void>;

  /**
   * Clear flash sale data for products not in the current flash sale
   * Resets flashSale to default values based on retail price
   * @param excludeProductIds - Product IDs to exclude from clearing
   */
  abstract clearFlashSaleData(excludeProductIds: string[]): Promise<void>;

  /**
   * Set default flash sale values for all products
   * Used when no flash sale is active
   */
  abstract setDefaultFlashSaleForAll(): Promise<void>;

  /**
   * Initialize flash sale defaults for products that don't have the field
   * Used on app startup to ensure all products have flashSale.effectivePrice for sorting
   * @returns Number of products updated
   */
  abstract initializeFlashSaleDefaults(): Promise<number>;

  /**
   * Update product discount data for specific products
   * Used by the product discount sync cron job
   * @param updates - Array of product IDs and their product discount data
   */
  abstract updateProductDiscountData(
    updates: Array<{
      productId: string;
      productDiscount: Product['productDiscount'];
    }>,
  ): Promise<void>;

  /**
   * Clear product discount data for products not in the current promotion
   * @param excludeProductIds - Product IDs to exclude from clearing
   */
  abstract clearProductDiscountData(excludeProductIds: string[]): Promise<void>;

  /**
   * Update review statistics for a product
   * Called when reviews are created or visibility is toggled
   * @param productId - Product ID
   * @param stats - Review statistics (averageRating, reviewCount)
   */
  abstract updateReviewStats(
    productId: string,
    stats: { averageRating: number; reviewCount: number },
  ): Promise<void>;

  /**
   * Update product details (CMS-only data)
   * @param productId - Product ID
   * @param data - Product data to update (description, content, details, badge, and their localizations)
   * @returns Updated product or null if not found
   */
  abstract updateDetails(
    productId: string,
    data: {
      nameLocalization?: { vi?: string; en?: string };
      description?: string;
      descriptionLocalization?: { vi?: string; en?: string };
      content?: string;
      details?: {
        material?: string;
        style?: string;
        highlights?: string;
        suitableFor?: string;
        careInstructions?: string;
      };
      detailsLocalization?: {
        material?: { vi?: string; en?: string };
        style?: { vi?: string; en?: string };
        highlights?: { vi?: string; en?: string };
        suitableFor?: { vi?: string; en?: string };
        careInstructions?: { vi?: string; en?: string };
      };
      badge?: ProductBadge | null;
      sizeGuide?: string | null;
      descriptionMedia?: Partial<ProductDescriptionMedia>;
    },
  ): Promise<NullableType<Product>>;

  /**
   * Bulk update hide status for multiple products
   * @param items - Array of product IDs and their hide status
   * @returns Number of products updated
   */
  abstract bulkUpdateHide(
    items: Array<{ productId: string; hide: boolean }>,
  ): Promise<number>;

  /**
   * Update product banner for multiple products (bulk operation)
   * Used when syncing banner data to products
   * @param productIds - Product IDs to update
   * @param banner - Embedded banner data or null to remove
   * @returns Number of products updated
   */
  abstract updateProductBanner(
    productIds: string[],
    banner: {
      id: string;
      name: string;
      image: string;
      position: ProductBannerPosition;
      ratio?: number | null;
    } | null,
  ): Promise<number>;

  /**
   * Clear product banner from all products that have a specific banner ID
   * Used when deleting a product banner
   * @param bannerId - Banner ID to clear from products
   * @returns Number of products updated
   */
  abstract clearProductBanner(bannerId: string): Promise<number>;

  /**
   * Find parent/standalone products updated since a given date
   * Used by commission product sync cron to detect changes.
   * Excludes child variants (snapshot.parentId > 0).
   * @param since - Date cursor (exclusive)
   * @param limit - Max number of products to return
   * @returns Array of lightweight product data sorted by updatedAt ASC
   */
  abstract findUpdatedSince(
    since: Date,
    limit: number,
  ): Promise<
    Array<{
      id: string;
      name: string;
      code: string;
      slug?: string | null;
      images: { avatar?: string | null; others?: string[] };
      costPrice: number;
      stock: number;
      category?: { id: string; name: string } | null;
      updatedAt: Date;
      deletedAt: Date | null;
    }>
  >;

  /**
   * Find active products by IDs
   * Filters: status=ACTIVE, deletedAt=null, type=REGULAR
   * @param ids - Product IDs to find
   * @returns Active products matching the given IDs
   */
  abstract findActiveByIds(ids: string[]): Promise<Product[]>;

  /**
   * Find popular products from given category IDs
   * Sorted by reviewStats.reviewCount desc, then createdAt desc
   * @param categoryIds - Category IDs to filter by
   * @param excludeIds - Product IDs to exclude
   * @param limit - Maximum number of results
   * @returns Products from the given categories
   */
  abstract findPopularByCategories(
    categoryIds: string[],
    excludeIds: string[],
    limit: number,
  ): Promise<Product[]>;

  /**
   * Find most ordered products (trending) from the last N days
   * @param productIds - Product IDs to look up
   * @param limit - Maximum number of results
   * @returns Products sorted for trending display
   */
  abstract findTrendingByIds(
    productIds: string[],
    limit: number,
  ): Promise<Product[]>;

  /**
   * Stream variant products in batches for Excel export
   * Yields batches of lean documents including the parent field
   * @param filters - Optional search and status filters
   * @param batchSize - Number of documents per batch (default 500)
   */
  abstract streamVariantsForExport(
    filters: {
      search?: string;
      status?: ProductStatus;
      categoryIds?: string[];
      businessId?: string;
    },
    batchSize?: number,
  ): AsyncGenerator<Record<string, any>[]>;

  /**
   * Get mapping of Nhanh Product ID -> Internal Product ID for all active products
   * Used by Worker to build product mapping for inventory sync
   * @returns Map of Nhanh snapshot ID (string) to internal MongoDB ObjectId (string)
   */
  abstract getNhanhIdMapping(): Promise<Map<string, string>>;
}
