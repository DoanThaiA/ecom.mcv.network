import type { Product } from './gen/shared/shared/products/product';

export interface GetProductsResponse {
  data: Product[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
