import { Injectable, HttpStatus, Optional } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IPromotionHandler } from './promotion-handler.interface';
import { OrderDiscountConfig } from '../domain/order-discount-config';
import { OrderDiscountSubType } from '../domain/order-discount-sub-type.enum';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { throwException } from '../../utils/errors/throw-exception';
import { roundToNearestThousand } from '../../utils/helpers/round-price';
import { PromotionUsageRecordRepository } from '../../promotion-usage-records/domain/promotion-usage-record.repository';

/**
 * Eligibility check options
 */
export interface OrderDiscountEligibilityOptions {
  promotionId?: string;
  userId?: string;
  hasOtherPromotions?: boolean;
}

/**
 * Eligibility check result
 */
export interface OrderDiscountEligibilityResult {
  eligible: boolean;
  reason?: string;
  discountAmount?: number;
}

/**
 * Order Discount promotion handler
 * Handles validation, eligibility checking, and discount calculation
 */
@Injectable()
export class OrderDiscountHandler implements IPromotionHandler {
  constructor(
    private readonly i18n: I18nService,
    @Optional()
    private readonly promotionUsageRecordRepository?: PromotionUsageRecordRepository,
  ) {}

  /**
   * Validate order discount configuration
   */
  validate(config: OrderDiscountConfig): Promise<void> {
    // Validate subType
    if (
      !config.subType ||
      !Object.values(OrderDiscountSubType).includes(config.subType)
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.invalidSubType'),
      });
    }

    // Validate promoCode is required for PROMO_CODE subType
    if (
      config.subType === OrderDiscountSubType.PROMO_CODE &&
      !config.promoCode
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.promoCodeRequired'),
      });
    }

    // Validate promoCode should not be set for AUTO_APPLY subType
    if (
      config.subType === OrderDiscountSubType.AUTO_APPLY &&
      config.promoCode
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.promoCodeNotAllowedForAutoApply'),
      });
    }

    // Validate discount type
    if (
      !config.discountType ||
      !Object.values(DiscountType).includes(config.discountType)
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.invalidDiscountType'),
      });
    }

    // Validate discount value
    if (config.discountValue == null || config.discountValue < 0) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.invalidDiscountValue'),
      });
    }

    // Validate percentage is 0-100
    if (
      config.discountType === DiscountType.PERCENTAGE &&
      config.discountValue > 100
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.percentageMustBe0To100'),
      });
    }

    // Validate minimum order value
    if (config.minimumOrderValue == null || config.minimumOrderValue < 0) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.invalidMinimumOrderValue'),
      });
    }

    // Validate maxDiscountValue only for percentage type
    if (
      config.discountType === DiscountType.FIXED &&
      config.maxDiscountValue != null
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.maxDiscountOnlyForPercentage'),
      });
    }

    // Validate totalUsageLimit if provided
    if (config.totalUsageLimit != null && config.totalUsageLimit < 1) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.usageLimitMustBePositive'),
      });
    }

    return Promise.resolve();
  }

  /**
   * Enrich config (no enrichment needed for order discount)
   */
  enrich(config: OrderDiscountConfig): Promise<OrderDiscountConfig> {
    return Promise.resolve(config);
  }

  /**
   * Check if order is eligible for this promotion
   */
  async checkEligibility(
    orderValue: number,
    config: OrderDiscountConfig,
    options?: OrderDiscountEligibilityOptions,
  ): Promise<OrderDiscountEligibilityResult> {
    // Check minimum order value
    if (orderValue < config.minimumOrderValue) {
      return Promise.resolve({
        eligible: false,
        reason: this.i18n.t('promotion.minimumOrderNotMet', {
          args: { minimum: config.minimumOrderValue },
        }),
      });
    }

    // Check exclusivity with other promotions
    if (
      config.notApplicableWithOtherPromotions &&
      options?.hasOtherPromotions
    ) {
      return Promise.resolve({
        eligible: false,
        reason: this.i18n.t('promotion.notApplicableWithOtherPromotions'),
      });
    }

    // Check total usage limit
    if (
      config.totalUsageLimit &&
      config.currentUsageCount >= config.totalUsageLimit
    ) {
      return Promise.resolve({
        eligible: false,
        reason: this.i18n.t('promotion.usageLimitReached'),
      });
    }

    // Check single use per customer
    if (
      config.singleUsePerCustomer &&
      options?.userId &&
      options?.promotionId &&
      this.promotionUsageRecordRepository
    ) {
      const hasUsed =
        await this.promotionUsageRecordRepository.existsByPromotionIdAndUserId(
          options.promotionId,
          options.userId,
        );
      if (hasUsed) {
        return {
          eligible: false,
          reason: this.i18n.t('promotion.alreadyUsedByCustomer'),
        };
      }
    }

    // Calculate discount amount
    let discountAmount: number;
    if (config.discountType === DiscountType.PERCENTAGE) {
      discountAmount = roundToNearestThousand(
        orderValue * (config.discountValue / 100),
      );
      // Apply max discount cap
      if (config.maxDiscountValue && discountAmount > config.maxDiscountValue) {
        discountAmount = config.maxDiscountValue;
      }
    } else {
      discountAmount = config.discountValue;
    }

    // Ensure discount doesn't exceed order value
    discountAmount = Math.min(discountAmount, orderValue);

    return Promise.resolve({
      eligible: true,
      discountAmount,
    });
  }

  /**
   * Get tier count (order discount has no tiers)
   */
  getTierCount(config: OrderDiscountConfig): number {
    return 0;
  }
}
