import { Injectable, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { IPromotionHandler } from './promotion-handler.interface';
import { BundleDealConfig, BundleDealTier } from '../domain/bundle-deal-config';
import { BundleDealSubType } from '../domain/bundle-deal-sub-type.enum';
import { throwException } from '../../utils/errors/throw-exception';

/**
 * Bundle Deal promotion handler
 * Handles validation, enrichment, and eligibility for bundle deals
 */
@Injectable()
export class BundleDealHandler implements IPromotionHandler {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Validate bundle deal configuration
   */
  validate(config: BundleDealConfig): Promise<void> {
    if (!config.subType) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.bundleDealSubTypeRequired'),
      });
    }

    if (config.subType === BundleDealSubType.BUY_TO_GET_GIFT) {
      if (!config.tiers || config.tiers.length === 0) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.atLeastOneTierRequired'),
        });
      }

      for (let i = 0; i < config.tiers.length; i++) {
        const tier = config.tiers[i];

        if (tier.minOrderValue == null || tier.minOrderValue < 0) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('promotion.invalidMinOrderValue'),
          });
        }

        if (!tier.giftProducts || tier.giftProducts.length === 0) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('promotion.atLeastOneGiftProductRequired'),
          });
        }
      }

      // Validate tiers are sorted by minOrderValue ascending
      for (let i = 1; i < config.tiers.length; i++) {
        if (
          config.tiers[i].minOrderValue <= config.tiers[i - 1].minOrderValue
        ) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('promotion.tiersMustBeAscending'),
          });
        }
      }
    } else if (config.subType === BundleDealSubType.BUY_X_GET_Y) {
      if (config.requiredQuantity == null || config.requiredQuantity < 1) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.invalidRequiredQuantity'),
        });
      }

      if (!config.requiredProducts || config.requiredProducts.length === 0) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.atLeastOneRequiredProductRequired'),
        });
      }

      if (config.giftQuantity == null || config.giftQuantity < 1) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.invalidGiftQuantity'),
        });
      }

      if (!config.giftProducts || config.giftProducts.length === 0) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.atLeastOneGiftProductRequired'),
        });
      }

      if (config.minimumOrderValue != null && config.minimumOrderValue < 0) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.invalidMinimumOrderValue'),
        });
      }

      if (config.maxGiftQuantity != null && config.maxGiftQuantity < 1) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.invalidMaxGiftQuantity'),
        });
      }

      if (
        config.maxGiftQuantity != null &&
        config.giftQuantity != null &&
        config.maxGiftQuantity < config.giftQuantity
      ) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('promotion.maxGiftQuantityTooLow'),
        });
      }
    } else {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('promotion.invalidSubType'),
      });
    }

    return Promise.resolve();
  }

  /**
   * Enrich config with product details
   * TODO: Inject ProductsService to fetch product details
   */
  enrich(config: BundleDealConfig): Promise<any> {
    // For now, return config as-is
    // In full implementation, fetch product name, image, stock from ProductsService
    if (config.subType === BundleDealSubType.BUY_X_GET_Y) {
      return Promise.resolve({
        subType: config.subType,
        requiredQuantity: config.requiredQuantity,
        giftQuantity: config.giftQuantity,
        minimumOrderValue: config.minimumOrderValue,
        maxGiftQuantity: config.maxGiftQuantity,
        requiredProducts: (config.requiredProducts || []).map((rp) => ({
          productId: rp.productId,
          productName: null, // TODO: Fetch from product service
          productCode: null,
          productImage: null,
          availableStock: null,
        })),
        giftProducts: (config.giftProducts || []).map((gp) => ({
          productId: gp.productId,
          productName: null, // TODO: Fetch from product service
          productCode: null,
          productImage: null,
          availableStock: null,
        })),
      });
    }

    return Promise.resolve({
      subType: config.subType,
      tiers: (config.tiers || []).map((tier) => ({
        minOrderValue: tier.minOrderValue,
        giftProducts: tier.giftProducts.map((gp) => ({
          productId: gp.productId,
          productName: null, // TODO: Fetch from product service
          productCode: null,
          productImage: null,
          availableStock: null,
        })),
      })),
    });
  }

  /**
   * Check eligibility and return qualifying tiers/products
   */
  checkEligibility(
    orderValue: number,
    config: BundleDealConfig,
  ): Promise<{ eligible: boolean; qualifyingTiers: BundleDealTier[] }> {
    if (config.subType === BundleDealSubType.BUY_X_GET_Y) {
      const minimumOrderValue = config.minimumOrderValue ?? 0;
      const eligible = orderValue >= minimumOrderValue;
      return Promise.resolve({
        eligible,
        qualifyingTiers: [],
      });
    }

    const qualifyingTiers = (config.tiers || []).filter(
      (tier) => orderValue >= tier.minOrderValue,
    );

    return Promise.resolve({
      eligible: qualifyingTiers.length > 0,
      qualifyingTiers,
    });
  }

  /**
   * Get tier count for list display
   */
  getTierCount(config: BundleDealConfig): number {
    if (config?.subType === BundleDealSubType.BUY_X_GET_Y) {
      return 1;
    }
    return config?.tiers?.length ?? 0;
  }
}
