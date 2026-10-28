import { NullableType } from '../../utils/types/nullable.type';
import { Depot } from './depot';

/**
 * Abstract repository interface for Depot entity
 * Defines the contract for depot data access
 */
export abstract class DepotRepository {
  /**
   * Create a new depot
   * @param data - Depot data
   */
  abstract create(
    data: Omit<Depot, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Depot>;

  /**
   * Find depot by ID
   * @param id - Depot ID
   */
  abstract findById(id: Depot['id']): Promise<NullableType<Depot>>;

  /**
   * Find depot by snapshot ID (source ID), business ID and source
   * @param snapshotId - Snapshot ID from source system
   * @param businessId - Business ID
   * @param source - Data source
   */
  abstract findBySnapshotId(
    snapshotId: number,
    businessId: string,
    source: Depot['source'],
  ): Promise<NullableType<Depot>>;

  /**
   * Find depots by multiple snapshot IDs
   * @param snapshotIds - Array of snapshot IDs from source system
   * @param businessId - Business ID
   * @param source - Data source
   */
  abstract findBySnapshotIds(
    snapshotIds: number[],
    businessId: string,
    source: Depot['source'],
  ): Promise<Depot[]>;

  /**
   * Find all depots for a business
   * @param businessId - Business ID
   */
  abstract findAllByBusiness(businessId: string): Promise<Depot[]>;

  /**
   * Update depot
   * @param id - Depot ID
   * @param payload - Update data
   */
  abstract update(
    id: Depot['id'],
    payload: Partial<Depot>,
  ): Promise<NullableType<Depot>>;

  /**
   * Delete depot
   * @param id - Depot ID
   */
  abstract remove(id: Depot['id']): Promise<void>;

  /**
   * Bulk upsert depots (create or update by snapshot.id)
   * Uses MongoDB bulkWrite for optimal performance
   * @param depots - Array of depot data
   * @returns Number of depots upserted
   */
  abstract bulkUpsert(
    depots: Array<Omit<Depot, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<number>;
}
