/**
 * Product Categories Types
 * Custom repository types for product categories
 */

import type {
  ProductCategory,
  FilterProductCategory,
  SortProductCategory,
} from './gen/shared/shared/product-categories/product-category';

// Re-export ProductCategory for convenience
export type { ProductCategory };

/**
 * Repository-specific Request types
 */

// Get product categories request (simplified from QueryProductCategory)
export interface GetProductCategoriesRequest {
  page: number;
  limit: number;
  filters?: FilterProductCategory;
  sort?: SortProductCategory[];
}
