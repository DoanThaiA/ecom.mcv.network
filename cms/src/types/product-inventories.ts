/**
 * Product Inventories Types
 * Custom repository types for product inventories
 */

import type {
  ProductInventory,
  FilterProductInventory,
  SortProductInventory,
} from './gen/shared/shared/product-inventories/product-inventory';

// Re-export ProductInventory for convenience
export type { ProductInventory };

/**
 * Repository-specific Request types
 */

// Get inventories request (simplified from QueryProductInventory)
export interface GetInventoriesRequest {
  page: number;
  limit: number;
  filters?: FilterProductInventory;
  sort?: SortProductInventory[];
}

/**
 * Repository-specific Response types
 */

// List response with pagination
export interface GetInventoriesResponse {
  data: ProductInventory[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
