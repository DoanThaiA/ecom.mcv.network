import axiosInstance from 'src/utils/axios';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';
import type {
  AffiliateOverviewResponse,
  QueryAffiliateProductAnalyticsRequest,
  QueryAffiliateCommissionAnalyticsResponse,
  QueryAffiliateTrackingAnalyticsResponse,
} from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';
import type { Affiliate } from 'src/types/gen/shared/shared/affiliates/affiliate';
import type {
  WithdrawalRequest,
  QueryWithdrawalRequestsResponse,
  AffiliateBalanceResponse,
  WithdrawalRequestFilters,
} from 'src/types/withdrawal-request';
import {
  WithdrawalRequestMessage,
  QueryWithdrawalRequestsResponseMessage,
} from 'src/types/withdrawal-request';
import type { ProductCommissionsPage } from 'src/types/gen/shared/shared/product-commissions/product-commission';

export interface CreateWithdrawalRequestData {
  amount: number;
  recipientName: string;
  bankAccountNumber: string;
  bankName: string;
  note?: string;
}

interface GetWithdrawalRequestsParams {
  page: number;
  limit: number;
  filters?: WithdrawalRequestFilters;
}

interface GetMyProductCommissionsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryName?: string;
}

/**
 * Affiliate Portal Repository
 * API calls for the affiliate's own dashboard (not admin management)
 */
class AffiliatePortalRepository {
  /**
   * Get the logged-in affiliate's performance overview
   */
  getMyOverview = async (params: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AffiliateOverviewResponse> => {
    const response = await axiosInstance.get<AffiliateOverviewResponse>(
      '/affiliate-portal/analytics/overview',
      { params }
    );
    return response.data;
  };

  /**
   * Get the logged-in affiliate's commission analytics per (product, rate)
   */
  getMyCommissionAnalytics = async (
    params: Omit<QueryAffiliateProductAnalyticsRequest, 'affiliateId'>
  ): Promise<QueryAffiliateCommissionAnalyticsResponse> => {
    const response = await axiosInstance.get<QueryAffiliateCommissionAnalyticsResponse>(
      '/affiliate-portal/analytics/products/commissions',
      { params }
    );
    return response.data;
  };

  /**
   * Get the logged-in affiliate's traffic & conversion analytics per product
   */
  getMyTrackingAnalytics = async (
    params: Omit<QueryAffiliateProductAnalyticsRequest, 'affiliateId'>
  ): Promise<QueryAffiliateTrackingAnalyticsResponse> => {
    const response = await axiosInstance.get<QueryAffiliateTrackingAnalyticsResponse>(
      '/affiliate-portal/analytics/products/tracking',
      { params }
    );
    return response.data;
  };

  /**
   * Get the logged-in affiliate's own profile information
   */
  getMyProfile = async (): Promise<Affiliate> => {
    const response = await axiosInstance.get<Affiliate>('/affiliate-portal/me');
    return response.data;
  };

  /**
   * Get available commission balance for the logged-in affiliate
   */
  getMyBalance = async (): Promise<AffiliateBalanceResponse> => {
    const response = await axiosInstance.get<AffiliateBalanceResponse>('/affiliate-portal/balance');
    return response.data;
  };

  /**
   * Create a new withdrawal request for the logged-in affiliate
   */
  createWithdrawalRequest = async (
    data: CreateWithdrawalRequestData
  ): Promise<WithdrawalRequest> => {
    const response = await axiosInstance.post<unknown>(
      '/affiliate-portal/withdrawal-requests',
      data
    );
    return WithdrawalRequestMessage.fromJSON(response.data);
  };

  /**
   * Get the logged-in affiliate's withdrawal request history
   */
  getMyWithdrawalRequests = async (
    params: GetWithdrawalRequestsParams
  ): Promise<QueryWithdrawalRequestsResponse> => {
    const { page = 1, limit = 10, filters } = params;

    const queryParams: Record<string, string | number> = { page, limit };
    if (filters?.tab && filters.tab !== 'all') {
      queryParams.status = filters.tab;
    }
    if (filters?.status) {
      queryParams.status = filters.status;
    }

    const response = await axiosInstance.get<unknown>('/affiliate-portal/withdrawal-requests', {
      params: queryParams,
    });

    const parsed = QueryWithdrawalRequestsResponseMessage.fromJSON(response.data);
    const raw = response.data as { data?: Array<Record<string, unknown>> };

    // fromJSON strips fields not in the proto ListItem — merge processedDate back
    if (raw?.data && parsed.data) {
      parsed.data.forEach((item, i) => {
        const src = raw.data![i];
        if (src?.processedDate) {
          (item as any).processedDate = new Date(src.processedDate as string);
        }
      });
    }

    return parsed;
  };

  /**
   * Get a single withdrawal request detail
   */
  getMyWithdrawalRequestById = async (id: string): Promise<WithdrawalRequest> => {
    const response = await axiosInstance.get<unknown>(
      `/affiliate-portal/withdrawal-requests/${id}`
    );
    return WithdrawalRequestMessage.fromJSON(response.data);
  };

  /**
   * Get all product categories (public endpoint, no CMS permissions required)
   */
  getPublicCategories = async (): Promise<ProductCategory[]> => {
    const response = await axiosInstance.get<ProductCategory[]>('/shop/categories');
    return response.data;
  };

  /**
   * Get the logged-in affiliate's product commissions (paginated)
   */
  getMyProductCommissions = async (
    params: GetMyProductCommissionsParams
  ): Promise<ProductCommissionsPage> => {
    const { page = 1, limit = 10, search, categoryName } = params;
    const queryParams: Record<string, string | number> = { page, limit };

    const filters: Record<string, string> = {};
    if (search) filters.search = search;
    if (categoryName) filters.categoryName = categoryName;
    if (Object.keys(filters).length > 0) {
      queryParams.filters = JSON.stringify(filters);
    }

    const response = await axiosInstance.get<ProductCommissionsPage>(
      '/affiliate-portal/product-commissions',
      { params: queryParams }
    );
    return response.data;
  };
}

export const affiliatePortalRepository = new AffiliatePortalRepository();
