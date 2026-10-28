import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PushNotificationsService } from '../push-notifications.service';

/**
 * Controller for shop notification endpoints (authenticated users)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Shop - Notifications')
@Controller({ path: 'shop/notifications', version: '1' })
export class ShopPushNotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  /**
   * Get user's notifications (paginated)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get user's notifications" })
  @ApiOkResponse({ description: 'Notifications returned successfully' })
  async findAll(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pushNotificationsService.findUserNotifications(
      req.user.id,
      page || 1,
      limit || 10,
    );
  }

  /**
   * Get unread notification count
   */
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiOkResponse({ description: 'Unread count returned' })
  async getUnreadCount(@Request() req: any): Promise<{ count: number }> {
    const count = await this.pushNotificationsService.getUnreadCount(
      req.user.id,
    );
    return { count };
  }

  /**
   * Mark a notification as read
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', type: String, description: 'Notification ID' })
  async markAsRead(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.pushNotificationsService.markAsRead(req.user.id, id);
    return { success: true };
  }

  /**
   * Mark all notifications as read
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req: any): Promise<{ success: boolean }> {
    await this.pushNotificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }
}
