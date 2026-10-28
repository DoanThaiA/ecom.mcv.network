import axiosInstance from 'src/utils/axios';

import type { ShippingPromotion } from 'src/types/gen/shared/shared/shipping/shipping-promotion';
import type {
  CreateShippingPromotionRequest,
  UpdateShippingPromotionRequest,
  QueryShippingPromotionsRequest,
  QueryShippingPromotionsResponse,
} from 'src/types/gen/cms/cms/shipping/shipping-promotion';
import {
  shippingPromotionTypeToApiString,
  shippingPromotionStatusToApiString,
  discountTypeToApiString,
  apiStringToShippingPromotionType,
  apiStringToDiscountType,
} from 'src/types/shipping-promotion';

/**
 * Helper to convert shippingDiscountConfig tiers to API format
 */
const convertTiersToApiFormat = (config: {
  tiers: Array<{ minimumOrderValue: number; discountType: number; discountValue: number }>;
}) => ({
  tiers: config.tiers.map((tier) => ({
    ...tier,
    discountType: discountTypeToApiString(tier.discountType),
  })),
});

/**
 * Shipping Promotion Repository
 * Handles all shipping promotion-related API calls
 */
class ShippingPromotionRepository {
  /**
   * Query shipping promotions with filters, sort and pagination
   * GET /api/v1/shipping-promotions
   */
  queryShippingPromotions = async (
    params: QueryShippingPromotionsRequest
  ): Promise<QueryShippingPromotionsResponse> => {
    const queryParams: Record<string, string> = {};

    if (params.page !== undefined) {
      queryParams.page = params.page.toString();
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }
    if (params.filters) {
      const apiFilters: Record<string, unknown> = { ...params.filters };
      if (params.filters.status !== undefined) {
        apiFilters.status = shippingPromotionStatusToApiString(params.filters.status);
      }
      queryParams.filters = JSON.stringify(apiFilters);
    }
    if (params.sort && params.sort.length > 0) {
      queryParams.sort = JSON.stringify(params.sort);
    }

    const response = await axiosInstance.get<QueryShippingPromotionsResponse>(
      '/shipping-promotions',
      {
        params: queryParams,
      }
    );

    return response.data;
  };

  /**
   * Get shipping promotion by ID
   * GET /api/v1/shipping-promotions/{id}
   */
  getShippingPromotion = async (id: string): Promise<ShippingPromotion> => {
    const response = await axiosInstance.get<ShippingPromotion>(`/shipping-promotions/${id}`);
    const data = response.data;

    // Map type from API string to enum
    data.type = apiStringToShippingPromotionType(data.type as unknown as string);

    // Map shippingDiscountConfig tiers discountType from API string to enum
    if (data.shippingDiscountConfig?.tiers) {
      data.shippingDiscountConfig.tiers = data.shippingDiscountConfig.tiers.map((tier) => ({
        ...tier,
        discountType: apiStringToDiscountType(tier.discountType as unknown as string),
      }));
    }

    return data;
  };

  /**
   * Create a new shipping promotion
   * POST /api/v1/shipping-promotions
   */
  createShippingPromotion = async (
    data: CreateShippingPromotionRequest
  ): Promise<ShippingPromotion> => {
    // Convert enums to API string format
    const payload: Record<string, unknown> = {
      ...data,
      type: shippingPromotionTypeToApiString(data.type),
    };
    // Convert shippingDiscountConfig tiers if present
    if (data.shippingDiscountConfig) {
      payload.shippingDiscountConfig = convertTiersToApiFormat(data.shippingDiscountConfig);
    }
    const response = await axiosInstance.post<ShippingPromotion>('/shipping-promotions', payload);
    return response.data;
  };

  /**
   * Update a shipping promotion
   * PATCH /api/v1/shipping-promotions/{id}
   */
  updateShippingPromotion = async (
    id: string,
    data: Omit<UpdateShippingPromotionRequest, 'id'>
  ): Promise<ShippingPromotion> => {
    // Convert enums to API string format
    const payload: Record<string, unknown> = { ...data };
    // Convert shippingDiscountConfig tiers if present
    if (data.shippingDiscountConfig) {
      payload.shippingDiscountConfig = convertTiersToApiFormat(data.shippingDiscountConfig);
    }
    const response = await axiosInstance.patch<ShippingPromotion>(
      `/shipping-promotions/${id}`,
      payload
    );
    return response.data;
  };

  /**
   * Delete a shipping promotion (soft delete)
   * DELETE /api/v1/shipping-promotions/{id}
   */
  deleteShippingPromotion = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/shipping-promotions/${id}`);
  };

  /**
   * Toggle shipping promotion enabled/disabled
   * PATCH /api/v1/shipping-promotions/{id}/toggle
   */
  toggleShippingPromotion = async (id: string): Promise<ShippingPromotion> => {
    const response = await axiosInstance.patch<ShippingPromotion>(
      `/shipping-promotions/${id}/toggle`
    );
    return response.data;
  };
}

export const shippingPromotionRepository = new ShippingPromotionRepository();
