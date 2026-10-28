import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { ProductBannerRepository } from './domain/product-banner.repository';
import { ProductBanner, ProductBannerProduct } from './domain/product-banner';
import { ProductBannerPosition } from './domain/product-banner-position.enum';
import { CreateProductBannerDto } from './dto/create-product-banner.dto';
import { UpdateProductBannerDto } from './dto/update-product-banner.dto';
import { QueryProductBannersDto } from './dto/query-product-banners.dto';
import { throwException } from '../utils/errors/throw-exception';
import { ProductRepository } from '../products/domain/product.repository';

/**
 * Service for managing product banners
 */
@Injectable()
export class ProductBannersService {
  private readonly logger = new Logger(ProductBannersService.name);

  constructor(
    private readonly productBannerRepository: ProductBannerRepository,
    private readonly productRepository: ProductRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new product banner
   * @param dto - Banner creation data
   * @returns Created banner
   */
  async create(dto: CreateProductBannerDto): Promise<ProductBanner> {
    this.logger.debug(`Creating product banner: ${dto.name}`);

    // Fetch product details if productIds are provided
    let products: ProductBannerProduct[] = [];
    if (dto.productIds && dto.productIds.length > 0) {
      products = await this.fetchProductDetails(dto.productIds);
    }

    const productBanner = await this.productBannerRepository.create({
      name: dto.name,
      image: dto.image,
      position: dto.position ?? ProductBannerPosition.BOTTOM,
      ratio: dto.ratio ?? null,
      isActive: dto.isActive ?? true,
      products,
      deletedAt: null,
    });

    // Sync banner data to assigned products
    if (productBanner.products.length > 0 && productBanner.isActive) {
      await this.syncBannerToProducts(productBanner);
    }

    return productBanner;
  }

  /**
   * Get list of banners with pagination and filtering
   * @param dto - Filter conditions
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated banner list
   */
  async findAll(
    dto: QueryProductBannersDto,
    page = 1,
    limit = 50,
  ): Promise<PaginateResult<ProductBanner>> {
    this.logger.debug(
      `Finding product banners with filters: ${JSON.stringify(dto)}`,
    );

    const filterOptions = {
      search: dto.search,
      isActive: dto.isActive,
    };

    // Remove undefined values
    Object.keys(filterOptions).forEach((key) => {
      if (filterOptions[key as keyof typeof filterOptions] === undefined) {
        delete filterOptions[key as keyof typeof filterOptions];
      }
    });

    const result = await this.productBannerRepository.findManyWithPagination({
      filterOptions:
        Object.keys(filterOptions).length > 0 ? filterOptions : null,
      sortOptions: [{ orderBy: 'createdAt', order: 'desc' }],
      paginationOptions: { page, limit },
    });

    return result;
  }

  /**
   * Get banner by ID with product details
   * @param id - Banner ID
   * @returns Found banner with product list
   */
  async findOne(id: string): Promise<ProductBanner> {
    const productBanner = await this.productBannerRepository.findById(id);

    if (!productBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-banner.notFound'),
      });
    }

