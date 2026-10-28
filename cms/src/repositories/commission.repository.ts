import axiosInstance from 'src/utils/axios';
import type {
  UpdateCommissionSettingsRequest,
  UpdateCommissionSettingsResponse,
} from 'src/types/gen/cms/cms/commission-settings/commission-settings';
import type { CommissionSettingsResponse } from 'src/types/gen/shared/shared/commission-settings/commission-settings';
import { UpdateCommissionSettingsResponse as UpdateCommissionSettingsResponseProto } from 'src/types/gen/cms/cms/commission-settings/commission-settings';
import { CommissionSettingsResponse as CommissionSettingsResponseProto } from 'src/types/gen/shared/shared/commission-settings/commission-settings';
import type {
  ProductCommission,
  ProductCommissionsPage,
} from 'src/types/gen/shared/shared/product-commissions/product-commission';
import type {
  ConfirmImportSessionResponse,
  ImportSessionResponse,
  PaginatedImportSessionRows,
  QueryImportSessionRowsParams,
} from 'src/types/import-session';

/**
 * Commission Repository
 * Handles API calls for commission settings and product commissions
 */
class CommissionRepository {
  /**
   * Get commission settings (singleton)
   * @returns Commission settings response
   */
  getCommissionSettings = async (): Promise<CommissionSettingsResponse> => {
    const response = await axiosInstance.get('/commission-settings');
    // Deserialize using proto's fromJSON to handle snake_case and defaults
    const parsed = CommissionSettingsResponseProto.fromJSON(response.data);
    // Preserve raw string commission trigger (proto fromJSON doesn't handle lowercase)
    const rawTrigger = response.data.commissionTrigger ?? response.data.commission_trigger;
    if (rawTrigger != null) {
      (parsed as Record<string, unknown>).commissionTrigger = rawTrigger;
    }
    return parsed;
  };

  /**
   * Update commission settings
   * @param data Update request with defaultCommissionRate and/or autoUpdateProducts
   * @returns Update response with settings and optional jobId
   */
  updateCommissionSettings = async (
    data: UpdateCommissionSettingsRequest
  ): Promise<UpdateCommissionSettingsResponse> => {
    const response = await axiosInstance.patch('/commission-settings', data);

    // Deserialize using proto's fromJSON
    const parsed = UpdateCommissionSettingsResponseProto.fromJSON(response.data);

    // Handle case where backend returns flat structure instead of nested
    // If settings is undefined but we have root-level id, the API returned flat structure
    if (!parsed.settings && response.data.id) {
      // Deserialize the root-level fields as CommissionSettingsResponse
      parsed.settings = CommissionSettingsResponseProto.fromJSON(response.data);
    }

    // Preserve raw string commission trigger on the settings object
    if (parsed.settings) {
      const rawTrigger =
        (response.data.settings ?? response.data).commissionTrigger ??
        (response.data.settings ?? response.data).commission_trigger;
      if (rawTrigger != null) {
        (parsed.settings as Record<string, unknown>).commissionTrigger = rawTrigger;
      }
    }

    return parsed;
  };

  /**
   * Get product commissions (paginated)
   * @param params Pagination and search parameters
   * @returns Paginated product commissions
   */
  getProductCommissions = async (params: {
    page: number;
    limit: number;
    search?: string;
    categoryNames?: string[];
  }): Promise<ProductCommissionsPage> => {
    const queryParams: Record<string, any> = {
      page: params.page,
      limit: params.limit,
      affiliateId: null, // null = global commissions
    };

    const filters: Record<string, string | string[]> = {};
    if (params.search) filters.search = params.search;
    if (params.categoryNames?.length) filters.categoryNames = params.categoryNames;
    if (Object.keys(filters).length > 0) {
      queryParams.filters = JSON.stringify(filters);
    }

    const response = await axiosInstance.get<ProductCommissionsPage>(
      '/commission-settings/products',
      {
        params: queryParams,
      }
    );
    return response.data;
  };

  /**
   * Add products to commission list
   * @param products Array of products with productId
   */
  addProductCommissions = async (products: Array<{ productId: string }>): Promise<void> => {
    await axiosInstance.post('/commission-settings/products', {
      products,
    });
  };

