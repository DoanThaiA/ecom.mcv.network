import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CheckoutSessionRepository } from '../domain/checkout-session.repository';
import {
  CheckoutSession,
  CheckoutSessionItem,
  CheckoutSessionVoucher,
  CheckoutSessionDiscountDetailType,
} from '../domain/checkout-session';
import {
  CheckoutSessionResponseDto,
  toCheckoutSessionResponse,
} from '../dto/checkout-session-response.dto';
import { ApplyVoucherToSessionDto } from '../dto/apply-voucher-session.dto';
import { CheckoutSessionStatus } from '../domain/checkout-session-status.enum';
import { CartRepository } from '../../cart/domain/cart.repository';
import { UserRepository } from '../../../users/domain/user.repository';
import { PromotionRepository } from '../../../promotions/domain/promotion.repository';
import { PromotionProductRepository } from '../../../promotion-products/domain/promotion-product.repository';
import { CdpService } from '../../../cdp/cdp.service';
import { CheckoutUtilsService } from './checkout-utils.service';
import { throwException } from '../../../utils/errors/throw-exception';
import { roundToNearestThousand } from '../../../utils/helpers/round-price';
import { DiscountType } from '../../../combos/domain/discount-type.enum';

/**
 * Handles voucher application, removal, recalculation, and promotion clearing for checkout sessions
 */
@Injectable()
export class CheckoutVoucherService {
  private readonly logger = new Logger(CheckoutVoucherService.name);

