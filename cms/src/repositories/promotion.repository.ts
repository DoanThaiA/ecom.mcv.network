import axiosInstance from 'src/utils/axios';

import {
  DiscountType,
  PromotionType,
  type Promotion,
  type PromotionListItem,
  type PromotionListResponse,
  type QueryPromotionsDto,
  type CreatePromotionDto,
  type UpdatePromotionDto,
  type CreateOrderDiscountConfigDto,
} from 'src/types/promotion';
import type { ValidateProductDiscountExcelResponse } from 'src/types/gen/cms/cms/promotions/promotion';
import type {
  ImportSessionResponse,
  ImportSessionRow,
  PaginatedImportSessionRows,
  QueryImportSessionRowsParams,
  ConfirmImportSessionResponse,
  UpdateImportSessionRowData,
} from 'src/types/import-session';
import type { FilterProduct } from 'src/types/products';

// ----------------------------------------------------------------------
// Helper functions for API data transformation
// ----------------------------------------------------------------------

/**
 * Convert DiscountType enum to API string format
 * Backend expects: "fixed" | "percentage"
 */
const discountTypeToApiString = (type: DiscountType): string => {
  switch (type) {
    case DiscountType.DISCOUNT_TYPE_FIXED:
      return 'fixed';
    case DiscountType.DISCOUNT_TYPE_PERCENTAGE:
      return 'percentage';
    default:
      return 'fixed';
  }
};

/**
 * Convert API string format to DiscountType enum
 * API returns: "fixed" | "percentage"
 */
const apiStringToDiscountType = (type: string | undefined): DiscountType => {
  switch (type) {
    case 'fixed':
      return DiscountType.DISCOUNT_TYPE_FIXED;
    case 'percentage':
      return DiscountType.DISCOUNT_TYPE_PERCENTAGE;
    default:
      return DiscountType.DISCOUNT_TYPE_FIXED;
  }
};

/**
 * Extract subType from promotion config based on type
 */
const extractSubType = (doc: any): number | undefined => {
  const type = doc.type as PromotionType;

  switch (type) {
    case PromotionType.PROMOTION_TYPE_BUNDLE_DEAL:
      return doc.bundleDealConfig?.subType;
    case PromotionType.PROMOTION_TYPE_ORDER_DISCOUNT:
      return doc.orderDiscountConfig?.subType;
    case PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT:
      return doc.productDiscountConfig?.subType;
    default:
      return undefined;
  }
};

/**
 * Transform API doc to PromotionListItem
 */
const transformToListItem = (doc: any): PromotionListItem => ({
  id: doc._id || doc.id,
  type: doc.type,
  subType: extractSubType(doc),
  name: doc.name,
  startTime: doc.startTime ? new Date(doc.startTime) : undefined,
  endTime: doc.endTime ? new Date(doc.endTime) : undefined,
  isEnabled: doc.isEnabled ?? true,
  status: doc.status,
  tierCount: doc.bundleDealConfig?.tiers?.length ?? 0,
  createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
  updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
});

/**
 * Transform API response to Promotion with correct enum types
 */
const transformPromotionResponse = (data: any): Promotion => {
  if (data.orderDiscountConfig) {
    return {
      ...data,
      orderDiscountConfig: {
        ...data.orderDiscountConfig,
        discountType: apiStringToDiscountType(data.orderDiscountConfig.discountType),
      },
    };
  }
  return data;
};

/**
 * Transform orderDiscountConfig for API
 * - subType: keep as number (backend expects 1 or 2)
 * - discountType: convert to string (backend expects "fixed" or "percentage")
 */
const transformOrderDiscountConfig = (config: CreateOrderDiscountConfigDto) => ({
  ...config,
  discountType: discountTypeToApiString(config.discountType),
});

/**
 * Transform productDiscountConfig for API
 * - subType: keep as number (backend expects 1 or 2)
 * - discountType removed from config level (now per-product)
 */