  /**
   * Update single product commission rate
   * @param productId Product ID
   * @param commissionRate New commission rate
   * @returns Updated product commission
   */
  updateProductCommission = async (
    productId: string,
    commissionRate: number
  ): Promise<ProductCommission> => {
    const response = await axiosInstance.patch<ProductCommission>(
      `/commission-settings/products/${productId}`,
      {
        commissionRate,
      }
    );
    return response.data;
  };

  /**
   * Bulk update product commission rates
   * @param productIds Array of product IDs
   * @param commissionRate New commission rate to apply to all
   */
  bulkUpdateProductCommissions = async (
    productIds: string[],
    commissionRate: number
  ): Promise<void> => {
    await axiosInstance.post('/commission-settings/products/bulk-update-rate', {
      productIds,
      commissionRate,
    });
  };

  /**
   * Delete single product from commission list
   * @param productId Product ID to delete
   */
  deleteProductCommission = async (productId: string): Promise<void> => {
    await axiosInstance.delete(`/commission-settings/products/${productId}`);
  };

  /**
   * Bulk delete products from commission list
   * @param productIds Array of product IDs to delete
   */
  bulkDeleteProductCommissions = async (productIds: string[]): Promise<void> => {
    await axiosInstance.post('/commission-settings/products/bulk-delete', {
      productIds,
    });
  };

  // ------------------------------------------------------------------------
  // Affiliate-specific product commissions
  // ------------------------------------------------------------------------

  /**
   * Get affiliate product commissions (paginated)
   * @param affiliateId Affiliate ID
   * @param params Pagination, search, and category filter parameters
   * @returns Paginated product commissions for the affiliate
   */
  getAffiliateProductCommissions = async (
    affiliateId: string,
    params: { page: number; limit: number; search?: string; categoryNames?: string[] }
  ): Promise<ProductCommissionsPage> => {
    const queryParams: Record<string, any> = {
      page: params.page,
      limit: params.limit,
    };

    // Build filters object like global method does
    const filters: Record<string, string | string[]> = {};
    if (params.search) filters.search = params.search;
    if (params.categoryNames?.length) filters.categoryNames = params.categoryNames;

    // Add filters to query params if any exist
    if (Object.keys(filters).length > 0) {
      queryParams.filters = JSON.stringify(filters);
    }

    const response = await axiosInstance.get<ProductCommissionsPage>(
      `/affiliates/${affiliateId}/product-commissions`,
      { params: queryParams }
    );
    return response.data;
  };

  /**
   * Add products to affiliate commission list
   * @param affiliateId Affiliate ID
   * @param products Array of products with productId and commissionRate
   * @returns Updated product commissions page
   */
  addAffiliateProductCommissions = async (
    affiliateId: string,
    products: Array<{ productId: string; commissionRate: number }>
  ): Promise<ProductCommissionsPage> => {
    const response = await axiosInstance.post<ProductCommissionsPage>(
      `/affiliates/${affiliateId}/product-commissions`,
      { products }
    );
    return response.data;
  };

  /**
   * Update single affiliate product commission rate
   * @param affiliateId Affiliate ID
   * @param productId Product ID
   * @param commissionRate New commission rate
   * @returns Updated product commission
   */
  updateAffiliateProductCommission = async (
    affiliateId: string,
    productId: string,
    commissionRate: number
  ): Promise<ProductCommission> => {
    const response = await axiosInstance.patch<ProductCommission>(
      `/affiliates/${affiliateId}/product-commissions/${productId}`,
      { commissionRate }
    );
    return response.data;
  };

  /**
   * Bulk update affiliate product commission rates
   * @param affiliateId Affiliate ID
   * @param productIds Array of product IDs
   * @param commissionRate New commission rate to apply to all
   */
  bulkUpdateAffiliateProductCommissions = async (
    affiliateId: string,
    productIds: string[],
    commissionRate: number
  ): Promise<void> => {
    await axiosInstance.post(`/affiliates/${affiliateId}/product-commissions/bulk-update-rate`, {
      productIds,
      commissionRate,
    });
  };

