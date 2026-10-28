import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { ComboRepository } from './domain/combo.repository';
import { Combo, ComboItem } from './domain/combo';
import { ComboStatus } from './domain/combo-status.enum';
import { DiscountType } from './domain/discount-type.enum';
import { ProductRepository } from '../products/domain/product.repository';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { QueryComboDto } from './dto/query-combo.dto';
import {
  ComboResponseDto,
  ComboItemResponseDto,
} from './dto/combo-response.dto';
import { throwException } from '../utils/errors/throw-exception';
import { calculateRoundedDiscountAmount } from '../utils/helpers/round-price';

/**
 * Service for managing combos
 */
@Injectable()
export class CombosService {
  private readonly logger = new Logger(CombosService.name);

  constructor(
    private readonly comboRepository: ComboRepository,
    private readonly productRepository: ProductRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new combo
   */
  async create(dto: CreateComboDto): Promise<ComboResponseDto> {
    this.logger.debug(`Creating combo: ${dto.name}`);

    // Validate items
    await this.validateComboItems(dto.items);

    // Validate percentage discount
    if (
      dto.discountType === DiscountType.PERCENTAGE &&
      dto.discountValue > 100
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.percentageDiscountMax'),
        errors: { discountValue: 'Percentage discount cannot exceed 100' },
      });
    }

    // Calculate original price
    const originalPrice = await this.calculateOriginalPrice(dto.items);

    // Validate fixed discount doesn't exceed original price
    if (
      dto.discountType === DiscountType.FIXED &&
      dto.discountValue > originalPrice
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.fixedDiscountExceedsPrice'),
        errors: {
          discountValue: 'Fixed discount cannot exceed original price',
        },
      });
    }

    const combo = await this.comboRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      image: dto.image ?? null,
      items: dto.items,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      originalPrice,
      status: dto.status ?? ComboStatus.ACTIVE,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
      validTo: dto.validTo ? new Date(dto.validTo) : null,
      nameLocalization: dto.nameLocalization ?? null,
      deletedAt: null,
    });

    return this.toResponseDto(combo);
  }

  /**
   * Find combos with filtering and pagination
   */
  async findAll(
    query: QueryComboDto,
  ): Promise<PaginateResult<ComboResponseDto>> {
    this.logger.debug(`Finding combos with query: ${JSON.stringify(query)}`);

    const result = await this.comboRepository.findManyWithPagination({
      filterOptions: query.filters,
      sortOptions: query.sort,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      },
    });

    // Enrich combos with product details
    const enrichedDocs = await Promise.all(
      result.docs.map((combo) => this.toResponseDto(combo)),
    );

    return {
      ...result,
      docs: enrichedDocs,
    };
  }

  /**
   * Find a combo by ID
   */
  async findOne(id: string): Promise<ComboResponseDto> {
    const combo = await this.comboRepository.findById(id);

    if (!combo) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.notFound'),
      });
    }

    return this.toResponseDto(combo);
  }

  /**
   * Update an existing combo
   */
  async update(id: string, dto: UpdateComboDto): Promise<ComboResponseDto> {
    this.logger.debug(`Updating combo ${id}`);

    // Check combo exists
    const existingCombo = await this.comboRepository.findById(id);
    if (!existingCombo) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.notFound'),
      });
    }

    // Prepare update data
    const updateData: Partial<Combo> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.image !== undefined) updateData.image = dto.image;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.validFrom !== undefined)
      updateData.validFrom = new Date(dto.validFrom);
    if (dto.validTo !== undefined) updateData.validTo = new Date(dto.validTo);
    if (dto.nameLocalization !== undefined)
      updateData.nameLocalization = dto.nameLocalization;

    // Handle items update - recalculate original price
    if (dto.items !== undefined) {
      await this.validateComboItems(dto.items);
      updateData.items = dto.items;
      updateData.originalPrice = await this.calculateOriginalPrice(dto.items);
    }

    // Handle discount update
    if (dto.discountType !== undefined)
      updateData.discountType = dto.discountType;
    if (dto.discountValue !== undefined)
      updateData.discountValue = dto.discountValue;

    // Validate discount values
    const finalDiscountType =
      updateData.discountType ?? existingCombo.discountType;
    const finalDiscountValue =
      updateData.discountValue ?? existingCombo.discountValue;
    const finalOriginalPrice =
      updateData.originalPrice ?? existingCombo.originalPrice;

    if (
      finalDiscountType === DiscountType.PERCENTAGE &&
      finalDiscountValue > 100
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.percentageDiscountMax'),
        errors: { discountValue: 'Percentage discount cannot exceed 100' },
      });
    }

    if (
      finalDiscountType === DiscountType.FIXED &&
      finalDiscountValue > finalOriginalPrice
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.fixedDiscountExceedsPrice'),
        errors: {
          discountValue: 'Fixed discount cannot exceed original price',
        },
      });
    }

    const updatedCombo = await this.comboRepository.update(id, updateData);

    if (!updatedCombo) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.notFound'),
      });
    }

    return this.toResponseDto(updatedCombo);
  }

  /**
   * Soft delete a combo
   */
  async remove(id: string): Promise<void> {
    const combo = await this.comboRepository.findById(id);

    if (!combo) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.notFound'),
      });
    }

    await this.comboRepository.remove(id);
    this.logger.debug(`Deleted combo ${id}`);
  }

  /**
   * Find active combos containing a specific product
   */
  async findByProductId(productId: string): Promise<ComboResponseDto[]> {
    const combos = await this.comboRepository.findActiveByProductId(productId);
    return Promise.all(combos.map((combo) => this.toResponseDto(combo)));
  }

  /**
   * Validate combo items - check products exist and are active
   */
  private async validateComboItems(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.productsNotFound'),
        errors: { productIds: `Products not found: ${missingIds.join(', ')}` },
      });
    }
  }

  /**
   * Calculate original price from combo items
   */
  async calculateOriginalPrice(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<number> {
    let total = 0;
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        total += product.prices.retail * item.quantity;
      }
    }
    return total;
  }

  /**
   * Calculate final price after discount
   */
  calculateFinalPrice(
    originalPrice: number,
    discountType: DiscountType,
    discountValue: number,
  ): number {
    const discountAmount = calculateRoundedDiscountAmount(
      originalPrice,
      discountType,
      discountValue,
    );
    return Math.max(0, originalPrice - discountAmount);
  }

  /**
   * Convert Combo to ComboResponseDto with product details
   */
  private async toResponseDto(combo: Combo): Promise<ComboResponseDto> {
    const productIds = combo.items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    // Create a Map for O(1) lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Enrich items with product details
    const enrichedItems: ComboItemResponseDto[] = combo.items.map((item) => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        productName: product?.name,
        productImage: product?.images?.avatar ?? undefined,
        productPrice: product?.prices?.retail,
      };
    });

    const discountAmount = calculateRoundedDiscountAmount(
      combo.originalPrice,
      combo.discountType,
      combo.discountValue,
    );

    const finalPrice = this.calculateFinalPrice(
      combo.originalPrice,
      combo.discountType,
      combo.discountValue,
    );

    return {
      id: combo.id,
      name: combo.name,
      description: combo.description,
      image: combo.image,
      items: enrichedItems,
      discountType: combo.discountType,
      discountValue: combo.discountValue,
      originalPrice: combo.originalPrice,
      finalPrice,
      discountAmount,
      status: combo.status,
      validFrom: combo.validFrom,
      validTo: combo.validTo,
      createdAt: combo.createdAt,
      updatedAt: combo.updatedAt,
      nameLocalization: combo.nameLocalization,
    };
  }
}
