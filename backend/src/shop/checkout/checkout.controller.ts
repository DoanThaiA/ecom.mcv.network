import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiHeader,
  ApiParam,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { UpsertCheckoutSessionDto } from './dto/upsert-checkout-session.dto';
import { PlaceOrderDto, PlaceOrderResponseDto } from './dto/place-order.dto';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { ShopAuthGuard, ShopCustomer } from '../guards/shop-auth.guard';
import { Customer, ClientIp } from '../decorators/shop-customer.decorator';

/**
 * Shop Checkout Controller
 * Single-page checkout flow: Upsert Session -> Place Order
 *
 * Endpoints:
 * - POST /shop/checkout/sessions - Create or update checkout session (upsert)
 * - GET /shop/checkout/sessions/:id - Get session by ID
 * - POST /shop/checkout/sessions/:id/place-order - Place order from session
 * - DELETE /shop/checkout/sessions/:id - Cancel session
 */
@ApiTags('Shop - Checkout')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-session-id',
  description:
    'Session ID for guest identification (required if not authenticated)',
  required: false,
})
@UseGuards(ShopAuthGuard)
@Controller({ path: 'shop/checkout/sessions', version: '1' })
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Upsert checkout session - creates new or updates existing session
   * If dto.id is provided, updates existing session. Otherwise creates new.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create or update checkout session',
    description:
      'Creates a new checkout session or updates existing session (if id provided). ' +
      'Provide items and/or combos for checkout. ' +
      'Customer info, shipping address, and payment method can be provided progressively. ' +
      'Response includes validation status (canPlaceOrder, missingFields, hasUnavailableItems).',
  })
  @ApiOkResponse({
    description: 'Session created/updated successfully',
    type: CheckoutSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or no items selected',
  })
  @ApiNotFoundResponse({
    description: 'Session not found (when updating existing)',
  })
  @ApiForbiddenResponse({
    description: 'Not authorized to update this session',
  })
  async upsertSession(
    @Customer() customer: ShopCustomer,
    @Body() dto: UpsertCheckoutSessionDto,
    @Req() req: Request,
  ): Promise<CheckoutSessionResponseDto> {
    // DTO body takes priority over cookie (handles cross-origin frontends)
    const affiliateCode =
      dto.affiliateCode ?? req.cookies?.['aff_code'] ?? null;
    return this.checkoutService.upsertSession(
      customer.sessionId,
      dto,
      customer.userId,
      affiliateCode,
    );
  }

  /**
   * Get checkout session by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get checkout session by ID',
    description:
      'Returns session details including items, pricing, validation status, and order readiness.',
  })
  @ApiParam({ name: 'id', description: 'Checkout session ID' })
  @ApiOkResponse({
    description: 'Session found',
    type: CheckoutSessionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @ApiForbiddenResponse({ description: 'Not authorized to view this session' })
  async getSessionById(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
  ): Promise<CheckoutSessionResponseDto> {
    return this.checkoutService.getById(
      id,
      customer.sessionId,
      customer.userId,
    );
  }

  /**
   * Place order from checkout session
   */
  @Post(':id/place-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Place order from checkout session',
    description:
      'Creates an order from the checkout session. ' +
      'Session must have customer info, shipping address, and payment method. ' +
      'Validates item availability and flash sale stock before creating order. ' +
      'For OnePay payment methods (onepay_intercard, onepay_domestic), returns paymentUrl for redirect. ' +
      'Returns validation errors or missing fields if order cannot be placed.',
  })
  @ApiParam({ name: 'id', description: 'Checkout session ID' })
  @ApiOkResponse({
    description: 'Order created successfully or validation failed',
    type: PlaceOrderResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @ApiBadRequestResponse({
    description: 'Session already completed or not active',
  })
  @ApiForbiddenResponse({
    description: 'Not authorized to place order from this session',
  })
  async placeOrder(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
    @Body() dto: PlaceOrderDto,
    @ClientIp() clientIp: string,
  ): Promise<PlaceOrderResponseDto> {
    return this.checkoutService.placeOrder(
      id,
      customer.sessionId,
      dto,
      customer.userId,
      clientIp,
    );
  }

  /**
   * Cancel/delete checkout session
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel checkout session',
    description:
      'Deletes the checkout session. Use when customer abandons checkout.',
  })
  @ApiParam({ name: 'id', description: 'Checkout session ID' })
  @ApiNoContentResponse({ description: 'Session cancelled successfully' })
  @ApiNotFoundResponse({ description: 'Session not found' })
  @ApiForbiddenResponse({
    description: 'Not authorized to cancel this session',
  })
  async cancelSession(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
  ): Promise<void> {
    return this.checkoutService.cancelSession(
      id,
      customer.sessionId,
      customer.userId,
    );
  }
}
