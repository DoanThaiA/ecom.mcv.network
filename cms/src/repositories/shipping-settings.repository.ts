import axiosInstance from 'src/utils/axios';

import type { ShippingSettings } from 'src/types/gen/shared/shared/shipping/shipping-settings';
import type { ApiCalculationMethod } from 'src/types/shipping-settings';

/**
 * API request type for updating shipping settings
 * Note: Backend expects snake_case string values for calculationMethod
 */
interface UpdateShippingSettingsApiRequest {
  calculationMethod?: ApiCalculationMethod;
  fixedShippingFee?: number;
}

/**
 * Shipping Settings Repository
 * Handles shipping settings API calls (singleton settings)
 */
class ShippingSettingsRepository {
  /**
   * Get shipping settings (singleton)
   * GET /api/v1/shipping-settings
   */
  getShippingSettings = async (): Promise<ShippingSettings> => {
    const response = await axiosInstance.get<ShippingSettings>('/shipping-settings');
    return response.data;
  };

  /**
   * Update shipping settings
   * PATCH /api/v1/shipping-settings
   */
  updateShippingSettings = async (
    data: UpdateShippingSettingsApiRequest
  ): Promise<ShippingSettings> => {
    const response = await axiosInstance.patch<ShippingSettings>('/shipping-settings', data);
    return response.data;
  };
}

export const shippingSettingsRepository = new ShippingSettingsRepository();
