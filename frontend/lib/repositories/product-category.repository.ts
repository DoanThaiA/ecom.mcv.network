import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import { ProductCategoryStatus } from '@/types/gen/shared/shared/common/enums';
import { API_BASE_URL } from '@/lib/config/api';
import { fetchWithTimeout } from '@/lib/utils/fetchWithTimeout';

const CATEGORIES_REVALIDATE_SECONDS = 300;

class ProductCategoryRepository {
  /**
   * Fetch product categories (server-side compatible)
   * Uses native fetch for SSR compatibility
   * Filters to return only active categories
   */
  async getProductCategories(): Promise<ProductCategory[]> {
    try {
      const url = `${API_BASE_URL}/shop/categories`;

      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: CATEGORIES_REVALIDATE_SECONDS,
        },
        timeout: 3000, // 3 second timeout
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch product categories: ${response.statusText}`
        );
      }

      const results: ProductCategory[] = await response.json();

      return results.filter(
        (category) =>
          category.status === ProductCategoryStatus.PRODUCT_CATEGORY_STATUS_ACTIVE
      );
    } catch {
      // Return empty array on timeout or error
      return [];
    }
  }

  /**
   * Get all product categories (with error handling)
   * Returns all categories regardless of level
   */
  async getAllCategories(): Promise<ProductCategory[]> {
    return this.getProductCategories();
  }
}

export const productCategoryRepository = new ProductCategoryRepository();
