import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ProductCategoryRepository } from './domain/product-category.repository';
import { ProductCategory } from './domain/product-category';
import { QueryProductCategoryDto } from './dto/product-query-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { throwException } from '../utils/errors/throw-exception';
import { NhanhAuthService } from '../nhanh/services/nhanh-auth.service';

/**
 * Service for managing categories (our business domain)
 * Interacts ONLY with our domain models
 */
@Injectable()
export class ProductCategoriesService {
  private readonly logger = new Logger(ProductCategoriesService.name);

  constructor(
    private readonly productCategoryRepository: ProductCategoryRepository,
    private readonly i18n: I18nService,
    private readonly nhanhAuthService: NhanhAuthService,
  ) {}

  /**
   * Find categories with filtering
   *
   * @param query - Query parameters for filtering
   * @returns Array of categories
   */
  async findAll(query: QueryProductCategoryDto): Promise<ProductCategory[]> {
    this.logger.debug(
      `Finding categories with query: ${JSON.stringify(query)}`,
    );

    // Get businessId from cached token
    const tokenData = await this.nhanhAuthService.getAccessToken();
    const businessId = tokenData?.businessId.toString();

    // Add businessId to filter options
    const filterOptions = {
      ...query.filters,
      ...(businessId && { businessId }),
    };

    return this.productCategoryRepository.findAllWithFilter({
      filterOptions,
      sortOptions: query.sort,
    });
  }

  /**
   * Count categories with filtering
   *
   * @param query - Query parameters for filtering
   * @returns Total count of categories matching the filter
   */

  /**
   * Get all categories (for tree building)
   *
   * @returns Array of all categories
   */
  async findAllProductCategories(): Promise<ProductCategory[]> {
    return this.productCategoryRepository.findAll();
  }

  /**
   * Find a category by ID
   *
   * @param id - ProductCategory ID
   * @returns ProductCategory
   */
  async findOne(id: string): Promise<ProductCategory> {
    const category = await this.productCategoryRepository.findById(id);

    if (!category) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('category.notFound'),
      });
    }

    return category;
  }

  /**
   * Find child categories by parent ID
   *
   * @param parentId - Parent category ID
   * @returns Array of child categories
   */
  async findByParentId(parentId: string): Promise<ProductCategory[]> {
    return this.productCategoryRepository.findByParentId(parentId);
  }

  /**
   * Build category tree with parent-child relationships
   *
   * @returns Nested category tree
   */
  async getProductCategoryTree(): Promise<any[]> {
    const allProductCategories = await this.productCategoryRepository.findAll();

    // Build a map for quick lookup
    const categoryMap = new Map<string, any>();
    const rootProductCategories: any[] = [];

    // First pass: Create map and identify root categories
    allProductCategories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // Second pass: Build tree structure
    allProductCategories.forEach((category) => {
      const node = categoryMap.get(category.id);

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found, treat as root
          rootProductCategories.push(node);
        }
      } else {
        // No parent, this is a root category
        rootProductCategories.push(node);
      }
    });

    return rootProductCategories;
  }

  /**
   * Update category localization
   *
   * @param id - ProductCategory ID
   * @param updateDto - Update data (localization)
   * @returns Updated category
   */
  async updateLocalization(
    id: string,
    updateDto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    const category = await this.productCategoryRepository.findById(id);

    if (!category) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('category.notFound'),
      });
    }

    const updated = await this.productCategoryRepository.update(id, {
      nameLocalization: updateDto.nameLocalization,
    });

    if (!updated) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('category.updateFailed'),
      });
    }

    return updated;
  }
}
