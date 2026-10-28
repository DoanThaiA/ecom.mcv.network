import { BundleDealConfig } from '../domain/bundle-deal-config';

/**
 * Validation options for promotion handlers
 */
export interface PromotionValidationOptions {
  /**
   * Exclude this promotion ID from conflict checks (for updates)
   */
  excludePromotionId?: string;
}

/**
 * Promotion handler interface
 * Each promotion type implements this to handle type-specific logic
 */
export interface IPromotionHandler {
  /**
   * Validate type-specific configuration
   */
  validate(
    config: any,
    options?: PromotionValidationOptions,
  ): void | Promise<void>;

  /**
   * Enrich config with product details (for responses)
   */
  enrich(config: any): Promise<any>;

  /**
   * Check if order is eligible for this promotion
   */
  checkEligibility(orderValue: number, config: any): Promise<any>;

  /**
   * Get tier count for list display
   */
  getTierCount(config: any, promotionId?: string): number | Promise<number>;
}

/**
 * Handler registry key type
 */
export type HandlerKey = 'bundle_deal' | 'order_discount' | 'product_combo';