const transformProductDiscountConfig = (config: any) => ({
  ...config,
});

/**
 * Promotion Repository
 * Handles all promotion-related API calls
 */
class PromotionRepository {
  /**
   * Query promotions with filters and pagination
   * GET /api/v1/promotions
   */
  queryPromotions = async (params: QueryPromotionsDto): Promise<PromotionListResponse> => {
    const queryParams: Record<string, string | number> = {};

    if (params.page !== undefined) {
      queryParams.page = params.page;
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit;
    }
    if (params.type !== undefined) {
      queryParams.type = params.type;
    }
    if (params.status !== undefined) {
      queryParams.status = params.status;
    }
    if (params.keyword) {
      queryParams.keyword = params.keyword;
    }

    // API returns { docs, totalDocs, ... } but FE expects { data, total, ... }
    const response = await axiosInstance.get<{
      docs: any[];
      totalDocs: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/promotions', {
      params: queryParams,
    });

    // Transform API response to match PromotionListResponse
    return {
      data: (response.data.docs || []).map(transformToListItem),
      total: response.data.totalDocs || 0,
      page: response.data.page || 1,
      limit: response.data.limit || 10,
      totalPages: response.data.totalPages || 0,
    };
  };

  /**
   * Get promotion by ID
   * GET /api/v1/promotions/{id}
   */
  getPromotion = async (id: string): Promise<Promotion> => {
    const response = await axiosInstance.get<Promotion>(`/promotions/${id}`);
    return transformPromotionResponse(response.data);
  };

  /**
   * Create a new promotion
   * POST /api/v1/promotions
   */
  createPromotion = async (data: CreatePromotionDto): Promise<Promotion> => {
    const transformedData = {
      ...data,
      orderDiscountConfig: data.orderDiscountConfig
        ? transformOrderDiscountConfig(data.orderDiscountConfig)
        : undefined,
      productDiscountConfig: data.productDiscountConfig
        ? transformProductDiscountConfig(data.productDiscountConfig)
        : undefined,
    };
    const response = await axiosInstance.post<Promotion>('/promotions', transformedData);
    return transformPromotionResponse(response.data);
  };

  /**
   * Update a promotion
   * PATCH /api/v1/promotions/{id}
   */
  updatePromotion = async (id: string, data: UpdatePromotionDto): Promise<Promotion> => {
    const transformedData = {
      ...data,
      orderDiscountConfig: data.orderDiscountConfig
        ? transformOrderDiscountConfig(data.orderDiscountConfig)
        : undefined,
      productDiscountConfig: data.productDiscountConfig
        ? transformProductDiscountConfig(data.productDiscountConfig)
        : undefined,
    };
    const response = await axiosInstance.patch<Promotion>(`/promotions/${id}`, transformedData);
    return transformPromotionResponse(response.data);
  };

  /**
   * Delete a promotion (soft delete)
   * DELETE /api/v1/promotions/{id}
   */
  deletePromotion = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/promotions/${id}`);
  };

  /**
   * Pause a promotion
   * PATCH /api/v1/promotions/{id}/pause
   */
  pausePromotion = async (id: string): Promise<Promotion> => {
    const response = await axiosInstance.patch<Promotion>(`/promotions/${id}/pause`);
    return transformPromotionResponse(response.data);
  };

  /**
   * Resume a promotion
   * PATCH /api/v1/promotions/{id}/resume
   */
  resumePromotion = async (id: string): Promise<Promotion> => {
    const response = await axiosInstance.patch<Promotion>(`/promotions/${id}/resume`);
    return transformPromotionResponse(response.data);
  };

  /**
   * Validate products from Excel file for product discount
   * POST /api/v1/promotions/validate-products
   */
  validateExcelProducts = async (
    file: File,
    startTime: string,
    endTime: string,
    promotionId?: string
  ): Promise<ValidateProductDiscountExcelResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    if (promotionId) {
      formData.append('promotionId', promotionId);
    }

    const response = await axiosInstance.post<ValidateProductDiscountExcelResponse>(
      '/promotions/validate-products',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  };

  // ==================== Promotion Products (separate collection) ====================

  /**
   * Get promotion products with pagination
   * GET /api/v1/promotions/{id}/products
   */
  getPromotionProducts = async (
    promotionId: string,
    params?: { page?: number; limit?: number; filters?: FilterProduct }
  ): Promise<{
    docs: any[];
    totalDocs: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const { page, limit, filters } = params || {};
    const queryParams: any = { page, limit };

    // Build filters object (only include fields with values)
    // Backend expects JSON string: filters={"search":"value"}
    const filterParams: Record<string, any> = {};
    if (filters?.search) filterParams.search = filters.search;
    if (filters?.categoryIds?.length) filterParams.categoryIds = filters.categoryIds;
    if (filters?.productIds?.length) filterParams.productIds = filters.productIds;
    if (filters?.minPrice !== undefined) filterParams.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) filterParams.maxPrice = filters.maxPrice;

    // Pass filters as JSON string (matching affiliate endpoint format)
    if (Object.keys(filterParams).length > 0) {
      queryParams.filters = JSON.stringify(filterParams);
    }

    const response = await axiosInstance.get(`/promotions/${promotionId}/products`, {
      params: queryParams,
    });
    return response.data;
  };

  /**
   * Get all product IDs associated with a promotion (no pagination)
   * Used for pre-selecting products in ProductSelectionDialog
   * GET /api/v1/promotions/{id}/products/product-ids
   * API Response: { productIds: string[] }
   */
  getPromotionProductIds = async (promotionId: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/promotions/${promotionId}/products/product-ids`);
    return response.data.productIds;
  };

  /**
   * Add a single product to promotion
   * POST /api/v1/promotions/{id}/products
   */
  addPromotionProduct = async (
    promotionId: string,
    data: { productId: string; isEnabled?: boolean }
  ): Promise<any> => {
    const response = await axiosInstance.post(`/promotions/${promotionId}/products`, data);
    return response.data;
  };

  /**
   * Bulk update products in a promotion
   * PATCH /api/v1/promotions/{id}/products/bulk
   */
  bulkUpdatePromotionProducts = async (
    promotionId: string,
    products: Array<{
      productId: string;
      discountType?: string;
      discountValue?: number;
      isEnabled?: boolean;
    }>
  ): Promise<{ updatedCount: number }> => {
    const response = await axiosInstance.patch(`/promotions/${promotionId}/products/bulk`, {
      products,
    });
    return response.data;
  };

  /**
   * Bulk add products to promotion
   * POST /api/v1/promotions/{id}/products/bulk
   */
  bulkAddPromotionProducts = async (
    promotionId: string,
    products: Array<{
      productId: string;
      isEnabled?: boolean;
      discountType?: string;
      discountValue?: number;
    }>
  ): Promise<{ addedCount: number; failedCount: number; failedProducts: any[] }> => {
    const response = await axiosInstance.post(`/promotions/${promotionId}/products/bulk`, {
      products,
    });
    return response.data;
  };

  /**
   * Update a single promotion product
   * PATCH /api/v1/promotions/{id}/products/{productId}
   */
  updatePromotionProduct = async (
    promotionId: string,
    productId: string,
    data: { discountType?: string; discountValue?: number; isEnabled?: boolean }
  ): Promise<any> => {
    const response = await axiosInstance.patch(
      `/promotions/${promotionId}/products/${productId}`,
      data
    );
    return response.data;
  };

  /**
   * Remove a single promotion product
   * DELETE /api/v1/promotions/{id}/products/{productId}
   */
  removePromotionProduct = async (promotionId: string, productId: string): Promise<void> => {
    await axiosInstance.delete(`/promotions/${promotionId}/products/${productId}`);
  };

  /**
   * Toggle a promotion product's enabled status
   * PATCH /api/v1/promotions/{id}/products/{productId}/toggle
   */
  togglePromotionProduct = async (promotionId: string, productId: string): Promise<any> => {
    const response = await axiosInstance.patch(
      `/promotions/${promotionId}/products/${productId}/toggle`
    );
    return response.data;
  };

  // ==================== Import Session Methods ====================

  /**
   * Create import session (upload Excel, validate, persist rows)
   * POST /api/v1/promotions/{promotionId}/import-session
   */
  createImportSession = async (
    promotionId: string,
    file: File,
    startTime: string,
    endTime: string
  ): Promise<ImportSessionResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);

    const response = await axiosInstance.post<ImportSessionResponse>(
      `/promotions/${promotionId}/import-session`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  };

  /**
   * Get import session summary
   * GET /api/v1/promotions/import-session/{sessionId}
   */
  getImportSession = async (sessionId: string): Promise<ImportSessionResponse> => {
    const response = await axiosInstance.get<ImportSessionResponse>(
      `/promotions/import-session/${sessionId}`
    );
    return response.data;
  };

  /**
   * Get paginated import session rows
   * GET /api/v1/promotions/import-session/{sessionId}/rows
   */
  getImportSessionRows = async (
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

    const response = await axiosInstance.get<PaginatedImportSessionRows>(
      `/promotions/import-session/${sessionId}/rows`,
      { params: queryParams }
    );
    return response.data;
  };

  /**
   * Delete a session row
   * DELETE /api/v1/promotions/import-session/{sessionId}/rows/{rowId}
   */
  deleteImportSessionRow = async (
    sessionId: string,
    rowId: string
  ): Promise<ImportSessionResponse> => {
    const response = await axiosInstance.delete<ImportSessionResponse>(
      `/promotions/import-session/${sessionId}/rows/${rowId}`
    );
    return response.data;
  };

  /**
   * Update a session row (inline edit)
   * PATCH /api/v1/promotions/import-session/{sessionId}/rows/{rowId}
   */
  updateImportSessionRow = async (
    sessionId: string,
    rowId: string,
    data: UpdateImportSessionRowData
  ): Promise<ImportSessionRow> => {
    const response = await axiosInstance.patch<ImportSessionRow>(
      `/promotions/import-session/${sessionId}/rows/${rowId}`,
      data
    );
    return response.data;
  };

  /**
   * Confirm import session and start processing job
   * POST /api/v1/promotions/import-session/{sessionId}/confirm
   */
  confirmImportSession = async (sessionId: string): Promise<ConfirmImportSessionResponse> => {
    const response = await axiosInstance.post<ConfirmImportSessionResponse>(
      `/promotions/import-session/${sessionId}/confirm`
    );
    return response.data;
  };
  // ==================== Promotion Statistics Methods ====================

  /**
   * Get orders for a promotion (statistics)
   * GET /api/v1/promotions/{id}/stats/orders
   */
  getPromotionOrders = async (
    promotionId: string,
    params: { page?: number; limit?: number; fromDate?: string; toDate?: string }
  ): Promise<{
    docs: any[];
    totalDocs: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: any;
  }> => {
    const response = await axiosInstance.get(`/promotions/${promotionId}/stats/orders`, {
      params,
    });
    return response.data;
  };

  /**
   * Get product statistics for a promotion
   * GET /api/v1/promotions/{id}/stats/products
   */
  getPromotionProductStats = async (
    promotionId: string,
    params: { page?: number; limit?: number; fromDate?: string; toDate?: string }
  ): Promise<{
    docs: any[];
    totalDocs: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: any;
  }> => {
    const response = await axiosInstance.get(`/promotions/${promotionId}/stats/products`, {
      params,
    });
    return response.data;
  };
}

export const promotionRepository = new PromotionRepository();
