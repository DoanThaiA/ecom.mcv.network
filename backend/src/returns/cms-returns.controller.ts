import {
  Controller,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReturnsService } from './returns.service';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';
import { QueryReturnRequestDto } from './dto/query-return-request.dto';
import { ReturnRequest } from './domain/return-request';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * CMS controller for admin return request management
 */
@ApiTags('CMS - Returns')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.return_management)
@Controller({ path: 'return-requests', version: '1' })
export class CmsReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  /**
   * Get all return requests with filters
   */
  @Get()
  @ApiOperation({ summary: 'Get all return requests (CMS)' })
  @ApiResponse({ status: 200 })
  async getReturnRequests(@Query() query: QueryReturnRequestDto) {
    const result = await this.returnsService.getReturnRequests(query);
    return {
      data: result.docs,
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get return request by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get return request by ID' })
  @ApiResponse({ status: 200, type: ReturnRequest })
  async getReturnRequestById(@Param('id') id: string): Promise<ReturnRequest> {
    return this.returnsService.getReturnRequestById(id);
  }

  /**
   * Update return request status
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update return request' })
  @ApiResponse({ status: 200, type: ReturnRequest })
  async updateReturnRequest(
    @Param('id') id: string,
    @Body() dto: UpdateReturnRequestDto,
  ): Promise<ReturnRequest> {
    return this.returnsService.updateReturnRequest(id, dto);
  }

  /**
   * Delete return request
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete return request' })
  async deleteReturnRequest(@Param('id') id: string): Promise<void> {
    return this.returnsService.deleteReturnRequest(id);
  }
}
