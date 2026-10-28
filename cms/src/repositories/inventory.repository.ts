import axiosInstance from 'src/utils/axios';
import type { ProductInventory, GetInventoriesRequest, GetInventoriesResponse } from 'src/types';

/**
 * Inventory Repository
 * Handles all inventory-related API calls
 */
class InventoryRepository {
  /**
   * Get inventories with filters, sorting, and pagination
   */
  getInventories = async (params: GetInventoriesRequest): Promise<GetInventoriesResponse> => {
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

    const response = await axiosInstance.get<GetInventoriesResponse>('/product-inventories', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Get single inventory by ID
   */
  getInventoryById = async (id: string): Promise<ProductInventory> => {
    const response = await axiosInstance.get<ProductInventory>(
      `/product-inventories/product/${id}`
    );
    return response.data;
  };
}

export const inventoryRepository = new InventoryRepository();
