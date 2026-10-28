import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import * as XLSX from 'xlsx';
import { PromotionRepository } from './domain/promotion.repository';
import { Promotion, PromotionWithStatus } from './domain/promotion';
import { PromotionType } from './domain/promotion-type.enum';
import {
  PromotionStatus,
  computePromotionStatus,
} from './domain/promotion-status.enum';
import {
  CreatePromotionDto,
  CreateBundleDealConfigDto,
  CreateOrderDiscountConfigDto,
  CreateProductDiscountConfigDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { QueryPromotionDto } from './dto/query-promotion.dto';
import {
  ValidateProductDiscountExcelFileDto,
  ValidateProductDiscountExcelResponseDto,
  ValidatedProductDiscountProductDto,
  ProductDiscountExcelRow,
  ProductDiscountValidationErrorCode,
} from './dto/validate-excel-products.dto';
import { CreatePromotionProductDto } from './dto/create-promotion-product.dto';
import {
  BulkAddPromotionProductsDto,
  BulkAddPromotionProductsResponseDto,
} from './dto/bulk-add-promotion-products.dto';
import { UpdatePromotionProductDto } from './dto/update-promotion-product.dto';
import { BulkUpdatePromotionProductsDto } from './dto/bulk-update-promotion-products.dto';
import { QueryPromotionProductsDto } from './dto/query-promotion-products.dto';
import { BundleDealHandler } from './handlers/bundle-deal.handler';
import { OrderDiscountHandler } from './handlers/order-discount.handler';
import { ProductDiscountHandler } from './handlers/product-discount.handler';
import { IPromotionHandler } from './handlers/promotion-handler.interface';
import { throwException } from '../utils/errors/throw-exception';
import {
  BundleDealConfig,
  BundleDealTier,
  GiftProduct,
  RequiredProduct,
} from './domain/bundle-deal-config';
import { BundleDealSubType } from './domain/bundle-deal-sub-type.enum';
import { OrderDiscountConfig } from './domain/order-discount-config';
import { ProductDiscountConfig } from './domain/product-discount-config';
import { ProductRepository } from '../products/domain/product.repository';
import { DiscountType } from '../combos/domain/discount-type.enum';
import { FlashSaleRepository } from '../flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../flash-sale-products/domain/flash-sale-product.repository';
import {
  PromotionProductRepository,
  UpdatePromotionProductData,
} from '../promotion-products/domain/promotion-product.repository';
import { PromotionProduct } from '../promotion-products/domain/promotion-product';
import { Product } from '../products/domain/product';
import { calculateRoundedDiscountAmount } from '../utils/helpers/round-price';
import { PromotionUsageRecordRepository } from '../promotion-usage-records/domain/promotion-usage-record.repository';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  // Handler registry
  private readonly handlers: Record<PromotionType, IPromotionHandler>;

  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly bundleDealHandler: BundleDealHandler,
    private readonly orderDiscountHandler: OrderDiscountHandler,
    private readonly productDiscountHandler: ProductDiscountHandler,
    private readonly productRepository: ProductRepository,
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly promotionUsageRecordRepository: PromotionUsageRecordRepository,
    private readonly i18n: I18nService,
  ) {
    this.handlers = {
      [PromotionType.UNSPECIFIED]: null as any, // Not used
      [PromotionType.BUNDLE_DEAL]: this.bundleDealHandler,
      [PromotionType.ORDER_DISCOUNT]: this.orderDiscountHandler,
      [PromotionType.PRODUCT_COMBO]: null as any, // Future
      [PromotionType.PRODUCT_DISCOUNT]: this.productDiscountHandler,
    };
  }

  /**
   * Create a new promotion
   */
  async create(dto: CreatePromotionDto): Promise<PromotionWithStatus> {
    // Validate name uniqueness
    const nameExists = await this.promotionRepository.existsByName(dto.name);
    if (nameExists) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.nameAlreadyExists'),
      });
    }

    // Validate time range
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    this.validateTimeRange(startTime, endTime);

    // Validate type-specific config
    const handler = this.handlers[dto.type];
    if (!handler) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.unsupportedType'),
      });
    }

    // Build domain entity
    const promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'> = {
      type: dto.type,
      name: dto.name,
      startTime,
      endTime,
      isEnabled: true,
      deletedAt: null,
    };

    // Handle bundle deal config
    if (dto.type === PromotionType.BUNDLE_DEAL) {
      if (!dto.bundleDealConfig) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.bundleDealConfigRequired'),
        });
      }
      const config = await this.mapBundleDealConfig(dto.bundleDealConfig);
      await handler.validate(config);
      promotion.bundleDealConfig = config;
    }

    // Handle order discount config
    if (dto.type === PromotionType.ORDER_DISCOUNT) {
      if (!dto.orderDiscountConfig) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.orderDiscountConfigRequired'),
        });
      }
      const config = this.mapOrderDiscountConfig(dto.orderDiscountConfig);
      await handler.validate(config);

      // Check promo code uniqueness if provided
      if (config.promoCode) {
        const existingPromo = await this.promotionRepository.findByPromoCode(
          config.promoCode,
        );
        if (existingPromo) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('promotion.promoCodeAlreadyExists'),
          });
        }
      }

      promotion.orderDiscountConfig = config;
    }

    // Handle product discount config
    if (dto.type === PromotionType.PRODUCT_DISCOUNT) {
      if (!dto.productDiscountConfig) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.productDiscountConfigRequired'),
        });
      }
      const config = this.mapProductDiscountConfigFromDto(
        dto.productDiscountConfig,
      );
      await handler.validate(config);

      promotion.productDiscountConfig = config;
    }

    const created = await this.promotionRepository.create(promotion);

    // Upsert products to promotion_products collection for product discount
    if (
      dto.type === PromotionType.PRODUCT_DISCOUNT &&
      dto.productDiscountConfig?.products?.length
    ) {
      await this.upsertPromotionProducts(
        created.id,
        created.name,
        created.endTime,
        dto.productDiscountConfig,
        dto.productDiscountConfig.products,
      );
    }

    return this.addStatus(created);
  }

  /**
   * Find promotion by ID
   */
  async findById(id: string): Promise<PromotionWithStatus | null> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) return null;
    return this.addStatus(promotion);
  }

  /**
   * Find all promotions with pagination and filters
   */
  async findAll(
    query: QueryPromotionDto,
  ): Promise<PaginateResult<PromotionWithStatus>> {
    const result = await this.promotionRepository.findAll(
      {
        type: query.type,
        status: query.status,
        keyword: query.keyword,
      },
      query.page ?? 1,
      query.limit ?? 10,
    );

    return {
      ...result,
      docs: result.docs.map((p) => this.addStatus(p)),
    };
  }

  /**
   * Update promotion
   */
  async update(
    id: string,
    dto: UpdatePromotionDto,
  ): Promise<PromotionWithStatus | null> {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('promotion.notFound'),
      });
    }

    // Validate name uniqueness if changing
    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.promotionRepository.existsByName(
        dto.name,
        id,
      );
      if (nameExists) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.nameAlreadyExists'),
        });
      }
    }

    // Validate time range if changing
    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : existing.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    if (dto.startTime || dto.endTime) {
      this.validateTimeRange(startTime, endTime);
    }

    // Build update payload
    const updateData: Partial<Promotion> = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.startTime) updateData.startTime = startTime;
    if (dto.endTime) updateData.endTime = endTime;
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;

    // Handle bundle deal config update
    if (existing.type === PromotionType.BUNDLE_DEAL && dto.bundleDealConfig) {
      const config = await this.mapBundleDealConfig(
        dto.bundleDealConfig,
        existing.bundleDealConfig,
      );
      await this.bundleDealHandler.validate(config);
      updateData.bundleDealConfig = config;
    }

    // Handle order discount config update
    if (
      existing.type === PromotionType.ORDER_DISCOUNT &&
      dto.orderDiscountConfig
    ) {
      const config = this.mapOrderDiscountConfig(dto.orderDiscountConfig);
      await this.orderDiscountHandler.validate(config);

      // Check promo code uniqueness if changed
      if (
        config.promoCode &&
        config.promoCode !== existing.orderDiscountConfig?.promoCode
      ) {
        const existingPromo = await this.promotionRepository.findByPromoCode(
          config.promoCode,
        );
        if (existingPromo && existingPromo.id !== id) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('promotion.promoCodeAlreadyExists'),
          });
        }
      }

      // Preserve usage data when updating
      config.currentUsageCount =
        existing.orderDiscountConfig?.currentUsageCount ?? 0;

      updateData.orderDiscountConfig = config;
    }

    // Handle product discount config update (config-level only, products managed separately)
    if (
      existing.type === PromotionType.PRODUCT_DISCOUNT &&
      dto.productDiscountConfig
    ) {
      const config = this.mapProductDiscountConfigFromDto(
        dto.productDiscountConfig,
      );
      await this.productDiscountHandler.validate(config, {
        excludePromotionId: id,
      });

      updateData.productDiscountConfig = config;

      // If products are passed in update DTO, upsert them to the separate collection
      if (dto.productDiscountConfig.products?.length) {
        await this.upsertPromotionProducts(
          id,
          dto.name || existing.name,
          endTime,
          dto.productDiscountConfig,
          dto.productDiscountConfig.products,
        );
      }
    }

    const updated = await this.promotionRepository.update(id, updateData);
    return updated ? this.addStatus(updated) : null;
  }

  /**
   * Pause promotion (set isEnabled = false)
   */
  async pause(id: string): Promise<PromotionWithStatus | null> {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('promotion.notFound'),
      });
    }

    const status = computePromotionStatus(
      existing.startTime,
      existing.endTime,
      existing.isEnabled,
    );

    if (
      status !== PromotionStatus.ACTIVE &&
      status !== PromotionStatus.UPCOMING
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.cannotPause'),
      });
    }

    const updated = await this.promotionRepository.update(id, {
      isEnabled: false,
    });
    return updated ? this.addStatus(updated) : null;
  }

  /**
   * Resume promotion (set isEnabled = true)
   */
  async resume(id: string): Promise<PromotionWithStatus | null> {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('promotion.notFound'),
      });
    }

    const status = computePromotionStatus(
      existing.startTime,
      existing.endTime,
      existing.isEnabled,
    );

    if (status !== PromotionStatus.PAUSED) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.cannotResume'),
      });
    }

    const updated = await this.promotionRepository.update(id, {
      isEnabled: true,
    });
    return updated ? this.addStatus(updated) : null;
  }

  /**
   * Soft delete promotion
   */
  async delete(id: string): Promise<boolean> {
    const deleted = await this.promotionRepository.softDelete(id);
    if (!deleted) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('promotion.notFound'),
      });
    }

    // Also remove all products and usage records from the separate collections
    await this.promotionProductRepository.removeByPromotionId(id);
    await this.promotionUsageRecordRepository.deleteByPromotionId(id);

    return true;
  }

  // ==================== Promotion Products CRUD ====================

  /**
   * Add a single product to a product discount promotion
   */
  async addPromotionProduct(
    promotionId: string,
    dto: CreatePromotionProductDto,
  ): Promise<PromotionProduct> {
    const promotion = await this.getPromotionOrThrow(promotionId);
    this.ensureProductDiscountType(promotion);

    const config = promotion.productDiscountConfig!;

    // Fetch the actual product
    const products = await this.productRepository.findByIds([dto.productId]);
    if (!products.length) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.productNotFound', {
          args: { productId: dto.productId },
        }),
      });
    }

    const product = products[0];
    const promotionProduct = this.buildPromotionProduct(
      promotionId,
      promotion.name,
      promotion.endTime,
      config,
      product,
      dto,
    );

    return this.promotionProductRepository.createOne(promotionProduct);
  }

  /**
   * Bulk add products to a product discount promotion
   */
  async bulkAddPromotionProducts(
    promotionId: string,
    dto: BulkAddPromotionProductsDto,
  ): Promise<BulkAddPromotionProductsResponseDto> {
    const promotion = await this.getPromotionOrThrow(promotionId);
    this.ensureProductDiscountType(promotion);

    const config = promotion.productDiscountConfig!;
    const productIds = dto.products.map((p) => p.productId);
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const toUpsert: Omit<PromotionProduct, 'id' | 'createdAt' | 'updatedAt'>[] =
      [];
    const failedProducts: Array<{ productId: string; reason: string }> = [];

    for (const item of dto.products) {
      const product = productMap.get(item.productId);
      if (!product) {
        failedProducts.push({
          productId: item.productId,
          reason: 'Product not found',
        });
        continue;
      }

      toUpsert.push(
        this.buildPromotionProduct(
          promotionId,
          promotion.name,
          promotion.endTime,
          config,
          product,
          item,
        ),
      );
    }

    let addedCount = 0;
    if (toUpsert.length > 0) {
      addedCount = await this.promotionProductRepository.upsertMany(toUpsert);
    }

    return {
      addedCount,
      failedCount: failedProducts.length,
      failedProducts,
    };
  }

  /**
   * Get paginated products for a promotion (CMS-facing)
   */
  async getPromotionProducts(
    promotionId: string,
    query: QueryPromotionProductsDto,
  ) {
    return this.promotionProductRepository.findByPromotionIdWithPagination({
      promotionId,
      filterOptions: query.filters ?? null,
      sortOptions: query.sort || null,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      },
    });
  }

  /**
   * Update a single product in a promotion
   */
  async updatePromotionProduct(
    promotionId: string,
    productId: string,
    dto: UpdatePromotionProductDto,
  ): Promise<PromotionProduct> {
    await this.getPromotionOrThrow(promotionId);

    // If discount fields changed, recalculate derived pricing
    const updateData: UpdatePromotionProductData = { ...dto };
    if (dto.discountType !== undefined || dto.discountValue !== undefined) {
      const existing = await this.promotionProductRepository.findOneByProductId(
        promotionId,
        productId,
      );
      if (!existing) {
        throwException({
          status: HttpStatus.NOT_FOUND,
          message: this.i18n.t('promotion.productNotFound', {
            args: { productId },
          }),
        });
      }
      const discountType = dto.discountType ?? existing.discountType;
      const discountValue = dto.discountValue ?? existing.discountValue;
      const originalPrice = existing.originalPrice;

      const discountAmount = calculateRoundedDiscountAmount(
        originalPrice,
        discountType,
        discountValue,
      );
      const discountedPrice = originalPrice - discountAmount;
      const discountPercent =
        originalPrice > 0
          ? Math.round((discountAmount / originalPrice) * 100)
          : 0;

      updateData.discountedPrice = discountedPrice;
      updateData.discountAmount = discountAmount;
      updateData.discountPercent = discountPercent;
      updateData.effectivePrice = discountedPrice;
    }

    const updated = await this.promotionProductRepository.updateOne(
      promotionId,
      productId,
      updateData,
    );
    if (!updated) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('promotion.productNotFound', {
          args: { productId },
        }),
      });
    }
    return updated;
  }

  /**
   * Remove a product from a promotion
   */
  async removePromotionProduct(
    promotionId: string,
    productId: string,
  ): Promise<void> {
    await this.getPromotionOrThrow(promotionId);

    const removed = await this.promotionProductRepository.removeOne(
      promotionId,
      productId,
    );
    if (!removed) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('promotion.productNotFound', {
          args: { productId },
        }),
      });
    }
  }

  /**
   * Toggle product enabled/disabled in promotion
   */
  async togglePromotionProduct(
    promotionId: string,
    productId: string,
  ): Promise<PromotionProduct> {
    await this.getPromotionOrThrow(promotionId);

    const existing = await this.promotionProductRepository.findOneByProductId(
      promotionId,
      productId,
    );
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('promotion.productNotFound', {
          args: { productId },
        }),
      });
    }

    const updated = await this.promotionProductRepository.updateOne(
      promotionId,
      productId,
      { isEnabled: !existing.isEnabled },
    );
    return updated!;
  }

  /**
   * Get all product IDs for a promotion (no pagination)
   */
  async getPromotionProductIds(promotionId: string): Promise<string[]> {
    await this.getPromotionOrThrow(promotionId);
    return this.promotionProductRepository.findProductIdsByPromotionId(
      promotionId,
    );
  }

  /**
   * Bulk update products in a promotion
   */
  async bulkUpdatePromotionProducts(
    promotionId: string,
    dto: BulkUpdatePromotionProductsDto,
  ): Promise<{ updatedCount: number }> {
    await this.getPromotionOrThrow(promotionId);

    // Recalculate derived pricing for products with discount changes
    const productIds = dto.products
      .filter(
        (p) => p.discountType !== undefined || p.discountValue !== undefined,
      )
      .map((p) => p.productId);

    let existingMap = new Map<string, PromotionProduct>();
    if (productIds.length > 0) {
      const existing =
        await this.promotionProductRepository.findByPromotionIdAndProductIds(
          promotionId,
          productIds,
        );
      existingMap = new Map(existing.map((p) => [p.productId, p]));
    }

    const updates = dto.products.map((p) => {
      const { productId, ...rest } = p;
      const update: { productId: string } & UpdatePromotionProductData = {
        productId,
        ...rest,
      };

      if (p.discountType !== undefined || p.discountValue !== undefined) {
        const existing = existingMap.get(p.productId);
        if (existing) {
          const discountType = p.discountType ?? existing.discountType;
          const discountValue = p.discountValue ?? existing.discountValue;
          const originalPrice = existing.originalPrice;

          const discountAmount = calculateRoundedDiscountAmount(
            originalPrice,
            discountType,
            discountValue,
          );
          const discountedPrice = originalPrice - discountAmount;
          update.discountedPrice = discountedPrice;
          update.discountAmount = discountAmount;
          update.discountPercent =
            originalPrice > 0
              ? Math.round((discountAmount / originalPrice) * 100)
              : 0;
          update.effectivePrice = discountedPrice;
        }
      }

      return update;
    });

    const updatedCount = await this.promotionProductRepository.bulkUpdate(
      promotionId,
      updates,
    );
    return { updatedCount };
  }

  // ==================== Public Query Methods ====================

  /**
   * Get active bundle deals for shop
   */
  async getActiveBundleDeals(): Promise<PromotionWithStatus[]> {
    const promotions = await this.promotionRepository.findActiveByType(
      PromotionType.BUNDLE_DEAL,
    );
    return promotions.map((p) => this.addStatus(p));
  }

  /**
   * Get active product discount promotions for shop
   */
  async getActiveProductDiscounts(): Promise<PromotionWithStatus[]> {
    const promotions = await this.promotionRepository.findActiveByType(
      PromotionType.PRODUCT_DISCOUNT,
    );
    return promotions.map((p) => this.addStatus(p));
  }

  /**
   * Get active order discount promotions for shop
   */
  async getActiveOrderDiscounts(): Promise<PromotionWithStatus[]> {
    const promotions = await this.promotionRepository.findActiveByType(
      PromotionType.ORDER_DISCOUNT,
    );
    return promotions.map((p) => this.addStatus(p));
  }

  /**
   * Find active product discount promotions that apply to given product IDs
   * Queries the promotion_products collection for AUTO_APPLY promotions
   * Returns per-product discount values from the promotion_products collection
   */
  async findActiveProductDiscountsForProducts(productIds: string[]): Promise<
    Map<
      string,
      {
        promotion: PromotionWithStatus;
        discountType: DiscountType;
        discountValue: number;
      }
    >
  > {
    const promotions = await this.getActiveProductDiscounts();

    if (promotions.length === 0) {
      return new Map();
    }

    const activePromotionIds = promotions.map((p) => p.id);

    // Query the promotion_products collection for matching products
    const promotionProductMap =
      await this.promotionProductRepository.findActiveForProducts(
        activePromotionIds,
        productIds,
      );

    // Build result map using per-product discount values
    const result = new Map<
      string,
      {
        promotion: PromotionWithStatus;
        discountType: DiscountType;
        discountValue: number;
      }
    >();

    const promotionMap = new Map(promotions.map((p) => [p.id, p]));

    for (const [pid, promoProd] of promotionProductMap) {
      const promotion = promotionMap.get(promoProd.promotionId);
      if (!promotion) continue;

      result.set(pid, {
        promotion,
        discountType: promoProd.discountType,
        discountValue: promoProd.discountValue,
      });
    }

    return result;
  }

  /**
   * Find order discount promotion by promo code
   */
  async findOrderDiscountByPromoCode(
    code: string,
  ): Promise<PromotionWithStatus | null> {
    const promotion = await this.promotionRepository.findByPromoCode(code);
    if (!promotion) {
      return null;
    }

    const withStatus = this.addStatus(promotion);
    if (withStatus.status !== PromotionStatus.ACTIVE) {
      return null;
    }

    return withStatus;
  }

  // ==================== Usage Tracking Methods ====================

  /**
   * Increment sold count for products in a product discount promotion
   * Delegates to the promotion_products collection
   */
  async incrementProductDiscountSoldCount(
    promotionId: string,
    productQuantities: Map<string, number>,
  ): Promise<void> {
    for (const [productId, quantity] of productQuantities) {
      await this.promotionProductRepository.incrementSoldCount(
        promotionId,
        productId,
        quantity,
      );
    }
  }

  /**
   * Increment usage count for order discount promo code after successful order
   */
  async incrementOrderDiscountUsage(
    promotionId: string,
    userId?: string,
  ): Promise<boolean> {
    const result =
      await this.promotionRepository.incrementOrderDiscountUsage(promotionId);
    if (result && userId) {
      await this.promotionUsageRecordRepository.create({
        promotionId,
        userId,
        usedAt: new Date(),
      });
    }
    return result !== null;
  }

  // ==================== Excel Validation ====================

  /**
   * Validate products from Excel file upload for product discount
   */
  async validateExcelProducts(
    file: Express.Multer.File,
    dto: ValidateProductDiscountExcelFileDto,
  ): Promise<ValidateProductDiscountExcelResponseDto> {
    if (!file) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('promotion.fileRequired'),
        errors: { file: 'Excel file is required' },
      });
    }

    const parsedRows = this.parseProductDiscountExcelFile(file);
    this.logger.debug(`Parsed ${parsedRows.length} rows from Excel file`);

    if (parsedRows.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('promotion.emptyExcelFile'),
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

    const productIds = products.map((p) => p.id);

    // Check for flash sale conflicts
    let conflictFlashSaleProductIds = new Set<string>();
    const overlappingFlashSale = await this.flashSaleRepository.findOverlapping(
      startTime,
      endTime,
    );

    if (overlappingFlashSale) {
      const conflictProductsPage =
        await this.flashSaleProductRepository.findByFlashSaleIdWithPagination({
          flashSaleId: overlappingFlashSale.id,
          filterOptions: null,
          sortOptions: null,
          paginationOptions: { page: 1, limit: 10000 },
        });
      conflictFlashSaleProductIds = new Set(
        conflictProductsPage.docs.map((p) => p.productId),
      );
    }

    // Check for product discount conflicts via promotion_products collection
    const conflictPromotionProductIds = new Set<string>();
    const activeProductDiscounts =
      await this.promotionRepository.findActiveByType(
        PromotionType.PRODUCT_DISCOUNT,
      );
    const activePromotionIds = activeProductDiscounts
      .filter((p) => !dto.promotionId || p.id !== dto.promotionId)
      .map((p) => p.id);

    if (activePromotionIds.length > 0 && productIds.length > 0) {
      const existingPromoProducts =
        await this.promotionProductRepository.findActiveForProducts(
          activePromotionIds,
          productIds,
        );
      for (const [pid] of existingPromoProducts) {
        conflictPromotionProductIds.add(pid);
      }
    }

    const validProducts: ValidatedProductDiscountProductDto[] = [];
    const invalidProducts: ValidatedProductDiscountProductDto[] = [];

    for (const item of parsedRows) {
      const errors: ProductDiscountValidationErrorCode[] = [];
      const product = productMap.get(item.code);

      if (!item.code) {
        errors.push(ProductDiscountValidationErrorCode.INVALID_ROW_FORMAT);
      }

      if (duplicateCodes.has(item.code)) {
        errors.push(ProductDiscountValidationErrorCode.DUPLICATE_IN_EXCEL);
      }

      const validatedProduct: ValidatedProductDiscountProductDto = {
        productId: product?.id ?? '',
        code: item.code,
        name: item.name,
        actualName: product?.name,
        image: product?.images?.avatar ?? undefined,
        originalPrice: product?.prices?.retail ?? 0,
        isValid: false,
        errors: [],
        rowNumber: item.rowNumber,
      };

      if (!product) {
        errors.push(ProductDiscountValidationErrorCode.PRODUCT_NOT_FOUND);
      } else {
        if (!product.images?.avatar && !product.images?.others?.length) {
          errors.push(ProductDiscountValidationErrorCode.NO_IMAGE);
        }

        if (conflictFlashSaleProductIds.has(product.id)) {
          errors.push(ProductDiscountValidationErrorCode.CONFLICT_FLASH_SALE);
        }

        if (conflictPromotionProductIds.has(product.id)) {
          errors.push(ProductDiscountValidationErrorCode.CONFLICT_PROMOTION);
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
   */
  private parseProductDiscountExcelFile(
    file: Express.Multer.File,
  ): ProductDiscountExcelRow[] {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: '' },
    );

    const parsedRows: ProductDiscountExcelRow[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2;

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

      if (!code) continue;

      let discountType = DiscountType.FIXED;
      if (
        discountTypeRaw === '%' ||
        discountTypeRaw.toLowerCase() === 'percentage' ||
        discountTypeRaw.toLowerCase() === 'phần trăm'
      ) {
        discountType = DiscountType.PERCENTAGE;
      }

      const discountValue = Math.round(Number(discountValueRaw) || 0);

      parsedRows.push({
        code,
        name,
        rowNumber,
        discountType,
        discountValue,
      });
    }

    return parsedRows;
  }

  // ==================== Private Helpers ====================

  private addStatus(promotion: Promotion): PromotionWithStatus {
    const status = computePromotionStatus(
      promotion.startTime,
      promotion.endTime,
      promotion.isEnabled,
    );
    return { ...promotion, status } as PromotionWithStatus;
  }

  private validateTimeRange(startTime: Date, endTime: Date): void {
    if (startTime >= endTime) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.startTimeMustBeBeforeEndTime'),
      });
    }
  }

  /**
   * Get promotion or throw 404
   */
  private async getPromotionOrThrow(promotionId: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findById(promotionId);
    if (!promotion) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('promotion.notFound'),
      });
    }
    return promotion;
  }

  /**
   * Ensure the promotion is of PRODUCT_DISCOUNT type
   */
  private ensureProductDiscountType(promotion: Promotion): void {
    if (promotion.type !== PromotionType.PRODUCT_DISCOUNT) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.unsupportedType'),
      });
    }
  }

  /**
   * Build a PromotionProduct entity from a product and per-product discount config
   */
  private buildPromotionProduct(
    promotionId: string,
    promotionName: string,
    endTime: Date,
    _config: ProductDiscountConfig,
    product: Product,
    dto: {
      discountType: DiscountType;
      discountValue: number;
      isEnabled?: boolean;
    },
  ): Omit<PromotionProduct, 'id' | 'createdAt' | 'updatedAt'> {
    const discountType = dto.discountType;
    const discountValue = dto.discountValue;
    const originalPrice = product.prices?.retail ?? 0;

    const discountAmount = calculateRoundedDiscountAmount(
      originalPrice,
      discountType,
      discountValue,
    );
    const discountedPrice = originalPrice - discountAmount;
    const discountPercent =
      originalPrice > 0
        ? Math.round((discountAmount / originalPrice) * 100)
        : 0;

    return {
      promotionId,
      promotionName,
      productId: product.id,
      name: product.name,
      code: product.code || '',
      category: product.category || null,
      stock: product.stock ?? 0,
      images: product.images,
      discountType,
      discountValue,
      originalPrice,
      discountedPrice,
      discountAmount,
      discountPercent,
      effectivePrice: discountedPrice,
      soldCount: 0,
      isEnabled: dto.isEnabled ?? true,
      endTime,
    };
  }

  /**
   * Upsert products to the promotion_products collection during create/update
   * Each product must have its own discountType and discountValue
   */
  private async upsertPromotionProducts(
    promotionId: string,
    promotionName: string,
    endTime: Date,
    _configDto: CreateProductDiscountConfigDto,
    productDtos: Array<{
      productId: string;
      discountType: DiscountType;
      discountValue: number;
      isEnabled?: boolean;
    }>,
  ): Promise<void> {
    const productIds = productDtos.map((p) => p.productId);
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const config = new ProductDiscountConfig();

    const toUpsert: Omit<PromotionProduct, 'id' | 'createdAt' | 'updatedAt'>[] =
      [];

    for (const pDto of productDtos) {
      const product = productMap.get(pDto.productId);
      if (!product) continue;

      toUpsert.push(
        this.buildPromotionProduct(
          promotionId,
          promotionName,
          endTime,
          config,
          product,
          pDto,
        ),
      );
    }

    if (toUpsert.length > 0) {
      await this.promotionProductRepository.upsertMany(toUpsert);
    }
  }

  /**
   * Map product discount config DTO to domain config (config-level only, no products)
   * Note: discountType/discountValue are now per-product, not promotion-level
   */
  private mapProductDiscountConfigFromDto(
    dto: CreateProductDiscountConfigDto,
  ): ProductDiscountConfig {
    const config = new ProductDiscountConfig();
    return config;
  }

  private async mapBundleDealConfig(
    dto: CreateBundleDealConfigDto,
    existingConfig?: BundleDealConfig,
  ): Promise<BundleDealConfig> {
    const config = new BundleDealConfig();
    config.subType = dto.subType;
    config.notApplicableWithOtherPromotions =
      dto.notApplicableWithOtherPromotions ?? false;

    if (dto.subType === BundleDealSubType.BUY_TO_GET_GIFT) {
      const allProductIds: string[] = [];
      for (const tierDto of dto.tiers || []) {
        for (const gpDto of tierDto.giftProducts || []) {
          allProductIds.push(gpDto.productId);
        }
      }

      const products = await this.productRepository.findByIds(allProductIds);
      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const productId of allProductIds) {
        if (!productMap.has(productId)) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('promotion.giftProductNotFound', {
              args: { productId },
            }),
          });
        }
      }

      config.tiers = (dto.tiers || []).map((tierDto) => {
        const tier = new BundleDealTier();
        tier.minOrderValue = tierDto.minOrderValue;
        tier.giftProducts = (tierDto.giftProducts || []).map((gpDto) => {
          const product = productMap.get(gpDto.productId)!;
          const gp = new GiftProduct();
          gp.productId = gpDto.productId;
          gp.name = product.name;
          gp.image = product.images?.avatar || '';
          return gp;
        });
        return tier;
      });
      config.requiredQuantity = undefined;
      config.requiredProducts = undefined;
      config.giftQuantity = undefined;
      config.giftProducts = undefined;
      config.minimumOrderValue = undefined;
      config.maxGiftQuantity = undefined;
      config.currentGiftCount = undefined;
      return config;
    }

    if (dto.subType === BundleDealSubType.BUY_X_GET_Y) {
      const requiredProductIds = (dto.requiredProducts || []).map(
        (rp) => rp.productId,
      );
      const giftProductIds = (dto.giftProducts || []).map((gp) => gp.productId);
      const allProductIds = [...requiredProductIds, ...giftProductIds];

      const products = await this.productRepository.findByIds(allProductIds);
      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const productId of allProductIds) {
        if (!productMap.has(productId)) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('promotion.productNotFound', {
              args: { productId },
            }),
          });
        }
      }

      config.tiers = [];
      config.requiredQuantity = dto.requiredQuantity;
      config.requiredProducts = (dto.requiredProducts || []).map((rpDto) => {
        const product = productMap.get(rpDto.productId)!;
        const rp = new RequiredProduct();
        rp.productId = rpDto.productId;
        rp.name = product.name;
        rp.image = product.images?.avatar || '';
        return rp;
      });
      config.giftQuantity = dto.giftQuantity;
      config.giftProducts = (dto.giftProducts || []).map((gpDto) => {
        const product = productMap.get(gpDto.productId)!;
        const gp = new GiftProduct();
        gp.productId = gpDto.productId;
        gp.name = product.name;
        gp.image = product.images?.avatar || '';
        return gp;
      });
      config.minimumOrderValue = dto.minimumOrderValue;
      config.maxGiftQuantity = dto.maxGiftQuantity;
      config.currentGiftCount =
        existingConfig?.subType === BundleDealSubType.BUY_X_GET_Y
          ? (existingConfig.currentGiftCount ?? 0)
          : 0;
    }

    return config;
  }

  /**
   * Map order discount config DTO to domain config
   */
  private mapOrderDiscountConfig(
    dto: CreateOrderDiscountConfigDto,
  ): OrderDiscountConfig {
    const config = new OrderDiscountConfig();
    config.subType = dto.subType;
    config.promoCode = dto.promoCode;
    config.discountType = dto.discountType;
    config.discountValue = dto.discountValue;
    config.maxDiscountValue = dto.maxDiscountValue;
    config.minimumOrderValue = dto.minimumOrderValue;
    config.notApplicableWithOtherPromotions =
      dto.notApplicableWithOtherPromotions ?? false;
    config.singleUsePerCustomer = dto.singleUsePerCustomer ?? false;
    config.totalUsageLimit = dto.totalUsageLimit;
    config.currentUsageCount = 0;
    return config;
  }
}
