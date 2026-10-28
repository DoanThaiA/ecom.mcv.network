import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiHeader,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  AddComboToCartDto,
  UpdateCartItemDto,
  MergeGuestCartDto,
  CartResponseDto,
} from './dto/cart.dto';
import { ShopAuthGuard, ShopCustomer } from '../guards/shop-auth.guard';
import { Customer } from '../decorators/shop-customer.decorator';
import { I18nService } from 'nestjs-i18n';
import { throwException } from '../../utils/errors/throw-exception';

/**
 * Cart controller for shopping cart operations
 * Supports both guest (session-based) and authenticated users
 */
@ApiTags('Shop - Cart')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-session-id',
  description:
    'Session ID for guest cart identification (required if not authenticated)',
  required: false,
})
@UseGuards(ShopAuthGuard)
@Controller({ path: 'shop/cart', version: '1' })
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get current cart
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current cart',
    description:
      'Returns the current cart for the session/user. Creates empty cart if none exists.',
  })
  @ApiOkResponse({
    description: 'Cart returned successfully',
    type: CartResponseDto,
  })
  async getCart(@Customer() customer: ShopCustomer): Promise<CartResponseDto> {
    return this.cartService.getCart(customer.sessionId, customer.userId);
  }

  /**
   * Add item to cart
   */
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to cart',
    description:
      'Adds a product to the cart. Updates quantity if already exists.',
  })
  @ApiCreatedResponse({
    description: 'Item added to cart',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Product not available' })
  async addToCart(
    @Customer() customer: ShopCustomer,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addToCart(customer.sessionId, dto, customer.userId);
  }

  /**
   * Add combo to cart
   */
  @Post('combo')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add combo to cart',
    description:
      'Adds a combo (product bundle) to the cart with selected variants for each product.',
  })
  @ApiCreatedResponse({
    description: 'Combo added to cart',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Combo or product not found' })
  @ApiBadRequestResponse({
    description: 'Combo not available or invalid variants',
  })
  async addComboToCart(
    @Customer() customer: ShopCustomer,
    @Body() dto: AddComboToCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addComboToCart(
      customer.sessionId,
      dto,
      customer.userId,
    );
  }

  /**
   * Update item quantity
   */
  @Patch('items/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update cart item quantity',
    description: 'Updates the quantity of an item in the cart.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Item quantity updated',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Cart or item not found' })
  async updateItemQuantity(
    @Customer() customer: ShopCustomer,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItemQuantity(
      customer.sessionId,
      productId,
      dto.variantId ?? null,
      dto.quantity,
      customer.userId,
      dto.comboInstanceId,
    );
  }

  /**
   * Remove item from cart
   */
  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Removes an item from the cart.',
  })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiQuery({
    name: 'variantId',
    type: String,
    required: false,
    description: 'Variant ID (if applicable)',
  })
  @ApiQuery({
    name: 'comboInstanceId',
    type: String,
    required: false,
    description:
      'Combo instance ID to target a specific combo item. If not provided, standalone items are prioritized.',
  })
  @ApiOkResponse({
    description: 'Item removed from cart',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Cart not found' })
  async removeItem(
    @Customer() customer: ShopCustomer,
    @Param('productId') productId: string,
    @Query('variantId') variantId: string | undefined,
    @Query('comboInstanceId') comboInstanceId: string | undefined,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(
      customer.sessionId,
      productId,
      variantId ?? null,
      customer.userId,
      comboInstanceId,
    );
  }

  /**
   * Clear cart
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Removes all items from the cart.',
  })
  @ApiOkResponse({
    description: 'Cart cleared',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Cart not found' })
  async clearCart(
    @Customer() customer: ShopCustomer,
  ): Promise<CartResponseDto> {
    return this.cartService.clearCart(customer.sessionId, customer.userId);
  }

  /**
   * Merge guest cart to authenticated user cart
   */
  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Merge guest cart to user cart',
    description:
      'Merges items from a guest cart into the authenticated user cart. Call this after login to transfer guest cart items.',
  })
  @ApiOkResponse({
    description: 'Cart merged successfully',
    type: CartResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'User must be authenticated' })
  async mergeGuestCart(
    @Customer() customer: ShopCustomer,
    @Body() dto: MergeGuestCartDto,
  ): Promise<CartResponseDto | null> {
    if (!customer.isAuthenticated || !customer.userId) {
      throwException({
        status: HttpStatus.UNAUTHORIZED,
        message: this.i18n.t('shop.cart.authRequiredForMerge'),
      });
    }
    return this.cartService.mergeGuestCart(dto.guestSessionId, customer.userId);
  }
}
