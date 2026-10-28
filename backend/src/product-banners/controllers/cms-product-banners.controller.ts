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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductBannersService } from '../product-banners.service';
import { CreateProductBannerDto } from '../dto/create-product-banner.dto';
import { UpdateProductBannerDto } from '../dto/update-product-banner.dto';
import { QueryProductBannersDto } from '../dto/query-product-banners.dto';
import {
  AssignProductsDto,
  RemoveBannerProductsDto,
} from '../dto/assign-products.dto';
import { ProductBanner } from '../domain/product-banner';
import { infinityPaginationFromPaginate } from '../../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

/**
 * Controller for product banner endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.product_management)
@ApiTags('Product Banners')
@Controller({ path: 'cms/product-banners', version: '1' })
export class CmsProductBannersController {
  constructor(private readonly productBannersService: ProductBannersService) {}

  /**
   * Create a new product banner
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product banner' })
  @ApiCreatedResponse({
    description: 'Product banner created successfully',
    type: ProductBanner,
  })
  async create(@Body() dto: CreateProductBannerDto): Promise<ProductBanner> {
    return this.productBannersService.create(dto);
  }

  /**
   * Get list of banners with pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of product banners',
    description:
      'Returns paginated product banners with filtering by active status',
  })
  @ApiOkResponse({
    description: 'List of product banners returned successfully',
    type: InfinityPaginationResponse(ProductBanner),
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: String,
    description:
      'JSON string with filters: {"search": "name", "isActive": true}',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status (alternative to filters param)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  async findAll(
    @Query('filters') filtersString?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<InfinityPaginationResponseDto<ProductBanner>> {
    // Parse filters from JSON string or use direct query params
    let filters: QueryProductBannersDto = {};

    if (filtersString) {
      // If filters JSON string is provided, parse it
      filters = JSON.parse(filtersString);
    } else {
      // Otherwise use direct query params
      if (isActive !== undefined) filters.isActive = isActive;
    }

    const result = await this.productBannersService.findAll(
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
  @ApiOperation({ summary: 'Get product banner by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Product Banner ID' })
  @ApiOkResponse({
    description: 'Product banner found',
    type: ProductBanner,
  })
  @ApiNotFoundResponse({ description: 'Product banner not found' })
  async findOne(@Param('id') id: string): Promise<ProductBanner> {
    return this.productBannersService.findOne(id);
  }

  /**
   * Update product banner
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product banner' })
  @ApiParam({ name: 'id', type: String, description: 'Product Banner ID' })
  @ApiOkResponse({
    description: 'Product banner updated successfully',
    type: ProductBanner,
  })
  @ApiNotFoundResponse({ description: 'Product banner not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductBannerDto,
  ): Promise<ProductBanner> {
    return this.productBannersService.update(id, dto);
  }

  /**
   * Delete product banner (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product banner' })
  @ApiParam({ name: 'id', type: String, description: 'Product Banner ID' })
  @ApiNoContentResponse({ description: 'Product banner deleted successfully' })
  @ApiNotFoundResponse({ description: 'Product banner not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productBannersService.remove(id);
  }

  /**
   * Assign products to banner
   */
  @Post(':id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign products to a banner',
    description:
      'Add products to the banner. Products already assigned will be skipped.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product Banner ID' })
  @ApiOkResponse({
    description: 'Products assigned successfully',
    type: ProductBanner,
  })
  @ApiNotFoundResponse({ description: 'Product banner not found' })
  async assignProducts(
    @Param('id') id: string,
    @Body() dto: AssignProductsDto,
  ): Promise<ProductBanner> {
    return this.productBannersService.assignProducts(id, dto.productIds);
  }

  /**
   * Remove products from banner
   */
  @Delete(':id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove products from a banner',
    description: 'Remove specified products from the banner.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product Banner ID' })
  @ApiOkResponse({
    description: 'Products removed successfully',
    type: ProductBanner,
  })
  @ApiNotFoundResponse({ description: 'Product banner not found' })
  async removeProducts(
    @Param('id') id: string,
    @Body() dto: RemoveBannerProductsDto,
  ): Promise<ProductBanner> {
    return this.productBannersService.unassignProducts(id, dto.productIds);
  }
}
