import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { v4 as uuidv4 } from 'uuid';
import { CheckoutSessionRepository } from '../domain/checkout-session.repository';
import {
  CheckoutSession,
  CheckoutSessionItem,
  CheckoutSessionComboInstance,
  CheckoutSessionDiscountDetail,
  CheckoutSessionDiscountDetailType,
} from '../domain/checkout-session';
import { CheckoutSessionStatus } from '../domain/checkout-session-status.enum';
import {
  UpsertCheckoutSessionDto,
  CheckoutSessionItemDto,
  CheckoutSessionComboDto,
} from '../dto/upsert-checkout-session.dto';
import {
  CheckoutSessionResponseDto,
  toCheckoutSessionResponse,
} from '../dto/checkout-session-response.dto';
import { ProductRepository } from '../../../products/domain/product.repository';
import { CartRepository } from '../../cart/domain/cart.repository';
import { CartItem } from '../../cart/domain/cart';
import { FlashSaleRepository } from '../../../flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../../../flash-sale-products/domain/flash-sale-product.repository';
import { ComboRepository } from '../../../combos/domain/combo.repository';
import { ComboStatus } from '../../../combos/domain/combo-status.enum';
import { DiscountType } from '../../../combos/domain/discount-type.enum';
import { GiftValidationService } from '../../cart/gift-validation.service';
import { PromotionRepository } from '../../../promotions/domain/promotion.repository';
import { OrderService } from '../../order/order.service';
import { CheckoutUtilsService } from './checkout-utils.service';
import { CheckoutShippingService } from './checkout-shipping.service';
import { CheckoutVoucherService } from './checkout-voucher.service';
import { CheckoutProductDiscountService } from './checkout-product-discount.service';
import { throwException } from '../../../utils/errors/throw-exception';
import { isSaleable } from '../../../products/domain/product-status.enum';
import { getProductImage } from '../../../products/domain/product.utils';
import { calculateRoundedDiscountAmount } from '../../../utils/helpers/round-price';

// Session TTL: 24 hours
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Handles checkout session creation, update, and item/combo building
 */
@Injectable()
export class CheckoutSessionBuilderService {
  private readonly logger = new Logger(CheckoutSessionBuilderService.name);

