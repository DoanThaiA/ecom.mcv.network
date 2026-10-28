import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { FlashSaleRepository } from './domain/flash-sale.repository';
import { FlashSale } from './domain/flash-sale';
import {
  FlashSaleStatus,
  computeFlashSaleStatus,
} from './domain/flash-sale-status.enum';
import { DiscountType } from '../combos/domain/discount-type.enum';
import { ProductRepository } from '../products/domain/product.repository';
import { FlashSaleProductRepository } from '../flash-sale-products/domain/flash-sale-product.repository';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { QueryFlashSaleDto } from './dto/query-flash-sale.dto';
import { CreateFlashSaleProductDto } from './dto/create-flash-sale-product.dto';
import { UpdateFlashSaleProductDto } from './dto/update-flash-sale-product.dto';
import { BulkAddFlashSaleProductsDto } from './dto/bulk-add-flash-sale-products.dto';
import { BulkAddFlashSaleProductsResponseDto } from './dto/bulk-add-flash-sale-products-response.dto';
import { BulkUpdateFlashSaleProductsDto } from './dto/bulk-update-flash-sale-products.dto';
import { BulkUpsertFlashSaleProductsDto } from './dto/bulk-upsert-flash-sale-products.dto';
import { BulkUpsertFlashSaleProductsResponseDto } from './dto/bulk-upsert-flash-sale-products-response.dto';
import { BulkRemoveFlashSaleProductsDto } from './dto/bulk-remove-flash-sale-products.dto';
import {
  ValidateExcelFileDto,
  ValidateExcelProductsResponseDto,
  ValidatedProductDto,
  ValidationErrorCode,
  ExcelProductRow,
} from './dto/validate-excel-products.dto';
import * as XLSX from 'xlsx';
import {
  FlashSaleResponseDto,
  FlashSaleProductResponseDto,
  FlashSaleListItemResponseDto,
} from './dto/flash-sale-response.dto';
import { throwException } from '../utils/errors/throw-exception';
import { calculateRoundedDiscountAmount } from '../utils/helpers/round-price';
import { QueryFlashSaleProductsDto } from './dto/query-flash-sale-products.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';

const DEFAULT_PRODUCT_PAGE = 1;
const DEFAULT_PRODUCT_LIMIT = 20;
const MAX_PRODUCT_LIMIT = 100;

/**
 * Service for managing flash sales
 * Product operations use the flash_sale_products collection
 */
@Injectable()
export class FlashSalesService {
  private readonly logger = new Logger(FlashSalesService.name);

