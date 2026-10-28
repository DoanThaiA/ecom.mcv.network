import {
  Controller,
  Get,
  Post,
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
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { OrderNhanhSyncService } from '../../nhanh/services/order-nhanh-sync.service';
import { Order } from './domain/order';
import { QueryOrderDto } from './dto/order.dto';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../../utils/dto/infinity-pagination-response.dto';
import { infinityPaginationFromPaginate } from '../../utils/infinity-pagination';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

/**
 * CMS Order controller for admin order management (read-only)
 * All order updates are synced via webhook from nhanh.vn
 * All actions require CMS authentication
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.order_management)
@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
export class CmsOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderNhanhSyncService: OrderNhanhSyncService,
  ) {}

  /**
   * Get orders with pagination and filters
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all orders',
    description:
      'Returns paginated list of orders with optional filters and sorting.',
  })
  @ApiOkResponse({
    description: 'Orders returned successfully',
    type: InfinityPaginationResponse(Order),
  })
  async getOrders(
    @Query() query: QueryOrderDto,
  ): Promise<InfinityPaginationResponseDto<Order>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const result = await this.orderService.getOrders({
      ...query,
      page,
      limit,
    });

    return infinityPaginationFromPaginate(result);
  }

  /**
   * Count orders not yet synced to Nhanh.vn
   */
  @Get('nhanh-sync/count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Count orders not synced to Nhanh.vn',
    description:
      'Returns the number of orders that do not have a nhanh.orderId yet (sync pending or failed).',
  })
  @ApiOkResponse({
    description: 'Count returned successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  async countUnsyncedToNhanh(): Promise<{ count: number }> {
    const count = await this.orderService.countUnsyncedToNhanh();
    return { count };
  }

  /**
   * Get order by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Returns detailed order information by ID.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiOkResponse({
    description: 'Order found',
    type: Order,
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async getOrder(@Param('id') id: string): Promise<Order> {
    return this.orderService.getById(id);
  }

  /**
   * Sync order to Nhanh.vn (retry for failed syncs)
   */
  @Post(':id/sync-nhanh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync order to Nhanh.vn',
    description:
      'Manually trigger sync of an order to Nhanh.vn. Use this to retry failed syncs.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiOkResponse({
    description: 'Sync result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        nhanhOrderId: { type: 'number', nullable: true },
        trackingUrl: { type: 'string', nullable: true },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async syncToNhanh(@Param('id') id: string): Promise<{
    success: boolean;
    nhanhOrderId: number | null;
    trackingUrl: string | null;
    error: string | null;
  }> {
    const order = await this.orderService.getById(id);
    return this.orderNhanhSyncService.syncOrder(order);
  }
}
