import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { v4 as uuidv4 } from 'uuid';
import { CartRepository } from './domain/cart.repository';
import { ProductRepository } from '../../products/domain/product.repository';
import { ComboRepository } from '../../combos/domain/combo.repository';
import { FlashSaleRepository } from '../../flash-sales/domain/flash-sale.repository';
import { FlashSaleProductRepository } from '../../flash-sale-products/domain/flash-sale-product.repository';
import { Cart, CartItem, CartComboInstance } from './domain/cart';
import {
  AddToCartDto,
  AddComboToCartDto,
  CartResponseDto,
  CartItemResponseDto,
  CartComboInstanceResponseDto,
  CartItemFlashSaleInfoDto,
  CartItemProductDiscountInfoDto,
} from './dto/cart.dto';
import { Product } from '../../products/domain/product';
import { throwException } from '../../utils/errors/throw-exception';
import { isSaleable } from '../../products/domain/product-status.enum';
import { getProductImage } from '../../products/domain/product.utils';
import { ComboStatus } from '../../combos/domain/combo-status.enum';
import { calculateRoundedDiscountAmount } from '../../utils/helpers/round-price';
import { SocketService } from '../../socket/socket.service';
import { GiftValidationService } from './gift-validation.service';

/**
 * Cart service for managing shopping cart operations
 */
