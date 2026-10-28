import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { ShippingPromotionRepository } from './domain/shipping-promotion.repository';
import { ShippingPromotion } from './domain/shipping-promotion';
import { ShippingPromotionType } from './domain/shipping-promotion-type.enum';
import { CreateShippingPromotionDto } from './dto/create-shipping-promotion.dto';
import { UpdateShippingPromotionDto } from './dto/update-shipping-promotion.dto';
import { QueryShippingPromotionDto } from './dto/query-shipping-promotion.dto';
import { DiscountType } from '../combos/domain/discount-type.enum';
import { throwException } from '../utils/errors/throw-exception';
import { roundToNearestHundred } from '../utils/helpers/round-price';

/**
 * Service for managing shipping promotions
 */
@Injectable()
export class ShippingPromotionsService {
  constructor(
    private readonly shippingPromotionRepository: ShippingPromotionRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new shipping promotion
   */
  async create(dto: CreateShippingPromotionDto): Promise<ShippingPromotion> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime >= endTime) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shipping-promotion.startTimeMustBeBeforeEndTime'),
      });
    }

    // Validate config is provided for the type
    if (
      dto.type === ShippingPromotionType.FREESHIP &&
      !dto.freeshippingConfig
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shipping-promotion.configRequired'),
      });
    }

    if (
      dto.type === ShippingPromotionType.SHIPPING_DISCOUNT &&
      !dto.shippingDiscountConfig
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shipping-promotion.configRequired'),
      });
    }

    // Validate percentage discount max 100
    if (dto.shippingDiscountConfig) {
      for (const tier of dto.shippingDiscountConfig.tiers) {
        if (
          tier.discountType === DiscountType.PERCENTAGE &&
          tier.discountValue > 100
        ) {
          throwException({
            status: HttpStatus.BAD_REQUEST,
            message: this.i18n.t('shipping-promotion.percentageMax'),
          });
        }
      }
    }

    // Check for overlapping promotion of the same type
    const overlapping = await this.shippingPromotionRepository.findOverlapping(
      dto.type,
      startTime,
      endTime,
    );
    if (overlapping) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: this.i18n.t('shipping-promotion.overlapping'),
      });
    }

    return this.shippingPromotionRepository.create({
      type: dto.type,
      name: dto.name,
      startTime,
      endTime,
      isEnabled: true,
      freeshippingConfig: dto.freeshippingConfig ?? null,
      shippingDiscountConfig: dto.shippingDiscountConfig ?? null,
      deletedAt: null,
    });
  }

  /**
   * Find all shipping promotions with filtering and pagination
   */
  async findAll(
    query: QueryShippingPromotionDto,
  ): Promise<PaginateResult<ShippingPromotion>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return this.shippingPromotionRepository.findAll(
      {
        type: query.filters?.type,
        status: query.filters?.status,
        keyword: query.filters?.search,
      },
      page,
      limit,
    );
  }

  /**
   * Find shipping promotion by ID
   */
  async findOne(id: string): Promise<ShippingPromotion> {
    const promotion = await this.shippingPromotionRepository.findById(id);
    if (!promotion) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shipping-promotion.notFound'),
      });
    }
    return promotion;
  }

  /**
   * Update a shipping promotion
   */
  async update(
    id: string,
    dto: UpdateShippingPromotionDto,
  ): Promise<ShippingPromotion> {
    const existing = await this.shippingPromotionRepository.findById(id);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shipping-promotion.notFound'),
      });
    }

    // Validate time range if either is provided
    const startTime = dto.startTime
      ? new Date(dto.startTime)
      : existing.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existing.endTime;

    if (startTime >= endTime) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shipping-promotion.startTimeMustBeBeforeEndTime'),
      });
    }

    // Validate percentage discount max 100
    if (dto.shippingDiscountConfig) {
      for (const tier of dto.shippingDiscountConfig.tiers) {
        if (
          tier.discountType === DiscountType.PERCENTAGE &&
          tier.discountValue > 100
        ) {
          throwException({
            status: HttpStatus.BAD_REQUEST,
            message: this.i18n.t('shipping-promotion.percentageMax'),
          });
        }
      }
    }

    // Check for overlapping promotion of the same type
    const isEnabled = dto.isEnabled ?? existing.isEnabled;
    if (isEnabled) {
      const overlapping =
        await this.shippingPromotionRepository.findOverlapping(
          existing.type,
          startTime,
          endTime,
          id,
        );
      if (overlapping) {
        throwException({
          status: HttpStatus.CONFLICT,
          message: this.i18n.t('shipping-promotion.overlapping'),
        });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.startTime !== undefined)
      updateData.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) updateData.endTime = new Date(dto.endTime);
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;
    if (dto.freeshippingConfig !== undefined)
      updateData.freeshippingConfig = dto.freeshippingConfig;
    if (dto.shippingDiscountConfig !== undefined)
      updateData.shippingDiscountConfig = dto.shippingDiscountConfig;

    const updated = await this.shippingPromotionRepository.update(
      id,
      updateData,
    );
    if (!updated) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shipping-promotion.notFound'),
      });
    }

    return updated;
  }

  /**
   * Soft delete a shipping promotion
   */
  async remove(id: string): Promise<void> {
    const existing = await this.shippingPromotionRepository.findById(id);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shipping-promotion.notFound'),
      });
    }

    await this.shippingPromotionRepository.softDelete(id);
  }

  /**
   * Toggle isEnabled on a shipping promotion
   */
  async toggleEnabled(id: string): Promise<ShippingPromotion> {
    const existing = await this.shippingPromotionRepository.findById(id);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shipping-promotion.notFound'),
      });
    }

    // If enabling, check for overlapping promotion of the same type
    if (!existing.isEnabled) {
      const overlapping =
        await this.shippingPromotionRepository.findOverlapping(
          existing.type,
          existing.startTime,
          existing.endTime,
          id,
        );
      if (overlapping) {
        throwException({
          status: HttpStatus.CONFLICT,
          message: this.i18n.t('shipping-promotion.overlapping'),
        });
      }
    }

    const updated = await this.shippingPromotionRepository.update(id, {
      isEnabled: !existing.isEnabled,
    });

    return updated!;
  }

  /**
   * Find active shipping promotions applicable for checkout
   */
  async findActiveForCheckout(subtotal: number): Promise<ShippingPromotion[]> {
    return this.shippingPromotionRepository.findActiveForCheckout(subtotal);
  }

  /**
   * Calculate shipping discount amount for a given promotion, subtotal, and shipping fee
   * Returns the discount amount to subtract from shipping fee
   */
  calculateShippingDiscount(
    promotion: ShippingPromotion,
    subtotal: number,
    shippingFee: number,
  ): number {
    if (shippingFee <= 0) return 0;

    if (promotion.type === ShippingPromotionType.FREESHIP) {
      if (
        promotion.freeshippingConfig &&
        subtotal >= promotion.freeshippingConfig.minimumOrderValue
      ) {
        return shippingFee; // Full free shipping
      }
      return 0;
    }

    if (promotion.type === ShippingPromotionType.SHIPPING_DISCOUNT) {
      if (!promotion.shippingDiscountConfig) return 0;

      // Find the highest applicable tier (sorted by minimumOrderValue desc)
      const applicableTiers = promotion.shippingDiscountConfig.tiers
        .filter((t) => subtotal >= t.minimumOrderValue)
        .sort((a, b) => b.minimumOrderValue - a.minimumOrderValue);

      if (applicableTiers.length === 0) return 0;

      const tier = applicableTiers[0];
      let raw: number;

      if (tier.discountType === DiscountType.PERCENTAGE) {
        raw = (shippingFee * tier.discountValue) / 100;
      } else {
        raw = tier.discountValue;
      }

      // Round to nearest hundred, cap at shipping fee
      return Math.min(roundToNearestHundred(raw), shippingFee);
    }

    return 0;
  }
}
