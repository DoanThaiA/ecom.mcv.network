import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PromotionsService } from '../../promotions/promotions.service';
import { ProductRepository } from '../../products/domain/product.repository';
import { CartRepository } from '../cart/domain/cart.repository';
import { Cart, CartItem } from '../cart/domain/cart';
import { BundleDealSubType } from '../../promotions/domain/bundle-deal-sub-type.enum';
import { PromotionStatus } from '../../promotions/domain/promotion-status.enum';
import { getProductImage } from '../../products/domain/product.utils';
import { throwException } from '../../utils/errors/throw-exception';
import {
  CheckBundleDealEligibilityDto,
  AddGiftToCartDto,
  SetBuyXGetYGiftsDto,
} from './dto/shop-promotion.dto';
import {
  BundleDealEligibilityResponseDto,
  EligibleGiftTierDto,
  GiftProductDetailDto,
  GiftProductVariantDto,
  CartGiftInfoDto,
} from './dto/bundle-deal-eligibility-response.dto';
import {
  CheckProductDiscountEligibilityDto,
  ProductDiscountEligibilityResponseDto,
  EligibleProductDto,
  ApplyProductDiscountDto,
} from './dto/product-discount-eligibility.dto';
import {
  CheckPromotionEligibilityDto,
  PromotionEligibilityResponseDto,
} from './dto/check-promotion-eligibility.dto';
import { CartResponseDto } from '../cart/dto/cart.dto';
import { Product } from '../../products/domain/product';
import { CheckoutService } from '../checkout/checkout.service';
import { CartService } from '../cart/cart.service';
import { CdpService } from '../../cdp/cdp.service';
import { ApplyVoucherDto, VoucherResponseDto } from './dto/apply-voucher.dto';
import { UserRepository } from '../../users/domain/user.repository';
import { OrderDiscountSubType } from '../../promotions/domain/order-discount-sub-type.enum';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { OrderDiscountEligibilityResponseDto } from './dto/order-discount-eligibility.dto';
import { PromotionProductRepository } from '../../promotion-products/domain/promotion-product.repository';
import { PromotionUsageRecordRepository } from '../../promotion-usage-records/domain/promotion-usage-record.repository';

