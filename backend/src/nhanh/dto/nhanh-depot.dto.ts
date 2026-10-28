/**
 * Nhanh Depot location nested object
 * Contains address and geographic identifiers
 */
export class NhanhDepotLocationDto {
  /** Nhanh city ID */
  cityId?: number;

  /** City name */
  cityName?: string;

  /** Nhanh district ID */
  districtId?: number;

  /** District name */
  districtName?: string;

  /** Nhanh ward ID */
  wardId?: number;

  /** Ward name */
  wardName?: string;

  /** Street address */
  address?: string;
}

/**
 * Nhanh Depot API response item
 * Based on Nhanh.vn /v3.0/business/depot API response
 * @see https://apidocs.nhanh.vn/v3/business/depot
 */
export class NhanhDepotDto {
  /** Depot ID in Nhanh */
  id: number;

  /** Depot code */
  code?: string;

  /** Depot name */
  name: string;

  /** Depot phone number (API returns 'mobile') */
  mobile?: string;

  /** Location information (nested object) */
  location?: NhanhDepotLocationDto;
}
