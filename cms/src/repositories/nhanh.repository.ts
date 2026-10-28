import axiosInstance from 'src/utils/axios';
import type {
  NhanhRedirectResponse,
  NhanhCallbackRequest,
  NhanhCallbackResponse,
  NhanhSyncAllResponse,
  NhanhCheckConnectionResponse,
  NhanhSyncProductCategoriesResponse,
  NhanhSyncProductsResponse,
} from 'src/types';

/**
 * Nhanh Repository
 * Handles all Nhanh.vn integration API calls
 */
class NhanhRepository {
  /**
   * Get redirect URL for Nhanh.vn authentication
   */
  getRedirectUrl = async (): Promise<NhanhRedirectResponse> => {
    const response = await axiosInstance.get<NhanhRedirectResponse>('/integration/nhanh/redirect');
    return response.data;
  };

  /**
   * Handle callback from Nhanh.vn with access code
   */
  handleCallback = async (payload: NhanhCallbackRequest): Promise<NhanhCallbackResponse> => {
    const response = await axiosInstance.post<NhanhCallbackResponse>(
      '/integration/nhanh/callback',
      payload
    );
    return response.data;
  };

  /**
   * Sync all data from Nhanh.vn
   */
  syncAll = async (): Promise<NhanhSyncAllResponse> => {
    const response = await axiosInstance.post<NhanhSyncAllResponse>('/integration/nhanh/sync/all');
    return response.data;
  };

  /**
   * Check Nhanh.vn connection status
   */
  checkConnection = async (): Promise<NhanhCheckConnectionResponse> => {
    const response = await axiosInstance.get<NhanhCheckConnectionResponse>(
      '/integration/nhanh/connection'
    );
    return response.data;
  };

  /**
   * Sync product categories from Nhanh.vn
   */
  syncProductCategories = async (): Promise<NhanhSyncProductCategoriesResponse> => {
    const response = await axiosInstance.post<NhanhSyncProductCategoriesResponse>(
      '/integration/nhanh/sync/product-categories'
    );
    return response.data;
  };

  /**
   * Sync products from Nhanh.vn (full product sync: list -> details -> embed)
   */
  syncProducts = async (): Promise<NhanhSyncProductsResponse> => {
    const response = await axiosInstance.post<NhanhSyncProductsResponse>(
      '/integration/nhanh/sync/products'
    );
    return response.data;
  };
}

// Export singleton instance
export const nhanhRepository = new NhanhRepository();
