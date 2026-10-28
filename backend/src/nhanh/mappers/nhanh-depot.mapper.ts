import { Depot } from '../../depots/domain/depot';
import { NhanhDepotDto } from '../dto/nhanh-depot.dto';
import { NhanhDepotSnapshot } from '../types/nhanh-snapshots';

/**
 * Mapper for converting Nhanh depot data to domain Depot entity
 *
 * Data architecture:
 * - Stores raw Nhanh data in `snapshot` field without modification
 * - Derives domain fields from snapshot data with appropriate conversions
 *
 * @see https://apidocs.nhanh.vn/v3/business/depot
 */
export class NhanhDepotMapper {
  /**
   * Convert Nhanh depot to Depot domain entity
   * @param nhanhDepot - Nhanh depot data (with nested location object)
   * @param businessId - The business ID from Nhanh token
   * @returns Depot domain entity with snapshot
   */
  static toDomain(
    nhanhDepot: NhanhDepotDto,
    businessId: string,
  ): Omit<Depot, 'id' | 'createdAt' | 'updatedAt'> {
    // Store raw data as snapshot
    const snapshot: NhanhDepotSnapshot = { ...nhanhDepot };

    // Extract location data from nested object
    const location = nhanhDepot.location;

    return {
      businessId,
      source: 'nhanh',
      snapshot,
      // Derive domain fields from snapshot
      name: nhanhDepot.name,
      phone: nhanhDepot.mobile || null,
      address: location?.address || null,
      cityId: location?.cityId || null,
      districtId: location?.districtId || null,
      wardId: location?.wardId || null,
    };
  }
}
