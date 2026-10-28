import axiosInstance from '../axios';
import type { GetProductsResponse } from '@/types/product';
import type { Product } from '@/types/gen/shared/shared/products/product';
import type { ShopQueryProduct, ShopQueryProduct as QueryProduct } from '@/types/gen/shop/shop/products/product';
import type { GetCombosForProductResponse } from '@/types/gen/shop/shop/combos/combo';

// Cache for top keywords (5 minutes TTL)
const TOP_KEYWORDS_CACHE_TTL = 5 * 60 * 1000;
let topKeywordsCache: { data: string[]; timestamp: number } | null = null;

/**
 * Product Repository
 * Handles all product-related API calls
 */
class ProductRepository {
  /**
   * Get shop products with public filters (for category/shop pages)
   * Supports categoryIds (array), search, price range filters
   */
  async getShopProducts(
    params: ShopQueryProduct
  ): Promise<GetProductsResponse> {
    const { page, limit, filters, sort } = params;

    const queryParams: Record<string, string> = {};

    if (page !== undefined) {
      queryParams.page = page.toString();
    }
    if (limit !== undefined) {
      queryParams.limit = limit.toString();
    }

    if (filters) {
      queryParams.filters = JSON.stringify(filters);
    }

    if (sort) {
      queryParams.sort = JSON.stringify(sort);
    }

    const response = await axiosInstance.get<GetProductsResponse>(
      '/shop/products',
      {
        params: queryParams,
      }
    );

    return response.data;
  }

  /**
   * Get products with internal filters (for admin sections)
   * Supports categoryId (single), status, businessId, etc.
   */
  async getProducts(params: QueryProduct): Promise<GetProductsResponse> {
    const { page, limit, filters, sort } = params;

    const queryParams: Record<string, string> = {};

    if (page !== undefined) {
      queryParams.page = page.toString();
    }
    if (limit !== undefined) {
      queryParams.limit = limit.toString();
    }

    if (filters && Object.keys(filters).length > 0) {
      queryParams.filters = JSON.stringify(filters);
    }

    if (sort) {
      queryParams.sort = JSON.stringify(sort);
    }

    const response = await axiosInstance.get<GetProductsResponse>(
      '/shop/products',
      {
        params: queryParams,
      }
    );

    return response.data;
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await axiosInstance.get<Product>(`/shop/products/${id}`);
    return response.data;
  }

  /**
   * Get combos for a product
   */
  async getCombosForProduct(productId: string): Promise<GetCombosForProductResponse> {
    const response = await axiosInstance.get<GetCombosForProductResponse>(
      `/shop/combos/product/${productId}`
    );
    return response.data;
  }

  /**
   * Track a product view (fire-and-forget)
   * @param productId - Product ID being viewed
   * @param categoryId - Category ID (optional, avoids backend lookup)
   */
  async trackProductView(productId: string, categoryId?: string): Promise<void> {
    try {
      await axiosInstance.post('/shop/product-views', {
        productId,
        ...(categoryId ? { categoryId } : {}),
      });
    } catch {
      // Fire-and-forget: silently ignore errors
    }
  }

  /**
   * Get personalized product recommendations
   * Returns recently viewed products combined with search-based recommendations
   */
  async getPersonalizedRecommendations(limit?: number): Promise<Product[]> {
    const response = await axiosInstance.get<Product[]>(
      '/shop/recommendations/personalized',
      {
        params: limit ? { limit: limit.toString() } : undefined,
      }
    );
    return response.data || [];
  }

  /**
   * Get cross-sell product recommendations
   * Returns products that complement the given product IDs (for order success page)
   */
  async getCrossSellRecommendations(productIds: string[], limit?: number): Promise<Product[]> {
    const response = await axiosInstance.get<Product[]>(
      '/shop/recommendations/cross-sell',
      {
        params: {
          productIds: productIds.join(','),
          ...(limit ? { limit: limit.toString() } : {}),
        },
      }
    );
    return response.data || [];
  }

  /**
   * Get top trending keywords with caching
   * Returns a list of popular search keywords
   * Cached for 5 minutes to reduce API calls
   */
  async getTopKeywords(): Promise<string[]> {
    // Return cached data if still valid
    if (
      topKeywordsCache &&
      Date.now() - topKeywordsCache.timestamp < TOP_KEYWORDS_CACHE_TTL
    ) {
      return topKeywordsCache.data;
    }

    try {
      const response = await axiosInstance.get<string[]>('/shop/top-keywords');
      const data = response.data || [];

      // Cache the result
      topKeywordsCache = { data, timestamp: Date.now() };

      return data;
    } catch {
      // Return empty array on error, don't cache errors
      return [];
    }
  }
}

export const productRepository = new ProductRepository();
