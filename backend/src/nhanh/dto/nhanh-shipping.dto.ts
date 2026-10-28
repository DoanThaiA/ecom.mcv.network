/**
 * Nhanh.vn Shipping API DTOs
 * Used for calculating shipping fees via Nhanh's carrier connections
 */

/**
 * Location data for shipping origin/destination
 */
export class NhanhShippingLocationDto {
  /** City ID from Nhanh location API */
  cityId: number;

  /** District ID from Nhanh location API */
  districtId: number;

  /** Ward ID from Nhanh location API (optional) */
  wardId?: number;

  /** Street address (optional, for more accurate fee calculation) */
  address?: string;

  /** Location version - use 'v1' for 3-level address (city/district/ward) */
  locationVersion: 'v1' | 'v2';
}

/**
 * Carrier filter for type 2 (SHOP_ACCOUNT) connections
 */
export class NhanhShippingCarrierFilterDto {
  /** Carrier ID to filter by */
  id: number;
}

/**
 * Request filters for shipping fee calculation
 */
export class NhanhShippingFeeFiltersDto {
  /**
   * Carrier connection type:
   * - 1: Use Nhanh's carrier connection (easier testing)
   * - 2: Use shop's own carrier accounts (better rates)
   */
  type: 1 | 2;

  /** Total shipping weight in grams */
  shippingWeight: number;

  /** Order value (for insurance calculation) */
  price?: number;

  /** COD amount (if COD payment) */
  totalCod?: number;

  /** Depot ID for shipping origin (optional, overrides shippingFrom) */
  depotId?: number;

  /** Shipping origin location */
  shippingFrom: NhanhShippingLocationDto;

  /** Shipping destination location */
  shippingTo: NhanhShippingLocationDto;

  /** Carrier filter (required for type 2 - SHOP_ACCOUNT) */
  carrier?: NhanhShippingCarrierFilterDto;
}

/**
 * Carrier info in shipping fee response
 */
export class NhanhShippingCarrierDto {
  /** Carrier ID */
  id: number;

  /** Account ID (for type 2 connections) */
  accountId?: number;

  /** Account name */
  accountName?: string;

  /** Shop ID at carrier */
  shopId?: string;
}

/**
 * Service info in shipping fee response
 */
export class NhanhShippingServiceDto {
  /** Service ID */
  id: number;

  /** Service name */
  name: string;

  /** Service code */
  code: string;

  /** Service description */
  description?: string;
}

/**
 * Single carrier option in shipping fee response
 */
export class NhanhShippingFeeOptionDto {
  /** Carrier logo URL */
  logo: string;

  /** Carrier information */
  carrier: NhanhShippingCarrierDto;

  /** Service information */
  service: NhanhShippingServiceDto;

  /** Base shipping fee */
  shipFee: number;

  /** COD handling fee */
  codFee: number;

  /** Declared value fee (insurance) */
  declaredFee: number;

  /** Total fee charged to customer */
  customerShipFee: number;
}

/**
 * Carrier list item for cached carrier data
 */
export class NhanhCarrierDto {
  /** Carrier ID */
  id: number;

  /** Carrier name */
  name: string;

  /** Carrier code */
  code: string;

  /** Carrier logo URL */
  logo?: string;
}
