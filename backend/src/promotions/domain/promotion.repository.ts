import { Promotion } from './promotion';
import { PromotionType } from './promotion-type.enum';
import { PromotionStatus } from './promotion-status.enum';
import { PaginateResult } from 'mongoose';

/**
 * Query options for promotions
 */
export interface PromotionQueryOptions {
  type?: PromotionType;
  status?: PromotionStatus;
  keyword?: string;
}

/**
 * Promotion repository interface
 */
export abstract class PromotionRepository {
  /**
   * Create a new promotion
   */
  abstract create(
    data: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Promotion>;

  /**
   * Find promotion by ID
   */
  abstract findById(id: string): Promise<Promotion | null>;

  /**
   * Find all promotions with pagination and filters
   */
  abstract findAll(
    options: PromotionQueryOptions,
    page: number,
    limit: number,
  ): Promise<PaginateResult<Promotion>>;

  /**
   * Find active promotions by type
   */
  abstract findActiveByType(type: PromotionType): Promise<Promotion[]>;

  /**
   * Find active order discounts and PDP-relevant bundle deals.
   * BUY_TO_GET_GIFT deals are global; BUY_X_GET_Y deals are restricted to
   * promotions whose required-products list contains the current product.
   */
  abstract findActiveForProductHighlights(
    productId: string,
  ): Promise<Promotion[]>;

  /**
   * Update promotion
   */
  abstract update(
    id: string,
    data: Partial<Omit<Promotion, 'id' | 'createdAt'>>,
  ): Promise<Promotion | null>;

  /**
   * Soft delete promotion
   */
  abstract softDelete(id: string): Promise<boolean>;

  /**
   * Check if promotion name exists (excluding given ID)
   */
  abstract existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Find active order discount promotion by promo code
   */
  abstract findByPromoCode(promoCode: string): Promise<Promotion | null>;

  /**
   * Increment usage count for order discount promo code
   * Uses atomic update to prevent race conditions
   * @param promotionId - Promotion ID
   * @returns Updated promotion or null if limit exceeded
   */
  abstract incrementOrderDiscountUsage(
    promotionId: string,
  ): Promise<Promotion | null>;

  /**
   * Increment gift count for bundle deal promotion (BUY_X_GET_Y)
   * Uses atomic update to prevent race conditions
   * @param promotionId - Promotion ID
   * @param giftCount - Number of gifts to increment
   * @returns Updated promotion or null if limit exceeded
   */
  abstract incrementBundleDealGiftCount(
    promotionId: string,
    giftCount: number,
  ): Promise<Promotion | null>;

  /**
   * Find all active product discount promotions
   * @returns Array of active promotions
   */
  abstract findActiveProductDiscounts(): Promise<Promotion[]>;
}
