/**
 * Products Types
 * Custom repository types for products
 */

import type { Product } from './gen/shared/shared/products/product';
import type {
  FilterProduct,
  SortProduct,
  UpdateProductDetailsRequest,
} from './gen/cms/cms/products/product-query';

// Re-export types for convenience
export type { Product, FilterProduct, SortProduct, UpdateProductDetailsRequest };

/**
 * Extended Product type with additional fields from API
 * that are not in the protobuf definition
 */
export interface ProductBrand {
  id: string;
  name: string;
}

export interface ProductAttribute {
  id?: string;
  name: string;
  value: string;
}

export interface ProductSupplier {
  id: string;
  name: string;
}

export interface ProductShipping {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

export interface ProductExtended extends Product {
  // Additional fields from API
  sourceId?: string;
  otherName?: string;
  countryName?: string;
  brand?: ProductBrand;
  suppliers?: ProductSupplier;
  internalCategory?: { id: string; name: string };
  shipping?: ProductShipping;
  sourceUpdatedAt?: Date;
  availableQuantity?: number;
}

/**
 * Repository-specific Request types
 */

// Get products request (simplified from QueryProduct)
export interface GetProductsRequest {
  page: number;
  limit: number;
  filters?: FilterProduct;
  sort?: SortProduct[];
}

/**
 * Repository-specific Response types
 */

// List response with pagination
export interface GetProductsResponse {
  data: Product[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Payload for Redux action
 */
export type UpdateProductPayload = {
  id: string;
  data: UpdateProductDetailsRequest;
  onSuccess?: () => void;
};

/**
 * Product Review Types
 */
export interface ProductReview {
  id: string;
  customerName: string;
  customerPhone: string;
  rating: number; // 1-5
  content: string;
  images?: string[];
  reviewDate: Date;
}

export interface GetProductReviewsRequest {
  productId: string;
  page: number;
  limit: number;
}

export interface GetProductReviewsResponse {
  data: ProductReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Bulk Hide Products Types
 */
export interface BulkHideProductItem {
  productId: string;
  hide: boolean;
}

export interface BulkHideProductsRequest {
  items: BulkHideProductItem[];
}

export interface BulkHideProductsResponse {
  updatedCount: number;
}