  constructor(
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly cartRepository: CartRepository,
    private readonly userRepository: UserRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly cdpService: CdpService,
    private readonly checkoutUtilsService: CheckoutUtilsService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Apply voucher to checkout session
   * Auto-clears existing promotions (gifts, product discounts) before applying
   */
  async applyVoucherToSession(
    checkoutSessionId: string,
    sessionId: string,
    dto: ApplyVoucherToSessionDto,
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

    if (session!.status !== CheckoutSessionStatus.ACTIVE) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.sessionNotActive'),
      });
    }

    // Conditional clearing based on exclusivity rules:
    // 1. If new voucher is exclusive: clear ALL existing vouchers
    // 2. If existing voucher is exclusive: reject new voucher (checked later)
    // 3. If both are stackable: allow both to coexist
    if (dto.notApplicableWithOtherPromotions) {
      // New voucher is exclusive - clear all existing promotions
      await this.clearExistingPromotions(session!, sessionId, userId);
    }

    // Reload session after clearing
    const cleanSession =
      await this.checkoutSessionRepository.findById(checkoutSessionId);

    // Calculate session subtotal for voucher validation and discount calculation
    const sessionSubtotal = cleanSession!.items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const eligibleSubtotal = sessionSubtotal;

    // Validate minimum order value if specified (using full session subtotal for qualification)
    if (
      dto.minimumOrderValue &&
      dto.minimumOrderValue > 0 &&
      sessionSubtotal < dto.minimumOrderValue
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.voucherMinimumNotMet', {
          args: { minimum: dto.minimumOrderValue },
        }),
      });
    }

    // Validate voucher cannot be used with other vouchers
    // Note: Flash sale items are product-level discounts and don't block voucher application
    // The exclusivity rule only applies to user-selected promotions (Bundle Deal, CTKM, Voucher)
    // clearExistingPromotions() already handles removing other user-selected promotions
    if (dto.notApplicableWithOtherPromotions) {
      const hasOtherVouchers =
        cleanSession!.appliedVouchers &&
        cleanSession!.appliedVouchers.length > 0;

      if (hasOtherVouchers) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t(
            'shop.checkout.voucherNotApplicableWithOtherPromotions',
            { args: { voucherCode: dto.code } },
          ),
        });
      }
    }

    // Check if any existing voucher has notApplicableWithOtherPromotions
    const existingExclusiveVoucher = cleanSession!.appliedVouchers?.find(
      (v) => v.notApplicableWithOtherPromotions,
    );
    if (existingExclusiveVoucher) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t(
          'shop.checkout.voucherNotApplicableWithOtherPromotions',
          { args: { voucherCode: existingExclusiveVoucher.code } },
        ),
      });
    }

    // Calculate the actual discount amount based on discount type
    let calculatedDiscountAmount = dto.discountAmount;

    {
      // Calculate discount on entire subtotal (maxDiscountValue applies to entire order)
      if (dto.discountType === 1 && dto.discountValue) {
        // Percentage discount: calculate based on subtotal, rounded to nearest thousand
        calculatedDiscountAmount = roundToNearestThousand(
          eligibleSubtotal * (dto.discountValue / 100),
        );
        // Apply max discount cap if specified (for entire order)
        if (dto.maxDiscountValue && dto.maxDiscountValue > 0) {
          calculatedDiscountAmount = Math.min(
            calculatedDiscountAmount,
            dto.maxDiscountValue,
          );
        }
      } else if (dto.discountType === 0 && dto.discountValue) {
        // Fixed discount: round to nearest thousand for consistency
        calculatedDiscountAmount = roundToNearestThousand(dto.discountValue);
      }

      // Cap discount to not exceed subtotal
      calculatedDiscountAmount = Math.min(
        calculatedDiscountAmount,
        eligibleSubtotal,
      );
    }

    let appliedVouchers = cleanSession!.appliedVouchers || [];

    // Remove if already exists (update case)
    appliedVouchers = appliedVouchers.filter((v) => v.code !== dto.code);

    appliedVouchers.push({
      code: dto.code,
      name: dto.name,
      source: dto.source,
      id: dto.id,
      discountAmount: calculatedDiscountAmount,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minimumOrderValue: dto.minimumOrderValue,
      maxDiscountValue: dto.maxDiscountValue,
      notApplicableWithOtherPromotions: dto.notApplicableWithOtherPromotions,
    });

    // Recalculate totals
    const { subtotal, discount, totalDiscount } =
      this.checkoutUtilsService.calculateTotals(
        cleanSession!.items,
        cleanSession!.discountDetails || [],
        appliedVouchers,
      );

    // Update session
    const updated = await this.checkoutSessionRepository.update(
      cleanSession!.id,
      {
        appliedVouchers,
        subtotal,
        discount,
        totalDiscount,
        total:
          subtotal +
          (cleanSession!.shippingFee || 0) -
          (cleanSession!.shippingDiscount || 0) -
          discount,
      },
    );

    return toCheckoutSessionResponse(updated!);
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
    const session =
      await this.checkoutSessionRepository.findById(checkoutSessionId);
    if (!session)
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: 'Session not found',
      });

    await this.checkoutUtilsService.validateOwnership(
      session,
      sessionId,
      userId,
    );

    let appliedVouchers = session!.appliedVouchers || [];
    const initialLen = appliedVouchers.length;
    appliedVouchers = appliedVouchers.filter((v) => v.code !== code);

    if (appliedVouchers.length === initialLen) {
      return toCheckoutSessionResponse(session!);
    }

    // Recalculate
    const { subtotal, discount, totalDiscount } =
      this.checkoutUtilsService.calculateTotals(
        session!.items,
        session!.discountDetails || [],
        appliedVouchers,
      );

    const updated = await this.checkoutSessionRepository.update(session!.id, {
      appliedVouchers,
      subtotal,
      discount,
      totalDiscount,
      total:
        subtotal +
        (session!.shippingFee || 0) -
        (session!.shippingDiscount || 0) -
        discount,
    });

    return toCheckoutSessionResponse(updated!);
  }

  /**
   * Clear vouchers and product discounts from checkout session for auto-replace
   * Used when adding a gift to cart (exclusivity rule: only one promotion type per order)
   * Does NOT clear gift items as they are handled in the cart
   */
  async clearVouchersAndProductDiscounts(
    sessionId: string,
    userId?: string,
  ): Promise<void> {
    // Find active checkout session
    const session =
      await this.checkoutSessionRepository.findActiveBySessionIdOrUserId(
        sessionId,
        userId,
      );

    if (!session) {
      // No active session to clear
      return;
    }

    let needsUpdate = false;
    const updates: Partial<CheckoutSession> = {};

    // 1. Clear applied vouchers
    if (session.appliedVouchers && session.appliedVouchers.length > 0) {
      updates.appliedVouchers = [];
      needsUpdate = true;
    }

    // 2. Clear product/order discounts from discount details
    const promotionDiscounts = (session.discountDetails || []).filter(
      (d) =>
        d.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT ||
        d.type === CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
    );

    if (promotionDiscounts.length > 0) {
      updates.discountDetails = (session.discountDetails || []).filter(
        (d) =>
          d.type !== CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT &&
          d.type !== CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
      );
      needsUpdate = true;
    }

    if (needsUpdate) {
      await this.checkoutSessionRepository.update(session.id, updates);

      // Recalculate totals
      const updatedSession = await this.checkoutSessionRepository.findById(
        session.id,
      );
      if (updatedSession) {
        const { subtotal, discount, totalDiscount } =
          this.checkoutUtilsService.calculateTotals(
            updatedSession.items,
            updatedSession.discountDetails || [],
            updatedSession.appliedVouchers || [],
          );

        await this.checkoutSessionRepository.update(updatedSession.id, {
          subtotal,
          discount,
          totalDiscount,
          total:
            subtotal +
            (updatedSession.shippingFee || 0) -
            (updatedSession.shippingDiscount || 0) -
            discount,
        });
      }
    }
  }

  /**
   * Recalculate voucher discount amounts based on new subtotal
   * Used when cart items change to update percentage-based discounts
   * Also removes exclusive vouchers if flash sale items are present
   */
  async recalculateVoucherDiscounts(
    vouchers: CheckoutSessionVoucher[],
    subtotal: number,
    items?: CheckoutSessionItem[],
  ): Promise<CheckoutSessionVoucher[]> {
    const hasFlashSaleItems = items?.some((item) => item.flashSaleId != null);

    const filtered = vouchers.filter((v) => {
      // Remove vouchers that no longer meet minimum order value
      if (v.minimumOrderValue && v.minimumOrderValue > 0) {
        if (subtotal < v.minimumOrderValue) {
          return false;
        }
      }
      // Remove exclusive vouchers if flash sale items are present
      if (v.notApplicableWithOtherPromotions && hasFlashSaleItems) {
        return false;
      }
      return true;
    });

    const result: CheckoutSessionVoucher[] = [];
    for (const v of filtered) {
      let discountAmount = v.discountAmount;

      // CMS Product Discount VOUCHER: recalculate per-item using per-product discount values
      if (
        v.eligibleProductIds &&
        v.eligibleProductIds.length > 0 &&
        items &&
        v.id
      ) {
        const eligibleProductIdSet = new Set(v.eligibleProductIds);
        const eligibleItems = items.filter((item) =>
          eligibleProductIdSet.has(item.productId),
        );

        const promoProductMap =
          await this.promotionProductRepository.findActiveForProducts(
            [v.id],
            eligibleItems.map((i) => i.productId),
          );

        discountAmount = 0;
        for (const item of eligibleItems) {
          const promoProduct = promoProductMap.get(item.productId);
          if (!promoProduct) continue;
          const itemDiscount = this.calculateItemProductDiscount(
            item.originalPrice,
            promoProduct.discountType,
            promoProduct.discountValue,
          );
          discountAmount += itemDiscount * item.quantity;
        }
      } else if (v.discountType === 1 && v.discountValue) {
        // CDP voucher: percentage discount on entire subtotal
        discountAmount = roundToNearestThousand(
          subtotal * (v.discountValue / 100),
        );
        // Apply max discount cap if specified (for entire order)
        if (v.maxDiscountValue && v.maxDiscountValue > 0) {
          discountAmount = Math.min(discountAmount, v.maxDiscountValue);
        }
      }
      // Fixed discounts stay the same (already rounded when applied)

      // Cap discount to not exceed subtotal
      discountAmount = Math.min(discountAmount, subtotal);

      result.push({
        ...v,
        discountAmount,
      });
    }

    return result;
  }

  /**
   * Clear all existing promotions (gifts, vouchers, product discounts)
   * Used for auto-replace functionality
   */
  async clearExistingPromotions(
    session: CheckoutSession,
    sessionId: string,
    userId?: string,
  ): Promise<void> {
    // 1. Remove gift items from cart
    const cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    if (cart) {
      const giftItems = cart.items.filter((item) => item.isGift);
      if (giftItems.length > 0) {
        const updatedItems = cart.items.filter((item) => !item.isGift);
        await this.cartRepository.update(cart.id, { items: updatedItems });
      }
    }

    // 2. Remove gift items from checkout session items (effectivePrice = 0)
    const sessionGiftItems = session.items.filter(
      (item) => item.effectivePrice === 0,
    );
    if (sessionGiftItems.length > 0) {
      const nonGiftSessionItems = session.items.filter(
        (item) => item.effectivePrice !== 0,
      );
      await this.checkoutSessionRepository.update(session.id, {
        items: nonGiftSessionItems,
      });
    }

    // 3. Clear applied vouchers
    if (session.appliedVouchers && session.appliedVouchers.length > 0) {
      await this.checkoutSessionRepository.update(session.id, {
        appliedVouchers: [],
      });
    }

    // 4. Clear product/order discounts from discount details
    const promotionDiscounts = (session.discountDetails || []).filter(
      (d) =>
        d.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT ||
        d.type === CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
    );

    if (promotionDiscounts.length > 0) {
      const remainingDetails = (session.discountDetails || []).filter(
        (d) =>
          d.type !== CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT &&
          d.type !== CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
      );
      await this.checkoutSessionRepository.update(session.id, {
        discountDetails: remainingDetails,
      });
    }

    // Recalculate and update totals after clearing
    const updatedSession = await this.checkoutSessionRepository.findById(
      session.id,
    );
    if (updatedSession) {
      const { subtotal, discount, totalDiscount } =
        this.checkoutUtilsService.calculateTotals(
          updatedSession.items,
          updatedSession.discountDetails || [],
          updatedSession.appliedVouchers || [],
        );

      await this.checkoutSessionRepository.update(updatedSession.id, {
        subtotal,
        discount,
        totalDiscount,
        total:
          subtotal +
          (updatedSession.shippingFee || 0) -
          (updatedSession.shippingDiscount || 0) -
          discount,
      });
    }
  }

  /**
   * Consume CDP vouchers when placing order
   * Calls useVoucher RPC to mark voucher as used
   * CDP vouchers are only available for registered users
   */
  async consumeCdpVouchers(
    session: CheckoutSession,
    orderNumber: string,
    userId?: string,
  ): Promise<void> {
    const cdpVouchers = session.appliedVouchers?.filter(
      (v) => v.source === 'CDP',
    );

    if (!cdpVouchers || cdpVouchers.length === 0) {
      return;
    }

    // Get CDP customer ID from user (CDP vouchers require registered user)
    let customerId: string | undefined;
    if (userId) {
      const user = await this.userRepository.findById(userId);
      customerId = user?.cdpCustomerId ?? undefined;
    }

    for (const voucher of cdpVouchers) {
      try {
        const response = await this.cdpService.useVoucher({
          voucher_code: voucher.code,
          merchant_code: 'CCHAT',
          transaction_no: orderNumber,
          customer_id: customerId,
        });

        if (response.code === 0) {
          this.logger.log(
            `CDP voucher ${voucher.code} consumed for order ${orderNumber}`,
          );
        } else {
          this.logger.warn(
            `CDP useVoucher returned non-zero code for ${voucher.code}: ${response.code} - ${response.message}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error consuming CDP voucher ${voucher.code}: ${error.message}`,
        );
        // Continue with order creation even if voucher consumption fails
        // The voucher was already validated during apply
      }
    }
  }

  /**
   * Calculate discount amount for a single item based on product discount config
   */
  private calculateItemProductDiscount(
    originalPrice: number,
    discountType: DiscountType,
    discountValue: number,
    maxDiscountValue?: number,
  ): number {
    let discount = 0;

    if (discountType === DiscountType.PERCENTAGE) {
      discount = roundToNearestThousand((originalPrice * discountValue) / 100);
      if (maxDiscountValue && discount > maxDiscountValue) {
        discount = maxDiscountValue;
      }
    } else {
      discount = roundToNearestThousand(discountValue);
    }

    // Ensure discount doesn't exceed original price
    return Math.min(discount, originalPrice);
  }
}
