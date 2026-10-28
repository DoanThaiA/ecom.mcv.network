import axiosInstance from 'src/utils/axios';
import type {
  CreateAffiliateRequest,
  UpdateAffiliateRequest,
  QueryAffiliatesRequest,
  QueryAffiliatesResponse,
} from 'src/types/gen/cms/cms/affiliates/affiliate';
import type { Affiliate } from 'src/types/gen/shared/shared/affiliates/affiliate';
import type {
  QueryAffiliateAnalyticsRequest,
  AffiliateOverviewResponse,
  QueryAffiliateProductAnalyticsRequest,
  QueryAffiliateCommissionAnalyticsResponse,
  QueryAffiliateTrackingAnalyticsResponse,
  QueryAffiliateOrdersRequest,
  QueryAffiliateOrdersResponse,
} from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';

/**
 * Affiliate Repository
 * Handles API calls for affiliate management
 */
class AffiliateRepository {
  /**
   * Query affiliates with pagination and filters
   * @param params Query parameters (page, limit, filters, sort)
   * @returns Paginated list of affiliates
   */
  queryAffiliates = async (params: QueryAffiliatesRequest): Promise<QueryAffiliatesResponse> => {
    const { filters, sort, ...rest } = params;
    const serializedParams: Record<string, unknown> = { ...rest };
    if (filters) {
      serializedParams.filters = JSON.stringify(filters);
    }
    if (sort && sort.length > 0) {
      serializedParams.sort = JSON.stringify(sort);
    }
    const response = await axiosInstance.get<QueryAffiliatesResponse>('/affiliates', {
      params: serializedParams,
    });
    return response.data;
  };

  /**
   * Get affiliate by ID
   * @param affiliateId Affiliate ID
   * @returns Affiliate details
   */
  getAffiliate = async (affiliateId: string): Promise<Affiliate> => {
    const response = await axiosInstance.get<Affiliate>(`/affiliates/${affiliateId}`);
    return response.data;
  };

  /**
   * Create new affiliate
   * @param data Create affiliate request
   * @returns Created affiliate
   */
  createAffiliate = async (data: CreateAffiliateRequest): Promise<Affiliate> => {
    const response = await axiosInstance.post<Affiliate>('/affiliates', data);
    return response.data;
  };

  /**
   * Update affiliate
   * @param data Update affiliate request (includes affiliateId)
   * @returns Updated affiliate
   */
  updateAffiliate = async (data: UpdateAffiliateRequest): Promise<Affiliate> => {
    const response = await axiosInstance.patch<Affiliate>(`/affiliates/${data.affiliateId}`, data);
    return response.data;
  };

  /**
   * Delete affiliate (soft delete)
   * @param affiliateId Affiliate ID to delete
   */
  deleteAffiliate = async (affiliateId: string): Promise<void> => {
    await axiosInstance.delete(`/affiliates/${affiliateId}`);
  };

  /**
   * Bulk delete affiliates
   * @param affiliateIds Array of affiliate IDs to delete
   */
  bulkDeleteAffiliates = async (affiliateIds: string[]): Promise<void> => {
    await axiosInstance.post('/affiliates/bulk-delete', { affiliateIds });
  };

  /**
   * Get affiliate performance overview
   * @param params Query parameters (affiliateId, dateFrom, dateTo)
   * @returns Affiliate overview analytics
   */
  getAffiliateOverview = async (
    params: QueryAffiliateAnalyticsRequest
  ): Promise<AffiliateOverviewResponse> => {
    const response = await axiosInstance.get<AffiliateOverviewResponse>(
      `cms/affiliates/${params.affiliateId}/analytics/overview`,
      {
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }
    );
    return response.data;
  };

  /**
   * Get affiliate commission analytics per (product, rate)
   */
  getAffiliateCommissionAnalytics = async (
    params: QueryAffiliateProductAnalyticsRequest
  ): Promise<QueryAffiliateCommissionAnalyticsResponse> => {
    const response = await axiosInstance.get<QueryAffiliateCommissionAnalyticsResponse>(
      `cms/affiliates/${params.affiliateId}/analytics/products/commissions`,
      {
        params: {
          page: params.page,
          limit: params.limit,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          search: params.search,
          categoryName: params.categoryName,
        },
      }
    );
    return response.data;
  };

  /**
   * Get affiliate traffic & conversion analytics per product
   */
  getAffiliateTrackingAnalytics = async (
    params: QueryAffiliateProductAnalyticsRequest
  ): Promise<QueryAffiliateTrackingAnalyticsResponse> => {
    const response = await axiosInstance.get<QueryAffiliateTrackingAnalyticsResponse>(
      `cms/affiliates/${params.affiliateId}/analytics/products/tracking`,
      {
        params: {
          page: params.page,
          limit: params.limit,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          search: params.search,
          categoryName: params.categoryName,
        },
      }
    );
    return response.data;
  };

  /**
   * Get affiliate orders list
   * @param params Query parameters (affiliateId, page, limit, dateFrom, dateTo)
   * @returns Paginated affiliate orders
   */
  getAffiliateOrders = async (
    params: QueryAffiliateOrdersRequest
  ): Promise<QueryAffiliateOrdersResponse> => {
    const response = await axiosInstance.get<QueryAffiliateOrdersResponse>(
      `cms/affiliates/${params.affiliateId}/orders`,
      {
        params: {
          page: params.page,
          limit: params.limit,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }
    );
    return response.data;
  };
}

export const affiliateRepository = new AffiliateRepository();
