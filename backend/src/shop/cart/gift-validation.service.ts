import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PromotionsService } from '../../promotions/promotions.service';
import { CartRepository } from '../cart/domain/cart.repository';
import { Cart } from '../cart/domain/cart';
import { BundleDealSubType } from '../../promotions/domain/bundle-deal-sub-type.enum';
import { PromotionStatus } from '../../promotions/domain/promotion-status.enum';
import { SocketService } from '../../socket/socket.service';

/**
 * Gift validation service - handles gift eligibility validation
 * Separated to avoid circular dependencies between Cart/Checkout and ShopPromotion
 */
@Injectable()
export class GiftValidationService {
  private readonly logger = new Logger(GiftValidationService.name);

  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly cartRepository: CartRepository,
    private readonly i18n: I18nService,
    private readonly socketService: SocketService,
  ) {}

  /**
   * Auto-remove gift if cart total drops below tier threshold
   * Called after cart item quantity change or removal
   * Returns true if gift was removed
   * @param selectedProductIds - Optional: only count items matching these productIds for total (for checkout with partial selection)
   */
  async validateAndRemoveIneligibleGifts(
    sessionId: string,
    userId?: string,
    selectedProductIds?: string[],
  ): Promise<boolean> {
    const cart = await this.findCart(sessionId, userId);
    if (!cart) return false;

    // Find all gift items
    const giftItems = cart.items.filter((item) => item.isGift);
    if (giftItems.length === 0) return false;

    let anyRemoved = false;
    const updatedItems = [...cart.items];

    // Optimize: Cache promotion lookups to avoid duplicate queries
    const promotionCache = new Map<string, any>();

    // Pre-calculate cart total once (excluding gifts) - O(n) instead of O(n×m)
    // If selectedProductIds provided, only count those items
    const eligibleItems = updatedItems.filter((item) => {
      if (item.isGift) return false;
      if (!selectedProductIds) return true;
      return selectedProductIds.includes(item.productId);
    });

    const cartTotal = eligibleItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const requiredCountCache = new Map<string, number>();
    const requiredProductIdCache = new Map<string, Set<string>>();
    const giftQuantityByPromotion = new Map<string, number>();

    for (const giftItem of giftItems) {
      if (!giftItem.promotionId) continue;
      const existing = giftQuantityByPromotion.get(giftItem.promotionId) || 0;
      giftQuantityByPromotion.set(
        giftItem.promotionId,
        existing + (giftItem.quantity ?? 1),
      );
    }

    for (const giftItem of giftItems) {
      if (!giftItem.promotionId) continue;

      // Get promotion from cache or fetch once
      let promotion = promotionCache.get(giftItem.promotionId);
      if (promotion === undefined) {
        promotion = await this.promotionsService.findById(giftItem.promotionId);
        promotionCache.set(giftItem.promotionId, promotion);
      }

      // Remove if promotion no longer valid
      if (!promotion || promotion.status !== PromotionStatus.ACTIVE) {
        const idx = updatedItems.findIndex(
          (item) =>
            item.isGift &&
            item.promotionId === giftItem.promotionId &&
            item.productId === giftItem.productId &&
            (item.variantId ?? null) === (giftItem.variantId ?? null),
        );
        if (idx !== -1) {
          updatedItems.splice(idx, 1);
          anyRemoved = true;
          this.logger.log(
            `[GiftValidation] Removed gift ${giftItem.productId} - promotion inactive`,
          );
        }
        continue;
      }

      const bundleConfig = promotion.bundleDealConfig;
      if (!bundleConfig) continue;

      if (bundleConfig.subType === BundleDealSubType.BUY_TO_GET_GIFT) {
        // Find tier
        const tier = bundleConfig.tiers?.find(
          (t) => t.minOrderValue.toString() === giftItem.promotionTierId,
        );

        if (!tier) {
          const idx = updatedItems.findIndex(
            (item) =>
              item.isGift &&
              item.promotionId === giftItem.promotionId &&
              item.productId === giftItem.productId &&
              (item.variantId ?? null) === (giftItem.variantId ?? null),
          );
          if (idx !== -1) {
            updatedItems.splice(idx, 1);
            anyRemoved = true;
            this.logger.log(
              `[GiftValidation] Removed gift ${giftItem.productId} - tier not found`,
            );
          }
          continue;
        }

        // Check if cart total meets tier requirement
        if (cartTotal < tier.minOrderValue) {
          const idx = updatedItems.findIndex(
            (item) =>
              item.isGift &&
              item.promotionId === giftItem.promotionId &&
              item.productId === giftItem.productId &&
              (item.variantId ?? null) === (giftItem.variantId ?? null),
          );
          if (idx !== -1) {
            updatedItems.splice(idx, 1);
            anyRemoved = true;
            this.logger.log(
              `[GiftValidation] Removed gift ${giftItem.productId} - cart total ${cartTotal} < threshold ${tier.minOrderValue}`,
            );
          }
        }
        continue;
      }

      if (bundleConfig.subType === BundleDealSubType.BUY_X_GET_Y) {
        const requiredProducts = bundleConfig.requiredProducts || [];
        if (
          requiredProducts.length === 0 ||
          bundleConfig.requiredQuantity == null
        ) {
          const idx = updatedItems.findIndex(
            (item) =>
              item.isGift &&
              item.promotionId === giftItem.promotionId &&
              item.productId === giftItem.productId &&
              (item.variantId ?? null) === (giftItem.variantId ?? null),
          );
          if (idx !== -1) {
            updatedItems.splice(idx, 1);
            anyRemoved = true;
            this.logger.log(
              `[GiftValidation] Removed gift ${giftItem.productId} - missing BUY_X_GET_Y config`,
            );
          }
          continue;
        }

        if (
          bundleConfig.minimumOrderValue != null &&
          cartTotal < bundleConfig.minimumOrderValue
        ) {
          const idx = updatedItems.findIndex(
            (item) =>
              item.isGift &&
              item.promotionId === giftItem.promotionId &&
              item.productId === giftItem.productId &&
              (item.variantId ?? null) === (giftItem.variantId ?? null),
          );
          if (idx !== -1) {
            updatedItems.splice(idx, 1);
            anyRemoved = true;
            this.logger.log(
              `[GiftValidation] Removed gift ${giftItem.productId} - cart total ${cartTotal} < minimum ${bundleConfig.minimumOrderValue}`,
            );
          }
          continue;
        }

        let requiredProductIds = requiredProductIdCache.get(
          giftItem.promotionId,
        );
        if (!requiredProductIds) {
          requiredProductIds = new Set(
            requiredProducts.map((rp) => rp.productId),
          );
          requiredProductIdCache.set(giftItem.promotionId, requiredProductIds);
        }

        let currentRequiredQuantity = requiredCountCache.get(
          giftItem.promotionId,
        );
        if (currentRequiredQuantity === undefined) {
          currentRequiredQuantity = eligibleItems.reduce((sum, item) => {
            if (!requiredProductIds!.has(item.productId)) return sum;
            return sum + item.quantity;
          }, 0);
          requiredCountCache.set(giftItem.promotionId, currentRequiredQuantity);
        }

        if (currentRequiredQuantity < bundleConfig.requiredQuantity) {
          const idx = updatedItems.findIndex(
            (item) =>
              item.isGift &&
              item.promotionId === giftItem.promotionId &&
              item.productId === giftItem.productId &&
              (item.variantId ?? null) === (giftItem.variantId ?? null),
          );
          if (idx !== -1) {
            updatedItems.splice(idx, 1);
            anyRemoved = true;
            this.logger.log(
              `[GiftValidation] Removed gift ${giftItem.productId} - required quantity not met`,
            );
          }
          continue;
        }

        if (bundleConfig.maxGiftQuantity != null) {
          const currentGiftQuantity =
            giftQuantityByPromotion.get(giftItem.promotionId) ?? 0;
          const totalGiftCount =
            (bundleConfig.currentGiftCount ?? 0) + currentGiftQuantity;

          if (totalGiftCount > bundleConfig.maxGiftQuantity) {
            const idx = updatedItems.findIndex(
              (item) =>
                item.isGift &&
                item.promotionId === giftItem.promotionId &&
                item.productId === giftItem.productId &&
                (item.variantId ?? null) === (giftItem.variantId ?? null),
            );
            if (idx !== -1) {
              updatedItems.splice(idx, 1);
              anyRemoved = true;
              this.logger.log(
                `[GiftValidation] Removed gift ${giftItem.productId} - promotion gift limit reached`,
              );
            }
          }
        }
      }
    }

    if (anyRemoved) {
      await this.cartRepository.update(cart.id, { items: updatedItems });

      // Notify frontend to refetch cart (gift was auto-removed)
      this.socketService.notifyCartRefetch(cart.id, userId, sessionId);
    }

    return anyRemoved;
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
}
