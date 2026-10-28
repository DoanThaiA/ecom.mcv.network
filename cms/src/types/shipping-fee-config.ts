// ==================== Local Types (not in proto) ====================

import type {
  ShippingFeeConfigListItem,
  FlatRateConfig,
  FreeThresholdConfig,
  WeightBasedConfig,
  LocationBasedConfig,
  TieredShippingConfig,
  CarrierBasedConfig,
} from 'src/types/gen/shared/shared/shipping/shipping-fee-config';
import {
  ShippingFeeMethod,
  ShippingFeeConfigStatus,
} from 'src/types/gen/shared/shared/common/enums';

// ==================== Types for Repository ====================

export interface ShippingFeeConfigListResponse {
  data: ShippingFeeConfigListItem[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateShippingFeeConfigDto {
  name: string;
  method: ShippingFeeMethod;
  defaultProductWeight?: number;
  flatRateConfig?: FlatRateConfig;
  carrierBasedConfig?: CarrierBasedConfig;
}

export interface UpdateShippingFeeConfigDto {
  name?: string;
  method?: ShippingFeeMethod;
  flatRateConfig?: FlatRateConfig;
  carrierBasedConfig?: CarrierBasedConfig;
}

export interface TestShippingCalculationDto {
  productWeight: number;
  orderValue: number;
}

export interface TestShippingCalculationResponse {
  fee: number;
  method: ShippingFeeMethod;
}

/**
 * Local interface for QueryShippingFeeConfigsDto with flat params (for repository)
 */
export interface QueryShippingFeeConfigsDto {
  page?: number;
  limit?: number;
  search?: string;
  method?: ShippingFeeMethod;
  status?: ShippingFeeConfigStatus;
  isActive?: boolean;
}

/**
 * Pagination info for list view
 */
export interface ShippingFeeConfigPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== Helper Functions ====================

/**
 * Convert ShippingFeeMethod to translation key
 */
export const shippingFeeMethodToKey = (method: ShippingFeeMethod): string => {
  switch (method) {
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_FLAT_RATE:
      return 'flatRate';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_FREE_THRESHOLD:
      return 'freeThreshold';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_WEIGHT_BASED:
      return 'weightBased';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_LOCATION_BASED:
      return 'locationBased';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_TIERED:
      return 'tieredShipping';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_CARRIER_BASED:
      return 'carrierBased';
    default:
      return 'unknown';
  }
};

/**
 * Convert ShippingFeeConfigStatus to translation key
 */
export const shippingFeeConfigStatusToKey = (status: ShippingFeeConfigStatus): string => {
  switch (status) {
    case ShippingFeeConfigStatus.SHIPPING_FEE_CONFIG_STATUS_ACTIVE:
      return 'active';
    case ShippingFeeConfigStatus.SHIPPING_FEE_CONFIG_STATUS_UPCOMING:
      return 'upcoming';
    case ShippingFeeConfigStatus.SHIPPING_FEE_CONFIG_STATUS_ENDED:
      return 'ended';
    case ShippingFeeConfigStatus.SHIPPING_FEE_CONFIG_STATUS_INACTIVE:
      return 'inactive';
    default:
      return 'unknown';
  }
};

/**
 * Get MUI Chip color for ShippingFeeConfigStatus
 */
export const getShippingFeeConfigStatusColor = (
  status: ShippingFeeConfigStatus
): 'success' | 'info' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case ShippingFeeConfigStatus.SHIPPING_FEE_CONFIG_STATUS_ACTIVE:
      return 'success';
    case ShippingFeeConfigStatus.SHIPPING_FEE_CONFIG_STATUS_UPCOMING:
      return 'info';
    case ShippingFeeConfigStatus.SHIPPING_FEE_CONFIG_STATUS_ENDED:
      return 'error';
    case ShippingFeeConfigStatus.SHIPPING_FEE_CONFIG_STATUS_INACTIVE:
      return 'warning';
    default:
      return 'default';
  }
};

/**
 * Get MUI Chip color for ShippingFeeMethod
 */
