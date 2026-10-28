import { Injectable } from '@nestjs/common';
import { CheckoutService } from '../checkout/checkout.service';
import { CheckoutSessionResponseDto } from '../checkout/dto/checkout-session-response.dto';
import { ShippingPromotion } from '../../shipping-promotions/domain/shipping-promotion';

/**
 * Shop shipping promotions service
 * Delegates to CheckoutService for shipping promotion operations on checkout sessions
 */
@Injectable()
export class ShopShippingPromotionsService {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Get available shipping promotions for a checkout session
   */
  async getAvailable(
    checkoutSessionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<ShippingPromotion[]> {
    return this.checkoutService.getAvailableShippingPromotions(
      checkoutSessionId,
      sessionId,
      userId,
    );
  }

  /**
   * Apply a shipping promotion to a checkout session
   */
  async apply(
    checkoutSessionId: string,
    promotionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutService.applyShippingPromotion(
      checkoutSessionId,
      promotionId,
      sessionId,
      userId,
    );
  }

  /**
   * Remove shipping promotion from a checkout session
   */
  async remove(
    checkoutSessionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutService.removeShippingPromotion(
      checkoutSessionId,
      sessionId,
      userId,
    );
  }
}
