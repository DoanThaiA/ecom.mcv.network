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
import { PopupAdsService } from '../popup-ads.service';
import { CreatePopupAdsDto } from '../dto/create-popup-ads.dto';
import { UpdatePopupAdsDto } from '../dto/update-popup-ads.dto';
import { QueryPopupAdsDto } from '../dto/query-popup-ads.dto';
import { PopupAds } from '../domain/popup-ads';
import { infinityPaginationFromPaginate } from '../../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

/**
 * Controller for popup ads endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.homepage_management)
@ApiTags('Popup Ads')
@Controller({ path: 'cms/popup-ads', version: '1' })
export class CmsPopupAdsController {
  constructor(private readonly popupAdsService: PopupAdsService) {}

  /**
   * Create a new popup ads
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new popup ads' })
  @ApiCreatedResponse({
    description: 'Popup ads created successfully',
    type: PopupAds,
  })
  async create(@Body() dto: CreatePopupAdsDto): Promise<PopupAds> {
    return this.popupAdsService.create(dto);
  }

  /**
   * Get list of popup ads with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of popup ads',
    description:
      'Returns paginated popup ads with optional filtering by active status',
  })
  @ApiOkResponse({
    description: 'List of popup ads returned successfully',
    type: InfinityPaginationResponse(PopupAds),
  })
  async findAll(
    @Query('filters') filtersString?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<InfinityPaginationResponseDto<PopupAds>> {
    let filters: QueryPopupAdsDto = {};

    if (filtersString) {
      filters = JSON.parse(filtersString);
    } else {
      if (isActive !== undefined) filters.isActive = isActive;
    }

    const result = await this.popupAdsService.findAll(
      filters,
      page || 1,
      limit || 50,
    );
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get popup ads by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get popup ads by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Popup Ads ID' })
  @ApiOkResponse({
    description: 'Popup ads found',
    type: PopupAds,
  })
  @ApiNotFoundResponse({ description: 'Popup ads not found' })
  async findOne(@Param('id') id: string): Promise<PopupAds> {
    return this.popupAdsService.findOne(id);
  }

  /**
   * Update an existing popup ads
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a popup ads' })
  @ApiParam({ name: 'id', type: String, description: 'Popup Ads ID' })
  @ApiOkResponse({
    description: 'Popup ads updated successfully',
    type: PopupAds,
  })
  @ApiNotFoundResponse({ description: 'Popup ads not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePopupAdsDto,
  ): Promise<PopupAds> {
    return this.popupAdsService.update(id, dto);
  }

  /**
   * Delete a popup ads (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a popup ads' })
  @ApiParam({ name: 'id', type: String, description: 'Popup Ads ID' })
  @ApiNoContentResponse({ description: 'Popup ads deleted successfully' })
  @ApiNotFoundResponse({ description: 'Popup ads not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.popupAdsService.remove(id);
  }
}
