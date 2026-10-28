import { HttpStatus, Injectable, Logger, Optional } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CheckoutSessionRepository } from '../domain/checkout-session.repository';
import {
  CheckoutSession,
  CheckoutSessionItem,
  CheckoutSessionShipping,
  CheckoutSessionAddress,
  CheckoutSessionShippingPromotion,
} from '../domain/checkout-session';
import {
  CheckoutSessionResponseDto,
  toCheckoutSessionResponse,
} from '../dto/checkout-session-response.dto';
import { ShippingService } from '../../shipping/shipping.service';
import { CalculateShippingDto } from '../../shipping/dto/shipping.dto';
import { ShippingSettingsRepository } from '../../../shipping-settings/domain/shipping-settings.repository';
import { ShippingCalculationMethod } from '../../../shipping-settings/domain/shipping-calculation-method.enum';
import { ShippingPromotionsService } from '../../../shipping-promotions/shipping-promotions.service';
import { ShippingPromotion } from '../../../shipping-promotions/domain/shipping-promotion';
import { ShippingPromotionType } from '../../../shipping-promotions/domain/shipping-promotion-type.enum';
import { CheckoutUtilsService } from './checkout-utils.service';
import { throwException } from '../../../utils/errors/throw-exception';

/**
 * Handles shipping fee calculation and shipping promotion management for checkout sessions
 */
@Injectable()
export class CheckoutShippingService {
  private readonly logger = new Logger(CheckoutShippingService.name);

  constructor(
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly shippingService: ShippingService,
    private readonly checkoutUtilsService: CheckoutUtilsService,
    private readonly i18n: I18nService,
    @Optional()
    private readonly shippingSettingsRepository?: ShippingSettingsRepository,
    @Optional()
    private readonly shippingPromotionsService?: ShippingPromotionsService,
  ) {}

  /**
   * Get available shipping promotions for a checkout session
   */
  async getAvailableShippingPromotions(
    checkoutSessionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<ShippingPromotion[]> {
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

    if (!this.shippingPromotionsService) {
      return [];
    }

    return this.shippingPromotionsService.findActiveForCheckout(
      session.subtotal,
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

    if (!this.shippingPromotionsService) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shipping-promotion.notFound'),
      });
    }

    // Find the promotion
    const promotion = await this.shippingPromotionsService.findOne(promotionId);

    // Validate promotion is active and applicable
    const activePromotions =
      await this.shippingPromotionsService.findActiveForCheckout(
        session.subtotal,
      );

    const isApplicable = activePromotions.some((p) => p.id === promotionId);
    if (!isApplicable) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shipping-promotion.notApplicable'),
      });
    }

    // Calculate shipping discount
    const shippingFee = session.shippingFee || 0;
    const shippingDiscount =
      this.shippingPromotionsService.calculateShippingDiscount(
        promotion,
        session.subtotal,
        shippingFee,
      );

    const shippingPromotion: CheckoutSessionShippingPromotion = {
      id: promotion.id,
      name: promotion.name,
      type: promotion.type,
      discountAmount: shippingDiscount,
    };

    const discount = session.discount ?? 0;
    const total = session.subtotal + shippingFee - shippingDiscount - discount;

    const updated = await this.checkoutSessionRepository.update(session.id, {
      shippingDiscount,
      shippingPromotion,
      total,
    });

    return toCheckoutSessionResponse(updated!);
  }

  /**
   * Remove shipping promotion from a checkout session
   */
  async removeShippingPromotion(
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

    const shippingFee = session.shippingFee || 0;
    const discount = session.discount ?? 0;
    const total = session.subtotal + shippingFee - discount;

    const updated = await this.checkoutSessionRepository.update(session.id, {
      shippingDiscount: 0,
      shippingPromotion: null,
      total,
    });

    return toCheckoutSessionResponse(updated!);
  }

  /**
   * Calculate shipping fee and build shipping object for a session
   */
  async calculateShippingForSession(
    shippingAddress: CheckoutSessionAddress | null,
    items: CheckoutSessionItem[],
    existingShipping?: CheckoutSessionShipping | null,
  ): Promise<{
    shippingFee: number;
    shipping: CheckoutSessionShipping | null;
  }> {
    if (!shippingAddress?.cityId || !shippingAddress?.districtId) {
      return { shippingFee: 0, shipping: existingShipping ?? null };
    }

    try {
      const shippingResult = await this.calculateShippingBySettings({
        shippingAddress: {
          cityId: shippingAddress.cityId,
          districtId: shippingAddress.districtId,
          wardId: shippingAddress.wardId ?? undefined,
          address: shippingAddress.address,
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      return {
        shippingFee: shippingResult.totalShippingFee,
        shipping: {
          fee: shippingResult.totalShippingFee,
          depotId: shippingResult.depot.id,
          depotName: shippingResult.depot.name,
          carrierId: shippingResult.selectedCarrier?.carrierId ?? null,
          carrierName: shippingResult.selectedCarrier?.carrierName ?? null,
          serviceId: shippingResult.selectedCarrier?.serviceId ?? null,
          carrierType: shippingResult.selectedCarrier?.carrierType ?? null,
          accountId: shippingResult.selectedCarrier?.accountId ?? null,
          serviceCode: shippingResult.selectedCarrier?.serviceCode ?? null,
          shopId: shippingResult.selectedCarrier?.shopId ?? null,
        },
      };
    } catch (err) {
      this.logger.warn(`Shipping calculation failed: ${err.message}`);
      return { shippingFee: 0, shipping: existingShipping ?? null };
    }
  }

  /**
   * Auto-apply the active FREESHIP promotion if the subtotal qualifies.
   * Returns the resolved shippingDiscount and shippingPromotion to store on the session.
   */
  async autoApplyFreeship(
    subtotal: number,
    shippingFee: number,
  ): Promise<{
    shippingDiscount: number;
    shippingPromotion: CheckoutSessionShippingPromotion | null;
  }> {
    if (!this.shippingPromotionsService || shippingFee <= 0) {
      return { shippingDiscount: 0, shippingPromotion: null };
    }

    const activePromotions =
      await this.shippingPromotionsService.findActiveForCheckout(subtotal);

    const freeship = activePromotions.find(
      (p) => p.type === ShippingPromotionType.FREESHIP,
    );

    if (!freeship) {
      return { shippingDiscount: 0, shippingPromotion: null };
    }

    const shippingDiscount =
      this.shippingPromotionsService.calculateShippingDiscount(
        freeship,
        subtotal,
        shippingFee,
      );

    if (shippingDiscount <= 0) {
      return { shippingDiscount: 0, shippingPromotion: null };
    }

    return {
      shippingDiscount,
      shippingPromotion: {
        id: freeship.id,
        name: freeship.name,
        type: freeship.type,
        discountAmount: shippingDiscount,
      },
    };
  }

  /**
   * Calculate shipping based on shipping settings
   * Checks calculationMethod to decide between carrier-based or fixed
   */
  private async calculateShippingBySettings(dto: CalculateShippingDto) {
    let method = ShippingCalculationMethod.FIXED;

    if (this.shippingSettingsRepository) {
      const settings = await this.shippingSettingsRepository.getOrCreate();
      method = settings.calculationMethod;
    }

    if (method === ShippingCalculationMethod.CARRIER_BASED) {
      return this.shippingService.calculateShipping(dto);
    }
    return this.shippingService.calculateFixedShipping(dto);
  }
}
