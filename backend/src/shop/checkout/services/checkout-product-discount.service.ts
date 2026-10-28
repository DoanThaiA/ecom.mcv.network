import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CheckoutSessionRepository } from '../domain/checkout-session.repository';
import {
  CheckoutSessionItem,
  CheckoutSessionDiscountDetail,
  CheckoutSessionDiscountDetailType,
} from '../domain/checkout-session';
import {
  CheckoutSessionResponseDto,
  toCheckoutSessionResponse,
} from '../dto/checkout-session-response.dto';
import { Promotion } from '../../../promotions/domain/promotion';
import { PromotionRepository } from '../../../promotions/domain/promotion.repository';
import { PromotionProductRepository } from '../../../promotion-products/domain/promotion-product.repository';
import { DiscountType } from '../../../combos/domain/discount-type.enum';
import { CheckoutSessionStatus } from '../domain/checkout-session-status.enum';
import { CheckoutUtilsService } from './checkout-utils.service';
import { CheckoutVoucherService } from './checkout-voucher.service';
import { throwException } from '../../../utils/errors/throw-exception';
import { roundToNearestThousand } from '../../../utils/helpers/round-price';

/**
 * Handles product-level and order-level promotion discount application for checkout sessions
 */
@Injectable()
export class CheckoutProductDiscountService {
  private readonly logger = new Logger(CheckoutProductDiscountService.name);

