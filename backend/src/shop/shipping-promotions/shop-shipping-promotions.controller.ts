import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiHeader,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShopShippingPromotionsService } from './shop-shipping-promotions.service';
import { ApplyShippingPromotionDto } from './dto/apply-shipping-promotion.dto';
import { CheckoutSessionResponseDto } from '../checkout/dto/checkout-session-response.dto';
import { ShippingPromotion } from '../../shipping-promotions/domain/shipping-promotion';
import { ShopAuthGuard, ShopCustomer } from '../guards/shop-auth.guard';
import { Customer } from '../decorators/shop-customer.decorator';

/**
 * Shop Shipping Promotions Controller
 * Manages shipping promotion operations within checkout sessions
 */
@ApiTags('Shop - Shipping Promotions')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-session-id',
  description:
    'Session ID for guest identification (required if not authenticated)',
  required: false,
})
@UseGuards(ShopAuthGuard)
@Controller({ path: 'shop/checkout/sessions', version: '1' })
export class ShopShippingPromotionsController {
  constructor(
    private readonly shopShippingPromotionsService: ShopShippingPromotionsService,
  ) {}

  /**
   * Get available shipping promotions for a checkout session
   */
  @Get(':id/shipping-promotions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get available shipping promotions for checkout session',
    description:
      'Returns shipping promotions applicable based on session subtotal and current time.',
  })
  @ApiParam({ name: 'id', description: 'Checkout session ID' })
  @ApiOkResponse({
    description: 'Available shipping promotions',
    type: [ShippingPromotion],
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async getAvailableShippingPromotions(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
  ): Promise<ShippingPromotion[]> {
    return this.shopShippingPromotionsService.getAvailable(
      id,
      customer.sessionId,
      customer.userId,
    );
  }

  /**
   * Apply a shipping promotion to checkout session
   */
  @Post(':id/apply-shipping-promotion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Apply shipping promotion to checkout session',
    description:
      'Applies a shipping promotion discount to the session shipping fee. Only one shipping promotion can be active at a time.',
  })
  @ApiParam({ name: 'id', description: 'Checkout session ID' })
  @ApiOkResponse({
    description: 'Shipping promotion applied successfully',
    type: CheckoutSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @ApiBadRequestResponse({
    description: 'Promotion not found or not applicable',
  })
  async applyShippingPromotion(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
    @Body() dto: ApplyShippingPromotionDto,
  ): Promise<CheckoutSessionResponseDto> {
    return this.shopShippingPromotionsService.apply(
      id,
      dto.promotionId,
      customer.sessionId,
      customer.userId,
    );
  }

  /**
   * Remove shipping promotion from checkout session
   */
  @Delete(':id/shipping-promotion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove shipping promotion from checkout session',
    description:
      'Removes the applied shipping promotion and resets shipping discount to 0.',
  })
  @ApiParam({ name: 'id', description: 'Checkout session ID' })
  @ApiOkResponse({
    description: 'Shipping promotion removed successfully',
    type: CheckoutSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async removeShippingPromotion(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.shopShippingPromotionsService.remove(
      id,
      customer.sessionId,
      customer.userId,
    );
  }
}
