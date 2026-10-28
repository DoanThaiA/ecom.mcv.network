import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CheckoutSessionRepository } from './domain/checkout-session.repository';
import { UpsertCheckoutSessionDto } from './dto/upsert-checkout-session.dto';
import { ApplyVoucherToSessionDto } from './dto/apply-voucher-session.dto';
import { PlaceOrderDto, PlaceOrderResponseDto } from './dto/place-order.dto';
import {
  CheckoutSessionResponseDto,
  toCheckoutSessionResponse,
} from './dto/checkout-session-response.dto';
import { Promotion } from '../../promotions/domain/promotion';
import { ShippingPromotion } from '../../shipping-promotions/domain/shipping-promotion';
import { CheckoutUtilsService } from './services/checkout-utils.service';
import { CheckoutShippingService } from './services/checkout-shipping.service';
import { CheckoutVoucherService } from './services/checkout-voucher.service';
import { CheckoutProductDiscountService } from './services/checkout-product-discount.service';
import { CheckoutSessionBuilderService } from './services/checkout-session-builder.service';
import { CheckoutOrderService } from './services/checkout-order.service';
import { throwException } from '../../utils/errors/throw-exception';

/**
 * Checkout service for managing checkout sessions
 * Single-page checkout flow: Upsert Session -> Place Order
 * Thin orchestrator — delegates to focused sub-services.
 */
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly checkoutUtilsService: CheckoutUtilsService,
    private readonly checkoutShippingService: CheckoutShippingService,
    private readonly checkoutVoucherService: CheckoutVoucherService,
    private readonly checkoutProductDiscountService: CheckoutProductDiscountService,
    private readonly checkoutSessionBuilderService: CheckoutSessionBuilderService,
    private readonly checkoutOrderService: CheckoutOrderService,
    private readonly i18n: I18nService,
  ) {}

  // ============= Public Methods =============

  /**
   * Upsert checkout session - creates new or updates existing session
   * If dto.id is provided, updates existing session. Otherwise creates new.
   */
  async upsertSession(
    sessionId: string,
    dto: UpsertCheckoutSessionDto,
    userId?: string,
    affiliateCode?: string | null,
  ): Promise<CheckoutSessionResponseDto> {
    const hasItems = !!(dto.items && dto.items.length > 0);
    const hasCombos = !!(dto.combos && dto.combos.length > 0);
    // Detect if items/combos were explicitly provided (even as empty arrays)
    const itemsExplicitlyProvided =
      Array.isArray(dto.items) || Array.isArray(dto.combos);

    if (dto.id) {
      return this.checkoutSessionBuilderService.updateExistingSession(
        dto,
        sessionId,
        userId,
        affiliateCode,
        hasItems,
        hasCombos,
        itemsExplicitlyProvided,
      );
    }

    return this.checkoutSessionBuilderService.createNewSession(
      dto,
      sessionId,
      userId,
      affiliateCode,
      hasItems,
      hasCombos,
    );
  }

  /**
   * Get checkout session by ID
   */
  async getById(
    checkoutSessionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    const session =
      await this.checkoutSessionRepository.findById(checkoutSessionId);

    if (!session) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.checkout.sessionNotFound'),
      });
    }

    await this.checkoutUtilsService.validateOwnership(
      session,
      sessionId,
      userId,
    );

    return toCheckoutSessionResponse(session);
  }

  /**
   * Apply voucher to checkout session
   */
  async applyVoucherToSession(
    checkoutSessionId: string,
    sessionId: string,
    dto: ApplyVoucherToSessionDto,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutVoucherService.applyVoucherToSession(
      checkoutSessionId,
      sessionId,
      dto,
      userId,
    );
  }

  /**
   * Remove voucher from session
   */
  async removeVoucherFromSession(
    checkoutSessionId: string,
    sessionId: string,
    code: string,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutVoucherService.removeVoucherFromSession(
      checkoutSessionId,
      sessionId,
      code,
      userId,
    );
  }

  /**
   * Place order from checkout session
   * For OnePay methods, returns paymentUrl for redirect
   */
  async placeOrder(
    checkoutSessionId: string,
    sessionId: string,
    dto: PlaceOrderDto,
    userId?: string,
    clientIp?: string,
  ): Promise<PlaceOrderResponseDto> {
    return this.checkoutOrderService.placeOrder(
      checkoutSessionId,
      sessionId,
      dto,
      userId,
      clientIp,
    );
  }

  /**
   * Cancel/delete checkout session
   */
  async cancelSession(
    checkoutSessionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<void> {
    const session =
      await this.checkoutSessionRepository.findById(checkoutSessionId);

    if (!session) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.checkout.sessionNotFound'),
      });
    }

    await this.checkoutUtilsService.validateOwnership(
      session,
      sessionId,
      userId,
    );

    await this.checkoutSessionRepository.delete(checkoutSessionId);

    this.logger.log(`Checkout session cancelled: ${session.sessionNumber}`);
  }

  /**
   * Get available shipping promotions for a checkout session
   */
  async getAvailableShippingPromotions(
    checkoutSessionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<ShippingPromotion[]> {
    return this.checkoutShippingService.getAvailableShippingPromotions(
      checkoutSessionId,
      sessionId,
      userId,
    );
  }

  /**
   * Apply a shipping promotion to a checkout session
   */
  async applyShippingPromotion(
    checkoutSessionId: string,
    promotionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutShippingService.applyShippingPromotion(
      checkoutSessionId,
      promotionId,
      sessionId,
      userId,
    );
  }

  /**
   * Remove shipping promotion from a checkout session
   */
  async removeShippingPromotion(
    checkoutSessionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutShippingService.removeShippingPromotion(
      checkoutSessionId,
      sessionId,
      userId,
    );
  }

  /**
   * Apply product discount to checkout session
   */
  async applyProductDiscountToSession(
    checkoutSessionId: string,
    sessionId: string,
    promotion: Promotion,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutProductDiscountService.applyProductDiscountToSession(
      checkoutSessionId,
      sessionId,
      promotion,
      userId,
    );
  }

  /**
   * Apply order discount to checkout session
   */
  async applyOrderDiscountToSession(
    checkoutSessionId: string,
    sessionId: string,
    promotion: Promotion,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutProductDiscountService.applyOrderDiscountToSession(
      checkoutSessionId,
      sessionId,
      promotion,
      userId,
    );
  }

  /**
   * Remove product discount from session
   */
  async removeProductDiscountFromSession(
    checkoutSessionId: string,
    sessionId: string,
    promotionId: string,
    userId?: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutProductDiscountService.removeProductDiscountFromSession(
      checkoutSessionId,
      sessionId,
      promotionId,
      userId,
    );
  }

  /**
   * Clear vouchers and product discounts from checkout session for auto-replace
   * Used when adding a gift to cart (exclusivity rule: only one promotion type per order)
   */
  async clearVouchersAndProductDiscounts(
    sessionId: string,
    userId?: string,
  ): Promise<void> {
    return this.checkoutVoucherService.clearVouchersAndProductDiscounts(
      sessionId,
      userId,
    );
  }
}
