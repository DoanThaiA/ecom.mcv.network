import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import {
  IPromotionHandler,
  PromotionValidationOptions,
} from './promotion-handler.interface';
import { ProductDiscountConfig } from '../domain/product-discount-config';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { PromotionProduct } from '../../promotion-products/domain/promotion-product';
import { PromotionProductRepository } from '../../promotion-products/domain/promotion-product.repository';
import { roundToNearestThousand } from '../../utils/helpers/round-price';

/**
 * Eligibility check options
 */
export interface ProductDiscountEligibilityOptions {
  userId?: string;
  productId?: string;
}

/**
 * Eligibility check result
 */
export interface ProductDiscountEligibilityResult {
  eligible: boolean;
  reason?: string;
  discountAmount?: number;
  discountedPrice?: number;
}

/**
 * Product Discount promotion handler
 * Handles validation, eligibility checking, and discount calculation for product discounts
 */
@Injectable()
export class ProductDiscountHandler implements IPromotionHandler {
  constructor(
    private readonly i18n: I18nService,
    private readonly promotionProductRepository: PromotionProductRepository,
  ) {}

  /**
   * Validate product discount configuration (config-level only, products are managed separately)
   * Note: Per-product discountType/discountValue are validated at the DTO level (class-validator)
   */
  validate(
    _config: ProductDiscountConfig,
    _options?: PromotionValidationOptions,
  ): void {
    // No config-level validation needed; per-product discounts are validated at DTO level
  }

  /**
   * Enrich config (no enrichment needed)
   */
  enrich(config: ProductDiscountConfig): Promise<ProductDiscountConfig> {
    return Promise.resolve(config);
  }

  /**
   * Check if a product is eligible for this promotion
   * Products are passed in from the caller (fetched from promotion_products collection)
   */
  checkEligibility(
    orderValue: number,
    config: ProductDiscountConfig,
    options?: ProductDiscountEligibilityOptions & {
      promotionProducts?: PromotionProduct[];
    },
  ): Promise<ProductDiscountEligibilityResult> {
    // If checking for a specific product
    if (options?.productId && options?.promotionProducts) {
      const product = options.promotionProducts.find(
        (p) => p.productId === options.productId && p.isEnabled,
      );

      if (!product) {
        return Promise.resolve({
          eligible: false,
          reason: this.i18n.t('promotion.productNotInPromotion'),
        });
      }

      // Calculate discount amount for this product (using per-product discount values)
      let discountAmount: number;
      if (product.discountType === DiscountType.PERCENTAGE) {
        discountAmount = roundToNearestThousand(
          product.originalPrice * (product.discountValue / 100),
        );
      } else {
        discountAmount = product.discountValue;
      }

      discountAmount = Math.min(discountAmount, product.originalPrice);
      const discountedPrice = product.originalPrice - discountAmount;

      return Promise.resolve({
        eligible: true,
        discountAmount,
        discountedPrice,
      });
    }

    // General eligibility (order value meets minimum)
    return Promise.resolve({
      eligible: true,
    });
  }

  /**
   * Get product count for list display (queries separate collection)
   */
  async getTierCount(
    _config: ProductDiscountConfig,
    promotionId?: string,
  ): Promise<number> {
    if (!promotionId) return 0;
    return this.promotionProductRepository.countByPromotionId(promotionId);
  }

  /**
   * Calculate discounted price for a product
   */
  calculateDiscountedPrice(
    originalPrice: number,
    discountType: DiscountType,
    discountValue: number,
  ): number {
    let discountAmount: number;

    if (discountType === DiscountType.PERCENTAGE) {
      discountAmount = roundToNearestThousand(
        originalPrice * (discountValue / 100),
      );
    } else {
      discountAmount = discountValue;
    }

    discountAmount = Math.min(discountAmount, originalPrice);
    return originalPrice - discountAmount;
  }
}