  constructor(
    private readonly checkoutSessionRepository: CheckoutSessionRepository,
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    private readonly comboRepository: ComboRepository,
    private readonly giftValidationService: GiftValidationService,
    private readonly promotionRepository: PromotionRepository,
    private readonly orderService: OrderService,
    private readonly checkoutUtilsService: CheckoutUtilsService,
    private readonly checkoutShippingService: CheckoutShippingService,
    private readonly checkoutVoucherService: CheckoutVoucherService,
    private readonly checkoutProductDiscountService: CheckoutProductDiscountService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Update an existing checkout session
   */
  async updateExistingSession(
    dto: UpsertCheckoutSessionDto,
    sessionId: string,
    userId: string | undefined,
    affiliateCode: string | null | undefined,
    hasItems: boolean,
    hasCombos: boolean,
    itemsExplicitlyProvided: boolean = false,
  ): Promise<CheckoutSessionResponseDto> {
    const existingSession = await this.validateAndPrepareExistingSession(
      dto.id!,
      sessionId,
      userId,
    );

    // If items explicitly provided as empty, clear the session cart entirely
    if (itemsExplicitlyProvided && !hasItems && !hasCombos) {
      return this.clearSessionItems(existingSession, dto, affiliateCode);
    }

    // If no items/combos provided, keep existing items (update only customer/shipping)
    let items = existingSession.items || [];
    let comboInstances = existingSession.comboInstances || [];
    let discountDetails = existingSession.discountDetails || [];

    this.logger.debug(
      `Updating session ${existingSession.id}: hasItems=${hasItems}, hasCombos=${hasCombos}, existingItems=${items.length}`,
    );

    // Check if cart has gift items (for exclusivity rule: Gift OR Voucher/CTKM)
    const cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);
    const hasGiftInCart =
      cart?.items?.some((item: CartItem) => item.isGift) ?? false;

    if (hasItems || hasCombos) {
      const result = await this.buildSessionData(
        dto.items || [],
        dto.combos || [],
        sessionId,
        userId,
      );
      items = result.items;
      comboInstances = result.comboInstances;
      discountDetails = await this.resolveDiscountDetails(
        hasGiftInCart,
        cart,
        result.discountDetails,
        existingSession.discountDetails || [],
      );
      this.logger.debug(`Rebuilt items: ${items.length}`);
    }

    if (!items || items.length === 0) {
      this.logger.error(
        `Session ${existingSession.id} has no items after update attempt`,
      );
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.noItemsSelected'),
      });
    }

    const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const appliedVouchers = await this.resolveVouchersForUpdate(
      hasGiftInCart,
      cart,
      existingSession.appliedVouchers || [],
      itemsSubtotal,
      items,
    );

    discountDetails =
      await this.checkoutProductDiscountService.recalculateProductDiscounts(
        discountDetails,
        items,
        itemsSubtotal,
      );

    const { subtotal, discount, totalDiscount } =
      this.checkoutUtilsService.calculateTotals(
        items,
        discountDetails,
        appliedVouchers,
      );

    const customer = this.checkoutUtilsService.buildCustomerInfo(
      dto,
      existingSession.customer ?? null,
    );
    const shippingAddress = this.checkoutUtilsService.buildShippingAddress(
      dto,
      existingSession.shippingAddress ?? null,
    );
    const { shippingFee, shipping } =
      await this.checkoutShippingService.calculateShippingForSession(
        shippingAddress,
        items,
        existingSession.shipping ?? null,
      );

    // Clear shipping promotion when items change, then re-apply freeship automatically
    const itemsChanged = !!dto.items || !!dto.combos;
    let shippingDiscount = itemsChanged
      ? 0
      : (existingSession.shippingDiscount ?? 0);
    let shippingPromotion = itemsChanged
      ? null
      : (existingSession.shippingPromotion ?? null);
    if (itemsChanged) {
      const autoFreeship = await this.checkoutShippingService.autoApplyFreeship(
        subtotal,
        shippingFee,
      );
      shippingDiscount = autoFreeship.shippingDiscount;
      shippingPromotion = autoFreeship.shippingPromotion;
    }

    const total = subtotal + shippingFee - shippingDiscount - discount;
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const shouldResetToActive =
      existingSession.status === CheckoutSessionStatus.PENDING_PAYMENT;

    const updated = await this.checkoutSessionRepository.update(
      existingSession.id,
      {
        customer,
        shippingAddress,
        items,
        comboInstances:
          comboInstances && comboInstances.length > 0 ? comboInstances : null,
        appliedVouchers:
          appliedVouchers && appliedVouchers.length > 0
            ? appliedVouchers
            : null,
        subtotal,
        shippingFee,
        discount,
        discountDetails: discountDetails.length > 0 ? discountDetails : null,
        totalDiscount,
        shippingDiscount,
        shippingPromotion,
        shipping,
        total,
        paymentMethod: dto.paymentMethod ?? existingSession.paymentMethod,
        note: dto.note ?? existingSession.note,
        affiliateCode:
          affiliateCode !== undefined
            ? affiliateCode
            : existingSession.affiliateCode,
        expiresAt,
        ...(shouldResetToActive && {
          status: CheckoutSessionStatus.ACTIVE,
          orderId: null,
          orderNumber: null,
        }),
      },
    );

    this.logger.log(
      `Checkout session updated: ${existingSession.sessionNumber}`,
    );
    return toCheckoutSessionResponse(updated!);
  }

  /**
   * Create a new checkout session
   */
  async createNewSession(
    dto: UpsertCheckoutSessionDto,
    sessionId: string,
    userId: string | undefined,
    affiliateCode: string | null | undefined,
    hasItems: boolean,
    hasCombos: boolean,
  ): Promise<CheckoutSessionResponseDto> {
    if (!hasItems && !hasCombos) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.noItemsSelected'),
      });
    }

    const { items, comboInstances, discountDetails } =
      await this.buildSessionData(
        dto.items || [],
        dto.combos || [],
        sessionId,
        userId,
      );

    if (items.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.noItemsSelected'),
      });
    }

    const { subtotal, discount, totalDiscount } =
      this.checkoutUtilsService.calculateTotals(items, discountDetails);

    const customer = this.checkoutUtilsService.buildCustomerInfo(dto);
    const shippingAddress = this.checkoutUtilsService.buildShippingAddress(dto);
    const { shippingFee, shipping } =
      await this.checkoutShippingService.calculateShippingForSession(
        shippingAddress,
        items,
      );

    const {
      shippingDiscount: autoShippingDiscount,
      shippingPromotion: autoShippingPromotion,
    } = await this.checkoutShippingService.autoApplyFreeship(
      subtotal,
      shippingFee,
    );
    const total = subtotal + shippingFee - autoShippingDiscount - discount;
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const sessionNumber =
      await this.checkoutSessionRepository.generateSessionNumber();

    const session = await this.checkoutSessionRepository.create({
      sessionNumber,
      userId: userId ?? null,
      sessionId,
      customer,
      shippingAddress,
      items,
      comboInstances: comboInstances.length > 0 ? comboInstances : null,
      subtotal,
      shippingFee,
      discount,
      discountDetails: discountDetails.length > 0 ? discountDetails : null,
      totalDiscount,
      shippingDiscount: autoShippingDiscount,
      shippingPromotion: autoShippingPromotion,
      shipping,
      total,
      paymentMethod: dto.paymentMethod ?? null,
      note: dto.note ?? null,
      affiliateCode: affiliateCode ?? null,
      status: CheckoutSessionStatus.ACTIVE,
      expiresAt,
      orderId: null,
      orderNumber: null,
    });

    this.logger.log(`Checkout session created: ${session.sessionNumber}`);
    return toCheckoutSessionResponse(session);
  }

  /**
   * Validate existing session ownership and status, cancel pending orders if needed
   */
  private async validateAndPrepareExistingSession(
    sessionDbId: string,
    sessionId: string,
    userId?: string,
  ): Promise<CheckoutSession> {
    const existingSession =
      await this.checkoutSessionRepository.findById(sessionDbId);

    if (!existingSession) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.checkout.sessionNotFound'),
      });
    }

    await this.checkoutUtilsService.validateOwnership(
      existingSession,
      sessionId,
      userId,
    );

    if (
      existingSession.status !== CheckoutSessionStatus.ACTIVE &&
      existingSession.status !== CheckoutSessionStatus.PENDING_PAYMENT
    ) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.checkout.sessionNotActive'),
      });
    }

    if (
      existingSession.status === CheckoutSessionStatus.PENDING_PAYMENT &&
      existingSession.orderId
    ) {
      this.logger.log(
        `Session ${existingSession.sessionNumber} has pending order, canceling order ${existingSession.orderNumber} before update`,
      );
      await this.orderService.cleanupAbandonedOrder(
        existingSession.orderId,
        'Cart modified during pending payment',
      );
    }

    return existingSession;
  }

  /**
   * Resolve discount details based on gift exclusivity rules
   */
  private async resolveDiscountDetails(
    hasGiftInCart: boolean,
    cart: { items: CartItem[] } | null,
    newDiscountDetails: CheckoutSessionDiscountDetail[],
    existingDiscountDetails: CheckoutSessionDiscountDetail[],
  ): Promise<CheckoutSessionDiscountDetail[]> {
    if (!hasGiftInCart) {
      const existingPromotionDiscounts = existingDiscountDetails.filter(
        (d) =>
          d.type === CheckoutSessionDiscountDetailType.COUPON ||
          d.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT ||
          d.type === CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
      );
      return [...newDiscountDetails, ...existingPromotionDiscounts];
    }

    const shouldClear = await this.isGiftPromotionExclusive(cart);
    if (shouldClear) {
      this.logger.debug(
        'Cart has exclusive gift - not preserving product discounts',
      );
      return newDiscountDetails;
    }

    this.logger.debug('Cart has stackable gift - preserving product discounts');
    const existingPromotionDiscounts = existingDiscountDetails.filter(
      (d) =>
        d.type === CheckoutSessionDiscountDetailType.COUPON ||
        d.type === CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT ||
        d.type === CheckoutSessionDiscountDetailType.ORDER_DISCOUNT,
    );
    return [...newDiscountDetails, ...existingPromotionDiscounts];
  }

  /**
   * Resolve vouchers for an existing session update, considering gift exclusivity
   */
  private async resolveVouchersForUpdate(
    hasGiftInCart: boolean,
    cart: { items: CartItem[] } | null,
    existingVouchers: import('../domain/checkout-session').CheckoutSessionVoucher[],
    itemsSubtotal: number,
    items: CheckoutSessionItem[],
  ): Promise<import('../domain/checkout-session').CheckoutSessionVoucher[]> {
    if (!hasGiftInCart) {
      return this.checkoutVoucherService.recalculateVoucherDiscounts(
        existingVouchers,
        itemsSubtotal,
        items,
      );
    }

    const shouldClear = await this.isGiftPromotionExclusive(cart);
    if (shouldClear) {
      return [];
    }

    return this.checkoutVoucherService.recalculateVoucherDiscounts(
      existingVouchers,
      itemsSubtotal,
      items,
    );
  }

  /**
   * Check if the gift item's promotion is exclusive (not stackable with other promotions)
   */
  private async isGiftPromotionExclusive(
    cart: { items: CartItem[] } | null,
  ): Promise<boolean> {
    const giftItem = cart?.items.find((item) => item.isGift);
    if (!giftItem?.promotionId) {
      return true; // No promotion ID - clear for safety
    }

    const giftPromotion = await this.promotionRepository.findById(
      giftItem.promotionId,
    );
    return !!giftPromotion?.bundleDealConfig?.notApplicableWithOtherPromotions;
  }

  /**
   * Clear all items from a session, resetting totals to zero
   */
  private async clearSessionItems(
    existingSession: CheckoutSession,
    dto: UpsertCheckoutSessionDto,
    affiliateCode: string | null | undefined,
  ): Promise<CheckoutSessionResponseDto> {
    this.logger.log(
      `Clearing all items from session ${existingSession.sessionNumber}`,
    );

    const customer = this.checkoutUtilsService.buildCustomerInfo(
      dto,
      existingSession.customer ?? null,
    );
    const shippingAddress = this.checkoutUtilsService.buildShippingAddress(
      dto,
      existingSession.shippingAddress ?? null,
    );
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const shouldResetToActive =
      existingSession.status === CheckoutSessionStatus.PENDING_PAYMENT;

    const updated = await this.checkoutSessionRepository.update(
      existingSession.id,
      {
        customer,
        shippingAddress,
        items: [],
        comboInstances: null,
        appliedVouchers: null,
        subtotal: 0,
        shippingFee: 0,
        discount: 0,
        discountDetails: null,
        totalDiscount: 0,
        shippingDiscount: 0,
        shippingPromotion: null,
        shipping: null,
        total: 0,
        paymentMethod: dto.paymentMethod ?? existingSession.paymentMethod,
        note: dto.note ?? existingSession.note,
        affiliateCode:
          affiliateCode !== undefined
            ? affiliateCode
            : existingSession.affiliateCode,
        expiresAt,
        ...(shouldResetToActive && {
          status: CheckoutSessionStatus.ACTIVE,
          orderId: null,
          orderNumber: null,
        }),
      },
    );

    this.logger.log(
      `Checkout session cleared: ${existingSession.sessionNumber}`,
    );
    return toCheckoutSessionResponse(updated!);
  }

  /**
   * Build checkout session data from items and combos DTOs
   */
  private async buildSessionData(
    itemDtos: CheckoutSessionItemDto[],
    comboDtos: CheckoutSessionComboDto[],
    sessionId: string,
    userId?: string,
  ): Promise<{
    items: CheckoutSessionItem[];
    comboInstances: CheckoutSessionComboInstance[];
    discountDetails: CheckoutSessionDiscountDetail[];
  }> {
    // IMPORTANT: Validate and remove ineligible gifts from cart BEFORE building session
    // Pass selected product IDs so validation only counts items user selected for checkout
    const selectedProductIds = itemDtos.map((item) => item.productId);
    await this.giftValidationService.validateAndRemoveIneligibleGifts(
      sessionId,
      userId,
      selectedProductIds,
    );

    // Build standalone items
    let standaloneItems: CheckoutSessionItem[] = [];
    let standaloneDiscountDetails: CheckoutSessionDiscountDetail[] = [];

    if (itemDtos.length > 0) {
      const result = await this.buildSessionItems(itemDtos);
      standaloneItems = result.items;
      standaloneDiscountDetails = result.discountDetails;
    }

    // Build combo items
    let comboItems: CheckoutSessionItem[] = [];
    let comboInstances: CheckoutSessionComboInstance[] = [];
    let comboDiscountDetails: CheckoutSessionDiscountDetail[] = [];

    if (comboDtos.length > 0) {
      const result = await this.buildComboItems(comboDtos);
      comboItems = result.items;
      comboInstances = result.comboInstances;
      comboDiscountDetails = result.discountDetails;
    }

    // Fetch cart to get gift items
    const cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    const giftItems: CheckoutSessionItem[] = [];
    if (cart) {
      // Get all gift items from cart
      const cartGiftItems = cart.items.filter((item) => item.isGift);

      // Gift items should always be included, don't check for duplicates
      // (a product can be both purchased and received as gift)
      for (const giftItem of cartGiftItems) {
        giftItems.push({
          productId: giftItem.productId,
          variantId: giftItem.variantId,
          code: giftItem.code,
          name: giftItem.name,
          image: giftItem.image,
          originalPrice: giftItem.originalPrice || 0,
          effectivePrice: 0, // Gifts are free
          quantity: giftItem.quantity,
          subtotal: 0, // No cost
          discount: 0,
          comboInstanceId: null,
          comboId: null,
          comboName: null,
          flashSaleId: null,
          flashSaleName: null,
          isAvailable: true, // Assume gift is available (validated when added)
          unavailableReason: null,
          discountDetails: null,
          isGift: true, // Mark as gift item
          giftPromotionId: giftItem.promotionId ?? null,
        });
      }
    }

    return {
      items: [...standaloneItems, ...comboItems, ...giftItems],
      comboInstances,
      discountDetails: [...standaloneDiscountDetails, ...comboDiscountDetails],
    };
  }

  /**
   * Build checkout session items from DTOs
   */
  private async buildSessionItems(dtoItems: CheckoutSessionItemDto[]): Promise<{
    items: CheckoutSessionItem[];
    discountDetails: CheckoutSessionDiscountDetail[];
  }> {
    const productIds = dtoItems.map((item) => item.variantId ?? item.productId);
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Build lookup set: include both variant IDs and parent IDs
    const lookupIds = new Set<string>(productIds);
    const variantToParentMap = new Map<string, string>();

    for (const product of products) {
      if (product.parent?.id) {
        lookupIds.add(product.parent.id);
        variantToParentMap.set(product.id, product.parent.id);
      }
    }

    // Get flash sale info (including parent products for variants)
    const activeFlashSale =
      await this.flashSaleRepository.findCurrentlyActive();
    const flashSaleProductMap = activeFlashSale
      ? await this.flashSaleProductRepository.findActiveForProducts(
          activeFlashSale.id,
          [...lookupIds],
        )
      : new Map();

    // Fetch parent products for product discount lookup
    const parentIds = [...variantToParentMap.values()].filter(
      (pid) => !productMap.has(pid),
    );
    const parentProducts =
      parentIds.length > 0
        ? await this.productRepository.findByIds(parentIds)
        : [];
    const parentProductMap = new Map(parentProducts.map((p) => [p.id, p]));

    const items: CheckoutSessionItem[] = [];
    const discountDetails: CheckoutSessionDiscountDetail[] = [];

    for (const dtoItem of dtoItems) {
      const productId = dtoItem.variantId ?? dtoItem.productId;
      const product = productMap.get(productId);

      // Check availability: must be saleable status and have a retail price set
      const isAvailable = !!(
        product &&
        isSaleable(product.status) &&
        product.prices?.retail
      );

      if (!product) {
        items.push({
          productId: dtoItem.productId,
          variantId: dtoItem.variantId ?? null,
          code: 'UNKNOWN',
          name: 'Product not found',
          image: null,
          originalPrice: 0,
          effectivePrice: 0,
          quantity: dtoItem.quantity,
          subtotal: 0,
          discount: 0,
          comboInstanceId: null,
          comboId: null,
          comboName: null,
          flashSaleId: null,
          flashSaleName: null,
          isAvailable: false,
          unavailableReason: this.i18n.t('shop.product.notFound'),
          discountDetails: null,
        });
        continue;
      }

      const originalPrice = product.prices.retail;
      let effectivePrice = originalPrice;
      let flashSaleId: string | null = null;
      let flashSaleName: string | null = null;
      let unavailableReason: string | null = null;

      if (!isAvailable) {
        unavailableReason = this.i18n.t('shop.product.notAvailable');
      }

      // Check flash sale for the product itself, or its parent if it's a variant
      const fsProduct =
        flashSaleProductMap.get(productId) ??
        flashSaleProductMap.get(variantToParentMap.get(productId) ?? '');

      // Build item-level discount details
      let itemDiscountDetails:
        | import('../domain/checkout-session').CheckoutSessionItemDiscountDetail[]
        | null = null;
      let itemDiscount = 0;
      let productDiscountId: string | null = null;
      let productDiscountName: string | null = null;

      // Step 1: Check product discount (CTKM auto-apply, no min order) from synced data
      // Check variant first, then fall back to parent product
      const parentId = variantToParentMap.get(productId);
      const parentProduct = parentId
        ? parentProductMap.get(parentId)
        : undefined;
      const pdInfo = product.productDiscount?.promotionId
        ? product.productDiscount
        : parentProduct?.productDiscount;
      if (pdInfo?.promotionId && pdInfo.discountedPrice != null) {
        const pdDiscountPerUnit = pdInfo.discountAmount;
        effectivePrice = originalPrice - pdDiscountPerUnit;
        productDiscountId = pdInfo.promotionId;
        productDiscountName = pdInfo.promotionName;
        itemDiscount += pdDiscountPerUnit * dtoItem.quantity;

        itemDiscountDetails = [
          {
            type: CheckoutSessionDiscountDetailType.PRODUCT_DISCOUNT,
            referenceId: pdInfo.promotionId,
            referenceName: pdInfo.promotionName ?? '',
            discountType: pdInfo.discountType ?? DiscountType.FIXED,
            discountValue: pdInfo.discountValue,
            discountAmountPerUnit: pdDiscountPerUnit,
            discountAmount: pdDiscountPerUnit * dtoItem.quantity,
          },
        ];
      }

      // Step 2: Check flash sale - stacks on top of product discount
      if (fsProduct && fsProduct.remainingStock > 0) {
        const fsDiscountPerUnit = calculateRoundedDiscountAmount(
          effectivePrice,
          fsProduct.discountType,
          fsProduct.discountValue,
        );
        effectivePrice = effectivePrice - fsDiscountPerUnit;
        flashSaleId = fsProduct.flashSaleId;
        flashSaleName = fsProduct.flashSaleName;
        itemDiscount += fsDiscountPerUnit * dtoItem.quantity;

        const fsDetail: import('../domain/checkout-session').CheckoutSessionItemDiscountDetail =
          {
            type: CheckoutSessionDiscountDetailType.FLASH_SALE,
            referenceId: fsProduct.flashSaleId,
            referenceName: fsProduct.flashSaleName,
            discountType: fsProduct.discountType,
            discountValue: fsProduct.discountValue,
            discountAmountPerUnit: fsDiscountPerUnit,
            discountAmount: fsDiscountPerUnit * dtoItem.quantity,
          };

        if (itemDiscountDetails) {
          itemDiscountDetails.push(fsDetail);
        } else {
          itemDiscountDetails = [fsDetail];
        }
      }

      items.push({
        productId: dtoItem.productId,
        variantId: dtoItem.variantId ?? null,
        code: product.code,
        name: product.name,
        image: getProductImage(product),
        originalPrice,
        effectivePrice,
        quantity: dtoItem.quantity,
        subtotal: effectivePrice * dtoItem.quantity,
        discount: itemDiscount,
        comboInstanceId: null,
        comboId: null,
        comboName: null,
        flashSaleId,
        flashSaleName,
        productDiscountId,
        productDiscountName,
        isAvailable,
        unavailableReason,
        discountDetails: itemDiscountDetails,
      });
    }

    return { items, discountDetails };
  }

  /**
   * Build checkout session items from combo DTOs
   */
  private async buildComboItems(comboDtos: CheckoutSessionComboDto[]): Promise<{
    items: CheckoutSessionItem[];
    comboInstances: CheckoutSessionComboInstance[];
    discountDetails: CheckoutSessionDiscountDetail[];
  }> {
    const items: CheckoutSessionItem[] = [];
    const comboInstances: CheckoutSessionComboInstance[] = [];
    const discountDetails: CheckoutSessionDiscountDetail[] = [];

    for (const comboDto of comboDtos) {
      // Fetch and validate combo
      const combo = await this.comboRepository.findById(comboDto.comboId);

      if (!combo) {
        throwException({
          status: HttpStatus.NOT_FOUND,
          message: this.i18n.t('combo.notFound'),
        });
      }

      if (combo.status !== ComboStatus.ACTIVE) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('combo.notActive'),
        });
      }

      // Check validity period
      const now = new Date();
      if (combo.validFrom && new Date(combo.validFrom) > now) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('combo.notYetValid'),
        });
      }
      if (combo.validTo && new Date(combo.validTo) < now) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('combo.expired'),
        });
      }

      // Validate all required combo products are included in the selection
      for (const comboItem of combo.items) {
        const selectedProduct = comboDto.items.find(
          (i) => i.productId === comboItem.productId,
        );

        if (!selectedProduct) {
          throwException({
            status: HttpStatus.BAD_REQUEST,
            message: this.i18n.t('combo.productRequired'),
          });
        }
      }

      // Use provided comboInstanceId from cart, or generate new one
      const comboInstanceId = comboDto.comboInstanceId || uuidv4();

      // Build items for this combo
      for (const comboItem of combo.items) {
        const selectedVariant = comboDto.items.find(
          (i) => i.productId === comboItem.productId,
        )!;

        // Get product details
        const productIdToFetch =
          selectedVariant.variantId || comboItem.productId;
        const product = await this.productRepository.findById(productIdToFetch);

        if (!product) {
          throwException({
            status: HttpStatus.NOT_FOUND,
            message: this.i18n.t('combo.variantNotFound'),
          });
        }

        const isAvailable = isSaleable(product.status);

        const originalPrice = product.prices.retail;
        const effectivePrice = originalPrice; // Combo items use original price, discount is applied to total

        items.push({
          productId: comboItem.productId,
          variantId: selectedVariant.variantId ?? null,
          code: product.code,
          name: product.name,
          image: getProductImage(product),
          originalPrice,
          effectivePrice,
          quantity: comboItem.quantity,
          subtotal: effectivePrice * comboItem.quantity,
          discount: 0, // Combo items don't have individual discounts; combo discount is at order level
          comboInstanceId,
          comboId: combo.id,
          comboName: combo.name,
          flashSaleId: null, // Combo items don't get flash sale pricing
          flashSaleName: null,
          isAvailable,
          unavailableReason: isAvailable
            ? null
            : this.i18n.t('shop.product.notAvailable'),
          discountDetails: null, // Combo discount is at combo level, not item level
        });
      }

      // Calculate combo discount (rounded for consistency)
      const discountAmount = calculateRoundedDiscountAmount(
        combo.originalPrice,
        combo.discountType,
        combo.discountValue,
      );

      // Create combo instance
      comboInstances.push({
        comboInstanceId,
        comboId: combo.id,
        comboName: combo.name,
        discountType: combo.discountType,
        discountValue: combo.discountValue,
        originalPrice: combo.originalPrice,
        discountAmount,
      });

      // Create discount detail
      discountDetails.push({
        type: CheckoutSessionDiscountDetailType.COMBO,
        referenceId: combo.id,
        referenceName: combo.name,
        instanceId: comboInstanceId,
        discountType: combo.discountType,
        discountValue: combo.discountValue,
        discountAmount,
      });
    }

    return { items, comboInstances, discountDetails };
  }
}
