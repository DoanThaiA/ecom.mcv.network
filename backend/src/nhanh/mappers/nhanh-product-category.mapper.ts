import { ProductCategory } from '../../product-categories/domain/product-category';
import { ProductCategoryStatus } from '../../product-categories/domain/product-category-status.enum';
import { NhanhProductCategoryDto } from '../dto/nhanh-product-category.dto';
import { NhanhProductCategorySnapshot } from '../types/nhanh-snapshots';

/**
 * Mapper for converting Nhanh category data to domain ProductCategory entity
 *
 * Data architecture:
 * - Stores raw Nhanh data in `snapshot` field without modification
 * - Derives domain fields from snapshot data with appropriate conversions
 */
export class NhanhProductCategoryMapper {
  /**
   * Convert Nhanh category to ProductCategory domain entity
   * @param nhanhProductCategory - Nhanh category data
   * @param businessId - The business ID from Nhanh token
   * @param parentMapping - Map of source parent IDs to internal parent IDs
   * @returns ProductCategory domain entity with snapshot
   */
  static toDomain(
    nhanhProductCategory: NhanhProductCategoryDto,
    businessId: string,
    parentMapping?: Map<string, string>,
  ): Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'> {
    // Store raw data as snapshot
    const snapshot: NhanhProductCategorySnapshot = { ...nhanhProductCategory };

    // Map parent ID from Nhanh ID to our internal ID if available
    let parentId: string | null = null;
    if (
      nhanhProductCategory.parentId &&
      nhanhProductCategory.parentId !== 0 &&
      parentMapping
    ) {
      parentId =
        parentMapping.get(nhanhProductCategory.parentId.toString()) || null;
    }

    return {
      businessId,
      source: 'nhanh',
      snapshot,
      // Derive domain fields from snapshot
      code: nhanhProductCategory.code,
      name: nhanhProductCategory.name,
      parentId,
      order: nhanhProductCategory.order || null,
      image: nhanhProductCategory.image || null,
      content: nhanhProductCategory.content || null,
      status: nhanhProductCategory.status as ProductCategoryStatus,
    };
  }
}
