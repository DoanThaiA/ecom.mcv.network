import { ShippingPromotion } from './shipping-promotion';
import { ShippingPromotionType } from './shipping-promotion-type.enum';
import { ShippingPromotionStatus } from './shipping-promotion-status.enum';
import { PaginateResult } from 'mongoose';

export interface ShippingPromotionQueryOptions {
  type?: ShippingPromotionType;
  status?: ShippingPromotionStatus;
  keyword?: string;
}

export abstract class ShippingPromotionRepository {
  abstract create(
    data: Omit<ShippingPromotion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ShippingPromotion>;

  abstract findById(id: string): Promise<ShippingPromotion | null>;

  abstract findAll(
    options: ShippingPromotionQueryOptions,
    page: number,
    limit: number,
  ): Promise<PaginateResult<ShippingPromotion>>;

  abstract update(
    id: string,
    data: Partial<Omit<ShippingPromotion, 'id' | 'createdAt'>>,
  ): Promise<ShippingPromotion | null>;

  abstract softDelete(id: string): Promise<boolean>;

  /**
   * Find an enabled shipping promotion of the given type that overlaps the time range
   */
  abstract findOverlapping(
    type: ShippingPromotionType,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<ShippingPromotion | null>;

  /**
   * Find active shipping promotions applicable for the given subtotal
   */
  abstract findActiveForCheckout(
    subtotal: number,
  ): Promise<ShippingPromotion[]>;

  /**
   * Find all active shipping promotions for storefront discovery, including
   * promotions whose order threshold has not yet been met.
   */
  abstract findActiveForDisplay(): Promise<ShippingPromotion[]>;
}
