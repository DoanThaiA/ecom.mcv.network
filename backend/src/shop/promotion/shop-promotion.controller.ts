import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ShopPromotionService } from './shop-promotion.service';
import { ShopAuthGuard, ShopCustomer } from '../guards/shop-auth.guard';
import { Customer } from '../decorators/shop-customer.decorator';
import {
  CheckBundleDealEligibilityDto,
  AddGiftToCartDto,
  RemoveGiftFromCartDto,
  SetBuyXGetYGiftsDto,
} from './dto/shop-promotion.dto';
import { BundleDealEligibilityResponseDto } from './dto/bundle-deal-eligibility-response.dto';
import {
  CheckProductDiscountEligibilityDto,
  ProductDiscountEligibilityResponseDto,
  ApplyProductDiscountDto,
} from './dto/product-discount-eligibility.dto';
import {
  CheckPromotionEligibilityDto,
  PromotionEligibilityResponseDto,
} from './dto/check-promotion-eligibility.dto';
import { CartResponseDto } from '../cart/dto/cart.dto';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
import { CheckoutSessionResponseDto } from '../checkout/dto/checkout-session-response.dto';

@ApiTags('Shop - Promotions')
@ApiBearerAuth()
@Controller({ path: 'shop/promotions', version: '1' })
@UseGuards(ShopAuthGuard)
export class ShopPromotionController {
  private readonly logger = new Logger(ShopPromotionController.name);

  constructor(private readonly shopPromotionService: ShopPromotionService) {}

  // ==================== Unified Promotion Eligibility ====================

  /**
   * Check all promotion eligibility in a single call (unified API)
   * Returns eligibility for bundle deals and product discounts
   * Recommended over individual endpoints for better performance
   */
  @Post('check-eligibility')
  @ApiOperation({
    summary: 'Check all promotion eligibility (unified)',
    description:
      'Returns eligibility for all promotion types (bundle deals, product discounts) in a single call. Recommended for cart page.',
  })
  @ApiOkResponse({
    description: 'Unified promotion eligibility response',
    type: PromotionEligibilityResponseDto,
  })
  async checkPromotionEligibility(
    @Body() dto: CheckPromotionEligibilityDto,
    @Customer() customer: ShopCustomer,
  ): Promise<PromotionEligibilityResponseDto> {
    return this.shopPromotionService.checkPromotionEligibility(
      dto,
      customer.sessionId,
      customer.userId,
    );
  }

  // ==================== Bundle Deal Endpoints (Legacy - use unified API instead) ====================

  /**
   * Check bundle deal eligibility based on cart total
   * @deprecated Use POST /check-eligibility instead for better performance
   */
  @Post('bundle-deals/check-eligibility')
  @ApiOperation({
    summary: 'Check bundle deal eligibility',
    description:
      'Returns eligible gift tiers based on cart total and hint for next tier for all active promotions. Deprecated: use POST /check-eligibility instead.',
  })
  @ApiOkResponse({
    description: 'Bundle deal eligibility info list',
    type: [BundleDealEligibilityResponseDto],
  })
  async checkBundleDealEligibility(
    @Body() dto: CheckBundleDealEligibilityDto,
    @Customer() customer: ShopCustomer,
  ): Promise<BundleDealEligibilityResponseDto[]> {
    return this.shopPromotionService.checkBundleDealEligibility(
      dto,
      customer.sessionId,
      customer.userId,
    );
  }

  /**
   * Add gift item to cart (BUY_TO_GET_GIFT type)
   */
  @Post('gift/buy-to-get-gift')
  @ApiOperation({
    summary: 'Add gift item to cart (BUY_TO_GET_GIFT)',
    description:
      'Validates promotion eligibility and adds gift item with price = 0. For BUY_TO_GET_GIFT bundle deal type only.',
  })
  @ApiOkResponse({
    description: 'Updated cart with gift item',
    type: CartResponseDto,
  })
  async addGiftToCart(
    @Body() dto: AddGiftToCartDto,
    @Customer() customer: ShopCustomer,
  ): Promise<CartResponseDto> {
    return this.shopPromotionService.addGiftToCart(
      customer.sessionId,
      dto,
      customer.userId,
    );
  }

  /**
   * Set BUY_X_GET_Y gifts in batch (replace-all approach)
   */
  @Post('gift/buy-x-get-y')
  @ApiOperation({
    summary: 'Set BUY_X_GET_Y gifts (batch)',
    description:
      'Replace all current gifts for a BUY_X_GET_Y promotion with the specified gift selections. Empty gifts array clears all gifts.',
  })
  @ApiOkResponse({
    description: 'Updated cart with gift items',
    type: CartResponseDto,
  })
  async setBuyXGetYGifts(
    @Body() dto: SetBuyXGetYGiftsDto,
    @Customer() customer: ShopCustomer,
  ): Promise<CartResponseDto> {
    return this.shopPromotionService.setBuyXGetYGifts(
      customer.sessionId,
      dto,
      customer.userId,
    );
  }

