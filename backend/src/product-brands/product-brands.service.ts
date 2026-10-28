import { Injectable } from '@nestjs/common';
import { PaginateResult } from 'mongoose';
import { ProductBrandRepository } from './domain/product-brand.repository';
import { ProductBrand } from './domain/product-brand';
import { QueryProductBrandDto } from './dto/product-query-brand.dto';
import { NhanhAuthService } from '../nhanh/services/nhanh-auth.service';

/**
 * Service for managing product brands
 */
@Injectable()
export class ProductBrandsService {
  constructor(
    private readonly productBrandRepository: ProductBrandRepository,
    private readonly nhanhAuthService: NhanhAuthService,
  ) {}

  /**
   * Find brands with filtering and pagination
   * @param query - Query parameters for filtering and pagination
   */
  async findManyWithPagination(
    query: QueryProductBrandDto,
  ): Promise<PaginateResult<ProductBrand>> {
    // Get businessId from cached token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    const businessId = tokenData?.businessId.toString();

    // Add businessId to filter options
    const filterOptions = {
      ...query.filters,
      ...(businessId && { businessId }),
    };

    return this.productBrandRepository.findManyWithPagination({
      filterOptions,
      sortOptions: query.sort,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      },
    });
  }

  /**
   * Count brands with filtering
   * @param query - Query parameters for filtering
   * @returns Total count of brands matching the filter
   */

  /**
   * Find brand by ID
   * @param id - ProductBrand ID
   */
  findById(id: ProductBrand['id']) {
    return this.productBrandRepository.findById(id);
  }
}
