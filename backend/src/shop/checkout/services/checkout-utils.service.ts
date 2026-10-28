import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CheckoutSessionRepository } from '../domain/checkout-session.repository';
import {
  CheckoutSession,
  CheckoutSessionCustomer,
  CheckoutSessionAddress,
  CheckoutSessionItem,
  CheckoutSessionDiscountDetail,
  CheckoutSessionVoucher,
} from '../domain/checkout-session';
import { UpsertCheckoutSessionDto } from '../dto/upsert-checkout-session.dto';
import { throwException } from '../../../utils/errors/throw-exception';

/**
 * Shared utilities for checkout sub-services
 * Pure helpers with no cross-service dependencies
 */
@Injectable()
export class CheckoutUtilsService {
  private readonly logger = new Logger(CheckoutUtilsService.name);

  constructor(
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Validate session ownership.
   * For authenticated users accessing a guest-created session (userId is null),
   * automatically claim the session by setting the userId.
   */
  async validateOwnership(
    session: CheckoutSession,
    sessionId: string,
    userId?: string,
  ): Promise<void> {
    if (userId) {
      // Direct ownership match
      if (session.userId === userId) return;

      // Auto-claim: unowned guest session accessed by authenticated user
      if (session.userId == null) {
        await this.checkoutSessionRepository.update(session.id, { userId });
        session.userId = userId;
        this.logger.log(
          `Checkout session ${session.sessionNumber} auto-claimed by user ${userId}`,
        );
        return;
      }
    } else {
      // Guest: match by sessionId
      if (session.sessionId === sessionId) return;
    }

    throwException({
      status: HttpStatus.FORBIDDEN,
      message: this.i18n.t('shop.checkout.notAuthorized'),
    });
  }

  /**
   * Generate unique key for item lookup
   */
  getItemKey(productId: string, variantId?: string | null): string {
    return `${productId}:${variantId || ''}`;
  }

  /**
   * Calculate session totals
   */
  calculateTotals(
    items: CheckoutSessionItem[],
    orderDiscountDetails?: CheckoutSessionDiscountDetail[],
    appliedVouchers?: CheckoutSessionVoucher[],
  ): {
    subtotal: number;
    discount: number;
    totalDiscount: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Sum item-level discounts (flash sale, per-item coupons, etc.)
    const itemLevelDiscount = items.reduce(
      (sum, item) =>
        sum +
        (item.discountDetails?.reduce((s, d) => s + d.discountAmount, 0) ?? 0),
      0,
    );

    let orderLevelDiscount = 0;

    // Sum order-level discounts only (combo, order coupons, etc.)
    if (orderDiscountDetails) {
      orderLevelDiscount += orderDiscountDetails.reduce(
        (sum, d) => sum + d.discountAmount,
        0,
      );
    }

    // Sum voucher discounts
    if (appliedVouchers) {
      for (const v of appliedVouchers) {
        orderLevelDiscount += v.discountAmount;
      }
    }

    // Cap discount
    if (orderLevelDiscount > subtotal) {
      orderLevelDiscount = subtotal;
    }

    // Total discount from all sources
    const totalDiscount = itemLevelDiscount + orderLevelDiscount;

    const total = subtotal - orderLevelDiscount;

    return { subtotal, discount: orderLevelDiscount, totalDiscount, total };
  }

  /**
   * Build customer info from DTO, with optional fallback to existing data
   */
  buildCustomerInfo(
    dto: UpsertCheckoutSessionDto,
    existing?: CheckoutSessionCustomer | null,
  ): CheckoutSessionCustomer | null {
    if (dto.customer) {
      return {
        name: dto.customer.name ?? '',
        phone: dto.customer.phone ?? '',
        email: dto.customer.email ?? null,
      };
    }
    return existing ?? null;
  }

  /**
   * Build shipping address from DTO, with optional fallback to existing data
   */
  buildShippingAddress(
    dto: UpsertCheckoutSessionDto,
    existing?: CheckoutSessionAddress | null,
  ): CheckoutSessionAddress | null {
    if (dto.shippingAddress) {
      return {
        address: dto.shippingAddress.address ?? '',
        ward: dto.shippingAddress.ward ?? null,
        district: dto.shippingAddress.district ?? null,
        city: dto.shippingAddress.city ?? '',
        country: 'Vietnam',
        cityId: dto.shippingAddress.cityId ?? null,
        districtId: dto.shippingAddress.districtId ?? null,
        wardId: dto.shippingAddress.wardId ?? null,
      };
    }
    return existing ?? null;
  }
}
