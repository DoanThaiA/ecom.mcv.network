import { HttpStatus, Injectable, Logger, Optional } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TelegramService } from '../../../telegram/telegram.service';
import { CheckoutSessionRepository } from '../domain/checkout-session.repository';
import {
  CheckoutSession,
  CheckoutSessionDiscountDetailType,
} from '../domain/checkout-session';
import { CheckoutSessionStatus } from '../domain/checkout-session-status.enum';
import {
  PlaceOrderDto,
  ItemValidationErrorDto,
  PlaceOrderResponseDto,
  FlashSaleAdjustmentDto,
} from '../dto/place-order.dto';
import { ProductRepository } from '../../../products/domain/product.repository';
import { CartRepository } from '../../cart/domain/cart.repository';
import { CartItem } from '../../cart/domain/cart';
import { FlashSaleRepository } from '../../../flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../../../flash-sale-products/domain/flash-sale-product.repository';
import { OrderRepository } from '../../order/domain/order.repository';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  isOnepayMethod,
  isOnlinePaymentMethod,
  isInfocmsMethod,
} from '../../order/domain/order.enums';
import { DiscountDetailType } from '../../order/domain/order';
import { DiscountType } from '../../../combos/domain/discount-type.enum';
import { OrderService } from '../../order/order.service';
import { OnepayService } from '../../../payment/onepay/onepay.service';
import { InfocmsService } from '../../../payment/infocms/infocms.service';
import { UserRepository } from '../../../users/domain/user.repository';
import { AffiliateRepository } from '../../../affiliates/domain/affiliate.repository';
import { AffiliateStatus } from '../../../affiliates/domain/affiliate-status.enum';
import { CommissionSettingsRepository } from '../../../commission-settings/domain/commission-settings.repository';
import { CommissionTrigger } from '../../../commission-settings/domain/commission-trigger.enum';
import { SystemTasksService } from '../../../system-tasks/system-tasks.service';
import {
  OrderTasksService,
  PromotionUsageParams,
} from '../../../order-tasks/order-tasks.service';
import { CheckoutUtilsService } from './checkout-utils.service';
import { CheckoutVoucherService } from './checkout-voucher.service';
import { throwException } from '../../../utils/errors/throw-exception';
import { isSaleable } from '../../../products/domain/product-status.enum';

/**
 * Handles order creation flow from session validation through payment handling
 */
@Injectable()
export class CheckoutOrderService {
  private readonly logger = new Logger(CheckoutOrderService.name);

  constructor(
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    private readonly orderRepository: OrderRepository,
    private readonly orderService: OrderService,
    private readonly onepayService: OnepayService,
    private readonly infocmsService: InfocmsService,
    private readonly userRepository: UserRepository,
    private readonly systemTasksService: SystemTasksService,
    private readonly orderTasksService: OrderTasksService,
    private readonly checkoutUtilsService: CheckoutUtilsService,
    private readonly checkoutVoucherService: CheckoutVoucherService,
    private readonly i18n: I18nService,
    @Optional()
    private readonly affiliateRepository?: AffiliateRepository,
    @Optional()
    private readonly commissionSettingsRepository?: CommissionSettingsRepository,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {}

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
    const session = await this.validateSessionForOrder(
      checkoutSessionId,
      sessionId,
      userId,
    );

    // Validate items
    const validation = await this.validateForOrder(session);

    if (!validation.isValid) {
      return { success: false, validationErrors: validation.errors };
    }

    // Handle flash sale conflicts by reverting to regular prices
    if (validation.flashSaleConflicts.length > 0) {
      return this.handleFlashSaleConflicts(
        session,
        checkoutSessionId,
        validation.flashSaleConflicts,
      );
    }

    // Check missing fields
    const paymentMethod = dto.paymentMethod ?? session.paymentMethod;
    const missingFields = this.checkRequiredFields(session, paymentMethod);
    if (missingFields.length > 0) {
      return { success: false, missingFields };
    }

    const note = dto.note ?? session.note;
    const { affiliateId, affiliateCode } = await this.resolveAffiliate(session);

    // Create order
    const order = await this.createOrderFromSession(
      session,
      sessionId,
      userId,
      paymentMethod!,
      note,
      affiliateId,
      affiliateCode,
    );

    // Handle online payment methods (OnePay, InfoCMS)
    if (isOnlinePaymentMethod(paymentMethod!)) {
      return this.handleOnlinePayment(
        session,
        checkoutSessionId,
        order,
        paymentMethod!,
        clientIp,
      );
    }

    // Non-online payment (COD, Bank Transfer, etc.): complete immediately
    return this.completeOfflineOrder(
      session,
      checkoutSessionId,
      sessionId,
      order,
      userId,
    );
  }

