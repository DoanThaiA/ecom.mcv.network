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
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ShippingPromotionsService } from './shipping-promotions.service';
import { ShippingPromotion } from './domain/shipping-promotion';
import { CreateShippingPromotionDto } from './dto/create-shipping-promotion.dto';
import { UpdateShippingPromotionDto } from './dto/update-shipping-promotion.dto';
import { QueryShippingPromotionDto } from './dto/query-shipping-promotion.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for shipping promotion endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.shipping_management)
@ApiTags('CMS - Shipping Promotions')
@Controller({ path: 'shipping-promotions', version: '1' })
export class ShippingPromotionsController {
  constructor(
    private readonly shippingPromotionsService: ShippingPromotionsService,
  ) {}

  /**
   * Create a new shipping promotion
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new shipping promotion' })
  @ApiCreatedResponse({
    description: 'Shipping promotion created successfully',
    type: ShippingPromotion,
  })
  async create(
    @Body() dto: CreateShippingPromotionDto,
  ): Promise<ShippingPromotion> {
    return this.shippingPromotionsService.create(dto);
  }

  /**
   * Get list of shipping promotions with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of shipping promotions',
    description:
      'Returns paginated shipping promotions with filtering by type, status, and keyword',
  })
  @ApiOkResponse({
    description: 'List of shipping promotions returned successfully',
    type: InfinityPaginationResponse(ShippingPromotion),
  })
  async findAll(
    @Query() query: QueryShippingPromotionDto,
  ): Promise<InfinityPaginationResponseDto<ShippingPromotion>> {
    const result = await this.shippingPromotionsService.findAll(query);
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get shipping promotion by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get shipping promotion by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Shipping promotion ID',
  })
  @ApiOkResponse({
    description: 'Shipping promotion found',
    type: ShippingPromotion,
  })
  @ApiNotFoundResponse({ description: 'Shipping promotion not found' })
  async findOne(@Param('id') id: string): Promise<ShippingPromotion> {
    return this.shippingPromotionsService.findOne(id);
  }

  /**
   * Update an existing shipping promotion
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a shipping promotion' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Shipping promotion ID',
  })
  @ApiOkResponse({
    description: 'Shipping promotion updated successfully',
    type: ShippingPromotion,
  })
  @ApiNotFoundResponse({ description: 'Shipping promotion not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateShippingPromotionDto,
  ): Promise<ShippingPromotion> {
    return this.shippingPromotionsService.update(id, dto);
  }

  /**
   * Delete a shipping promotion (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shipping promotion' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Shipping promotion ID',
  })
  @ApiNoContentResponse({
    description: 'Shipping promotion deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Shipping promotion not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.shippingPromotionsService.remove(id);
  }

  /**
   * Toggle shipping promotion enabled/disabled status
   */
  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle shipping promotion enabled/disabled status',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Shipping promotion ID',
  })
  @ApiOkResponse({
    description: 'Shipping promotion toggle successful',
    type: ShippingPromotion,
  })
  @ApiNotFoundResponse({ description: 'Shipping promotion not found' })
  async toggleEnabled(@Param('id') id: string): Promise<ShippingPromotion> {
    return this.shippingPromotionsService.toggleEnabled(id);
  }
}
