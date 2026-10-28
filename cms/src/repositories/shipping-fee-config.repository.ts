import axiosInstance from 'src/utils/axios';

import type { ShippingFeeConfig } from 'src/types/gen/shared/shared/shipping/shipping-fee-config';
import type {
  ShippingFeeConfigListResponse,
  CreateShippingFeeConfigDto,
  UpdateShippingFeeConfigDto,
  QueryShippingFeeConfigsDto,
  TestShippingCalculationDto,
  TestShippingCalculationResponse,
} from 'src/types/shipping-fee-config';

/**
 * Shipping Fee Config Repository
 * Handles all shipping fee configuration-related API calls
 */
class ShippingFeeConfigRepository {
  /**
   * Query shipping fee configs with filters, sort and pagination
   * GET /api/v1/shipping-fee-configs
   */
  queryShippingFeeConfigs = async (
    params: QueryShippingFeeConfigsDto
  ): Promise<ShippingFeeConfigListResponse> => {
    const queryParams: Record<string, string> = {};

    if (params.page !== undefined) {
      queryParams.page = params.page.toString();
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }
    if (params.search) {
      queryParams.search = params.search;
    }
    if (params.method !== undefined) {
      queryParams.method = params.method.toString();
    }
    if (params.status !== undefined) {
      queryParams.status = params.status.toString();
    }
    if (params.isActive !== undefined) {
      queryParams.isActive = params.isActive.toString();
    }

    const response = await axiosInstance.get<ShippingFeeConfigListResponse>(
      '/shipping-fee-configs',
      {
        params: queryParams,
      }
    );

    return response.data;
  };

  /**
   * Get shipping fee config by ID
   * GET /api/v1/shipping-fee-configs/{id}
   */
  getShippingFeeConfig = async (id: string): Promise<ShippingFeeConfig> => {
    const response = await axiosInstance.get<ShippingFeeConfig>(`/shipping-fee-configs/${id}`);
    return response.data;
  };

  /**
   * Get active shipping fee config
   * GET /api/v1/shipping-fee-configs/active
   */
  getActiveShippingFeeConfig = async (): Promise<ShippingFeeConfig | null> => {
    const response = await axiosInstance.get<{ config: ShippingFeeConfig | null }>(
      '/shipping-fee-configs/active'
    );
    return response.data.config;
  };

  /**
   * Create a new shipping fee config
   * POST /api/v1/shipping-fee-configs
   */
  createShippingFeeConfig = async (
    data: CreateShippingFeeConfigDto
  ): Promise<ShippingFeeConfig> => {
    const response = await axiosInstance.post<ShippingFeeConfig>('/shipping-fee-configs', data);
    return response.data;
  };

  /**
   * Update a shipping fee config
   * PATCH /api/v1/shipping-fee-configs/{id}
   */
  updateShippingFeeConfig = async (
    id: string,
    data: UpdateShippingFeeConfigDto
  ): Promise<ShippingFeeConfig> => {
    const response = await axiosInstance.patch<ShippingFeeConfig>(
      `/shipping-fee-configs/${id}`,
      data
    );
    return response.data;
  };

  /**
   * Delete a shipping fee config (soft delete)
   * DELETE /api/v1/shipping-fee-configs/{id}
   */
  deleteShippingFeeConfig = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/shipping-fee-configs/${id}`);
  };

  /**
   * Toggle shipping fee config active/inactive
   * PATCH /api/v1/shipping-fee-configs/{id}/toggle
   */
  toggleShippingFeeConfig = async (id: string): Promise<ShippingFeeConfig> => {
    const response = await axiosInstance.patch<ShippingFeeConfig>(
      `/shipping-fee-configs/${id}/toggle`
    );
    return response.data;
  };

  /**
   * Test shipping fee calculation
   * POST /api/v1/shipping-fee-configs/test-calculation
   */
  testShippingCalculation = async (
    data: TestShippingCalculationDto
  ): Promise<TestShippingCalculationResponse> => {
    const response = await axiosInstance.post<TestShippingCalculationResponse>(
      '/shipping-fee-configs/test-calculation',
      data
    );
    return response.data;
  };
}

export const shippingFeeConfigRepository = new ShippingFeeConfigRepository();
