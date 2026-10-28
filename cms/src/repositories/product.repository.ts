import axiosInstance from 'src/utils/axios';
import type {
  GetProductsRequest,
  GetProductsResponse,
  BulkHideProductsRequest,
  BulkHideProductsResponse,
} from 'src/types';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import type { ProductInventory } from 'src/types/gen/shared/shared/product-inventories/product-inventory';
import { UpdateProductDetailsRequest } from 'src/types/gen/cms/cms/products/product-query';
import { convertBadgeForApi } from 'src/utils/enum-helpers';

/**
 * Product Repository
 * Handles all product-related API calls
 */
class ProductRepository {
  /**
   * Get products with filters, sorting, and pagination
   */
  getProducts = async (params: GetProductsRequest): Promise<GetProductsResponse> => {
    const { page, limit, filters, sort } = params;

    // Build query params
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    // Add filters if provided
    if (filters && Object.keys(filters).length > 0) {
      queryParams.filters = JSON.stringify(filters);
    }

    // Add sort if provided
    if (sort && sort.length > 0) {
      queryParams.sort = JSON.stringify(sort);
    }

    const response = await axiosInstance.get<GetProductsResponse>('/products', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Get single product by ID
   */
  getProductById = async (id: string): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  };

  /**
   * Get product inventory by product ID
   */
  getProductInventoryById = async (id: string): Promise<ProductInventory> => {
    const response = await axiosInstance.get<ProductInventory>(
      `/product-inventories/product/${id}`
    );
    return response.data;
  };

  /**
   * Update product additional information
   */
  updateProduct = async (id: string, data: UpdateProductDetailsRequest): Promise<Product> => {
    // Transform badge enum to backend-expected string format
    const transformedData = {
      ...data,
      badge: data.badge !== undefined ? convertBadgeForApi(data.badge) : undefined,
    };

    const response = await axiosInstance.patch<Product>(`/products/${id}/details`, transformedData);
    return response.data;
  };

  /**
   * Bulk hide/show products
   */
  bulkHideProducts = async (data: BulkHideProductsRequest): Promise<BulkHideProductsResponse> => {
    const response = await axiosInstance.post<BulkHideProductsResponse>(
      '/products/bulk/hide',
      data
    );
    return response.data;
  };

  /**
   * Export all variant products to Excel file
   * Returns a Blob ready for download; uses arraybuffer response type for binary data
   */
  exportProducts = async (filters?: {
    search?: string;
    status?: string;
    categoryIds?: string[];
  }): Promise<Blob> => {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.categoryIds?.length) params.categoryIds = JSON.stringify(filters.categoryIds);

    const response = await axiosInstance.get('/products/export', {
      params,
      responseType: 'arraybuffer',
      timeout: 120_000,
    });

    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  };
}

export const productRepository = new ProductRepository();
