import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './domain/audit-log';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for audit log endpoints
 * Restricted to CMS admin users (owner permission)
 */
@ApiBearerAuth()
@RequireModulePermission(ModulePermission.settings)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('Audit Logs')
@Controller({ path: 'audit-logs', version: '1' })
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Get list of audit logs with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of audit logs' })
  @ApiOkResponse({
    description: 'List of audit logs returned successfully',
    type: InfinityPaginationResponse(AuditLog),
  })
  async findAll(
    @Query() query: QueryAuditLogDto,
  ): Promise<InfinityPaginationResponseDto<AuditLog>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 20;
    if (limit > 100) {
      limit = 100;
    }

    const result = await this.auditLogService.findManyWithPagination({
      filterOptions: query?.filters,
      paginationOptions: {
        page,
        limit,
      },
    });

    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get audit log by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Audit log ID' })
  @ApiOkResponse({
    description: 'Audit log found',
    type: AuditLog,
  })
  @ApiNotFoundResponse({ description: 'Audit log not found' })
  async findOne(@Param('id') id: string): Promise<AuditLog | null> {
    return this.auditLogService.findById(id);
  }

  /**
   * Get audit logs by user ID
   */
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit logs by user ID' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiOkResponse({
    description: 'Audit logs for user returned successfully',
    type: InfinityPaginationResponse(AuditLog),
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query() query: QueryAuditLogDto,
  ): Promise<InfinityPaginationResponseDto<AuditLog>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 20;
    if (limit > 100) {
      limit = 100;
    }

    const result = await this.auditLogService.findByUserId(userId, {
      page,
      limit,
    });

    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get audit logs by action
   */
  @Get('action/:action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit logs by action' })
  @ApiParam({ name: 'action', type: String, description: 'Action identifier' })
  @ApiOkResponse({
    description: 'Audit logs for action returned successfully',
    type: InfinityPaginationResponse(AuditLog),
  })
  async findByAction(
    @Param('action') action: string,
    @Query() query: QueryAuditLogDto,
  ): Promise<InfinityPaginationResponseDto<AuditLog>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 20;
    if (limit > 100) {
      limit = 100;
    }

    const result = await this.auditLogService.findByAction(action, {
      page,
      limit,
    });

    return infinityPaginationFromPaginate(result);
  }
}