  /**
   * Validate session exists, check ownership, status, and cancel pending orders if needed
   */
  private async validateSessionForOrder(
    checkoutSessionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<CheckoutSession> {
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

    if (session.status === CheckoutSessionStatus.COMPLETED) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.sessionAlreadyCompleted'),
      });
    }

    if (
      session.status !== CheckoutSessionStatus.ACTIVE &&
      session.status !== CheckoutSessionStatus.PENDING_PAYMENT
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.sessionNotActive'),
      });
    }

    if (
      session.status === CheckoutSessionStatus.PENDING_PAYMENT &&
      session.orderId
    ) {
      const existingOrder = await this.orderRepository.findById(
        session.orderId,
      );
      if (
        existingOrder &&
        existingOrder.paymentStatus === PaymentStatus.PENDING
      ) {
        this.logger.log(
          `Canceling pending order ${session.orderNumber} before creating new order`,
        );
        await this.orderService.cleanupAbandonedOrder(
          session.orderId,
          'Replaced by new payment attempt',
        );
      }
    }

    // Reject empty sessions - cannot place order with no items
    if (!session.items || session.items.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.noItemsSelected'),
      });
    }

    return session;
  }

  /**
   * Handle flash sale conflicts by reverting items to regular prices and persisting
   */
  private async handleFlashSaleConflicts(
    session: CheckoutSession,
    checkoutSessionId: string,
    flashSaleConflicts: Array<{
      productId: string;
      variantId?: string | null;
      productName: string;
    }>,
  ): Promise<PlaceOrderResponseDto> {
    const flashSaleAdjustments: FlashSaleAdjustmentDto[] = [];

    for (const conflict of flashSaleConflicts) {
      const item = session.items.find(
        (i) =>
          i.productId === conflict.productId &&
          i.variantId === conflict.variantId,
      );
      if (!item) continue;

      const flashSaleDetail = item.discountDetails?.find(
        (d) => d.type === CheckoutSessionDiscountDetailType.FLASH_SALE,
      );
      const flashSaleDiscountTotal = flashSaleDetail?.discountAmount ?? 0;

      item.discountDetails =
        item.discountDetails?.filter(
          (d) => d.type !== CheckoutSessionDiscountDetailType.FLASH_SALE,
        ) ?? null;

      const productDiscountDetail = item.discountDetails?.find(
        (d) => d.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT,
      );

      const fallbackPrice = productDiscountDetail
        ? item.originalPrice - productDiscountDetail.discountAmountPerUnit
        : item.originalPrice;

      flashSaleAdjustments.push({
        productId: item.productId,
        productName: item.name,
        flashSalePrice: item.effectivePrice,
        regularPrice: fallbackPrice,
      });

      item.effectivePrice = fallbackPrice;
      item.subtotal = fallbackPrice * item.quantity;
      item.discount = Math.max(
        0,
        (item.discount || 0) - flashSaleDiscountTotal,
      );
      item.flashSaleId = null;
      item.flashSaleName = null;
    }

    session.subtotal = session.items.reduce((sum, i) => sum + i.subtotal, 0);
    const itemLevelDiscount = session.items.reduce(
      (sum, i) => sum + (i.discount || 0),
      0,
    );
    session.totalDiscount = itemLevelDiscount + (session.discount || 0);
    session.total =
      session.subtotal +
      (session.shippingFee || 0) -
      (session.shippingDiscount || 0) -
      (session.discount || 0);

    await this.checkoutSessionRepository.update(checkoutSessionId, {
      items: session.items,
      subtotal: session.subtotal,
      totalDiscount: session.totalDiscount,
      total: session.total,
    });

    this.logger.log(
      `Flash sale auto-adjusted for session ${session.sessionNumber}: ` +
        flashSaleAdjustments.map((a) => a.productName).join(', '),
    );

    return {
      success: false,
      pricesAdjusted: true,
      flashSaleAdjustments,
    };
  }

  /**
   * Check required fields for placing an order
   */
  private checkRequiredFields(
    session: CheckoutSession,
    paymentMethod: PaymentMethod | null | undefined,
  ): string[] {
    const missingFields: string[] = [];

    if (!session.customer?.name) missingFields.push('customer.name');
    if (!session.customer?.phone) missingFields.push('customer.phone');
    if (!session.shippingAddress?.address)
      missingFields.push('shippingAddress.address');
    if (!session.shippingAddress?.city)
      missingFields.push('shippingAddress.city');
    if (!session.shippingAddress?.cityId)
      missingFields.push('shippingAddress.cityId');
    if (!session.shippingAddress?.districtId)
      missingFields.push('shippingAddress.districtId');
    if (!paymentMethod) missingFields.push('paymentMethod');

    return missingFields;
  }

  /**
   * Resolve affiliate from session's affiliate code
   */
  private async resolveAffiliate(
    session: CheckoutSession,
  ): Promise<{ affiliateId: string | null; affiliateCode: string | null }> {
    if (!session.affiliateCode || !this.affiliateRepository) {
      return { affiliateId: null, affiliateCode: null };
    }

    const affiliate = await this.affiliateRepository.findByAffiliateCode(
      session.affiliateCode,
    );
    if (affiliate && affiliate.status === AffiliateStatus.ACTIVE) {
      return {
        affiliateId: affiliate.id,
        affiliateCode: affiliate.affiliateCode,
      };
    }

    return { affiliateId: null, affiliateCode: null };
  }

  /**
   * Create order record from checkout session data
   */
  private async createOrderFromSession(
    session: CheckoutSession,
    sessionId: string,
    userId: string | undefined,
    paymentMethod: PaymentMethod,
    note: string | null | undefined,
    affiliateId: string | null,
    affiliateCode: string | null,
  ) {
    const orderNumber = await this.orderRepository.generateOrderNumber();

    await this.checkoutVoucherService.consumeCdpVouchers(
      session,
      orderNumber,
      userId,
    );

    return this.orderRepository.create({
      orderNumber,
      userId: userId ?? null,
      sessionId,
      customer: {
        name: session.customer!.name,
        phone: session.customer!.phone,
        email: session.customer!.email ?? null,
      },
      shippingAddress: {
        address: session.shippingAddress!.address,
        ward: session.shippingAddress!.ward ?? null,
        district: session.shippingAddress!.district ?? null,
        city: session.shippingAddress!.city,
        country: 'Vietnam',
        cityId: session.shippingAddress!.cityId!,
        districtId: session.shippingAddress!.districtId!,
        wardId: session.shippingAddress!.wardId ?? null,
      },
      items: session.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        code: item.code,
        name: item.name,
        image: item.image,
        price: item.effectivePrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        discount: item.discount,
        comboInstanceId: item.comboInstanceId,
        comboId: item.comboId,
        comboName: item.comboName,
        flashSaleId: item.flashSaleId,
        flashSaleName: item.flashSaleName,
        originalPrice: item.originalPrice,
        discountDetails:
          item.discountDetails?.map((d) => ({
            type: d.type as any,
            referenceId: d.referenceId,
            referenceName: d.referenceName,
            discountType: d.discountType,
            discountValue: d.discountValue,
            discountAmountPerUnit: d.discountAmountPerUnit,
            discountAmount: d.discountAmount,
          })) ?? null,
        isGift: item.isGift ?? null,
        giftPromotionId: item.giftPromotionId ?? null,
      })),
      subtotal: session.subtotal,
      shippingFee: session.shippingFee,
      depotId: session.shipping?.depotId,
      shippingCarrier: session.shipping?.carrierId
        ? {
            carrierId: session.shipping.carrierId,
            carrierName: session.shipping.carrierName ?? null,
            carrierType: session.shipping.carrierType ?? null,
            serviceId: session.shipping.serviceId ?? null,
            serviceCode: session.shipping.serviceCode ?? null,
            accountId: session.shipping.accountId ?? null,
            shopId: session.shipping.shopId ?? null,
          }
        : null,
      discount: session.discount,
      discountDetails: [
        ...(session.discountDetails?.map((d) => ({
          type: d.type as any,
          referenceId: d.referenceId,
          referenceName: d.referenceName,
          instanceId: d.instanceId,
          discountType: d.discountType,
          discountValue: d.discountValue,
          discountAmount: d.discountAmount,
        })) ?? []),
        ...(session.appliedVouchers?.map((v) => ({
          type: DiscountDetailType.COUPON,
          referenceId: v.code,
          referenceName: v.name,
          instanceId: null,
          discountType:
            v.discountType === 1 ? DiscountType.PERCENTAGE : DiscountType.FIXED,
          discountValue: v.discountValue || 0,
          discountAmount: v.discountAmount,
          source: v.source,
        })) ?? []),
      ],
      totalDiscount: session.totalDiscount,
      shippingDiscount: session.shippingDiscount ?? 0,
      shippingPromotionId: session.shippingPromotion?.id ?? null,
      shippingPromotionName: session.shippingPromotion?.name ?? null,
      total: session.total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod,
      note: note ?? null,
      affiliateId,
      affiliateCode,
      cancelledAt: null,
      cancellationReason: null,
    });
  }

  /**
   * Handle online payment flow (OnePay, InfoCMS)
   */
  private async handleOnlinePayment(
    session: CheckoutSession,
    checkoutSessionId: string,
    order: any,
    paymentMethod: PaymentMethod,
    clientIp?: string,
  ): Promise<PlaceOrderResponseDto> {
    await this.checkoutSessionRepository.markPendingPayment(
      checkoutSessionId,
      order.id,
      order.orderNumber,
    );

    if (isOnepayMethod(paymentMethod)) {
      const paymentUrl = await this.onepayService.createPaymentUrl(
        order,
        clientIp || '127.0.0.1',
      );

      this.logger.log(
        `OnePay payment initiated for order ${order.orderNumber}, ` +
          `checkout session ${session.sessionNumber} marked as PENDING_PAYMENT`,
      );

      return { success: true, order, paymentUrl };
    }

    if (isInfocmsMethod(paymentMethod)) {
      return this.handleInfocmsPayment(session, checkoutSessionId, order);
    }

    // Fallback for unknown online payment methods
    return { success: true, order };
  }

  /**
   * Handle InfoCMS (VietQR) payment creation
   */
  private async handleInfocmsPayment(
    session: CheckoutSession,
    checkoutSessionId: string,
    order: any,
  ): Promise<PlaceOrderResponseDto> {
    const qrResult = await this.infocmsService.createPaymentQr(order);

    if (!qrResult.success) {
      this.logger.error(
        `Failed to create InfoCMS QR for order ${order.orderNumber}: ${qrResult.errorMessage}`,
      );
      void this.telegramService?.sendErrorAlert(
        'CheckoutOrderService.handleInfocmsPayment',
        qrResult.errorMessage || 'InfoCMS QR creation failed',
        { orderNumber: order.orderNumber, orderId: order.id },
      );
      await this.checkoutSessionRepository.update(checkoutSessionId, {
        status: CheckoutSessionStatus.ACTIVE,
        orderId: null,
        orderNumber: null,
      });
      await this.orderService.cleanupAbandonedOrder(
        order.id,
        'QR code generation failed',
      );

      return {
        success: false,
        message: qrResult.errorMessage || 'Failed to create payment QR code',
      };
    }

    await this.orderRepository.update(order.id, {
      infocms: {
        transactionUuid: qrResult.transactionUuid,
        ecollectionCd: qrResult.ecollectionCd,
      },
    });

    this.logger.log(
      `InfoCMS QR created for order ${order.orderNumber}, ` +
        `checkout session ${session.sessionNumber} marked as PENDING_PAYMENT`,
    );

    return {
      success: true,
      order,
      qrUrl: qrResult.qrUrl,
      qrData: qrResult.qrData,
    };
  }

  /**
   * Complete offline order (COD, Bank Transfer): mark session, clear cart, queue tasks
   */
  private async completeOfflineOrder(
    session: CheckoutSession,
    checkoutSessionId: string,
    sessionId: string,
    order: any,
    userId?: string,
  ): Promise<PlaceOrderResponseDto> {
    await this.checkoutSessionRepository.markCompleted(
      checkoutSessionId,
      order.id,
      order.orderNumber,
    );

    const removedGiftItems = await this.clearSessionItemsFromCart(
      session,
      sessionId,
      userId,
    );

    const flashSaleItems = session.items
      .filter((item) => item.flashSaleId)
      .map((item) => ({
        flashSaleId: item.flashSaleId!,
        productId: item.productId,
        quantity: item.quantity,
      }));
    void this.systemTasksService.queueIncrementFlashSaleSoldCount(
      flashSaleItems,
    );

    void this.orderTasksService.queueIncrementPromotionUsage(
      this.buildPromotionUsageParams(session, userId, removedGiftItems),
      order.orderNumber,
    );

    void this.orderTasksService.queueSyncOrderCdp(order);
    void this.orderTasksService.queueSyncOrderNhanh(order, session.shipping);
    void this.orderTasksService.queueCreateOrderConfirmation(order);

    if (order.affiliateId && order.affiliateCode) {
      const settings = await this.commissionSettingsRepository?.getOrCreate();
      if (
        !settings ||
        settings.commissionTrigger === CommissionTrigger.ORDER_CREATION
      ) {
        void this.orderTasksService.queueCreateAffiliateCommission(
          order,
          order.affiliateId,
          order.affiliateCode,
        );
      }
    }

    this.logger.log(
      `Checkout session ${session.sessionNumber} completed, order ${order.orderNumber} created`,
    );

    return { success: true, order };
  }

  /**
   * Validate session items for order creation.
   * Returns hard errors (order must fail) and flash sale conflicts (auto-resolvable).
   */
  private async validateForOrder(session: CheckoutSession): Promise<{
    isValid: boolean;
    errors: ItemValidationErrorDto[];
    flashSaleConflicts: Array<{
      productId: string;
      variantId?: string | null;
      productName: string;
    }>;
  }> {
    const errors: ItemValidationErrorDto[] = [];
    const flashSaleConflicts: Array<{
      productId: string;
      variantId?: string | null;
      productName: string;
    }> = [];

    // Validate products
    const variantIds = session.items.map(
      (item) => item.variantId ?? item.productId,
    );
    const products = await this.productRepository.findByIds(variantIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of session.items) {
      const productId = item.variantId ?? item.productId;
      const product = productMap.get(productId);

      if (!product || !isSaleable(product.status) || !product.prices?.retail) {
        errors.push({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.name,
          error: 'unavailable',
          message: this.i18n.t('shop.product.notAvailable'),
        });
      } else {
        // Validate inventory
        const available = product.inventory?.available;

        if (!available) {
          // No inventory data - block order
          errors.push({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
            error: 'out_of_stock',
            message: this.i18n.t('shop.product.outOfStock'),
            availableQuantity: 0,
          });
        } else if (available < item.quantity) {
          // Insufficient inventory
          errors.push({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
            error: 'out_of_stock',
            message: this.i18n.t('shop.product.insufficientInventory'),
            availableQuantity: available,
          });
        }
      }
    }

    // Validate flash sales
    const flashSaleItems = session.items.filter((item) => item.flashSaleId);
    if (flashSaleItems.length > 0) {
      const activeFs = await this.flashSaleRepository.findCurrentlyActive();
      const productIds = flashSaleItems.map((item) => item.productId);
      const fsProductMap = activeFs
        ? await this.flashSaleProductRepository.findActiveForProducts(
            activeFs.id,
            productIds,
          )
        : new Map();

      for (const item of flashSaleItems) {
        const fsProduct = fsProductMap.get(item.productId);

        if (!fsProduct || fsProduct.flashSaleId !== item.flashSaleId) {
          // Flash sale ended — auto-resolvable by falling back to regular price
          flashSaleConflicts.push({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
          });
        } else {
          const remaining = fsProduct.promotionalQuantity - fsProduct.soldCount;

          if (remaining < item.quantity) {
            // Insufficient flash sale stock — auto-resolvable by falling back to regular price
            flashSaleConflicts.push({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.name,
            });
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      flashSaleConflicts,
    };
  }

  /**
   * Clear session items from cart
   */
  private async clearSessionItemsFromCart(
    session: CheckoutSession,
    sessionId: string,
    userId?: string,
  ): Promise<CartItem[]> {
    const cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    if (!cart) return [];

    const sessionItemKeys = new Set(
      session.items.map((item) =>
        this.checkoutUtilsService.getItemKey(item.productId, item.variantId),
      ),
    );

    // Get ordered combo instance IDs
    const orderedComboIds = new Set(
      session.comboInstances?.map((ci) => ci.comboInstanceId) || [],
    );

    const removedGiftItems = cart.items.filter(
      (item) =>
        item.isGift &&
        sessionItemKeys.has(
          this.checkoutUtilsService.getItemKey(item.productId, item.variantId),
        ),
    );

    // Keep items that were NOT ordered
    const remainingItems = cart.items.filter(
      (item) =>
        !sessionItemKeys.has(
          this.checkoutUtilsService.getItemKey(item.productId, item.variantId),
        ),
    );

    // Keep combo instances that were NOT ordered
    const remainingComboInstances = (cart.comboInstances || []).filter(
      (ci) => !orderedComboIds.has(ci.comboInstanceId),
    );

    await this.cartRepository.update(cart.id, {
      items: remainingItems,
      comboInstances: remainingComboInstances,
    });

    return removedGiftItems;
  }

  /**
   * Build PromotionUsageParams from a checkout session for queue serialization
   */
  private buildPromotionUsageParams(
    session: CheckoutSession,
    userId?: string,
    giftItems?: CartItem[],
  ): PromotionUsageParams {
    // Collect product discounts from session-level discountDetails (voucher-applied)
    const sessionProductDiscountIds = new Set(
      (session.discountDetails || [])
        .filter(
          (d) => d.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT,
        )
        .map((d) => d.referenceId),
    );

    // Also collect auto-applied product discounts from item-level discountDetails
    for (const item of session.items) {
      for (const detail of item.discountDetails || []) {
        if (
          detail.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT &&
          detail.referenceId
        ) {
          sessionProductDiscountIds.add(detail.referenceId);
        }
      }
    }

    const productDiscounts = Array.from(sessionProductDiscountIds).map(
      (referenceId) => ({ referenceId }),
    );

    const orderDiscounts = (session.discountDetails || [])
      .filter(
        (d) => d.type === CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
      )
      .map((d) => ({ referenceId: d.referenceId }));

    const giftCountByPromotion = new Map<string, number>();
    if (giftItems && giftItems.length > 0) {
      for (const giftItem of giftItems) {
        if (!giftItem.promotionId) continue;
        const existing = giftCountByPromotion.get(giftItem.promotionId) || 0;
        giftCountByPromotion.set(
          giftItem.promotionId,
          existing + (giftItem.quantity ?? 1),
        );
      }
    }
    const bundleDealGifts = Array.from(giftCountByPromotion.entries()).map(
      ([promotionId, count]) => ({ promotionId, count }),
    );

    const items = session.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    return {
      productDiscounts,
      orderDiscounts,
      bundleDealGifts,
      items,
      userId,
    };
  }
}
