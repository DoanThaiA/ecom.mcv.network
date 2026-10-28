import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BannersService } from '../banners.service';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { QueryBannersDto } from '../dto/query-banners.dto';
import { ReorderBannersDto } from '../dto/reorder-banners.dto';
import { Banner } from '../domain/banner';
import { infinityPaginationFromPaginate } from '../../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

/**
 * Controller for banner endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.homepage_management)
@ApiTags('Banners')
@Controller({ path: 'cms/banners', version: '1' })
export class CmsBannersController {
  constructor(private readonly bannersService: BannersService) {}

  /**
   * Create a new banner
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiCreatedResponse({
    description: 'Banner created successfully',
    type: Banner,
  })
  async create(@Body() dto: CreateBannerDto): Promise<Banner> {
    return this.bannersService.create(dto);
  }

  /**
   * Get list of banners with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of banners',
    description:
      'Returns paginated banners with filtering by position and active status',
  })
  @ApiOkResponse({
    description: 'List of banners returned successfully',
    type: InfinityPaginationResponse(Banner),
  })
  async findAll(
    @Query('filters') filtersString?: string,
    @Query('position') position?: number,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<InfinityPaginationResponseDto<Banner>> {
    // Parse filters from JSON string or use direct query params
    let filters: QueryBannersDto = {};

    if (filtersString) {
      // If filters JSON string is provided, parse it
      filters = JSON.parse(filtersString);
    } else {
      // Otherwise use direct query params
      if (position !== undefined) filters.position = position;
      if (isActive !== undefined) filters.isActive = isActive;
    }

    const result = await this.bannersService.findAll(
      filters,
      page || 1,
      limit || 50,
    );
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get banner by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get banner by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Banner ID' })
  @ApiOkResponse({
    description: 'Banner found',
    type: Banner,
  })
  @ApiNotFoundResponse({ description: 'Banner not found' })
  async findOne(@Param('id') id: string): Promise<Banner> {
    return this.bannersService.findOne(id);
  }

  /**
   * Update an existing banner
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a banner' })
  @ApiParam({ name: 'id', type: String, description: 'Banner ID' })
  @ApiOkResponse({
    description: 'Banner updated successfully',
    type: Banner,
  })
  @ApiNotFoundResponse({ description: 'Banner not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
  ): Promise<Banner> {
    return this.bannersService.update(id, dto);
  }

  /**
   * Delete a banner (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a banner' })
  @ApiParam({ name: 'id', type: String, description: 'Banner ID' })
  @ApiNoContentResponse({ description: 'Banner deleted successfully' })
  @ApiNotFoundResponse({ description: 'Banner not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.bannersService.remove(id);
  }

  /**
   * Reorder banners (bulk update order)
   */
  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Reorder banners',
    description: 'Bulk update banner display order',
  })
  @ApiNoContentResponse({ description: 'Banners reordered successfully' })
  async reorder(@Body() dto: ReorderBannersDto): Promise<void> {
    return this.bannersService.reorder(dto);
  }
}