  constructor(
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly productRepository: ProductRepository,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new flash sale campaign
   */
  async create(dto: CreateFlashSaleDto): Promise<FlashSaleResponseDto> {
    this.logger.debug(`Creating flash sale: ${dto.name}`);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    // Validate time range
    if (startTime >= endTime) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.startTimeMustBeBeforeEndTime'),
        errors: { startTime: 'Start time must be before end time' },
      });
    }

    // Check for overlapping flash sales (only one active at a time)
    const overlappingFlashSale = await this.flashSaleRepository.findOverlapping(
      startTime,
      endTime,
    );
    if (overlappingFlashSale) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('flash-sale.overlappingFlashSale'),
        errors: {
          timeRange: `Time range overlaps with existing flash sale: "${overlappingFlashSale.name}" (${overlappingFlashSale.startTime.toISOString()} - ${overlappingFlashSale.endTime.toISOString()})`,
        },
      });
    }

    const flashSale = await this.flashSaleRepository.create({
      name: dto.name,
      startTime,
      endTime,
      isEnabled: true,
      deletedAt: null,
    });

    return this.toResponseDto(flashSale);
  }

  /**
   * Find flash sales with filtering and pagination
   */
  async findAll(
    query: QueryFlashSaleDto,
  ): Promise<PaginateResult<FlashSaleListItemResponseDto>> {
    this.logger.debug(
      `Finding flash sales with query: ${JSON.stringify(query)}`,
    );

    const result = await this.flashSaleRepository.findManyWithPagination({
      filterOptions: query.filters,
      sortOptions: query.sort,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      },
    });

    // Convert to list item response (without full product details)
    const listItemPromises = result.docs.map((flashSale) =>
      this.toListItemResponseDto(flashSale),
    );
    const listItems = await Promise.all(listItemPromises);

    return {
      ...result,
      docs: listItems,
    };
  }

  /**
   * Find a flash sale by ID
   */
  async findOne(
    id: string,
    query?: QueryFlashSaleProductsDto,
  ): Promise<FlashSaleResponseDto> {
    const flashSale = await this.flashSaleRepository.findById(id);

    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    const paginationOptions = this.getProductPaginationOptions(query);
    return this.toResponseDto(
      flashSale,
      paginationOptions,
      query?.filters,
      query?.sort,
    );
  }

  /**
   * Update an existing flash sale
   */
  async update(
    id: string,
    dto: UpdateFlashSaleDto,
  ): Promise<FlashSaleResponseDto> {
    this.logger.debug(`Updating flash sale ${id}`);

    // Check flash sale exists
    const existingFlashSale = await this.flashSaleRepository.findById(id);
    if (!existingFlashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    // Prepare update data
    const updateData: Partial<FlashSale> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.startTime !== undefined)
      updateData.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) updateData.endTime = new Date(dto.endTime);
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;

    // Validate time range if either is being updated
    const finalStartTime = updateData.startTime ?? existingFlashSale.startTime;
    const finalEndTime = updateData.endTime ?? existingFlashSale.endTime;

    if (finalStartTime >= finalEndTime) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.startTimeMustBeBeforeEndTime'),
        errors: { startTime: 'Start time must be before end time' },
      });
    }

    // Check for overlapping flash sales if time range or enabled status changed
    const willBeEnabled = updateData.isEnabled ?? existingFlashSale.isEnabled;
    if (
      willBeEnabled &&
      (dto.startTime !== undefined ||
        dto.endTime !== undefined ||
        dto.isEnabled === true)
    ) {
      const overlappingFlashSale =
        await this.flashSaleRepository.findOverlapping(
          finalStartTime,
          finalEndTime,
          id,
        );
      if (overlappingFlashSale) {
        throwException({
          status: HttpStatus.CONFLICT,
          message: this.i18n.t('flash-sale.overlappingFlashSale'),
          errors: {
            timeRange: `Time range overlaps with existing flash sale: "${overlappingFlashSale.name}" (${overlappingFlashSale.startTime.toISOString()} - ${overlappingFlashSale.endTime.toISOString()})`,
          },
        });
      }
    }

    const updatedFlashSale = await this.flashSaleRepository.update(
      id,
      updateData,
    );

    if (!updatedFlashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    return this.toResponseDto(updatedFlashSale);
  }

  /**
   * Soft delete a flash sale
   */
  async remove(id: string): Promise<void> {
    const flashSale = await this.flashSaleRepository.findById(id);

    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    await this.flashSaleRepository.remove(id);
    await this.flashSaleProductRepository.removeByFlashSaleId(id);
    this.logger.debug(`Deleted flash sale ${id}`);
  }

  /**
   * Toggle flash sale enabled status
   */
  async toggleEnabled(id: string): Promise<FlashSaleResponseDto> {
    const flashSale = await this.flashSaleRepository.findById(id);

    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    // If enabling, check for overlapping flash sales
    if (!flashSale.isEnabled) {
      const overlappingFlashSale =
        await this.flashSaleRepository.findOverlapping(
          flashSale.startTime,
          flashSale.endTime,
          id,
        );
      if (overlappingFlashSale) {
        throwException({
          status: HttpStatus.CONFLICT,
          message: this.i18n.t('flash-sale.overlappingFlashSale'),
          errors: {
            timeRange: `Time range overlaps with existing flash sale: "${overlappingFlashSale.name}" (${overlappingFlashSale.startTime.toISOString()} - ${overlappingFlashSale.endTime.toISOString()})`,
          },
        });
      }
    }

    const updatedFlashSale = await this.flashSaleRepository.update(id, {
      isEnabled: !flashSale.isEnabled,
    });

    if (!updatedFlashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    return this.toResponseDto(updatedFlashSale);
  }

  /**
   * Add a product to a flash sale
   */
  async addProduct(
    flashSaleId: string,
    dto: CreateFlashSaleProductDto,
  ): Promise<FlashSaleResponseDto> {
    this.logger.debug(
      `Adding product ${dto.productId} to flash sale ${flashSaleId}`,
    );

    // Check flash sale exists
    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    // Check product exists
    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.productNotFound'),
        errors: { productId: 'Product not found' },
      });
    }

    // Check product is not already in this flash sale (including soft-deleted records)
    const existingProduct =
      await this.flashSaleProductRepository.findOneByProductIdIncludingDeleted(
        flashSaleId,
        dto.productId,
      );
    if (existingProduct && !existingProduct.deletedAt) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.productAlreadyInFlashSale'),
        errors: { productId: 'Product is already in this flash sale' },
      });
    }

    // Check product is not in another active flash sale
    const activeFlashSale =
      await this.flashSaleRepository.findCurrentlyActive();
    if (activeFlashSale && activeFlashSale.id !== flashSaleId) {
      const conflicting =
        await this.flashSaleProductRepository.findByActiveFlashSaleAndProductId(
          activeFlashSale.id,
          dto.productId,
        );
      if (conflicting) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('flash-sale.productInAnotherActiveFlashSale'),
          errors: {
            productId: `Product is already in another active flash sale: ${activeFlashSale.name}`,
          },
        });
      }
    }

    // Check product has stock available
    const availableStock = product.inventory?.available ?? 0;
    if (availableStock <= 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.productNoStock'),
        errors: {
          productId: 'Product has no available stock',
        },
      });
    }

    // Check product has at least one image
    if (!product.images?.avatar && !product.images?.others?.length) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.productNoImages'),
        errors: {
          productId: 'Product must have at least one image',
        },
      });
    }

    // Stacking: use product-discounted price as base if available
    const retail = product.prices.retail;
    const basePrice =
      product.productDiscount?.discountedPrice != null &&
      product.productDiscount.promotionId != null
        ? product.productDiscount.discountedPrice
        : retail;

    // Validate discount against the base price (post-product-discount)
    this.validateDiscountValue(dto.discountType, dto.discountValue, basePrice);

    // Calculate pricing fields
    const fsDiscountAmount = calculateRoundedDiscountAmount(
      basePrice,
      dto.discountType,
      dto.discountValue,
    );
    const flashSalePrice = basePrice - fsDiscountAmount;
    const totalDiscountFromRetail = retail - flashSalePrice;

    const flashSaleProductData = {
      flashSaleId,
      flashSaleName: flashSale.name,
      productId: dto.productId,
      name: product.name,
      code: product.code,
      category: product.category ?? null,
      status: product.status,
      stock: product.stock ?? 0,
      hide: product.hide ?? false,
      images: product.images,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      originalPrice: retail,
      productDiscountPrice: basePrice,
      flashSalePrice,
      discountAmount: totalDiscountFromRetail,
      discountPercent:
        retail > 0 ? Math.round((totalDiscountFromRetail / retail) * 100) : 0,
      promotionalQuantity: dto.promotionalQuantity,
      soldCount: 0,
      effectivePrice: flashSalePrice,
      endTime: flashSale.endTime,
      isEnabled: dto.isEnabled ?? true,
      order: 0,
      deletedAt: null,
    };

    if (existingProduct?.deletedAt) {
      // Restore soft-deleted record with new settings
      await this.flashSaleProductRepository.upsertMany([flashSaleProductData]);
    } else {
      // Create new record
      await this.flashSaleProductRepository.createOne(flashSaleProductData);
    }

    // Touch flash sale updatedAt so sync cron picks up the change
    await this.flashSaleRepository.update(flashSaleId, {});

    return this.toResponseDto(flashSale);
  }

  /**
   * Update a product in a flash sale
   */
  async updateProduct(
    flashSaleId: string,
    productId: string,
    dto: UpdateFlashSaleProductDto,
  ): Promise<FlashSaleResponseDto> {
    this.logger.debug(
      `Updating product ${productId} in flash sale ${flashSaleId}`,
    );

    // Check flash sale exists
    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    // Check product exists in flash sale
    const existingProduct =
      await this.flashSaleProductRepository.findOneByProductId(
        flashSaleId,
        productId,
      );
    if (!existingProduct) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.productNotInFlashSale'),
      });
    }

    // If discount is being updated, validate it
    if (dto.discountType !== undefined || dto.discountValue !== undefined) {
      const product = await this.productRepository.findById(productId);
      if (product) {
        const finalDiscountType =
          dto.discountType ?? existingProduct.discountType;
        const finalDiscountValue =
          dto.discountValue ?? existingProduct.discountValue;

        // Stacking: validate against product-discounted price if available
        const basePrice =
          product.productDiscount?.discountedPrice != null &&
          product.productDiscount.promotionId != null
            ? product.productDiscount.discountedPrice
            : product.prices.retail;

        this.validateDiscountValue(
          finalDiscountType,
          finalDiscountValue,
          basePrice,
        );
      }
    }

    await this.flashSaleProductRepository.updateOne(
      flashSaleId,
      productId,
      dto,
    );

    // Touch flash sale updatedAt so sync cron picks up the change
    await this.flashSaleRepository.update(flashSaleId, {});

    return this.toResponseDto(flashSale);
  }

  /**
   * Bulk remove products from a flash sale
   */
  async bulkRemoveProducts(
    flashSaleId: string,
    dto: BulkRemoveFlashSaleProductsDto,
  ): Promise<FlashSaleResponseDto> {
    this.logger.debug(
      `Bulk removing ${dto.productIds.length} products from flash sale ${flashSaleId}`,
    );

    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    await this.flashSaleProductRepository.removeByProductIds(
      flashSaleId,
      dto.productIds,
    );

    // Touch flash sale updatedAt so sync cron picks up the change
    await this.flashSaleRepository.update(flashSaleId, {});

    return this.toResponseDto(flashSale);
  }

  /**
   * Remove a product from a flash sale
   */
  async removeProduct(
    flashSaleId: string,
    productId: string,
  ): Promise<FlashSaleResponseDto> {
    this.logger.debug(
      `Removing product ${productId} from flash sale ${flashSaleId}`,
    );

    // Check flash sale exists
    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    // Check product is in flash sale
    const existingProduct =
      await this.flashSaleProductRepository.findOneByProductId(
        flashSaleId,
        productId,
      );
    if (!existingProduct) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.productNotInFlashSale'),
      });
    }

    await this.flashSaleProductRepository.removeOne(flashSaleId, productId);

    // Touch flash sale updatedAt so sync cron picks up the change
    await this.flashSaleRepository.update(flashSaleId, {});

    return this.toResponseDto(flashSale);
  }

  /**
   * Toggle a product's enabled status in a flash sale
   */
  async toggleProduct(
    flashSaleId: string,
    productId: string,
  ): Promise<FlashSaleResponseDto> {
    // Check flash sale exists
    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    const existingProduct =
      await this.flashSaleProductRepository.findOneByProductId(
        flashSaleId,
        productId,
      );
    if (!existingProduct) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.productNotInFlashSale'),
      });
    }

    await this.flashSaleProductRepository.updateOne(flashSaleId, productId, {
      isEnabled: !existingProduct.isEnabled,
    });

    // Touch flash sale updatedAt so sync cron picks up the change
    await this.flashSaleRepository.update(flashSaleId, {});

    return this.toResponseDto(flashSale);
  }

  /**
   * Get all product IDs and their order for a flash sale (no pagination)
   */
  async getProductIdsAndOrder(
    flashSaleId: string,
  ): Promise<Array<{ productId: string; order: number }>> {
    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    return this.flashSaleProductRepository.findProductIdsAndOrderByFlashSaleId(
      flashSaleId,
    );
  }

  /**
   * Bulk add products to a flash sale
   * Uses batch DB queries for performance with 1000+ products
   * Returns partial-success response instead of all-or-nothing
   */
  async bulkAddProducts(
    flashSaleId: string,
    dto: BulkAddFlashSaleProductsDto,
  ): Promise<BulkAddFlashSaleProductsResponseDto> {
    this.logger.debug(
      `Bulk adding ${dto.products.length} products to flash sale ${flashSaleId}`,
    );

    // Check flash sale exists
    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    const candidateProductIds = dto.products.map(
      (product) => product.productId,
    );

    // Batch query 1: find existing flash sale products for this sale
    const existingFsProducts =
      await this.flashSaleProductRepository.findByFlashSaleIdAndProductIds(
        flashSaleId,
        candidateProductIds,
      );
    const existingProductIds = new Set(
      existingFsProducts.map((p) => p.productId),
    );

    // Batch query 2: fetch all candidate products in one call
    const allProducts =
      await this.productRepository.findByIds(candidateProductIds);
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    // Batch query 3: check for conflicts with other active flash sales
    const activeFlashSale =
      await this.flashSaleRepository.findCurrentlyActive();

    let conflictMap = new Map<string, unknown>();
    if (activeFlashSale && activeFlashSale.id !== flashSaleId) {
      conflictMap = await this.flashSaleProductRepository.findActiveForProducts(
        activeFlashSale.id,
        candidateProductIds,
      );
    }

    // Validate all products — pure in-memory, no DB calls in loop
    const duplicateProducts: string[] = [];
    const notFoundProducts: string[] = [];
    const conflictProducts: string[] = [];
    const noStockProducts: string[] = [];
    const noImageProducts: string[] = [];
    const validProducts: Array<
      Omit<
        import('../flash-sale-products/domain/flash-sale-product').FlashSaleProduct,
        'id' | 'createdAt' | 'updatedAt' | 'remainingStock'
      >
    > = [];

    for (const productDto of dto.products) {
      // Check if product already exists in this flash sale
      if (existingProductIds.has(productDto.productId)) {
        duplicateProducts.push(productDto.productId);
        continue;
      }

      // Check product exists (from batch-fetched map)
      const product = productMap.get(productDto.productId);
      if (!product) {
        notFoundProducts.push(productDto.productId);
        continue;
      }

      // Check product is not in another active flash sale (from batch-fetched map)
      if (conflictMap.has(productDto.productId)) {
        conflictProducts.push(productDto.productId);
        continue;
      }

      // Check product has stock available
      const availableStock = product.inventory?.available ?? 0;
      if (availableStock <= 0) {
        noStockProducts.push(productDto.productId);
        continue;
      }

      // Check product has at least one image
      if (!product.images?.avatar && !product.images?.others?.length) {
        noImageProducts.push(productDto.productId);
        continue;
      }

      // Stacking: use product-discounted price as base if available
      const retail = product.prices.retail;
      const basePrice =
        product.productDiscount?.discountedPrice != null &&
        product.productDiscount.promotionId != null
          ? product.productDiscount.discountedPrice
          : retail;

      // Validate discount against the base price (post-product-discount)
      this.validateDiscountValue(
        productDto.discountType,
        productDto.discountValue,
        basePrice,
      );

      // Calculate pricing
      const fsDiscountAmount = calculateRoundedDiscountAmount(
        basePrice,
        productDto.discountType,
        productDto.discountValue,
      );
      const flashSalePrice = basePrice - fsDiscountAmount;
      const totalDiscountFromRetail = retail - flashSalePrice;

      // Build flash sale product
      validProducts.push({
        flashSaleId,
        flashSaleName: flashSale.name,
        productId: productDto.productId,
        name: product.name,
        code: product.code,
        category: product.category ?? null,
        status: product.status,
        stock: product.stock ?? 0,
        hide: product.hide ?? false,
        images: product.images,
        discountType: productDto.discountType,
        discountValue: productDto.discountValue,
        originalPrice: retail,
        productDiscountPrice: basePrice,
        flashSalePrice,
        discountAmount: totalDiscountFromRetail,
        discountPercent:
          retail > 0 ? Math.round((totalDiscountFromRetail / retail) * 100) : 0,
        promotionalQuantity: productDto.promotionalQuantity,
        soldCount: 0,
        effectivePrice: flashSalePrice,
        endTime: flashSale.endTime,
        isEnabled: productDto.isEnabled ?? true,
        order: productDto.order ?? 0,
        deletedAt: null,
      });
    }

    // Build per-product failure list
    const getCode = (id: string) => productMap.get(id)?.code ?? id;
    const failedProducts: Array<{
      productId: string;
      productCode: string;
      reason: string;
    }> = [
      ...duplicateProducts.map((id) => ({
        productId: id,
        productCode: getCode(id),
        reason: 'duplicate',
      })),
      ...notFoundProducts.map((id) => ({
        productId: id,
        productCode: id,
        reason: 'notFound',
      })),
      ...conflictProducts.map((id) => ({
        productId: id,
        productCode: getCode(id),
        reason: 'conflict',
      })),
      ...noStockProducts.map((id) => ({
        productId: id,
        productCode: getCode(id),
        reason: 'noStock',
      })),
      ...noImageProducts.map((id) => ({
        productId: id,
        productCode: getCode(id),
        reason: 'noImage',
      })),
    ];

    // If ALL products failed, throw as before for backward compatibility
    if (validProducts.length === 0 && failedProducts.length > 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.bulkAddValidationFailed'),
        errors: {
          failedProducts: JSON.stringify(failedProducts),
        },
      });
    }

    // Perform bulk upsert for valid products
    if (validProducts.length > 0) {
      await this.flashSaleProductRepository.upsertMany(validProducts);
    }

    // Touch flash sale updatedAt so sync cron picks up the change
    await this.flashSaleRepository.update(flashSaleId, {});

    return {
      addedCount: validProducts.length,
      failedCount: failedProducts.length,
      failedProducts,
    };
  }

  /**
   * Bulk update products in a flash sale
   */
  async bulkUpdateProducts(
    flashSaleId: string,
    dto: BulkUpdateFlashSaleProductsDto,
  ): Promise<FlashSaleResponseDto> {
    this.logger.debug(
      `Bulk updating ${dto.products.length} products in flash sale ${flashSaleId}`,
    );

    // Check flash sale exists
    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    const candidateProductIds = dto.products.map(
      (product) => product.productId,
    );
    const existingFsProducts =
      await this.flashSaleProductRepository.findByFlashSaleIdAndProductIds(
        flashSaleId,
        candidateProductIds,
      );
    const fsProductMap = new Map(
      existingFsProducts.map((p) => [p.productId, p]),
    );
    const notFoundProducts: string[] = [];

    for (const productUpdate of dto.products) {
      if (!fsProductMap.has(productUpdate.productId)) {
        notFoundProducts.push(productUpdate.productId);
      }
    }

    if (notFoundProducts.length > 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.productsNotInFlashSale'),
        errors: {
          productIds: `Products not found in flash sale: ${notFoundProducts.join(', ')}`,
        },
      });
    }

    // Validate discount values for products that have discount updates
    for (const productUpdate of dto.products) {
      if (
        productUpdate.discountType !== undefined ||
        productUpdate.discountValue !== undefined
      ) {
        const existingProduct = fsProductMap.get(productUpdate.productId);
        const product = await this.productRepository.findById(
          productUpdate.productId,
        );

        if (product && existingProduct) {
          const finalDiscountType =
            productUpdate.discountType ?? existingProduct.discountType;
          const finalDiscountValue =
            productUpdate.discountValue ?? existingProduct.discountValue;

          // Stacking: validate against product-discounted price as base
          const retail = product.prices.retail;
          const basePrice =
            product.productDiscount?.discountedPrice != null &&
            product.productDiscount.promotionId != null
              ? product.productDiscount.discountedPrice
              : retail;

          this.validateDiscountValue(
            finalDiscountType,
            finalDiscountValue,
            basePrice,
          );
        }
      }
    }

    // Perform bulk update
    await this.flashSaleProductRepository.bulkUpdate(flashSaleId, dto.products);

    // Touch flash sale updatedAt so sync cron picks up the change
    await this.flashSaleRepository.update(flashSaleId, {});

    return this.toResponseDto(flashSale);
  }

  /**
   * Bulk upsert products in a flash sale (add new + update existing in one call)
   */
  async bulkUpsertProducts(
    flashSaleId: string,
    dto: BulkUpsertFlashSaleProductsDto,
  ): Promise<BulkUpsertFlashSaleProductsResponseDto> {
    this.logger.debug(
      `Bulk upserting ${dto.products.length} products in flash sale ${flashSaleId}`,
    );

    // Check flash sale exists
    const flashSale = await this.flashSaleRepository.findById(flashSaleId);
    if (!flashSale) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('flash-sale.notFound'),
      });
    }

    const candidateProductIds = dto.products.map(
      (product) => product.productId,
    );

    // Batch query 1: find existing flash sale products for this sale
    const existingFsProducts =
      await this.flashSaleProductRepository.findByFlashSaleIdAndProductIds(
        flashSaleId,
        candidateProductIds,
      );
    const existingFsProductMap = new Map(
      existingFsProducts.map((p) => [p.productId, p]),
    );

    // Batch query 2: fetch all candidate products in one call
    const allProducts =
      await this.productRepository.findByIds(candidateProductIds);
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    // Batch query 3: check for conflicts with other active flash sales
    // Only check for NEW products (existing ones are already in this flash sale)
    const newProductIds = candidateProductIds.filter(
      (id) => !existingFsProductMap.has(id),
    );

    let conflictMap = new Map<string, unknown>();
    if (newProductIds.length > 0) {
      const activeFlashSale =
        await this.flashSaleRepository.findCurrentlyActive();
      if (activeFlashSale && activeFlashSale.id !== flashSaleId) {
        conflictMap =
          await this.flashSaleProductRepository.findActiveForProducts(
            activeFlashSale.id,
            newProductIds,
          );
      }
    }

    // Validate all products — pure in-memory, no DB calls in loop
    const notFoundProducts: string[] = [];
    const conflictProducts: string[] = [];
    const noStockProducts: string[] = [];
    const noImageProducts: string[] = [];
    const validProducts: Array<
      Omit<
        import('../flash-sale-products/domain/flash-sale-product').FlashSaleProduct,
        'id' | 'createdAt' | 'updatedAt' | 'remainingStock'
      >
    > = [];
    let addedCount = 0;
    let updatedCount = 0;

    for (const productDto of dto.products) {
      const existingFsProduct = existingFsProductMap.get(productDto.productId);
      const isExisting = !!existingFsProduct;

      // Check product exists (from batch-fetched map)
      const product = productMap.get(productDto.productId);
      if (!product) {
        notFoundProducts.push(productDto.productId);
        continue;
      }

      // For NEW products only: run full validation
      if (!isExisting) {
        // Check product is not in another active flash sale
        if (conflictMap.has(productDto.productId)) {
          conflictProducts.push(productDto.productId);
          continue;
        }

        // Check product has stock available
        const availableStock = product.inventory?.available ?? 0;
        if (availableStock <= 0) {
          noStockProducts.push(productDto.productId);
          continue;
        }

        // Check product has at least one image
        if (!product.images?.avatar && !product.images?.others?.length) {
          noImageProducts.push(productDto.productId);
          continue;
        }
      }

      // Stacking: use product-discounted price as base if available
      const retail = product.prices.retail;
      const basePrice =
        product.productDiscount?.discountedPrice != null &&
        product.productDiscount.promotionId != null
          ? product.productDiscount.discountedPrice
          : retail;

      // Validate discount against the base price
      this.validateDiscountValue(
        productDto.discountType,
        productDto.discountValue,
        basePrice,
      );

      // Calculate pricing
      const fsDiscountAmount = calculateRoundedDiscountAmount(
        basePrice,
        productDto.discountType,
        productDto.discountValue,
      );
      const flashSalePrice = basePrice - fsDiscountAmount;
      const totalDiscountFromRetail = retail - flashSalePrice;

      // Build flash sale product
      validProducts.push({
        flashSaleId,
        flashSaleName: flashSale.name,
        productId: productDto.productId,
        name: product.name,
        code: product.code,
        category: product.category ?? null,
        status: product.status,
        stock: product.stock ?? 0,
        hide: product.hide ?? false,
        images: product.images,
        discountType: productDto.discountType,
        discountValue: productDto.discountValue,
        originalPrice: retail,
        productDiscountPrice: basePrice,
        flashSalePrice,
        discountAmount: totalDiscountFromRetail,
        discountPercent:
          retail > 0 ? Math.round((totalDiscountFromRetail / retail) * 100) : 0,
        promotionalQuantity: productDto.promotionalQuantity,
        soldCount: isExisting ? existingFsProduct.soldCount : 0,
        effectivePrice: flashSalePrice,
        endTime: flashSale.endTime,
        isEnabled:
          productDto.isEnabled ??
          (isExisting ? existingFsProduct.isEnabled : true),
        order: productDto.order ?? (isExisting ? existingFsProduct.order : 0),
        deletedAt: null,
      });

      if (isExisting) {
        updatedCount++;
      } else {
        addedCount++;
      }
    }

    // Build per-product failure list
    const getCode = (id: string) => productMap.get(id)?.code ?? id;
    const failedProducts: Array<{
      productId: string;
      productCode: string;
      reason: string;
    }> = [
      ...notFoundProducts.map((id) => ({
        productId: id,
        productCode: id,
        reason: 'notFound',
      })),
      ...conflictProducts.map((id) => ({
        productId: id,
        productCode: getCode(id),
        reason: 'conflict',
      })),
      ...noStockProducts.map((id) => ({
        productId: id,
        productCode: getCode(id),
        reason: 'noStock',
      })),
      ...noImageProducts.map((id) => ({
        productId: id,
        productCode: getCode(id),
        reason: 'noImage',
      })),
    ];

    // If ALL products failed, throw for consistency
    if (validProducts.length === 0 && failedProducts.length > 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.bulkAddValidationFailed'),
        errors: {
          failedProducts: JSON.stringify(failedProducts),
        },
      });
    }

    // Perform bulk upsert for valid products
    if (validProducts.length > 0) {
      await this.flashSaleProductRepository.upsertMany(validProducts);
    }

    // Touch flash sale updatedAt so sync cron picks up the change
    await this.flashSaleRepository.update(flashSaleId, {});

    return {
      upsertedCount: validProducts.length,
      addedCount,
      updatedCount,
      failedCount: failedProducts.length,
      failedProducts,
    };
  }

  /**
   * Validate discount value based on type
   */
  private validateDiscountValue(
    discountType: DiscountType,
    discountValue: number,
    originalPrice: number,
  ): void {
    if (discountValue <= 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.discountValueMustBePositive'),
        errors: { discountValue: 'Discount value must be greater than 0' },
      });
    }

    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.percentageDiscountMax'),
        errors: { discountValue: 'Percentage discount cannot exceed 100' },
      });
    }

    if (discountType === DiscountType.FIXED && discountValue > originalPrice) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.fixedDiscountExceedsPrice'),
        errors: {
          discountValue: 'Fixed discount cannot exceed original price',
        },
      });
    }
  }

  /**
   * Convert FlashSale to FlashSaleResponseDto with paginated product details
   */
  private async toResponseDto(
    flashSale: FlashSale,
    paginationOptions?: IPaginationOptions,
    filterOptions?: QueryFlashSaleProductsDto['filters'],
    sortOptions?: QueryFlashSaleProductsDto['sort'],
  ): Promise<FlashSaleResponseDto> {
    const productPagination =
      paginationOptions ?? this.getProductPaginationOptions();

    const productPage =
      await this.flashSaleProductRepository.findByFlashSaleIdWithPagination({
        flashSaleId: flashSale.id,
        filterOptions: filterOptions ?? null,
        sortOptions: sortOptions ?? null,
        paginationOptions: productPagination,
      });

    const enrichedProducts: FlashSaleProductResponseDto[] =
      productPage.docs.map((item) => ({
        productId: item.productId,
        productName: item.name,
        productCode: item.code,
        productImage: item.images?.avatar ?? undefined,
        originalPrice: item.originalPrice,
        productDiscountPrice: item.productDiscountPrice,
        discountPrice: item.flashSalePrice,
        discountType: item.discountType,
        discountValue: item.discountValue,
        promotionalQuantity: item.promotionalQuantity,
        soldCount: item.soldCount,
        isEnabled: item.isEnabled,
        order: item.order,
      }));

    const productCount = productPage.totalDocs ?? 0;

    const paginatedProducts = {
      data: enrichedProducts,
      hasNextPage: productPage.hasNextPage ?? false,
      total: productCount,
      page: productPage.page ?? productPagination.page,
      limit: productPage.limit ?? productPagination.limit,
      totalPages: productPage.totalPages,
    };

    const status = computeFlashSaleStatus(
      flashSale.startTime,
      flashSale.endTime,
      flashSale.isEnabled,
    );

    return {
      id: flashSale.id,
      name: flashSale.name,
      startTime: flashSale.startTime,
      endTime: flashSale.endTime,
      isEnabled: flashSale.isEnabled,
      status,
      productCount,
      products: paginatedProducts,
      createdAt: flashSale.createdAt,
      updatedAt: flashSale.updatedAt,
    };
  }

  /**
   * Normalize pagination options for flash sale products
   */
  private getProductPaginationOptions(
    query?: QueryFlashSaleProductsDto,
  ): IPaginationOptions {
    const page =
      query?.page && query.page > 0
        ? Math.floor(query.page)
        : DEFAULT_PRODUCT_PAGE;
    const requestedLimit =
      query?.limit && query.limit > 0
        ? Math.floor(query.limit)
        : DEFAULT_PRODUCT_LIMIT;

    return {
      page,
      limit: Math.min(requestedLimit, MAX_PRODUCT_LIMIT),
    };
  }

  /**
   * Convert FlashSale to FlashSaleListItemResponseDto (without product details)
   */
  private async toListItemResponseDto(
    flashSale: FlashSale,
  ): Promise<FlashSaleListItemResponseDto> {
    const status = computeFlashSaleStatus(
      flashSale.startTime,
      flashSale.endTime,
      flashSale.isEnabled,
    );

    const productCount =
      await this.flashSaleProductRepository.countByFlashSaleId(flashSale.id);

    return {
      id: flashSale.id,
      name: flashSale.name,
      startTime: flashSale.startTime,
      endTime: flashSale.endTime,
      isEnabled: flashSale.isEnabled,
      status,
      productCount,
      createdAt: flashSale.createdAt,
      updatedAt: flashSale.updatedAt,
    };
  }

  /**
   * Validate products from Excel file upload
   * Parses Excel file and validates products for flash sale
   */
  async validateExcelProducts(
    file: Express.Multer.File,
    dto: ValidateExcelFileDto,
  ): Promise<ValidateExcelProductsResponseDto> {
    // Validate file
    if (!file) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.fileRequired'),
        errors: { file: 'Excel file is required' },
      });
    }

    // Parse Excel file
    const parsedRows = this.parseExcelFile(file);
    this.logger.debug(`Parsed ${parsedRows.length} rows from Excel file`);

    if (parsedRows.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('flash-sale.emptyExcelFile'),
        errors: { file: 'Excel file has no valid data rows' },
      });
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    // Check for duplicate codes in Excel
    const codeSet = new Set<string>();
    const duplicateCodes = new Set<string>();
    for (const item of parsedRows) {
      if (codeSet.has(item.code)) {
        duplicateCodes.add(item.code);
      }
      codeSet.add(item.code);
    }

    // Batch fetch products by codes
    const codes = parsedRows.map((p) => p.code);
    const products = await this.productRepository.findByCodes(codes);
    const productMap = new Map(products.map((p) => [p.code, p]));

    // Check for flash sale conflicts
    let conflictProductIds = new Set<string>();
    const overlappingFlashSale = await this.flashSaleRepository.findOverlapping(
      startTime,
      endTime,
      dto.flashSaleId,
    );

    this.logger.debug(
      `Checking conflicts: startTime=${startTime.toISOString()}, endTime=${endTime.toISOString()}, excludeId=${dto.flashSaleId}`,
    );
    this.logger.debug(
      `Overlapping flash sale found: ${overlappingFlashSale ? overlappingFlashSale.id : 'none'}`,
    );

    if (overlappingFlashSale) {
      const conflictProductsPage =
        await this.flashSaleProductRepository.findByFlashSaleIdWithPagination({
          flashSaleId: overlappingFlashSale.id,
          filterOptions: null,
          sortOptions: null,
          paginationOptions: { page: 1, limit: 10000 },
        });
      conflictProductIds = new Set(
        conflictProductsPage.docs.map((p) => p.productId),
      );
      this.logger.debug(`Conflict products count: ${conflictProductIds.size}`);
    }

    const validProducts: ValidatedProductDto[] = [];
    const invalidProducts: ValidatedProductDto[] = [];

    for (const item of parsedRows) {
      const errors: ValidationErrorCode[] = [];
      const product = productMap.get(item.code);

      // Check for invalid row format
      if (
        !item.code ||
        item.discountValue < 0 ||
        item.promotionalQuantity < 1
      ) {
        errors.push(ValidationErrorCode.INVALID_ROW_FORMAT);
      }

      // Check for duplicate in Excel
      if (duplicateCodes.has(item.code)) {
        errors.push(ValidationErrorCode.DUPLICATE_IN_EXCEL);
      }

      // Build base response
      const validatedProduct: ValidatedProductDto = {
        productId: product?.id ?? '',
        code: item.code,
        name: item.name,
        actualName: product?.name,
        image: product?.images?.avatar ?? undefined,
        originalPrice: product?.prices?.retail ?? 0,
        discountType: item.discountType,
        discountValue: item.discountValue,
        flashSalePrice: 0,
        promotionalQuantity: item.promotionalQuantity,
        stock: product?.inventory?.available ?? 0,
        isValid: false,
        errors: [],
        rowNumber: item.rowNumber,
      };

      // Validation checks
      if (!product) {
        errors.push(ValidationErrorCode.PRODUCT_NOT_FOUND);
      } else {
        // Check stock
        const availableStock = product.inventory?.available ?? 0;
        if (availableStock <= 0) {
          errors.push(ValidationErrorCode.NO_STOCK);
        }

        // Check image
        if (!product.images?.avatar && !product.images?.others?.length) {
          errors.push(ValidationErrorCode.NO_IMAGE);
        }

        // Check flash sale conflict
        if (conflictProductIds.has(product.id)) {
          errors.push(ValidationErrorCode.CONFLICT_FLASH_SALE);
        }

        // Validate discount
        if (item.discountValue <= 0) {
          errors.push(ValidationErrorCode.INVALID_DISCOUNT);
        }
        if (
          item.discountType === DiscountType.PERCENTAGE &&
          item.discountValue > 100
        ) {
          errors.push(ValidationErrorCode.INVALID_DISCOUNT);
        }
        if (
          item.discountType === DiscountType.FIXED &&
          item.discountValue > product.prices.retail
        ) {
          errors.push(ValidationErrorCode.INVALID_DISCOUNT);
        }

        // Calculate flash sale price
        if (!errors.includes(ValidationErrorCode.INVALID_DISCOUNT)) {
          const discountAmount = calculateRoundedDiscountAmount(
            product.prices.retail,
            item.discountType,
            item.discountValue,
          );
          validatedProduct.flashSalePrice =
            product.prices.retail - discountAmount;
        }
      }

      validatedProduct.errors = errors;
      validatedProduct.isValid = errors.length === 0;

      if (validatedProduct.isValid) {
        validProducts.push(validatedProduct);
      } else {
        invalidProducts.push(validatedProduct);
      }
    }

    return {
      validProducts,
      invalidProducts,
      total: parsedRows.length,
      validCount: validProducts.length,
      invalidCount: invalidProducts.length,
    };
  }

  /**
   * Parse Excel file buffer to product rows
   * Expected columns: Mã sản phẩm, Tên sản phẩm, Loại giảm giá, Mức giảm, Số lượng khuyến mãi
   */
  private parseExcelFile(file: Express.Multer.File): ExcelProductRow[] {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: '' },
    );

    const parsedRows: ExcelProductRow[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel rows start at 1, plus header row

      // Map column names (support both Vietnamese and English)
      const code = String(
        row['Mã sản phẩm'] ?? row['Product Code'] ?? row['code'] ?? '',
      ).trim();
      const name = String(
        row['Tên sản phẩm'] ?? row['Product Name'] ?? row['name'] ?? '',
      ).trim();
      const discountTypeRaw = String(
        row['Loại giảm giá'] ??
          row['Discount Type'] ??
          row['discountType'] ??
          '',
      ).trim();
      const discountValueRaw =
        row['Mức giảm'] ?? row['Discount Value'] ?? row['discountValue'] ?? 0;
      const promotionalQuantityRaw =
        row['Số lượng khuyến mãi'] ??
        row['Promotional Quantity'] ??
        row['promotionalQuantity'] ??
        1;

      // Skip empty rows
      if (!code) continue;

      // Parse discount type
      let discountType = DiscountType.FIXED;
      if (
        discountTypeRaw === '%' ||
        discountTypeRaw.toLowerCase() === 'percentage' ||
        discountTypeRaw.toLowerCase() === 'phần trăm'
      ) {
        discountType = DiscountType.PERCENTAGE;
      }

      // Parse numeric values - round to avoid Excel floating point artifacts
      const discountValue = Math.round(Number(discountValueRaw) || 0);
      const promotionalQuantity =
        Math.floor(Number(promotionalQuantityRaw)) || 1;

      parsedRows.push({
        code,
        name,
        discountType,
        discountValue,
        promotionalQuantity,
        rowNumber,
      });
    }

    return parsedRows;
  }
}
