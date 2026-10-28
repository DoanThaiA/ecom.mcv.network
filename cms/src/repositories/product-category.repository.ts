import axiosInstance from 'src/utils/axios';
import type { GetProductCategoriesRequest } from 'src/types/product-categories';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';
import type { UpdateProductCategoryLocalizationRequest } from 'src/types/gen/cms/cms/product-categories/product-category';

/**
 * Product Category Repository
 * Handles all product category-related API calls
 */
class ProductCategoryRepository {
  /**
   * Get product categories with filters, sorting, and pagination
   */
  getProductCategories = async (
    params: GetProductCategoriesRequest
  ): Promise<ProductCategory[]> => {
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

    const response = await axiosInstance.get<ProductCategory[]>('/product-categories', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Get single product category by ID
   */
  getProductCategoryById = async (id: string): Promise<ProductCategory> => {
    const response = await axiosInstance.get<ProductCategory>(`/product-categories/${id}`);
    return response.data;
  };

  /**
   * Update product category localization
   */
  updateProductCategoryLocalization = async (
    data: UpdateProductCategoryLocalizationRequest
  ): Promise<ProductCategory> => {
    const response = await axiosInstance.patch<ProductCategory>(
      `/product-categories/${data.categoryId}/localization`,
      {
        nameLocalization: data.nameLocalization,
      }
    );
    return response.data;
  };
}

export const productCategoryRepository = new ProductCategoryRepository();