  /**
   * Delete single product from affiliate commission list
   * @param affiliateId Affiliate ID
   * @param productId Product ID to delete
   */
  deleteAffiliateProductCommission = async (
    affiliateId: string,
    productId: string
  ): Promise<void> => {
    await axiosInstance.delete(`/affiliates/${affiliateId}/product-commissions/${productId}`);
  };

  /**
   * Bulk delete products from affiliate commission list
   * @param affiliateId Affiliate ID
   * @param productIds Array of product IDs to delete
   */
  bulkDeleteAffiliateProductCommissions = async (
    affiliateId: string,
    productIds: string[]
  ): Promise<void> => {
    await axiosInstance.post(`/affiliates/${affiliateId}/product-commissions/bulk-delete`, {
      productIds,
    });
  };

  /**
   * Get all product IDs assigned to an affiliate (no pagination)
   * @param affiliateId Affiliate ID
   * @returns Array of all product IDs
   */
  getAffiliateProductIds = async (affiliateId: string): Promise<string[]> => {
    const response = await axiosInstance.get<{ productIds: string[] }>(
      `/affiliates/${affiliateId}/product-commissions/product-ids`
    );
    return response.data.productIds;
  };

  // ------------------------------------------------------------------------
  // Excel import session (affiliate-specific + global commission settings)
  // ------------------------------------------------------------------------

  /**
   * Build the base URL for product commission import session endpoints.
   * `affiliateId = null` targets the global Cài đặt hoa hồng scope.
   */
  private getImportSessionBaseUrl = (affiliateId: string | null): string =>
    affiliateId
      ? `/affiliates/${affiliateId}/product-commissions`
      : '/commission-settings/products';

  /**
   * Upload Excel and create an import session.
   * @param affiliateId Affiliate ID, or null for global Cài đặt hoa hồng
   * @param file Excel file (.xlsx / .xls)
   */
  createProductCommissionImportSession = async (
    affiliateId: string | null,
    file: File
  ): Promise<ImportSessionResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = this.getImportSessionBaseUrl(affiliateId);
    const response = await axiosInstance.post<ImportSessionResponse>(
      `${baseUrl}/import-session`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  };

  /**
   * Get paginated rows for a product commission import session.
   */
  getProductCommissionImportSessionRows = async (
    affiliateId: string | null,
    sessionId: string,
    params: QueryImportSessionRowsParams
  ): Promise<PaginatedImportSessionRows> => {
    const queryParams: Record<string, string> = {
      page: params.page.toString(),
      limit: params.limit.toString(),
    };
    if (params.isValid !== undefined) {
      queryParams.isValid = params.isValid.toString();
    }
    if (params.search) {
      queryParams.search = params.search;
    }

    const baseUrl = this.getImportSessionBaseUrl(affiliateId);
    const response = await axiosInstance.get<PaginatedImportSessionRows>(
      `${baseUrl}/import-session/${sessionId}/rows`,
      { params: queryParams }
    );
    return response.data;
  };

  /**
   * Delete a row from a product commission import session preview.
   */
  deleteProductCommissionImportSessionRow = async (
    affiliateId: string | null,
    sessionId: string,
    rowId: string
  ): Promise<ImportSessionResponse> => {
    const baseUrl = this.getImportSessionBaseUrl(affiliateId);
    const response = await axiosInstance.delete<ImportSessionResponse>(
      `${baseUrl}/import-session/${sessionId}/rows/${rowId}`
    );
    return response.data;
  };

  /**
   * Confirm a product commission import session and start the background job.
   */
  confirmProductCommissionImportSession = async (
    affiliateId: string | null,
    sessionId: string
  ): Promise<ConfirmImportSessionResponse> => {
    const baseUrl = this.getImportSessionBaseUrl(affiliateId);
    const response = await axiosInstance.post<ConfirmImportSessionResponse>(
      `${baseUrl}/import-session/${sessionId}/confirm`
    );
    return response.data;
  };
}

export const commissionRepository = new CommissionRepository();
