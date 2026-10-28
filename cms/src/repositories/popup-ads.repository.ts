import axiosInstance from 'src/utils/axios';

import type { PopupAds } from 'src/types/gen/shared/shared/popup-ads/popup-ads';
import type {
  QueryPopupAdsRequest,
  QueryPopupAdsResponse,
  CreatePopupAdsRequest,
  UpdatePopupAdsRequest,
} from 'src/types/gen/cms/cms/popup-ads/popup-ads';

/**
 * PopupAds Repository
 * Handles all popup ads-related API calls
 */
class PopupAdsRepository {
  /**
   * Query popup ads with filters and pagination
   * GET /api/v1/cms/popup-ads
   */
  queryPopupAds = async (params: QueryPopupAdsRequest): Promise<QueryPopupAdsResponse> => {
    const queryParams: Record<string, string> = {};

    if (params.page !== undefined) {
      queryParams.page = params.page.toString();
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }
    if (params.filters) {
      queryParams.filters = JSON.stringify(params.filters);
    }
    if (params.sort && params.sort.length > 0) {
      queryParams.sort = JSON.stringify(params.sort);
    }

    const response = await axiosInstance.get<QueryPopupAdsResponse>('/cms/popup-ads', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Get popup ads by ID
   * GET /api/v1/cms/popup-ads/{id}
   */
  getPopupAds = async (id: string): Promise<PopupAds> => {
    const response = await axiosInstance.get<PopupAds>(`/cms/popup-ads/${id}`);
    return response.data;
  };

  /**
   * Create a new popup ads
   * POST /api/v1/cms/popup-ads
   */
  createPopupAds = async (data: CreatePopupAdsRequest): Promise<PopupAds> => {
    const response = await axiosInstance.post<PopupAds>('/cms/popup-ads', data);
    return response.data;
  };

  /**
   * Update a popup ads
   * PATCH /api/v1/cms/popup-ads/{id}
   */
  updatePopupAds = async (data: UpdatePopupAdsRequest): Promise<PopupAds> => {
    const { popupAdsId, ...updateData } = data;
    const response = await axiosInstance.patch<PopupAds>(
      `/cms/popup-ads/${popupAdsId}`,
      updateData
    );
    return response.data;
  };

  /**
   * Delete a popup ads
   * DELETE /api/v1/cms/popup-ads/{id}
   */
  deletePopupAds = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cms/popup-ads/${id}`);
  };
}

export const popupAdsRepository = new PopupAdsRepository();
