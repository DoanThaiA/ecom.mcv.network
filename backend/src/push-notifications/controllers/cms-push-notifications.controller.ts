import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PushNotificationsService } from '../push-notifications.service';
import { CreatePushNotificationDto } from '../dto/create-push-notification.dto';
import { UpdatePushNotificationDto } from '../dto/update-push-notification.dto';
import { QueryPushNotificationsDto } from '../dto/query-push-notifications.dto';
import { PushNotification } from '../domain/push-notification';
import { infinityPaginationFromPaginate } from '../../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

/**
 * Controller for push notification CMS endpoints
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.push_notification_management)
@ApiTags('Push Notifications')
@Controller({ path: 'cms/push-notifications', version: '1' })
export class CmsPushNotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  /**
   * Create a new push notification
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new push notification' })
  @ApiCreatedResponse({ type: PushNotification })
  async create(
    @Body() dto: CreatePushNotificationDto,
    @Request() req: any,
  ): Promise<PushNotification> {
    return this.pushNotificationsService.create(dto, req.user?.id);
  }

  /**
   * Get list of push notifications with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of push notifications' })
  @ApiOkResponse({ type: InfinityPaginationResponse(PushNotification) })
  async findAll(
    @Query('filters') filtersString?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<InfinityPaginationResponseDto<PushNotification>> {
    let filters: QueryPushNotificationsDto = {};

    if (filtersString) {
      filters = JSON.parse(filtersString);
    }

    const result = await this.pushNotificationsService.findAll(
      filters,
      page || 1,
      limit || 10,
    );
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get push notification by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get push notification by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: PushNotification })
  @ApiNotFoundResponse({ description: 'Push notification not found' })
  async findOne(@Param('id') id: string): Promise<PushNotification> {
    return this.pushNotificationsService.findOne(id);
  }

  /**
   * Update a draft push notification
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a draft push notification' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: PushNotification })
  @ApiNotFoundResponse({ description: 'Push notification not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePushNotificationDto,
  ): Promise<PushNotification> {
    return this.pushNotificationsService.update(id, dto);
  }

  /**
   * Delete a draft push notification (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft push notification' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Deleted successfully' })
  @ApiNotFoundResponse({ description: 'Push notification not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.pushNotificationsService.remove(id);
  }

  /**
   * Send a draft notification immediately
   */
  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a draft notification immediately' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: PushNotification })
  async send(@Param('id') id: string): Promise<PushNotification> {
    return this.pushNotificationsService.send(id);
  }

  /**
   * Recall a sent notification
   */
  @Post(':id/recall')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recall a sent notification' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: PushNotification })
  async recall(@Param('id') id: string): Promise<PushNotification> {
    return this.pushNotificationsService.recall(id);
  }
}
