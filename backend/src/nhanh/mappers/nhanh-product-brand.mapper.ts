import { ProductBrand } from '../../product-brands/domain/product-brand';
import { ProductBrandStatus } from '../../product-brands/domain/product-brand-status.enum';
import { NhanhProductBrandDto } from '../dto/nhanh-product-brand.dto';
import { NhanhProductBrandSnapshot } from '../types/nhanh-snapshots';

/**
 * Mapper for converting Nhanh brand data to domain ProductBrand entity
 *
 * Data architecture:
 * - Stores raw Nhanh data in `snapshot` field without modification
 * - Derives domain fields from snapshot data with appropriate conversions
 */
export class NhanhProductBrandMapper {
  /**
   * Convert Nhanh brand to ProductBrand domain entity
   * @param nhanhProductBrand - Nhanh brand data
   * @param businessId - The business ID from Nhanh token
   * @returns ProductBrand domain entity with snapshot
   */
  static toDomain(
    nhanhProductBrand: NhanhProductBrandDto,
    businessId: string,
  ): Omit<ProductBrand, 'id' | 'createdAt' | 'updatedAt'> {
    // Store raw data as snapshot
    const snapshot: NhanhProductBrandSnapshot = { ...nhanhProductBrand };

    return {
      businessId,
      source: 'nhanh',
      snapshot,
      // Derive domain fields from snapshot
      code: nhanhProductBrand.code || null,
      name: nhanhProductBrand.name,
      status: nhanhProductBrand.status as ProductBrandStatus,
      parentId: nhanhProductBrand.parentId?.toString() || null,
    };
  }
}
