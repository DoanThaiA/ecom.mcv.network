import axiosInstance from 'src/utils/axios';
import type {
  ZaloRedirectResponse,
  ZaloCallbackRequest,
  ZaloCallbackResponse,
  ZaloCheckConnectionResponse,
} from 'src/types';

/**
 * Zalo Repository
 * Handles all Zalo OA integration API calls
 */
class ZaloRepository {
  /**
   * Get redirect URL for Zalo OA authentication
   */
  getRedirectUrl = async (): Promise<ZaloRedirectResponse> => {
    const response = await axiosInstance.get<ZaloRedirectResponse>('/integration/zalo/redirect');
    return response.data;
  };

  /**
   * Handle callback from Zalo OA with authorization code
   */
  handleCallback = async (payload: ZaloCallbackRequest): Promise<ZaloCallbackResponse> => {
    const response = await axiosInstance.post<ZaloCallbackResponse>(
      '/integration/zalo/callback',
      payload
    );
    return response.data;
  };

  /**
   * Check Zalo OA connection status
   */
  checkConnection = async (): Promise<ZaloCheckConnectionResponse> => {
    const response = await axiosInstance.get<ZaloCheckConnectionResponse>(
      '/integration/zalo/connection'
    );
    return response.data;
  };
}

// Export singleton instance
export const zaloRepository = new ZaloRepository();
