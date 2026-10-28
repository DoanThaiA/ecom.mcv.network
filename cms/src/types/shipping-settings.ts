// ==================== Re-export from Generated Proto Types ====================

// Enums and types from shared/shipping/shipping-settings
export {
  ShippingCalculationMethod,
  shippingCalculationMethodFromJSON,
  shippingCalculationMethodToJSON,
} from 'src/types/gen/shared/shared/shipping/shipping-settings';

export type { ShippingSettings } from 'src/types/gen/shared/shared/shipping/shipping-settings';

// CMS DTOs from cms/shipping/shipping-settings
export type { UpdateShippingSettingsRequest } from 'src/types/gen/cms/cms/shipping/shipping-settings';

// ==================== Local Types (for simplified UX) ====================

import { ShippingCalculationMethod } from 'src/types/gen/shared/shared/shipping/shipping-settings';
import type { ShippingSettings } from 'src/types/gen/shared/shared/shipping/shipping-settings';

/**
 * Simplified shipping methods for the new UX
 * Maps to the underlying ShippingCalculationMethod enum
 */
export enum SimplifiedShippingMethod {
  CARRIER_API = 'CARRIER_API', // Tính phí theo DVVC - uses nhanh.vn API
  FIXED_PER_ORDER = 'FIXED_PER_ORDER', // Cố định theo đơn hàng - single fixed fee
  DISTANCE_BASED = 'DISTANCE_BASED', // Tính phí theo km - multiple distance tiers (local only)
}

/**
 * Distance-based shipping tier for "Tính phí theo km"
 */
export interface DistanceTier {
  id: string;
  fromKm: number;
  toKm: number;
  fee: number;
}

/**
 * Shipping fee settings form data for the simplified UX
 */
export interface ShippingFeeSettingsData {
  method: SimplifiedShippingMethod;
  fixedFee?: number; // For FIXED_PER_ORDER
  distanceTiers?: DistanceTier[]; // For DISTANCE_BASED (local only)
}

// ==================== Helper Functions ====================

/**
 * Get default distance tiers for new settings
 */
export const getDefaultDistanceTiers = (): DistanceTier[] => [
  { id: '1', fromKm: 0, toKm: 5, fee: 15000 },
  { id: '2', fromKm: 5, toKm: 10, fee: 25000 },
  { id: '3', fromKm: 10, toKm: 20, fee: 35000 },
];

/**
 * Get default shipping fee settings
 */
export const getDefaultShippingFeeSettings = (): ShippingFeeSettingsData => ({
  method: SimplifiedShippingMethod.CARRIER_API,
  fixedFee: 30000,
  distanceTiers: getDefaultDistanceTiers(),
});

/**
 * Validate distance tiers for overlapping ranges
 * Returns array of error messages (empty if valid)
 */
export const validateDistanceTiers = (tiers: DistanceTier[]): string[] => {
  const errors: string[] = [];

  // Check for overlapping ranges
  // Range A-B means > A and <= B, so 0-30 and 30-50 are OK (>0,<=30 and >30,<=50)
  for (let i = 0; i < tiers.length; i++) {
    for (let j = i + 1; j < tiers.length; j++) {
      const a = tiers[i];
      const b = tiers[j];
      // Ranges overlap if neither is completely before the other
      // a is before b if a.toKm <= b.fromKm
      // b is before a if b.toKm <= a.fromKm
      if (!(a.toKm <= b.fromKm || b.toKm <= a.fromKm)) {
        errors.push(`distanceTierOverlap`);
        break;
      }
    }
    if (errors.length > 0) break;
  }

  return errors;
};

// ==================== API Mapping Utilities ====================

/**
 * Convert SimplifiedShippingMethod to ShippingCalculationMethod enum (for API)
 * Note: DISTANCE_BASED is not supported by the backend proto
 */
