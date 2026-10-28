/**
 * Nhanh.vn Location API DTOs
 * Used for retrieving cities, districts, and wards for shipping addresses
 */

/**
 * Location filter parameters for the Nhanh shipping/location API
 */
export class NhanhLocationFiltersDto {
  /**
   * Location version - use 'v1' for 3-level address (city/district/ward)
   */
  locationVersion: 'v1' | 'v2';

  /**
   * Type of location to retrieve
   */
  type: 'CITY' | 'DISTRICT' | 'WARD';

  /**
   * Parent location ID (required for DISTRICT and WARD types)
   * - For DISTRICT: pass cityId
   * - For WARD: pass districtId
   */
  parentId?: number;
}

/**
 * Location data from Nhanh API response
 */
export class NhanhLocationDto {
  /**
   * Location ID (used as cityId, districtId, or wardId in shipping calculations)
   */
  id: number;

  /**
   * Location name
   */
  name: string;

  /**
   * Alternative name (if any)
   */
  otherName?: string;
}
