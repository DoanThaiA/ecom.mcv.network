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
  ApiQuery,
  ApiBearerAuth,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ColorVariantsService } from '../color-variants.service';
import { CreateColorVariantDto } from '../dto/create-color-variant.dto';
import { UpdateColorVariantDto } from '../dto/update-color-variant.dto';
import { QueryColorVariantsDto } from '../dto/query-color-variants.dto';
import { ColorVariant } from '../domain/color-variant';
import { infinityPaginationFromPaginate } from '../../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

/**
 * Controller for color variant endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.product_management)
@ApiTags('CMS - Color Variants')
@Controller({ path: 'cms/color-variants', version: '1' })
export class CmsColorVariantsController {
  constructor(private readonly colorVariantsService: ColorVariantsService) {}

  /**
   * Create a new color variant
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new color variant' })
  @ApiCreatedResponse({
    description: 'Color variant created successfully',
    type: ColorVariant,
  })
  @ApiConflictResponse({
    description: 'Color variant with this name already exists',
  })
  async create(@Body() dto: CreateColorVariantDto): Promise<ColorVariant> {
    return this.colorVariantsService.create(dto);
  }

  /**
   * Get list of color variants with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of color variants',
    description:
      'Returns paginated color variants with filtering by display type and name',
  })
  @ApiOkResponse({
    description: 'List of color variants returned successfully',
    type: InfinityPaginationResponse(ColorVariant),
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description: 'JSON string of filters',
  })
  @ApiQuery({
    name: 'displayType',
    required: false,
    type: Number,
    description: 'Filter by display type (1-6)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Search by name (case-insensitive)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 50)',
  })
  async findAll(
    @Query('filters') filtersString?: string,
    @Query('displayType') displayType?: number,
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<InfinityPaginationResponseDto<ColorVariant>> {
    // Parse filters from JSON string or use direct query params
    let filters: QueryColorVariantsDto = {};

    if (filtersString) {
      // If filters JSON string is provided, parse it
      filters = JSON.parse(filtersString);
    } else {
      // Otherwise use direct query params
      if (displayType !== undefined) filters.displayType = displayType;
      if (name !== undefined) filters.name = name;
    }

    const result = await this.colorVariantsService.findAll(
      filters,
      page || 1,
      limit || 50,
    );
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get color variant by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get color variant by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Color variant ID' })
  @ApiOkResponse({
    description: 'Color variant found',
    type: ColorVariant,
  })
  @ApiNotFoundResponse({ description: 'Color variant not found' })
  async findOne(@Param('id') id: string): Promise<ColorVariant> {
    return this.colorVariantsService.findOne(id);
  }

  /**
   * Update an existing color variant
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a color variant' })
  @ApiParam({ name: 'id', type: String, description: 'Color variant ID' })
  @ApiOkResponse({
    description: 'Color variant updated successfully',
    type: ColorVariant,
  })
  @ApiNotFoundResponse({ description: 'Color variant not found' })
  @ApiConflictResponse({
    description: 'Color variant with this name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateColorVariantDto,
  ): Promise<ColorVariant> {
    return this.colorVariantsService.update(id, dto);
  }

  /**
   * Delete a color variant (hard delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a color variant' })
  @ApiParam({ name: 'id', type: String, description: 'Color variant ID' })
  @ApiNoContentResponse({ description: 'Color variant deleted successfully' })
  @ApiNotFoundResponse({ description: 'Color variant not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.colorVariantsService.remove(id);
  }
}