export const simplifiedToCalculationMethod = (
  simplified: SimplifiedShippingMethod
): ShippingCalculationMethod | null => {
  switch (simplified) {
    case SimplifiedShippingMethod.CARRIER_API:
      return ShippingCalculationMethod.SHIPPING_CALCULATION_METHOD_CARRIER_BASED;
    case SimplifiedShippingMethod.FIXED_PER_ORDER:
      return ShippingCalculationMethod.SHIPPING_CALCULATION_METHOD_FIXED;
    case SimplifiedShippingMethod.DISTANCE_BASED:
      // Not supported by proto - returns null
      return null;
    default:
      return null;
  }
};

/**
 * Convert ShippingCalculationMethod to SimplifiedShippingMethod (from API)
 * Note: API returns snake_case strings like "fixed", "carrier_based"
 */
export const calculationMethodToSimplified = (
  method: ShippingCalculationMethod | string
): SimplifiedShippingMethod | null => {
  // Handle string values from API (snake_case)
  if (typeof method === 'string') {
    switch (method) {
      case 'carrier_based':
        return SimplifiedShippingMethod.CARRIER_API;
      case 'fixed':
        return SimplifiedShippingMethod.FIXED_PER_ORDER;
      default:
        return null;
    }
  }

  // Handle enum values (numbers)
  switch (method) {
    case ShippingCalculationMethod.SHIPPING_CALCULATION_METHOD_CARRIER_BASED:
      return SimplifiedShippingMethod.CARRIER_API;
    case ShippingCalculationMethod.SHIPPING_CALCULATION_METHOD_FIXED:
      return SimplifiedShippingMethod.FIXED_PER_ORDER;
    default:
      return null;
  }
};

/**
 * Check if a simplified method is supported by the backend API
 */
export const isMethodSupportedByApi = (method: SimplifiedShippingMethod): boolean => {
  return (
    method === SimplifiedShippingMethod.CARRIER_API ||
    method === SimplifiedShippingMethod.FIXED_PER_ORDER
  );
};

/**
 * Convert ShippingSettings (from API) to ShippingFeeSettingsData (for UI)
 */
export const apiSettingsToLocal = (settings: ShippingSettings | null): ShippingFeeSettingsData => {
  if (!settings) {
    return getDefaultShippingFeeSettings();
  }

  const simplifiedMethod = calculationMethodToSimplified(settings.calculationMethod);

  if (simplifiedMethod === SimplifiedShippingMethod.FIXED_PER_ORDER) {
    return {
      method: SimplifiedShippingMethod.FIXED_PER_ORDER,
      fixedFee: settings.fixedShippingFee,
      distanceTiers: getDefaultDistanceTiers(),
    };
  }

  if (simplifiedMethod === SimplifiedShippingMethod.CARRIER_API) {
    return {
      method: SimplifiedShippingMethod.CARRIER_API,
      fixedFee: 30000,
      distanceTiers: getDefaultDistanceTiers(),
    };
  }

  // Default to CARRIER_API if method is not recognized
  return getDefaultShippingFeeSettings();
};

/**
 * Backend API calculation method values (snake_case strings)
 */
export type ApiCalculationMethod = 'carrier_based' | 'fixed';

/**
 * Convert ShippingFeeSettingsData (from UI) to API update payload
 * Returns null if method is not supported by API (DISTANCE_BASED)
 * Note: Backend expects snake_case strings, not enum numbers
 */
export const settingsToApiPayload = (
  settings: ShippingFeeSettingsData
): {
  calculationMethod: ApiCalculationMethod;
  fixedShippingFee?: number;
} | null => {
  if (!isMethodSupportedByApi(settings.method)) {
    return null;
  }

  if (settings.method === SimplifiedShippingMethod.FIXED_PER_ORDER) {
    return {
      calculationMethod: 'fixed',
      fixedShippingFee: settings.fixedFee || 30000,
    };
  }

  if (settings.method === SimplifiedShippingMethod.CARRIER_API) {
    return {
      calculationMethod: 'carrier_based',
    };
  }

  return null;
};