@Injectable()
export class ShopPromotionService {
  private readonly logger = new Logger(ShopPromotionService.name);

  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly productRepository: ProductRepository,
    private readonly cartRepository: CartRepository,
    private readonly cartService: CartService,
    private readonly i18n: I18nService,
    private readonly cdpService: CdpService,
    private readonly checkoutService: CheckoutService,
    private readonly userRepository: UserRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly promotionUsageRecordRepository: PromotionUsageRecordRepository,
  ) {}

  /**
   * Check bundle deal eligibility based on cart total
   * Returns eligible tiers and hint for next tier
   */
  async checkBundleDealEligibility(
    dto: CheckBundleDealEligibilityDto,
    sessionId: string,
    userId?: string,
  ): Promise<BundleDealEligibilityResponseDto[]> {
    const { cartTotal } = dto;

    // Get active bundle deals
    const bundleDeals = await this.promotionsService.getActiveBundleDeals();
    const buyToGetGiftPromotions = bundleDeals.filter(
      (p) => p.bundleDealConfig?.subType === BundleDealSubType.BUY_TO_GET_GIFT,
    );
    const buyXGetYPromotions = bundleDeals.filter(
      (p) => p.bundleDealConfig?.subType === BundleDealSubType.BUY_X_GET_Y,
    );

    if (
      buyToGetGiftPromotions.length === 0 &&
      buyXGetYPromotions.length === 0
    ) {
      return [];
    }

    // Get current cart to check for existing gifts
    const cart = await this.findCart(sessionId, userId);

    const results: BundleDealEligibilityResponseDto[] = [];

    // Optimize: Collect all unique product IDs across all promotions and tiers
    const allProductIds = new Set<string>();
    for (const giftPromotion of buyToGetGiftPromotions) {
      const tiers = giftPromotion.bundleDealConfig?.tiers || [];
      for (const tier of tiers) {
        tier.giftProducts.forEach((gp) => allProductIds.add(gp.productId));
      }
    }
    for (const buyXGetYPromotion of buyXGetYPromotions) {
      const requiredProducts =
        buyXGetYPromotion.bundleDealConfig?.requiredProducts || [];
      const giftProducts =
        buyXGetYPromotion.bundleDealConfig?.giftProducts || [];
      requiredProducts.forEach((rp) => allProductIds.add(rp.productId));
      giftProducts.forEach((gp) => allProductIds.add(gp.productId));
    }

    // Bulk load all products at once to avoid N+1 queries
    const allProductsMap = await this.bulkLoadProducts([...allProductIds]);

    // Process BUY_TO_GET_GIFT promotions
    for (const giftPromotion of buyToGetGiftPromotions) {
      const tiers = giftPromotion.bundleDealConfig?.tiers || [];
      if (tiers.length === 0) {
        continue;
      }

      // Sort tiers by minOrderValue ascending
      const sortedTiers = [...tiers].sort(
        (a, b) => a.minOrderValue - b.minOrderValue,
      );

      // Get existing gifts for this specific promotion
      const giftItems =
        cart?.items.filter(
          (item) => item.isGift && item.promotionId === giftPromotion.id,
        ) || [];

      // Build map of claimed tiers for quick lookup
      const claimedTierIds = new Set(
        giftItems.map((item) => item.promotionTierId).filter(Boolean),
      );

      // For backward compatibility, map first gift as currentGift
      let currentGift: CartGiftInfoDto | null = null;
      if (giftItems.length > 0) {
        const firstGift = giftItems[0];
        currentGift = {
          productId: firstGift.productId,
          variantId: firstGift.variantId,
          promotionId: firstGift.promotionId!,
          tierId: firstGift.promotionTierId!,
          productName: firstGift.name,
          productImage: firstGift.image,
          originalPrice: firstGift.originalPrice || 0,
          quantity: firstGift.quantity,
        };
      }
      const currentGifts: CartGiftInfoDto[] = giftItems.map((gift) => ({
        productId: gift.productId,
        variantId: gift.variantId,
        promotionId: gift.promotionId!,
        tierId: gift.promotionTierId!,
        productName: gift.name,
        productImage: gift.image,
        originalPrice: gift.originalPrice || 0,
        quantity: gift.quantity,
      }));

      // Separate tiers into eligible and next tier
      const eligibleTiers: EligibleGiftTierDto[] = [];
      let nextTier: EligibleGiftTierDto | null = null;
      let amountNeededForNextTier: number | null = null;

      // Check if we should process this promotion (must have at least one valid tier)
      let hasValidTiers = false;

      for (const tier of sortedTiers) {
        const tierId = tier.minOrderValue.toString();
        const isClaimed = claimedTierIds.has(tierId);

        // Get gift products with full details from pre-loaded map
        const giftProducts = this.getGiftProductDetailsFromMap(
          tier.giftProducts.map((gp) => gp.productId),
          allProductsMap,
        );

        // Filter out products that are out of stock
        const availableGiftProducts = giftProducts.filter(
          (gp) => gp.availableStock > 0,
        );

        if (availableGiftProducts.length === 0) {
          continue; // Skip tier if all gift products are out of stock
        }

        hasValidTiers = true;

        const tierDto: EligibleGiftTierDto = {
          tierId,
          minOrderValue: tier.minOrderValue,
          giftProducts: availableGiftProducts,
          isClaimed,
        };

        if (cartTotal >= tier.minOrderValue) {
          eligibleTiers.push(tierDto);
        } else if (!nextTier) {
          // First tier not yet reached
          nextTier = tierDto;
          amountNeededForNextTier = tier.minOrderValue - cartTotal;
        }
      }

      if (hasValidTiers) {
        results.push({
          promotionId: giftPromotion.id,
          promotionName: giftPromotion.name,
          subType: giftPromotion.bundleDealConfig!.subType,
          cartTotal,
          amountNeededForNextTier,
          nextTier,
          eligibleTiers,
          currentGift,
          currentGifts,
          notApplicableWithOtherPromotions:
            giftPromotion.bundleDealConfig?.notApplicableWithOtherPromotions ||
            false,
        });
      }
    }

    // Process BUY_X_GET_Y promotions
    // If selectedItems provided, use them directly for required quantity calculation
    // to avoid counting unselected (unticked) cart items
    const nonGiftItemsForCount =
      dto.selectedItems && dto.selectedItems.length > 0
        ? dto.selectedItems
        : cart?.items.filter((item) => !item.isGift) || [];
    for (const promotion of buyXGetYPromotions) {
      const config = promotion.bundleDealConfig;
      if (!config) continue;

      const requiredProducts = config.requiredProducts || [];
      const giftProducts = config.giftProducts || [];
      if (requiredProducts.length === 0 || giftProducts.length === 0) {
        continue;
      }

      const requiredProductIds = new Set(
        requiredProducts.map((rp) => rp.productId),
      );
      const currentRequiredQuantity = nonGiftItemsForCount.reduce(
        (sum, item) => {
          if (!requiredProductIds.has(item.productId)) return sum;
          return sum + item.quantity;
        },
        0,
      );

      const requiredProductDetails = this.getGiftProductDetailsFromMap(
        requiredProducts.map((rp) => rp.productId),
        allProductsMap,
      );

      const giftProductDetails = this.getGiftProductDetailsFromMap(
        giftProducts.map((gp) => gp.productId),
        allProductsMap,
      );
      const availableGiftProducts = giftProductDetails.filter(
        (gp) => gp.availableStock > 0,
      );

      if (availableGiftProducts.length === 0) {
        continue;
      }

      const giftItems =
        cart?.items.filter(
          (item) => item.isGift && item.promotionId === promotion.id,
        ) || [];
      const currentGiftQuantity = giftItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const baseRemainingGiftQuantity = Math.max(
        0,
        (config.giftQuantity ?? 0) - currentGiftQuantity,
      );

      const remainingGlobalGiftQuantity =
        config.maxGiftQuantity != null
          ? Math.max(
              0,
              config.maxGiftQuantity -
                (config.currentGiftCount ?? 0) -
                currentGiftQuantity,
            )
          : null;
      const remainingGiftQuantity =
        remainingGlobalGiftQuantity != null
          ? Math.min(baseRemainingGiftQuantity, remainingGlobalGiftQuantity)
          : baseRemainingGiftQuantity;

      let currentGift: CartGiftInfoDto | null = null;
      if (giftItems.length > 0) {
        const firstGift = giftItems[0];
        currentGift = {
          productId: firstGift.productId,
          variantId: firstGift.variantId,
          promotionId: firstGift.promotionId!,
          tierId: firstGift.promotionTierId || 'buy_x_get_y',
          productName: firstGift.name,
          productImage: firstGift.image,
          originalPrice: firstGift.originalPrice || 0,
          quantity: firstGift.quantity,
        };
      }
      const currentGifts: CartGiftInfoDto[] = giftItems.map((gift) => ({
        productId: gift.productId,
        variantId: gift.variantId,
        promotionId: gift.promotionId!,
        tierId: gift.promotionTierId || 'buy_x_get_y',
        productName: gift.name,
        productImage: gift.image,
        originalPrice: gift.originalPrice || 0,
        quantity: gift.quantity,
      }));

      results.push({
        promotionId: promotion.id,
        promotionName: promotion.name,
        subType: config.subType,
        cartTotal,
        eligibleTiers: [],
        currentGift,
        currentGifts,
        requiredQuantity: config.requiredQuantity,
        currentRequiredQuantity,
        giftQuantity: config.giftQuantity,
        remainingGiftQuantity,
        requiredProducts: requiredProductDetails,
        giftProducts: availableGiftProducts,
        minimumOrderValue: config.minimumOrderValue,
        maxGiftQuantity: config.maxGiftQuantity,
        notApplicableWithOtherPromotions:
          config.notApplicableWithOtherPromotions || false,
      });
    }

    return results;
  }

  /**
   * Apply voucher code
   * Checks CMS Order Discount Promo Code first, then CDP
   */
  async applyVoucher(
    sessionId: string,
    dto: ApplyVoucherDto,
    userId?: string,
  ): Promise<any> {
    const { code, checkoutSessionId } = dto;
    let foundVoucher: VoucherResponseDto | null = null;

    // 1. Check CMS Order Discount Promo Code (type=ORDER_DISCOUNT, subType=PROMO_CODE)
    {
      const orderDiscountPromo =
        await this.promotionsService.findOrderDiscountByPromoCode(code);

      if (
        orderDiscountPromo &&
        orderDiscountPromo.status === PromotionStatus.ACTIVE &&
        orderDiscountPromo.orderDiscountConfig?.subType ===
          OrderDiscountSubType.PROMO_CODE
      ) {
        const config = orderDiscountPromo.orderDiscountConfig;

        // Check total usage limit
        if (config.totalUsageLimit) {
          const currentUsage = config.currentUsageCount ?? 0;
          if (currentUsage >= config.totalUsageLimit) {
            throwException({
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              message: this.i18n.t('shop.promotion.voucherUsageLimitExceeded'),
            });
          }
        }

        // Check single use per customer.
        // Guests are exempt by business decision: per-customer usage can't be
        // tracked without a user identity, and the shop owner chose to let
        // guests apply the code as long as the order itself qualifies.
        // The shop-wide `totalUsageLimit` above still caps everyone.
        if (config.singleUsePerCustomer && userId) {
          const alreadyUsed =
            await this.promotionUsageRecordRepository.existsByPromotionIdAndUserId(
              orderDiscountPromo.id,
              userId,
            );
          if (alreadyUsed) {
            throwException({
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              message: this.i18n.t(
                'shop.promotion.voucherMaxUsagePerCustomerExceeded',
              ),
            });
          }
        }

        // Apply order discount directly via CheckoutService
        let targetCheckoutSessionId = checkoutSessionId;
        if (!targetCheckoutSessionId) {
          const session = await this.checkoutService.upsertSession(
            sessionId,
            { items: [] },
            userId,
          );
          targetCheckoutSessionId = session.id;
        }

        return this.checkoutService.applyOrderDiscountToSession(
          targetCheckoutSessionId!,
          sessionId,
          orderDiscountPromo,
          userId,
        );
      }
    }

    // 3. Check CDP Voucher (using checkVoucher to validate without consuming usage)
    // CDP vouchers require user to be logged in
    if (!foundVoucher) {
      if (!userId) {
        throwException({
          // 422 (not 401): a 401 is caught by the frontend axios
          // refresh-token interceptor, which swallows this message and
          // forces a logout. 422 lets the message reach the user.
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('shop.promotion.voucherLoginRequired'),
        });
      }

      const user = await this.userRepository.findById(userId);
      const cdpCustomerId = user?.cdpCustomerId ?? undefined;

      try {
        const response = await this.cdpService.checkVoucher({
          voucher_code: code,
          merchant_code: 'CCHAT',
          customer_id: cdpCustomerId,
        });

        this.logger.debug('CDP checkVoucher response:', response);

        if (
          response.code === 0 &&
          response.is_valid &&
          response.voucher_detail
        ) {
          const detail = response.voucher_detail;
          // CDP may return discount_type as string 'PERCENTAGE'/'FIXED' or number 0/1
          const discountTypeValue = detail.discount_type as unknown;
          const isPercentage =
            discountTypeValue === 'PERCENTAGE' || discountTypeValue === 1;
          foundVoucher = {
            code: response.promotion_code || code,
            name: detail.voucher_event_name,
            discountAmount: detail.discount_value, // Will be recalculated in applyVoucherToSession
            source: 'CDP',
            id: detail.voucher_id,
            discountType: isPercentage ? 1 : 0,
            discountValue: detail.discount_value,
            minimumOrderValue: detail.minimum_order_value,
            maxDiscountValue: detail.max_discount_value,
            notApplicableWithOtherPromotions:
              detail.not_applicable_with_other_promotions,
          };
        }
      } catch (error) {
        this.logger.error(`Error validating CDP voucher: ${error.message}`);
      }
    }

    if (!foundVoucher) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidVoucher'),
      });
    }

    this.logger.debug('Found voucher to apply:', foundVoucher);

    // Apply to session via CheckoutService
    let targetCheckoutSessionId = checkoutSessionId;
    if (!targetCheckoutSessionId) {
      const session = await this.checkoutService.upsertSession(
        sessionId,
        { items: [] },
        userId,
      );
      targetCheckoutSessionId = session.id;
    }

    return this.checkoutService.applyVoucherToSession(
      targetCheckoutSessionId!,
      sessionId,
      {
        code: foundVoucher!.code,
        name: foundVoucher!.name,
        source: foundVoucher!.source,
        discountAmount: foundVoucher!.discountAmount,
        id: foundVoucher!.id,
        discountType: foundVoucher!.discountType,
        discountValue: foundVoucher!.discountValue,
        minimumOrderValue: foundVoucher!.minimumOrderValue,
        maxDiscountValue: foundVoucher!.maxDiscountValue,
        notApplicableWithOtherPromotions:
          foundVoucher!.notApplicableWithOtherPromotions,
        eligibleProductIds: foundVoucher!.eligibleProductIds,
      },
      userId,
    );
  }

  /**
   * Remove voucher from session
   * Note: Does NOT call CDP to release - voucher hasn't been consumed yet.
   * CDP release happens when an order using the voucher is cancelled.
   */
  async removeVoucher(
    checkoutSessionId: string,
    code: string,
    sessionId: string,
    userId?: string,
  ): Promise<any> {
    return this.checkoutService.removeVoucherFromSession(
      checkoutSessionId,
      sessionId,
      code,
      userId,
    );
  }

  /**
   * Add gift item to cart (BUY_TO_GET_GIFT type only)
   * Validates promotion, tier eligibility, and product availability
   */
  async addGiftToCart(
    sessionId: string,
    dto: AddGiftToCartDto,
    userId?: string,
  ): Promise<CartResponseDto> {
    const { promotionId, tierId, productId, variantId } = dto;

    // Validate promotion exists and is active
    const promotion = await this.promotionsService.findById(promotionId);
    if (!promotion || promotion.status !== PromotionStatus.ACTIVE) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidPromotion'),
      });
    }

    const bundleDealConfig = promotion.bundleDealConfig;
    if (
      !bundleDealConfig ||
      bundleDealConfig.subType !== BundleDealSubType.BUY_TO_GET_GIFT
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidPromotion'),
      });
    }

    if (!tierId) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidTier'),
      });
    }

    // Validate tier exists
    const tier = bundleDealConfig.tiers?.find(
      (t) => t.minOrderValue.toString() === tierId,
    );
    if (!tier) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidTier'),
      });
    }

    // Validate product is in tier's gift products
    const isValidGiftProduct = tier.giftProducts.some(
      (gp) => gp.productId === productId,
    );
    if (!isValidGiftProduct) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidGiftProduct'),
      });
    }

    const { product, selectedVariant } = await this.validateGiftProduct(
      productId,
      variantId,
    );
    const cart = await this.getOrCreateCart(sessionId, userId);

    // Calculate cart total (excluding gift items) and validate eligibility
    const cartTotal = this.calculateCartTotal(cart);
    if (cartTotal < tier.minOrderValue) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.notEligible'),
      });
    }

    // Refresh cart to get latest state before update (reduce race condition risk)
    const latestCart = await this.getLatestCart(sessionId, userId);

    // Conditional clearing based on exclusivity rules
    if (bundleDealConfig.notApplicableWithOtherPromotions) {
      await this.checkoutService.clearVouchersAndProductDiscounts(
        sessionId,
        userId,
      );
    }

    // Remove all existing gifts (only one gift allowed per order across all promotions)
    const updatedItems = latestCart.items.filter((item) => !item.isGift);

    // Create gift cart item
    const giftItem = this.buildGiftCartItem({
      product,
      selectedVariant,
      productId,
      variantId,
      promotionId,
      promotionTierId: tierId,
      quantity: 1,
    });

    updatedItems.push(giftItem);

    // Save cart via update
    await this.cartRepository.update(latestCart.id, { items: updatedItems });

    // Return fresh cart response via cartService
    return this.cartService.getCart(sessionId, userId);
  }

  /**
   * Set BUY_X_GET_Y gifts in batch (replace-all approach)
   * Replaces all current gifts for a BUY_X_GET_Y promotion with the specified selections
   */
  async setBuyXGetYGifts(
    sessionId: string,
    dto: SetBuyXGetYGiftsDto,
    userId?: string,
  ): Promise<CartResponseDto> {
    const { promotionId, gifts } = dto;

    // Validate promotion exists and is active
    const promotion = await this.promotionsService.findById(promotionId);
    if (!promotion || promotion.status !== PromotionStatus.ACTIVE) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidPromotion'),
      });
    }

    const bundleDealConfig = promotion.bundleDealConfig;
    if (
      !bundleDealConfig ||
      bundleDealConfig.subType !== BundleDealSubType.BUY_X_GET_Y
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidPromotion'),
      });
    }

    const configGiftProducts = bundleDealConfig.giftProducts || [];
    const requiredProducts = bundleDealConfig.requiredProducts || [];
    if (
      !bundleDealConfig.requiredQuantity ||
      requiredProducts.length === 0 ||
      !bundleDealConfig.giftQuantity ||
      configGiftProducts.length === 0
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidPromotion'),
      });
    }

    // Calculate total quantity across all gift selections
    const totalGiftQuantity = gifts.reduce((sum, g) => sum + g.quantity, 0);

    // Validate total quantity does not exceed giftQuantity limit
    if (totalGiftQuantity > bundleDealConfig.giftQuantity) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.giftLimitReached'),
      });
    }

    // Validate all gift products are in the promotion's gift product list
    const validGiftProductIds = new Set(
      configGiftProducts.map((gp) => gp.productId),
    );
    for (const gift of gifts) {
      if (!validGiftProductIds.has(gift.productId)) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('shop.promotion.invalidGiftProduct'),
        });
      }
    }

    // Check maxGiftQuantity global limit (optimistic check)
    if (
      bundleDealConfig.maxGiftQuantity != null &&
      (bundleDealConfig.currentGiftCount ?? 0) + totalGiftQuantity >
        bundleDealConfig.maxGiftQuantity
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.giftLimitReached'),
      });
    }

    // Get cart and validate eligibility
    const cart = await this.getOrCreateCart(sessionId, userId);

    // Validate minimum order value
    const cartTotal = this.calculateCartTotal(cart);
    if (
      bundleDealConfig.minimumOrderValue != null &&
      cartTotal < bundleDealConfig.minimumOrderValue
    ) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.notEligible'),
      });
    }

    // Validate required product quantity in cart
    const requiredProductIds = new Set(
      requiredProducts.map((rp) => rp.productId),
    );
    const currentRequiredQuantity = cart.items
      .filter((item) => !item.isGift)
      .reduce((sum, item) => {
        if (!requiredProductIds.has(item.productId)) return sum;
        return sum + item.quantity;
      }, 0);

    if (currentRequiredQuantity < bundleDealConfig.requiredQuantity) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.notEligible'),
      });
    }

    // Validate each gift product exists and is in stock
    const validatedProducts: Array<{
      product: Product;
      selectedVariant: Product | null;
      productId: string;
      variantId?: string;
      quantity: number;
    }> = [];

    for (const gift of gifts) {
      const { product, selectedVariant } = await this.validateGiftProduct(
        gift.productId,
        gift.variantId,
      );
      validatedProducts.push({
        product,
        selectedVariant,
        productId: gift.productId,
        variantId: gift.variantId,
        quantity: gift.quantity,
      });
    }

    // Refresh cart to get latest state before update
    const latestCart = await this.getLatestCart(sessionId, userId);

    // Handle exclusivity rules
    if (bundleDealConfig.notApplicableWithOtherPromotions) {
      await this.checkoutService.clearVouchersAndProductDiscounts(
        sessionId,
        userId,
      );
    }

    // Remove all existing gift items (from any promotion)
    const updatedItems = latestCart.items.filter((item) => !item.isGift);

    // Build and add new gift cart items
    for (const vp of validatedProducts) {
      const giftItem = this.buildGiftCartItem({
        product: vp.product,
        selectedVariant: vp.selectedVariant,
        productId: vp.productId,
        variantId: vp.variantId,
        promotionId,
        promotionTierId: 'buy_x_get_y',
        quantity: vp.quantity,
      });
      updatedItems.push(giftItem);
    }

    // Save cart
    await this.cartRepository.update(latestCart.id, { items: updatedItems });

    return this.cartService.getCart(sessionId, userId);
  }

  /**
   * Remove gift item from cart
   */
  async removeGiftFromCart(
    sessionId: string,
    productId: string,
    variantId?: string,
    userId?: string,
  ): Promise<CartResponseDto> {
    const cart = await this.findCart(sessionId, userId);

    if (!cart) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.cart.notFound'),
      });
    }

    // Find and remove gift item
    const giftIndex = cart.items.findIndex(
      (item) =>
        item.isGift &&
        item.productId === productId &&
        (item.variantId ?? null) === (variantId ?? null),
    );

    if (giftIndex === -1) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.promotion.giftNotFound'),
      });
    }

    // Refresh cart to get latest state before update (reduce race condition risk)
    const latestCart = await this.findCart(sessionId, userId);
    if (!latestCart) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.cart.notFound'),
      });
    }

    // Re-find gift item in latest cart
    const latestGiftIndex = latestCart.items.findIndex(
      (item) =>
        item.isGift &&
        item.productId === productId &&
        (item.variantId ?? null) === (variantId ?? null),
    );

    if (latestGiftIndex === -1) {
      // Gift already removed by another request
      return this.cartService.getCart(sessionId, userId);
    }

    const updatedItems = [...latestCart.items];
    const currentQty = updatedItems[latestGiftIndex].quantity ?? 1;
    if (currentQty > 1) {
      updatedItems[latestGiftIndex].quantity = currentQty - 1;
    } else {
      updatedItems.splice(latestGiftIndex, 1);
    }

    // Update cart
    await this.cartRepository.update(latestCart.id, { items: updatedItems });

    return this.cartService.getCart(sessionId, userId);
  }

  // ==================== Private Helpers ====================

  private async findCart(
    sessionId: string,
    userId?: string,
  ): Promise<Cart | null> {
    return userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);
  }

  /**
   * Calculate cart total excluding gift items
   */
  private calculateCartTotal(cart: Cart): number {
    return cart.items
      .filter((item) => !item.isGift)
      .reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /**
   * Validate gift product exists and has stock, resolve variant if needed
   */
  private async validateGiftProduct(
    productId: string,
    variantId?: string,
  ): Promise<{ product: Product; selectedVariant: Product | null }> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('product.notFound'),
      });
    }

    const hasVariants = (product.variants?.length ?? 0) > 0;
    let selectedVariant: Product | null = null;

    if (hasVariants) {
      if (!variantId) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('shop.promotion.variantRequired'),
        });
      }
      selectedVariant =
        product.variants?.find((v) => v.id === variantId) ?? null;
      if (!selectedVariant) {
        selectedVariant = await this.productRepository.findById(variantId);
        if (!selectedVariant || selectedVariant.parent?.id !== productId) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('shop.promotion.invalidVariant'),
          });
        }
      }
      if ((selectedVariant.inventory?.available ?? 0) <= 0) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('shop.promotion.giftOutOfStock'),
        });
      }
    } else {
      if ((product.inventory?.available ?? 0) <= 0) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('shop.promotion.giftOutOfStock'),
        });
      }
    }

    return { product, selectedVariant };
  }

  /**
   * Get or create cart, throwing if creation fails
   */
  private async getOrCreateCart(
    sessionId: string,
    userId?: string,
  ): Promise<Cart> {
    let cart = await this.findCart(sessionId, userId);
    if (!cart) {
      await this.cartService.getCart(sessionId, userId);
      cart = await this.findCart(sessionId, userId);
    }
    if (!cart) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('shop.cart.createFailed'),
      });
    }
    return cart;
  }

  /**
   * Refresh cart to get latest state before update (reduce race condition risk)
   */
  private async getLatestCart(
    sessionId: string,
    userId?: string,
  ): Promise<Cart> {
    const latestCart = await this.findCart(sessionId, userId);
    if (!latestCart) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('shop.cart.notFound'),
      });
    }
    return latestCart;
  }

  /**
   * Build a gift CartItem from product/variant data
   */
  private buildGiftCartItem(params: {
    product: Product;
    selectedVariant: Product | null;
    productId: string;
    variantId?: string;
    promotionId: string;
    promotionTierId: string;
    quantity: number;
  }): CartItem {
    const {
      product,
      selectedVariant,
      productId,
      variantId,
      promotionId,
      promotionTierId,
      quantity,
    } = params;
    return {
      productId: productId,
      variantId: selectedVariant ? variantId! : null,
      code: selectedVariant?.code || product.code,
      name: selectedVariant?.name || product.name,
      image: selectedVariant?.images?.avatar || product.images?.avatar || null,
      price: 0,
      quantity,
      comboInstanceId: null,
      attributes: selectedVariant?.attributes || product.attributes,
      isGift: true,
      promotionId,
      promotionTierId,
      originalPrice:
        selectedVariant?.prices?.retail ?? product.prices?.retail ?? 0,
    };
  }

  /**
   * Bulk load products and return as map for efficient lookup
   * Optimizes N+1 query problem
   */
  private async bulkLoadProducts(
    productIds: string[],
  ): Promise<Map<string, Product>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map<string, Product>();

    for (const product of products) {
      productMap.set(product.id, product);
    }

    return productMap;
  }

  /**
   * Get gift product details from pre-loaded product map
   * No database queries - uses cached data
   */
  private getGiftProductDetailsFromMap(
    productIds: string[],
    productMap: Map<string, Product>,
  ): GiftProductDetailDto[] {
    const products: GiftProductDetailDto[] = [];

    for (const productId of productIds) {
      const product = productMap.get(productId);
      if (!product) continue;

      const hasVariants = (product.variants?.length ?? 0) > 0;
      const variants: GiftProductVariantDto[] = [];

      if (hasVariants && product.variants) {
        // Use embedded variants
        for (const variant of product.variants) {
          const available = variant.inventory?.available ?? 0;
          variants.push({
            variantId: variant.id,
            name: variant.name,
            attributes: variant.attributes || [],
            availableStock: available,
            isAvailable: available > 0,
          });
        }
      }

      const totalStock = hasVariants
        ? variants.reduce((sum, v) => sum + v.availableStock, 0)
        : (product.inventory?.available ?? 0);

      products.push({
        productId: product.id,
        code: product.code,
        name: product.name,
        image: getProductImage(product) || '',
        price: product.prices?.retail ?? 0,
        availableStock: totalStock,
        hasVariants,
        variants: hasVariants ? variants : undefined,
      });
    }

    return products;
  }

  // ==================== Product Discount Methods ====================

  /**
   * Check product discount eligibility for AUTO_APPLY type
   * Returns eligible promotions based on cart total and products
   */
  async checkProductDiscountEligibility(
    dto: CheckProductDiscountEligibilityDto,
    sessionId: string,
    userId?: string,
  ): Promise<ProductDiscountEligibilityResponseDto[]> {
    const { productIds } = dto;

    // Get active product discounts
    const activePromotions =
      await this.promotionsService.getActiveProductDiscounts();

    if (activePromotions.length === 0) {
      return [];
    }

    // Fetch products to check which ones already have cron-applied discount
    const products = await this.productRepository.findByIds(productIds);
    const cronDiscountedProductIds = new Set(
      products.filter((p) => p.productDiscount?.promotionId).map((p) => p.id),
    );

    const results: ProductDiscountEligibilityResponseDto[] = [];

    for (const promotion of activePromotions) {
      const config = promotion.productDiscountConfig!;

      // Find eligible products from separate collection
      const promoProductMap =
        await this.promotionProductRepository.findActiveForProducts(
          [promotion.id],
          productIds,
        );

      const eligibleProducts: EligibleProductDto[] = [];
      let totalPotentialDiscount = 0;

      for (const [pId, promoProduct] of promoProductMap) {
        if (!cronDiscountedProductIds.has(pId)) {
          const discountAmount = this.calculateProductDiscount(
            promoProduct.originalPrice,
            promoProduct.discountType,
            promoProduct.discountValue,
          );

          eligibleProducts.push({
            productId: promoProduct.productId,
            productName: promoProduct.name,
            productImage: promoProduct.images?.avatar || '',
            productCode: promoProduct.code,
            originalPrice: promoProduct.originalPrice,
            discountedPrice: promoProduct.originalPrice - discountAmount,
            discountAmount,
          });

          totalPotentialDiscount += discountAmount;
        }
      }

      // Skip if no eligible products in cart
      if (eligibleProducts.length === 0) {
        continue;
      }

      results.push({
        promotionId: promotion.id,
        promotionName: promotion.name,
        discountType: config.discountType,
        discountValue: config.discountValue,
        maxDiscountValue: config.maxDiscountValue,
        isEligible: true,
        eligibleProducts,
        potentialDiscount: totalPotentialDiscount,
        endDate: promotion.endTime,
      });
    }

    return results;
  }

  /**
   * Apply product discount or order discount to checkout session
   * Supports both PRODUCT_DISCOUNT and ORDER_DISCOUNT promotion types
   */
  async applyProductDiscount(
    dto: ApplyProductDiscountDto,
    sessionId: string,
    userId?: string,
  ): Promise<any> {
    const { promotionId, checkoutSessionId } = dto;

    // Validate promotion exists and is active
    const promotion = await this.promotionsService.findById(promotionId);
    if (!promotion || promotion.status !== PromotionStatus.ACTIVE) {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidPromotion'),
      });
    }

    // Validate order discount usage limits
    if (promotion.orderDiscountConfig) {
      const config = promotion.orderDiscountConfig;

      // Check total usage limit
      if (config.totalUsageLimit) {
        const currentUsage = config.currentUsageCount ?? 0;
        if (currentUsage >= config.totalUsageLimit) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t('shop.promotion.voucherUsageLimitExceeded'),
          });
        }
      }

      // Check single use per customer.
      // Guests are exempt by business decision — see applyVoucher for the
      // rationale. The shop-wide `totalUsageLimit` above still caps everyone.
      if (config.singleUsePerCustomer && userId) {
        const alreadyUsed =
          await this.promotionUsageRecordRepository.existsByPromotionIdAndUserId(
            promotion.id,
            userId,
          );
        if (alreadyUsed) {
          throwException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            message: this.i18n.t(
              'shop.promotion.voucherMaxUsagePerCustomerExceeded',
            ),
          });
        }
      }
    }

    // Check if it's a product discount or order discount
    if (promotion.productDiscountConfig) {
      // Apply product discount to checkout session
      return this.checkoutService.applyProductDiscountToSession(
        checkoutSessionId,
        sessionId,
        promotion,
        userId,
      );
    } else if (promotion.orderDiscountConfig) {
      // Apply order discount to checkout session
      return this.checkoutService.applyOrderDiscountToSession(
        checkoutSessionId,
        sessionId,
        promotion,
        userId,
      );
    } else {
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('shop.promotion.invalidPromotion'),
      });
    }
  }

  /**
   * Remove product discount from checkout session
   */
  async removeProductDiscount(
    checkoutSessionId: string,
    promotionId: string,
    sessionId: string,
    userId?: string,
  ): Promise<any> {
    return await this.checkoutService.removeProductDiscountFromSession(
      checkoutSessionId,
      sessionId,
      promotionId,
      userId,
    );
  }

  /**
   * Calculate discount amount for a product
   */
  private calculateProductDiscount(
    originalPrice: number,
    discountType: DiscountType,
    discountValue: number,
    maxDiscountValue?: number,
  ): number {
    let discount = 0;

    if (discountType === DiscountType.PERCENTAGE) {
      discount = (originalPrice * discountValue) / 100;
      if (maxDiscountValue && discount > maxDiscountValue) {
        discount = maxDiscountValue;
      }
    } else {
      discount = discountValue;
    }

    // Ensure discount doesn't exceed original price
    return Math.min(discount, originalPrice);
  }

  // ==================== Order Discount Methods ====================

  /**
   * Check order discount eligibility for AUTO_APPLY type
   * Returns eligible promotions based on cart total
   */
  async checkOrderDiscountEligibility(
    cartTotal: number,
    sessionId: string,
    userId?: string,
  ): Promise<OrderDiscountEligibilityResponseDto[]> {
    // Get active order discounts with AUTO_APPLY subtype
    const orderDiscounts =
      await this.promotionsService.getActiveOrderDiscounts();
    const autoApplyPromotions = orderDiscounts.filter(
      (p) => p.orderDiscountConfig?.subType === OrderDiscountSubType.AUTO_APPLY,
    );

    if (autoApplyPromotions.length === 0) {
      return [];
    }

    const results: OrderDiscountEligibilityResponseDto[] = [];

    for (const promotion of autoApplyPromotions) {
      const config = promotion.orderDiscountConfig!;

      // Check total usage limit
      if (config.totalUsageLimit) {
        const currentUsage = config.currentUsageCount ?? 0;
        if (currentUsage >= config.totalUsageLimit) {
          continue;
        }
      }

      // Check single use per customer
      if (config.singleUsePerCustomer && userId) {
        const alreadyUsed =
          await this.promotionUsageRecordRepository.existsByPromotionIdAndUserId(
            promotion.id,
            userId,
          );
        if (alreadyUsed) {
          continue;
        }
      }

      const isEligible = cartTotal >= config.minimumOrderValue;
      const amountNeeded = isEligible
        ? undefined
        : config.minimumOrderValue - cartTotal;

      // Calculate potential discount
      let potentialDiscount = 0;
      if (isEligible) {
        if (config.discountType === DiscountType.PERCENTAGE) {
          potentialDiscount = (cartTotal * config.discountValue) / 100;
          if (
            config.maxDiscountValue &&
            potentialDiscount > config.maxDiscountValue
          ) {
            potentialDiscount = config.maxDiscountValue;
          }
        } else {
          potentialDiscount = config.discountValue;
        }
        // Ensure discount doesn't exceed cart total
        potentialDiscount = Math.min(potentialDiscount, cartTotal);
      }

      results.push({
        promotionId: promotion.id,
        promotionName: promotion.name,
        subType: config.subType,
        discountType: config.discountType,
        discountValue: config.discountValue,
        maxDiscountValue: config.maxDiscountValue,
        minimumOrderValue: config.minimumOrderValue,
        isEligible,
        potentialDiscount,
        amountNeededForEligibility: amountNeeded,
        notApplicableWithOtherPromotions:
          config.notApplicableWithOtherPromotions,
        endDate: promotion.endTime,
      });
    }

    return results;
  }

  /**
   * Check all promotion eligibility in a single call (unified API)
   * Returns eligibility for bundle deals, product discounts, and order discounts
   * Easily extensible for new promotion types in the future
   */
  async checkPromotionEligibility(
    dto: CheckPromotionEligibilityDto,
    sessionId: string,
    userId?: string,
  ): Promise<PromotionEligibilityResponseDto> {
    const { cartTotal, productIds } = dto;

    // Run all eligibility checks in parallel for better performance
    const [bundleDeals, productDiscounts, orderDiscounts] = await Promise.all([
      // Bundle deal eligibility
      this.checkBundleDealEligibility({ cartTotal }, sessionId, userId),
      // Product discount eligibility (only if productIds provided)
      productIds && productIds.length > 0
        ? this.checkProductDiscountEligibility(
            { cartTotal, productIds },
            sessionId,
            userId,
          )
        : Promise.resolve([]),
      // Order discount eligibility (AUTO_APPLY type)
      this.checkOrderDiscountEligibility(cartTotal, sessionId, userId),
    ]);

    return {
      bundleDeals,
      productDiscounts,
      orderDiscounts,
    };
  }
}
