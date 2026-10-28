import axiosInstance from 'src/utils/axios';

import type { Banner } from 'src/types/gen/shared/shared/banners/banner';
import type {
  QueryBannersRequest,
  QueryBannersResponse,
  CreateBannerRequest,
  UpdateBannerRequest,
  ReorderBannersRequest,
} from 'src/types/gen/cms/cms/banners/banner';

/**
 * Banner Repository
 * Handles all banner-related API calls
 */
class BannerRepository {
  /**
   * Query banners with filters and pagination
   * GET /api/v1/cms/banners
   */
  queryBanners = async (params: QueryBannersRequest): Promise<QueryBannersResponse> => {
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

    const response = await axiosInstance.get<QueryBannersResponse>('/cms/banners', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Get banner by ID
   * GET /api/v1/cms/banners/{id}
   */
  getBanner = async (id: string): Promise<Banner> => {
    const response = await axiosInstance.get<Banner>(`/cms/banners/${id}`);
    return response.data;
  };

  /**
   * Create a new banner
   * POST /api/v1/cms/banners
   */
  createBanner = async (data: CreateBannerRequest): Promise<Banner> => {
    const response = await axiosInstance.post<Banner>('/cms/banners', data);
    return response.data;
  };

  /**
   * Update a banner
   * PATCH /api/v1/cms/banners/{id}
   */
  updateBanner = async (data: UpdateBannerRequest): Promise<Banner> => {
    const { bannerId, ...updateData } = data;
    const response = await axiosInstance.patch<Banner>(`/cms/banners/${bannerId}`, updateData);
    return response.data;
  };

  /**
   * Delete a banner
   * DELETE /api/v1/cms/banners/{id}
   */
  deleteBanner = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cms/banners/${id}`);
  };

  /**
   * Reorder banners (bulk update order)
   * PATCH /api/v1/cms/banners
   */
  reorderBanners = async (data: ReorderBannersRequest): Promise<void> => {
    await axiosInstance.patch('/cms/banners', data);
  };
}

export const bannerRepository = new BannerRepository();