@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  // Cart expiration for guest users (7 days)
  private readonly GUEST_CART_EXPIRATION_DAYS = 7;

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly comboRepository: ComboRepository,
    private readonly flashSaleRepository: FlashSaleRepository,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    private readonly i18n: I18nService,
    private readonly socketService: SocketService,
    private readonly giftValidationService: GiftValidationService,
  ) {}

  /**
   * Get or create cart for session/user
   */
  async getCart(sessionId: string, userId?: string): Promise<CartResponseDto> {
    let cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      // Create empty cart
      cart = await this.cartRepository.create({
        sessionId,
        userId: userId ?? null,
        items: [],
        expiresAt: userId ? null : this.getExpirationDate(),
      });
    }

    return await this.toCartResponse(cart);
  }

  /**
   * Add item to cart
   */
  async addToCart(
    sessionId: string,
    dto: AddToCartDto,
    userId?: string,
  ): Promise<CartResponseDto> {
    // Get product to validate and get details
    const productId = dto.variantId ?? dto.productId;
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.product.notFound'),
      });
    }

    if (!isSaleable(product.status)) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('shop.product.notAvailable'),
      });
    }

    // Get or create cart
    let cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      cart = await this.cartRepository.create({
        sessionId,
        userId: userId ?? null,
        items: [],
        expiresAt: userId ? null : this.getExpirationDate(),
      });
    }

    // Check if item already in cart (only match standalone items, not combo items)
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId === dto.productId &&
        item.variantId === (dto.variantId ?? null) &&
        !item.comboInstanceId,
    );

    const updatedItems = [...cart.items];

    if (existingIndex >= 0) {
      // Update quantity
      updatedItems[existingIndex].quantity += dto.quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: dto.productId,
        variantId: dto.variantId ?? null,
        code: product.code,
        name: product.name,
        image: getProductImage(product),
        price: product.prices.retail,
        quantity: dto.quantity,
        comboInstanceId: null,
        attributes: product.attributes,
      };
      updatedItems.push(newItem);
    }

    const updatedCart = await this.cartRepository.update(cart.id, {
      items: updatedItems,
    });

    // Notify other clients to refetch cart
    this.socketService.notifyCartRefetch(updatedCart!.id, userId, sessionId);

    return await this.toCartResponse(updatedCart!);
  }

  /**
   * Add combo to cart
   */
  async addComboToCart(
    sessionId: string,
    dto: AddComboToCartDto,
    userId?: string,
  ): Promise<CartResponseDto> {
    // Get and validate combo
    const combo = await this.comboRepository.findById(dto.comboId);

    if (!combo) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.notFound'),
      });
    }

    // Validate combo is active
    if (combo.status !== ComboStatus.ACTIVE) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.comboNotActive'),
      });
    }

    // Validate combo date range
    const now = new Date();
    if (combo.validFrom && combo.validFrom > now) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.comboNotYetValid'),
      });
    }
    if (combo.validTo && combo.validTo < now) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.comboExpired'),
      });
    }

    // Validate all variants are provided
    if (dto.items.length !== combo.items.length) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: this.i18n.t('combo.variantRequired'),
      });
    }

    // Get or create cart
    let cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      cart = await this.cartRepository.create({
        sessionId,
        userId: userId ?? null,
        items: [],
        comboInstances: [],
        expiresAt: userId ? null : this.getExpirationDate(),
      });
    }

    // Generate unique comboInstanceId for this combo addition
    const comboInstanceId = uuidv4();

    // Create cart items for each combo product
    const newItems: CartItem[] = [];
    for (const comboItem of combo.items) {
      const selectedVariant = dto.items.find(
        (i) => i.productId === comboItem.productId,
      );

      if (!selectedVariant) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('combo.variantRequired'),
        });
      }

      // Get product details - use variantId if provided, otherwise use productId
      const productIdToFetch = selectedVariant.variantId || comboItem.productId;
      const product = await this.productRepository.findById(productIdToFetch);

      if (!product) {
        throwException({
          status: HttpStatus.NOT_FOUND,
          message: this.i18n.t('combo.variantNotFound'),
        });
      }

      if (!isSaleable(product.status)) {
        throwException({
          status: HttpStatus.BAD_REQUEST,
          message: this.i18n.t('shop.product.notAvailable'),
        });
      }

      newItems.push({
        productId: comboItem.productId,
        variantId: selectedVariant.variantId ?? null,
        code: product.code,
        name: product.name,
        image: getProductImage(product),
        price: product.prices.retail,
        quantity: comboItem.quantity,
        comboInstanceId,
        attributes: product.attributes,
      });
    }

    // Calculate discount amount (rounded for consistency)
    const discountAmount = calculateRoundedDiscountAmount(
      combo.originalPrice,
      combo.discountType,
      combo.discountValue,
    );

    // Create combo instance tracking
    const comboInstance: CartComboInstance = {
      comboInstanceId,
      comboId: combo.id,
      comboName: combo.name,
      discountType: combo.discountType,
      discountValue: combo.discountValue,
      originalPrice: combo.originalPrice,
      discountAmount,
    };

    const updatedCart = await this.cartRepository.update(cart.id, {
      items: [...cart.items, ...newItems],
      comboInstances: [...(cart.comboInstances || []), comboInstance],
    });

    // Notify other clients to refetch cart
    this.socketService.notifyCartRefetch(updatedCart!.id, userId, sessionId);

    return await this.toCartResponse(updatedCart!);
  }

  /**
   * Update item quantity in cart
   * For combo items: decrease breaks combo, increase adds standalone
   * @param comboInstanceId - If provided, targets specific combo item; otherwise prioritizes standalone items
   */
  async updateItemQuantity(
    sessionId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
    userId?: string,
    comboInstanceId?: string,
  ): Promise<CartResponseDto> {
    const cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.cart.notFound'),
      });
    }

    // If comboInstanceId is provided, target that specific item
    // Otherwise, prioritize standalone items over combo items to preserve combos
    let itemIndex: number;
    if (comboInstanceId) {
      itemIndex = cart.items.findIndex(
        (item) =>
          item.productId === productId &&
          item.variantId === (variantId ?? null) &&
          item.comboInstanceId === comboInstanceId,
      );
    } else {
      // Prioritize standalone items
      itemIndex = cart.items.findIndex(
        (item) =>
          item.productId === productId &&
          item.variantId === (variantId ?? null) &&
          !item.comboInstanceId,
      );

      // If no standalone item found, find any matching item
      if (itemIndex < 0) {
        itemIndex = cart.items.findIndex(
          (item) =>
            item.productId === productId &&
            item.variantId === (variantId ?? null),
        );
      }
    }

    if (itemIndex < 0) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.cart.itemNotFound'),
      });
    }

    const item = cart.items[itemIndex];

    // Handle combo item
    if (item.comboInstanceId) {
      if (quantity < item.quantity) {
        // DECREASE: Break combo, keep items as standalone
        return this.breakCombo(cart, item.comboInstanceId, {
          productId,
          variantId,
          newQuantity: quantity,
        });
      } else if (quantity > item.quantity) {
        // INCREASE: Add additional as standalone
        const additionalQty = quantity - item.quantity;
        return this.addStandaloneQuantity(
          cart,
          productId,
          variantId,
          additionalQty,
        );
      }
      // Same quantity - no change needed
      return await this.toCartResponse(cart);
    }

    // Non-combo item: normal update
    const updatedItems = [...cart.items];
    updatedItems[itemIndex].quantity = quantity;

    const updatedCart = await this.cartRepository.update(cart.id, {
      items: updatedItems,
    });

    // Auto-remove ineligible gifts if cart total changed
    await this.giftValidationService.validateAndRemoveIneligibleGifts(
      sessionId,
      userId,
    );

    // Re-query cart to get latest state after gift validation
    const finalCart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    // Notify other clients to refetch cart
    this.socketService.notifyCartRefetch(updatedCart!.id, userId, sessionId);

    return await this.toCartResponse(finalCart!);
  }

  /**
   * Remove item from cart
   * For combo items: breaks combo, other combo items persist as standalone
   * @param comboInstanceId - If provided, targets specific combo item; otherwise prioritizes standalone items
   */
  async removeItem(
    sessionId: string,
    productId: string,
    variantId: string | null,
    userId?: string,
    comboInstanceId?: string,
  ): Promise<CartResponseDto> {
    const cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.cart.notFound'),
      });
    }

    // If comboInstanceId is provided, target that specific item
    // Otherwise, prioritize standalone items over combo items to preserve combos
    let item: CartItem | undefined;
    if (comboInstanceId) {
      item = cart.items.find(
        (i) =>
          i.productId === productId &&
          i.variantId === (variantId ?? null) &&
          i.comboInstanceId === comboInstanceId,
      );
    } else {
      // Prioritize standalone items
      item = cart.items.find(
        (i) =>
          i.productId === productId &&
          i.variantId === (variantId ?? null) &&
          !i.comboInstanceId,
      );

      // If no standalone item found, find any matching item
      if (!item) {
        item = cart.items.find(
          (i) =>
            i.productId === productId && i.variantId === (variantId ?? null),
        );
      }
    }

    if (!item) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.cart.itemNotFound'),
      });
    }

    // Handle combo item removal
    if (item.comboInstanceId) {
      return this.breakCombo(cart, item.comboInstanceId, {
        productId,
        variantId,
        remove: true,
      });
    }

    // Non-combo item: remove only the standalone item (not combo items with same product)
    let removed = false;
    const updatedItems = cart.items.filter((i) => {
      if (
        !removed &&
        i.productId === productId &&
        i.variantId === (variantId ?? null) &&
        !i.comboInstanceId
      ) {
        removed = true;
        return false;
      }
      return true;
    });

    const updatedCart = await this.cartRepository.update(cart.id, {
      items: updatedItems,
    });

    // Auto-remove ineligible gifts if cart total changed
    await this.giftValidationService.validateAndRemoveIneligibleGifts(
      sessionId,
      userId,
    );

    // Re-query cart to get latest state after gift validation
    const finalCart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    // Notify other clients to refetch cart
    this.socketService.notifyCartRefetch(updatedCart!.id, userId, sessionId);

    return await this.toCartResponse(finalCart!);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(
    sessionId: string,
    userId?: string,
  ): Promise<CartResponseDto> {
    const cart = userId
      ? await this.cartRepository.findByUserId(userId)
      : await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.cart.notFound'),
      });
    }

    const updatedCart = await this.cartRepository.update(cart.id, {
      items: [],
      comboInstances: [],
    });

    // Notify other clients to refetch cart
    this.socketService.notifyCartRefetch(updatedCart!.id, userId, sessionId);

    return await this.toCartResponse(updatedCart!);
  }

  /**
   * Merge guest cart to user cart after login
   */
  async mergeGuestCart(
    guestSessionId: string,
    userId: string,
  ): Promise<CartResponseDto | null> {
    const cart = await this.cartRepository.mergeGuestCartToUser(
      guestSessionId,
      userId,
    );

    return cart ? await this.toCartResponse(cart) : null;
  }

  /**
   * Get expiration date for guest carts
   */
  private getExpirationDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + this.GUEST_CART_EXPIRATION_DAYS);
    return date;
  }

  /**
   * Break a combo - remove combo ref from items, remove combo instance
   * Items remain in cart as standalone products
   */
  private async breakCombo(
    cart: Cart,
    comboInstanceId: string,
    change: {
      productId: string;
      variantId: string | null;
      newQuantity?: number;
      remove?: boolean;
    },
  ): Promise<CartResponseDto> {
    // Process items: remove comboInstanceId and apply changes
    const updatedItems = cart.items
      .map((item) => {
        if (item.comboInstanceId !== comboInstanceId) return item;

        // Apply the change to the specific item
        if (
          item.productId === change.productId &&
          item.variantId === change.variantId
        ) {
          if (change.remove) return null; // Will be filtered out
          return {
            ...item,
            comboInstanceId: null,
            quantity: change.newQuantity ?? item.quantity,
          };
        }

        // Other combo items become standalone
        return { ...item, comboInstanceId: null };
      })
      .filter((item): item is CartItem => item !== null);

    // Remove combo instance
    const updatedComboInstances = (cart.comboInstances || []).filter(
      (c) => c.comboInstanceId !== comboInstanceId,
    );

    const updatedCart = await this.cartRepository.update(cart.id, {
      items: updatedItems,
      comboInstances: updatedComboInstances,
    });

    // Notify other clients to refetch cart
    this.socketService.notifyCartRefetch(
      updatedCart!.id,
      cart.userId,
      cart.sessionId,
    );

    return await this.toCartResponse(updatedCart!);
  }

  /**
   * Add quantity to a standalone item or create new standalone
   */
  private async addStandaloneQuantity(
    cart: Cart,
    productId: string,
    variantId: string | null,
    additionalQty: number,
  ): Promise<CartResponseDto> {
    // Find existing standalone item
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId === productId &&
        item.variantId === variantId &&
        !item.comboInstanceId,
    );

    const updatedItems = [...cart.items];

    if (existingIndex >= 0) {
      // Add to existing standalone
      updatedItems[existingIndex].quantity += additionalQty;
    } else {
      // Create new standalone item (copy from combo item)
      const comboItem = cart.items.find(
        (item) => item.productId === productId && item.variantId === variantId,
      );

      if (comboItem) {
        updatedItems.push({
          ...comboItem,
          quantity: additionalQty,
          comboInstanceId: null,
        });
      }
    }

    const updatedCart = await this.cartRepository.update(cart.id, {
      items: updatedItems,
    });

    // Notify other clients to refetch cart
    this.socketService.notifyCartRefetch(
      updatedCart!.id,
      cart.userId,
      cart.sessionId,
    );

    return await this.toCartResponse(updatedCart!);
  }

  /**
   * Convert cart to response DTO with flash sale pricing
   */
  private async toCartResponse(cart: Cart): Promise<CartResponseDto> {
    // Get all product IDs from cart items (use variantId if available, otherwise productId)
    const productIds = cart.items.map(
      (item) => item.variantId ?? item.productId,
    );

    // Fetch products to get parent info for variants
    const products = await this.productRepository.findByIds(productIds);

    // Build lookup set: include both variant IDs and parent IDs
    const lookupIds = new Set<string>(productIds);
    const variantToParentMap = new Map<string, string>();

    for (const product of products) {
      if (product.parent?.id) {
        lookupIds.add(product.parent.id);
        variantToParentMap.set(product.id, product.parent.id);
      }
    }

    // Batch fetch flash sale info for all products (including parents)
    const activeFlashSale =
      await this.flashSaleRepository.findCurrentlyActive();
    const flashSaleProductMap = activeFlashSale
      ? await this.flashSaleProductRepository.findActiveForProducts(
          activeFlashSale.id,
          [...lookupIds],
        )
      : new Map();

    // Fetch parent products that are not yet in the products list
    const parentIds = [...variantToParentMap.values()].filter(
      (pid) => !products.some((p) => p.id === pid),
    );
    const parentProducts =
      parentIds.length > 0
        ? await this.productRepository.findByIds(parentIds)
        : [];
    const allProducts = [...products, ...parentProducts];

    // Build productDiscount map from fetched products (synced by cron)
    const productDiscountMap = new Map<
      string,
      NonNullable<Product['productDiscount']>
    >();
    for (const product of allProducts) {
      if (product.productDiscount?.promotionId) {
        productDiscountMap.set(product.id, product.productDiscount);
      }
    }
    // Map parent's productDiscount to variant IDs
    for (const [variantId, parentId] of variantToParentMap) {
      if (!productDiscountMap.has(variantId)) {
        const parentPd = productDiscountMap.get(parentId);
        if (parentPd) {
          productDiscountMap.set(variantId, parentPd);
        }
      }
    }

    // Build cart items with flash sale and product discount pricing
    let totalFlashSaleDiscount = 0;
    let totalProductDiscount = 0;
    const items: CartItemResponseDto[] = cart.items.map((item) => {
      let effectivePrice = item.price;
      let flashSale: CartItemFlashSaleInfoDto | null = null;
      let productDiscountInfo: CartItemProductDiscountInfoDto | null = null;

      // Combo items don't get flash sale/product discount pricing
      if (!item.comboInstanceId) {
        const productId = item.variantId ?? item.productId;

        // Step 1: Check product discount (acts as base price override)
        const pdInfo =
          productDiscountMap.get(productId) ??
          productDiscountMap.get(variantToParentMap.get(productId) ?? '');

        if (pdInfo && pdInfo.discountedPrice != null) {
          const discountAmount = pdInfo.discountAmount;
          effectivePrice = item.price - discountAmount;

          productDiscountInfo = {
            promotionId: pdInfo.promotionId!,
            promotionName: pdInfo.promotionName!,
            originalPrice: item.price,
            discountedPrice: effectivePrice,
            discountPercent: pdInfo.discountPercent,
          };

          totalProductDiscount += discountAmount * item.quantity;
        }

        // Step 2: Check flash sale - stacks on top of product discount
        const fsProduct =
          flashSaleProductMap.get(productId) ??
          flashSaleProductMap.get(variantToParentMap.get(productId) ?? '');

        if (fsProduct) {
          const discountAmount = calculateRoundedDiscountAmount(
            effectivePrice,
            fsProduct.discountType,
            fsProduct.discountValue,
          );
          const flashSalePrice = effectivePrice - discountAmount;
          const remainingStock =
            fsProduct.promotionalQuantity - fsProduct.soldCount;

          // Only apply flash sale pricing when stock covers all units
          if (remainingStock >= item.quantity) {
            effectivePrice = flashSalePrice;
            flashSale = {
              flashSaleId: fsProduct.flashSaleId,
              originalPrice: item.price,
              flashSalePrice,
              remainingStock,
            };

            totalFlashSaleDiscount += discountAmount * item.quantity;
          }
        }
      }

      return {
        productId: item.productId,
        variantId: item.variantId,
        code: item.code,
        name: item.name,
        image: item.image,
        price: item.price,
        effectivePrice,
        quantity: item.quantity,
        subtotal: effectivePrice * item.quantity,
        flashSale,
        productDiscount: productDiscountInfo,
        attributes: item.attributes,
        comboInstanceId: item.comboInstanceId ?? null,
        // Gift item fields
        isGift: item.isGift ?? false,
        promotionId: item.promotionId ?? null,
        promotionTierId: item.promotionTierId ?? null,
        originalPrice: item.originalPrice ?? null,
      };
    });

    const comboInstances: CartComboInstanceResponseDto[] = (
      cart.comboInstances || []
    ).map((ci) => ({
      comboInstanceId: ci.comboInstanceId,
      comboId: ci.comboId,
      comboName: ci.comboName,
      originalPrice: ci.originalPrice,
      discountAmount: ci.discountAmount,
      finalPrice: ci.originalPrice - ci.discountAmount,
      itemCount: cart.items.filter(
        (item) => item.comboInstanceId === ci.comboInstanceId,
      ).length,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const comboDiscount = comboInstances.reduce(
      (sum, ci) => sum + ci.discountAmount,
      0,
    );
    const total = subtotal - comboDiscount;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      comboInstances,
      itemCount,
      subtotal,
      comboDiscount,
      flashSaleDiscount: totalFlashSaleDiscount,
      productDiscountTotal: totalProductDiscount,
      total,
    };
  }
}