  constructor(
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly checkoutUtilsService: CheckoutUtilsService,
    private readonly checkoutVoucherService: CheckoutVoucherService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Apply product discount to checkout session
   * Auto-replaces any existing promotions (gifts, vouchers, other product discounts)
   */
  async applyProductDiscountToSession(
    checkoutSessionId: string,
    sessionId: string,
    promotion: Promotion,
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

    const cleanSession =
      await this.checkoutSessionRepository.findById(checkoutSessionId);

    // Find eligible items from separate promotion_products collection
    const sessionProductIds = cleanSession!.items.map((i) => i.productId);
    const eligiblePromoProducts =
      await this.promotionProductRepository.findActiveForProducts(
        [promotion.id],
        sessionProductIds,
      );

    // Calculate discount for each eligible item using per-product discount values
    let totalProductDiscount = 0;
    const discountDetails: CheckoutSessionDiscountDetail[] =
      cleanSession!.discountDetails || [];

    for (const item of cleanSession!.items) {
      // Skip items already having a product discount from cron (auto-apply, no min order)
      if (item.productDiscountId) {
        continue;
      }
      const promoProduct = eligiblePromoProducts.get(item.productId);
      if (promoProduct) {
        const discountAmount = this.calculateItemProductDiscount(
          item.originalPrice,
          promoProduct.discountType,
          promoProduct.discountValue,
        );
        totalProductDiscount += discountAmount * item.quantity;
      }
    }

    // Add product discount to discount details
    discountDetails.push({
      type: CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT,
      referenceId: promotion.id,
      referenceName: promotion.name,
      discountType: DiscountType.FIXED,
      discountValue: totalProductDiscount,
      discountAmount: totalProductDiscount,
    });

    // Recalculate totals
    const { subtotal, discount, totalDiscount } =
      this.checkoutUtilsService.calculateTotals(
        cleanSession!.items,
        discountDetails,
        cleanSession!.appliedVouchers || [],
      );

    // Update session
    const updated = await this.checkoutSessionRepository.update(
      cleanSession!.id,
      {
        discountDetails,
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
   * Apply order discount to checkout session
   * Auto-replaces any existing promotions (gifts, vouchers, other discounts)
   */
  async applyOrderDiscountToSession(
    checkoutSessionId: string,
    sessionId: string,
    promotion: Promotion,
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

    const config = promotion.orderDiscountConfig!;

    // Calculate session subtotal for validation
    const sessionSubtotal = session!.items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    // Validate minimum order value
    if (sessionSubtotal < config.minimumOrderValue) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.promotion.orderDiscountNotEligible'),
      });
    }

    // Auto-clear existing promotions before applying new one
    await this.checkoutVoucherService.clearExistingPromotions(
      session!,
      sessionId,
      userId,
    );

    // Reload session after clearing
    const cleanSession =
      await this.checkoutSessionRepository.findById(checkoutSessionId);

    // Calculate order discount
    let orderDiscount = 0;
    if (config.discountType === DiscountType.PERCENTAGE) {
      orderDiscount = (sessionSubtotal * config.discountValue) / 100;
      if (config.maxDiscountValue && orderDiscount > config.maxDiscountValue) {
        orderDiscount = config.maxDiscountValue;
      }
    } else {
      orderDiscount = config.discountValue;
    }
    // Ensure discount doesn't exceed subtotal
    orderDiscount = Math.min(orderDiscount, sessionSubtotal);

    const discountDetails: CheckoutSessionDiscountDetail[] =
      cleanSession!.discountDetails || [];

    // Add order discount to discount details
    discountDetails.push({
      type: CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
      referenceId: promotion.id,
      referenceName: promotion.name,
      discountType:
        config.discountType === DiscountType.PERCENTAGE
          ? DiscountType.PERCENTAGE
          : DiscountType.FIXED,
      discountValue: config.discountValue,
      discountAmount: orderDiscount,
    });

    // Recalculate totals
    const { subtotal, discount, totalDiscount } =
      this.checkoutUtilsService.calculateTotals(
        cleanSession!.items,
        discountDetails,
        cleanSession!.appliedVouchers || [],
      );

    // Update session
    const updated = await this.checkoutSessionRepository.update(
      cleanSession!.id,
      {
        discountDetails,
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
   * Remove product discount from session
   */
  async removeProductDiscountFromSession(
    checkoutSessionId: string,
    sessionId: string,
    promotionId: string,
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

    // Filter out the product/order discount
    const discountDetails = (session!.discountDetails || []).filter(
      (d) =>
        !(
          (d.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT ||
            d.type === CheckoutSessionDiscountDetailType.ORDER_DISCOUNT) &&
          d.referenceId === promotionId
        ),
    );

    // Recalculate totals
    const { subtotal, discount, totalDiscount } =
      this.checkoutUtilsService.calculateTotals(
        session!.items,
        discountDetails,
        session!.appliedVouchers || [],
      );

    // Update session
    const updated = await this.checkoutSessionRepository.update(session!.id, {
      discountDetails,
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
   * Recalculate product discount amounts based on new items
   * Used when cart items change (quantity update, add/remove items)
   */
  async recalculateProductDiscounts(
    discountDetails: CheckoutSessionDiscountDetail[],
    items: CheckoutSessionItem[],
    subtotal: number,
  ): Promise<CheckoutSessionDiscountDetail[]> {
    const result: CheckoutSessionDiscountDetail[] = [];

    for (const detail of discountDetails) {
      // Only recalculate PRODUCT_DISCOUNT and ORDER_DISCOUNT types
      if (
        detail.type !== CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT &&
        detail.type !== CheckoutSessionDiscountDetailType.ORDER_DISCOUNT
      ) {
        result.push(detail);
        continue;
      }

      // Fetch promotion config
      const promotion = await this.promotionRepository.findById(
        detail.referenceId,
      );

      if (!promotion) {
        // Promotion no longer exists, skip it
        this.logger.warn(
          `Product discount promotion ${detail.referenceId} not found, removing from session`,
        );
        continue;
      }

      // Handle ORDER_DISCOUNT promotions stored as PRODUCT_DISCOUNT type
      if (promotion.orderDiscountConfig) {
        const orderConfig = promotion.orderDiscountConfig;

        // Check if still meets minimum order value
        if (subtotal < orderConfig.minimumOrderValue) {
          this.logger.debug(
            `Subtotal ${subtotal} below minimum ${orderConfig.minimumOrderValue}, removing order discount`,
          );
          continue;
        }

        // Recalculate order discount amount
        let orderDiscount = 0;
        if (orderConfig.discountType === DiscountType.PERCENTAGE) {
          orderDiscount = (subtotal * orderConfig.discountValue) / 100;
          if (
            orderConfig.maxDiscountValue &&
            orderDiscount > orderConfig.maxDiscountValue
          ) {
            orderDiscount = orderConfig.maxDiscountValue;
          }
        } else {
          orderDiscount = orderConfig.discountValue;
        }
        orderDiscount = Math.min(orderDiscount, subtotal);

        result.push({
          ...detail,
          discountAmount: orderDiscount,
        });
        continue;
      }

      const config = promotion.productDiscountConfig;
      if (!config) {
        this.logger.warn(
          `Product discount config not found for promotion ${detail.referenceId}`,
        );
        continue;
      }

      // Find eligible items from separate promotion_products collection
      const itemProductIds = items.map((i) => i.productId);
      const eligiblePromoProductsMap =
        await this.promotionProductRepository.findActiveForProducts(
          [detail.referenceId],
          itemProductIds,
        );

      let totalProductDiscount = 0;
      for (const item of items) {
        const promoProduct = eligiblePromoProductsMap.get(item.productId);
        if (promoProduct) {
          const discountAmount = this.calculateItemProductDiscount(
            item.originalPrice,
            promoProduct.discountType,
            promoProduct.discountValue,
          );
          totalProductDiscount += discountAmount * item.quantity;
        }
      }

      // If no eligible items remain, skip this discount
      if (totalProductDiscount === 0) {
        this.logger.debug(
          `No eligible items for product discount ${detail.referenceId}, removing`,
        );
        continue;
      }

      // Update discount amount
      result.push({
        ...detail,
        discountAmount: totalProductDiscount,
      });
    }

    return result;
  }

  /**
   * Calculate discount amount for a single item based on product discount config
   */
  calculateItemProductDiscount(
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