  /**
   * Remove gift item from cart
   */
  @Delete('gift/:productId')
  @ApiOperation({
    summary: 'Remove gift item from cart',
    description: 'Removes gift item from cart',
  })
  @ApiParam({
    name: 'productId',
    description: 'Gift product ID',
  })
  @ApiQuery({
    name: 'variantId',
    description: 'Variant ID (if applicable)',
    required: false,
  })
  @ApiOkResponse({
    description: 'Updated cart without gift item',
    type: CartResponseDto,
  })
  async removeGiftFromCart(
    @Param('productId') productId: string,
    @Query('variantId') variantId: string | undefined,
    @Customer() customer: ShopCustomer,
  ): Promise<CartResponseDto> {
    return this.shopPromotionService.removeGiftFromCart(
      customer.sessionId,
      productId,
      variantId,
      customer.userId,
    );
  }

  /**
   * Apply voucher to checkout session
   */
  @Post('voucher/apply')
  @ApiOperation({
    summary: 'Apply voucher',
    description: 'Validates and applies voucher to checkout session',
  })
  @ApiOkResponse({
    description: 'Updated checkout session',
    type: CheckoutSessionResponseDto,
  })
  async applyVoucher(
    @Body() dto: ApplyVoucherDto,
    @Customer() customer: ShopCustomer,
  ): Promise<CheckoutSessionResponseDto> {
    return this.shopPromotionService.applyVoucher(
      customer.sessionId,
      dto,
      customer.userId,
    );
  }

  /**
   * Remove voucher from checkout session
   */
  @Delete('voucher/:checkoutSessionId/:code')
  @ApiOperation({
    summary: 'Remove voucher',
    description: 'Removes voucher from checkout session',
  })
  @ApiParam({ name: 'checkoutSessionId', description: 'Checkout Session UUID' })
  @ApiParam({ name: 'code', description: 'Voucher code' })
  @ApiOkResponse({
    description: 'Updated checkout session',
    type: CheckoutSessionResponseDto,
  })
  async removeVoucher(
    @Param('checkoutSessionId') checkoutSessionId: string,
    @Param('code') code: string,
    @Customer() customer: ShopCustomer,
  ): Promise<CheckoutSessionResponseDto> {
    return this.shopPromotionService.removeVoucher(
      checkoutSessionId,
      code,
      customer.sessionId,
      customer.userId,
    );
  }

  // ==================== Product Discount Endpoints (Legacy - use unified API instead) ====================

  /**
   * Check product discount eligibility (AUTO_APPLY type)
   * @deprecated Use POST /check-eligibility instead for better performance
   */
  @Post('product-discounts/check-eligibility')
  @ApiOperation({
    summary: 'Check product discount eligibility',
    description:
      'Returns eligible product discount promotions based on cart total and products',
  })
  @ApiOkResponse({
    description: 'Product discount eligibility info list',
    type: [ProductDiscountEligibilityResponseDto],
  })
  async checkProductDiscountEligibility(
    @Body() dto: CheckProductDiscountEligibilityDto,
    @Customer() customer: ShopCustomer,
  ): Promise<ProductDiscountEligibilityResponseDto[]> {
    return this.shopPromotionService.checkProductDiscountEligibility(
      dto,
      customer.sessionId,
      customer.userId,
    );
  }

  /**
   * Apply product discount to checkout session
   */
  @Post('product-discounts/apply')
  @ApiOperation({
    summary: 'Apply product discount',
    description:
      'Applies product discount promotion to checkout session. Auto-replaces any existing promotions.',
  })
  @ApiOkResponse({
    description: 'Updated checkout session',
    type: CheckoutSessionResponseDto,
  })
  async applyProductDiscount(
    @Body() dto: ApplyProductDiscountDto,
    @Customer() customer: ShopCustomer,
  ): Promise<CheckoutSessionResponseDto> {
    return this.shopPromotionService.applyProductDiscount(
      dto,
      customer.sessionId,
      customer.userId,
    );
  }

  /**
   * Remove product discount from checkout session
   */
  @Delete('product-discounts/:checkoutSessionId/:promotionId')
  @ApiOperation({
    summary: 'Remove product discount',
    description: 'Removes product discount from checkout session',
  })
  @ApiParam({ name: 'checkoutSessionId', description: 'Checkout Session UUID' })
  @ApiParam({ name: 'promotionId', description: 'Promotion ID' })
  @ApiOkResponse({
    description: 'Updated checkout session',
    type: CheckoutSessionResponseDto,
  })
  async removeProductDiscount(
    @Param('checkoutSessionId') checkoutSessionId: string,
    @Param('promotionId') promotionId: string,
    @Customer() customer: ShopCustomer,
  ): Promise<CheckoutSessionResponseDto> {
    return this.shopPromotionService.removeProductDiscount(
      checkoutSessionId,
      promotionId,
      customer.sessionId,
      customer.userId,
    );
  }
}
