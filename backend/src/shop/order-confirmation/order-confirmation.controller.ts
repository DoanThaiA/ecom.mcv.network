import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrderConfirmationService } from './order-confirmation.service';
import { Order } from '../order/domain/order';

/**
 * Public controller for order confirmation via SMS/ZNS links
 * No authentication required
 */
@ApiTags('Shop - Orders')
@Controller({ path: 'shop/orders', version: '1' })
export class OrderConfirmationController {
  constructor(
    private readonly orderConfirmationService: OrderConfirmationService,
  ) {}

  /**
   * Get order by confirmation token from SMS/ZNS link
   * Token is HMAC-signed containing orderId - no other auth required
   */
  @Get('by-token/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order by confirmation token',
    description:
      'Returns order details using HMAC token from SMS/ZNS link. No authentication required - the token itself serves as authentication.',
  })
  @ApiParam({
    name: 'token',
    type: String,
    description: 'HMAC confirmation token from SMS/ZNS link',
  })
  @ApiOkResponse({
    description: 'Order found',
    type: Order,
  })
  @ApiNotFoundResponse({ description: 'Invalid or expired token' })
  async getOrderByToken(@Param('token') token: string): Promise<Order> {
    return this.orderConfirmationService.getOrderByToken(token);
  }
}
