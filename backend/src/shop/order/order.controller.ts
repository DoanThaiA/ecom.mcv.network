import {
  Controller,
  Get,
  Post,
  Patch,
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
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiHeader,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaginateResult } from 'mongoose';
import { OrderService } from './order.service';
import { Order } from './domain/order';
import {
  LookupOrderDto,
  CancelOrderDto,
  ShopOrdersQueryDto,
} from './dto/order.dto';
import {
  UpdatePaymentDto,
  UpdatePaymentResponseDto,
} from './dto/update-payment.dto';
import { ShopAuthGuard, ShopCustomer } from '../guards/shop-auth.guard';
import { Customer, ClientIp } from '../decorators/shop-customer.decorator';

/**
 * Order controller for shop order operations
 * Supports both guest (session-based) and authenticated users
 *
 * Note: Order creation is handled through the checkout flow only.
 * Use POST /shop/checkout/:id/place-order to create orders.
 */
@ApiTags('Shop - Orders')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-session-id',
  description:
    'Session ID for guest identification (required if not authenticated)',
  required: false,
})
@UseGuards(ShopAuthGuard)
@Controller({ path: 'shop/orders', version: '1' })
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Get order by order number
   * Verifies ownership by session ID or user ID
   */
  @Get('number/:orderNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order by order number',
    description:
      'Returns order details by order number. Only returns order if it belongs to the current user/session.',
  })
  @ApiParam({
    name: 'orderNumber',
    type: String,
    description: 'Order number',
  })
  @ApiOkResponse({
    description: 'Order found',
    type: Order,
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async getOrderByNumber(
    @Customer() customer: ShopCustomer,
    @Param('orderNumber') orderNumber: string,
  ): Promise<Order> {
    return this.orderService.getByOrderNumberWithOwnership(
      orderNumber,
      customer.sessionId,
      customer.userId,
    );
  }

  /**
   * Get order by ID
   * Verifies ownership by session ID or user ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Returns order details by ID. Only returns order if it belongs to the current user/session.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiOkResponse({
    description: 'Order found',
    type: Order,
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async getOrder(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
  ): Promise<Order> {
    return this.orderService.getByIdWithOwnership(
      id,
      customer.sessionId,
      customer.userId,
    );
  }

  /**
   * Get orders for current user/session with pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get orders for current user/session',
    description:
      'Returns paginated orders for the current user (if authenticated) or session (if guest).',
  })
  @ApiOkResponse({
    description: 'Orders returned successfully',
  })
  async getOrders(
    @Customer() customer: ShopCustomer,
    @Query() query: ShopOrdersQueryDto,
  ): Promise<PaginateResult<Order>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    if (customer.userId) {
      return this.orderService.getByUserIdPaginated(
        customer.userId,
        page,
        limit,
      );
    }
    return this.orderService.getBySessionIdPaginated(
      customer.sessionId,
      page,
      limit,
    );
  }

  /**
   * Lookup order (guest) - no guard needed
   */
  @Post('lookup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lookup order by order number and phone',
    description:
      'Allows guests to lookup their order using order number and phone number.',
  })
  @ApiOkResponse({
    description: 'Order found',
    type: Order,
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async lookupOrder(@Body() dto: LookupOrderDto): Promise<Order> {
    return this.orderService.lookupOrder(dto.orderNumber, dto.phone);
  }

  /**
   * Cancel order (by customer)
   */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel order',
    description:
      'Cancels an order. Only pending or confirmed orders can be cancelled.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiOkResponse({
    description: 'Order cancelled successfully',
    type: Order,
  })
  @ApiBadRequestResponse({ description: 'Order cannot be cancelled' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async cancelOrder(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<Order> {
    return this.orderService.cancelOrder(
      id,
      customer.sessionId,
      dto.reason,
      customer.userId,
    );
  }

  /**
   * Update payment method (retry or change payment)
   */
  @Patch(':id/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update payment method',
    description:
      'Updates the payment method on an order. Use this to retry payment or switch to a different payment method. Only works for orders with PENDING or FAILED payment status.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiOkResponse({
    description: 'Payment method updated successfully',
    type: UpdatePaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payment already processed or order status invalid',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async updatePayment(
    @Customer() customer: ShopCustomer,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @ClientIp() clientIp: string,
  ): Promise<UpdatePaymentResponseDto> {
    return this.orderService.updatePaymentMethod(
      id,
      customer.sessionId,
      customer.userId,
      dto.paymentMethod,
      clientIp,
    );
  }
}