    return productBanner;
  }

  /**
   * Update product banner
   * @param id - Banner ID
   * @param dto - Update data
   * @returns Updated banner
   */
  async update(
    id: string,
    dto: UpdateProductBannerDto,
  ): Promise<ProductBanner> {
    this.logger.debug(`Updating product banner ${id}`);

    // Check banner exists
    const existingBanner = await this.productBannerRepository.findById(id);
    if (!existingBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-banner.notFound'),
      });
    }

    // Track which products need to be updated
    const oldProductIds = existingBanner.products.map((p) => p.id);

    // Prepare update payload
    const updatePayload: Record<string, any> = { ...dto };

    // If productIds are provided, fetch product details
    let newProductIds = oldProductIds;
    if (dto.productIds !== undefined) {
      const products = await this.fetchProductDetails(dto.productIds);
      updatePayload.products = products;
      newProductIds = dto.productIds;
      delete updatePayload.productIds;
    }

    // Update the banner
    const updatedBanner = await this.productBannerRepository.update(
      id,
      updatePayload,
    );

    if (!updatedBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-banner.notFound'),
      });
    }

    // Sync banner data to products
    // Remove banner from products that are no longer assigned
    const removedProductIds = oldProductIds.filter(
      (pid) => !newProductIds.includes(pid),
    );
    if (removedProductIds.length > 0) {
      await this.productRepository.updateProductBanner(removedProductIds, null);
    }

    // Update or add banner to currently assigned products
    if (newProductIds.length > 0) {
      if (updatedBanner.isActive) {
        await this.syncBannerToProducts(updatedBanner);
      } else {
        // If banner is inactive, remove from all products
        await this.productRepository.updateProductBanner(newProductIds, null);
      }
    }

    return updatedBanner;
  }

  /**
   * Delete product banner (soft delete)
   * @param id - Banner ID
   */
  async remove(id: string): Promise<void> {
    const productBanner = await this.productBannerRepository.findById(id);

    if (!productBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-banner.notFound'),
      });
    }

    // Remove banner from all assigned products
    await this.productRepository.clearProductBanner(id);

    // Soft delete the banner
    await this.productBannerRepository.remove(id);
    this.logger.debug(`Deleted product banner ${id}`);
  }

  /**
   * Assign products to banner
   * @param id - Banner ID
   * @param productIds - List of product IDs
   * @returns Updated banner
   */
  async assignProducts(
    id: string,
    productIds: string[],
  ): Promise<ProductBanner> {
    this.logger.debug(
      `Assigning ${productIds.length} products to banner ${id}`,
    );

    const existingBanner = await this.productBannerRepository.findById(id);
    if (!existingBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-banner.notFound'),
      });
    }

    // Fetch product details
    const products = await this.fetchProductDetails(productIds);

    const updatedBanner = await this.productBannerRepository.addProducts(
      id,
      products,
    );

    if (!updatedBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-banner.notFound'),
      });
    }

    // Sync banner to newly assigned products if banner is active
    if (updatedBanner.isActive) {
      await this.productRepository.updateProductBanner(productIds, {
        id: updatedBanner.id,
        name: updatedBanner.name,
        image: updatedBanner.image,
        position: updatedBanner.position,
        ratio: updatedBanner.ratio,
      });
    }

    return updatedBanner;
  }

  /**
   * Remove products from banner
   * @param id - Banner ID
   * @param productIds - List of product IDs
   * @returns Updated banner
   */
  async unassignProducts(
    id: string,
    productIds: string[],
  ): Promise<ProductBanner> {
    this.logger.debug(
      `Removing ${productIds.length} products from banner ${id}`,
    );

    const existingBanner = await this.productBannerRepository.findById(id);
    if (!existingBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-banner.notFound'),
      });
    }

    const updatedBanner = await this.productBannerRepository.removeProducts(
      id,
      productIds,
    );

    if (!updatedBanner) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product-banner.notFound'),
      });
    }

    // Remove banner from unassigned products
    await this.productRepository.updateProductBanner(productIds, null);

    return updatedBanner;
  }

  /**
   * Sync banner data to assigned products
   * @param banner - Banner to sync
   * @returns Number of products updated
   */
  private async syncBannerToProducts(banner: ProductBanner): Promise<number> {
    if (!banner.products || banner.products.length === 0) {
      return 0;
    }

    const productIds = banner.products.map((p) => p.id);

    const embeddedBanner = {
      id: banner.id,
      name: banner.name,
      image: banner.image,
      position: banner.position,
      ratio: banner.ratio,
    };

    return this.productRepository.updateProductBanner(
      productIds,
      embeddedBanner,
    );
  }

  /**
   * Fetch product details by list of IDs
   * @param productIds - List of product IDs
   * @returns List of product info
   */
  private async fetchProductDetails(
    productIds: string[],
  ): Promise<ProductBannerProduct[]> {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    const products = await this.productRepository.findByIds(productIds);

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      images: {
        avatar: p.images?.avatar ?? null,
      },
    }));
  }
}