export const getShippingFeeMethodColor = (
  method: ShippingFeeMethod
): 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default' => {
  switch (method) {
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_FLAT_RATE:
      return 'primary';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_FREE_THRESHOLD:
      return 'success';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_WEIGHT_BASED:
      return 'info';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_LOCATION_BASED:
      return 'warning';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_TIERED:
      return 'secondary';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_CARRIER_BASED:
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get method description key for radio button descriptions
 */
export const getShippingFeeMethodDescriptionKey = (method: ShippingFeeMethod): string => {
  switch (method) {
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_FLAT_RATE:
      return 'flatRateDescription';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_FREE_THRESHOLD:
      return 'freeThresholdDescription';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_WEIGHT_BASED:
      return 'weightBasedDescription';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_LOCATION_BASED:
      return 'locationBasedDescription';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_TIERED:
      return 'tieredShippingDescription';
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_CARRIER_BASED:
      return 'carrierBasedDescription';
    default:
      return '';
  }
};

/**
 * Get all shipping fee methods as array for iteration
 */
export const getAllShippingFeeMethods = (): ShippingFeeMethod[] => [
  ShippingFeeMethod.SHIPPING_FEE_METHOD_FLAT_RATE,
  ShippingFeeMethod.SHIPPING_FEE_METHOD_FREE_THRESHOLD,
  ShippingFeeMethod.SHIPPING_FEE_METHOD_WEIGHT_BASED,
  ShippingFeeMethod.SHIPPING_FEE_METHOD_LOCATION_BASED,
  ShippingFeeMethod.SHIPPING_FEE_METHOD_TIERED,
  ShippingFeeMethod.SHIPPING_FEE_METHOD_CARRIER_BASED,
];

/**
 * Default empty configs for form initialization
 */
export const getDefaultFlatRateConfig = (): FlatRateConfig => ({
  fee: 30000,
});

export const getDefaultFreeThresholdConfig = (): FreeThresholdConfig => ({
  threshold: 600000,
  feeBelow: 30000,
});

export const getDefaultWeightBasedConfig = (): WeightBasedConfig => ({
  baseWeight: 500,
  baseFee: 30000,
  additionalFeePerKg: 5000,
  tiers: [],
});

export const getDefaultLocationBasedConfig = (): LocationBasedConfig => ({
  tiers: [],
  defaultFee: 30000,
});

export const getDefaultTieredShippingConfig = (): TieredShippingConfig => ({
  tiers: [],
});

export const getDefaultCarrierBasedConfig = (): CarrierBasedConfig => ({
  markupPercentage: 0,
  markupFixed: 0,
});

// ==================== Simplified UX Types (for new settings page) ====================

/**
 * Simplified shipping methods for the new UX
 * Maps to the underlying ShippingFeeMethod enum
 */
export enum SimplifiedShippingMethod {
  CARRIER_API = 'CARRIER_API', // Tính phí theo DVVC - uses nhanh.vn API
  FIXED_PER_ORDER = 'FIXED_PER_ORDER', // Cố định theo đơn hàng - single fixed fee
  DISTANCE_BASED = 'DISTANCE_BASED', // Tính phí theo km - multiple distance tiers
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
  distanceTiers?: DistanceTier[]; // For DISTANCE_BASED
}

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
 * Convert SimplifiedShippingMethod to ShippingFeeMethod enum (for API)
 * Note: DISTANCE_BASED is not supported by the backend proto
 */
export const simplifiedToProtoMethod = (
  simplified: SimplifiedShippingMethod
): ShippingFeeMethod | null => {
  switch (simplified) {
    case SimplifiedShippingMethod.CARRIER_API:
      return ShippingFeeMethod.SHIPPING_FEE_METHOD_CARRIER_BASED;
    case SimplifiedShippingMethod.FIXED_PER_ORDER:
      return ShippingFeeMethod.SHIPPING_FEE_METHOD_FLAT_RATE;
    case SimplifiedShippingMethod.DISTANCE_BASED:
      // Not supported by proto - returns null
      return null;
    default:
      return null;
  }
};

/**
 * Convert ShippingFeeMethod enum to SimplifiedShippingMethod (from API)
 * Note: Only CARRIER_BASED and FLAT_RATE are mapped to simplified UX
 */
export const protoToSimplifiedMethod = (
  protoMethod: ShippingFeeMethod
): SimplifiedShippingMethod | null => {
  switch (protoMethod) {
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_CARRIER_BASED:
      return SimplifiedShippingMethod.CARRIER_API;
    case ShippingFeeMethod.SHIPPING_FEE_METHOD_FLAT_RATE:
      return SimplifiedShippingMethod.FIXED_PER_ORDER;
    default:
      // Other methods (WEIGHT_BASED, LOCATION_BASED, etc.) are not shown in simplified UX
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
 * Convert ShippingFeeConfig (from API) to ShippingFeeSettingsData (for UI)
 */
export const apiConfigToSettings = (
  config:
    | import('src/types/gen/shared/shared/shipping/shipping-fee-config').ShippingFeeConfig
    | null
): ShippingFeeSettingsData => {
  if (!config) {
    return getDefaultShippingFeeSettings();
  }

  const simplifiedMethod = protoToSimplifiedMethod(config.method);

  if (simplifiedMethod === SimplifiedShippingMethod.FIXED_PER_ORDER && config.flatRateConfig) {
    return {
      method: SimplifiedShippingMethod.FIXED_PER_ORDER,
      fixedFee: config.flatRateConfig.fee,
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
 * Convert ShippingFeeSettingsData (from UI) to API update payload
 * Returns null if method is not supported by API (DISTANCE_BASED)
 */
export const settingsToApiPayload = (
  settings: ShippingFeeSettingsData
): {
  method: ShippingFeeMethod;
  flatRateConfig?: { fee: number };
  carrierBasedConfig?: { markupPercentage: number; markupFixed: number };
} | null => {
  if (!isMethodSupportedByApi(settings.method)) {
    return null;
  }

  if (settings.method === SimplifiedShippingMethod.FIXED_PER_ORDER) {
    return {
      method: ShippingFeeMethod.SHIPPING_FEE_METHOD_FLAT_RATE,
      flatRateConfig: { fee: settings.fixedFee || 30000 },
    };
  }

  if (settings.method === SimplifiedShippingMethod.CARRIER_API) {
    return {
      method: ShippingFeeMethod.SHIPPING_FEE_METHOD_CARRIER_BASED,
      carrierBasedConfig: { markupPercentage: 0, markupFixed: 0 },
    };
  }

  return null;
};
