import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PromotionsService } from './promotions.service';
import { PromotionStatsService } from './promotion-stats.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { QueryPromotionDto } from './dto/query-promotion.dto';
import { QueryPromotionStatsDto } from './dto/query-promotion-stats.dto';
import { PromotionWithStatus } from './domain/promotion';
import {
  ValidateProductDiscountExcelFileDto,
  ValidateProductDiscountExcelResponseDto,
} from './dto/validate-excel-products.dto';
import { CreatePromotionProductDto } from './dto/create-promotion-product.dto';
import {
  BulkAddPromotionProductsDto,
  BulkAddPromotionProductsResponseDto,
} from './dto/bulk-add-promotion-products.dto';
import { UpdatePromotionProductDto } from './dto/update-promotion-product.dto';
import { BulkUpdatePromotionProductsDto } from './dto/bulk-update-promotion-products.dto';
import { QueryPromotionProductsDto } from './dto/query-promotion-products.dto';
import { PromotionProduct } from '../promotion-products/domain/promotion-product';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.promotion_management)
@ApiTags('CMS - Promotions')
@Controller({
  path: 'promotions',
  version: '1',
})
export class PromotionsController {
  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly promotionStatsService: PromotionStatsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiCreatedResponse({ type: PromotionWithStatus })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreatePromotionDto,
  ): Promise<PromotionWithStatus> {
    return this.promotionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all promotions with pagination and filters' })
  @ApiOkResponse({ description: 'Paginated list of promotions' })
  async findAll(@Query() query: QueryPromotionDto) {
    return this.promotionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by ID' })
  @ApiOkResponse({ type: PromotionWithStatus })
  async findById(@Param('id') id: string): Promise<PromotionWithStatus | null> {
    return this.promotionsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promotion' })
  @ApiOkResponse({ type: PromotionWithStatus })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePromotionDto,
  ): Promise<PromotionWithStatus | null> {
    return this.promotionsService.update(id, updateDto);
  }

  @Patch(':id/pause')
  @ApiOperation({ summary: 'Pause active/upcoming promotion' })
  @ApiOkResponse({ type: PromotionWithStatus })
  async pause(@Param('id') id: string): Promise<PromotionWithStatus | null> {
    return this.promotionsService.pause(id);
  }

  @Patch(':id/resume')
  @ApiOperation({ summary: 'Resume paused promotion' })
  @ApiOkResponse({ type: PromotionWithStatus })
  async resume(@Param('id') id: string): Promise<PromotionWithStatus | null> {
    return this.promotionsService.resume(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete promotion' })
  @ApiNoContentResponse({ description: 'Promotion deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.promotionsService.delete(id);
  }

  @Post('validate-products')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Validate products from Excel file for product discount',
    description:
      'Upload Excel file (.xlsx) with product data. Backend parses and validates each product.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'startTime', 'endTime'],
      properties: {
        file: { type: 'string', format: 'binary' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
        promotionId: { type: 'string', description: 'Optional, for edit mode' },
      },
    },
  })
  @ApiOkResponse({
    type: ValidateProductDiscountExcelResponseDto,
    description: 'Validation results with valid and invalid products',
  })
  async validateExcelProducts(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ValidateProductDiscountExcelFileDto,
  ): Promise<ValidateProductDiscountExcelResponseDto> {
    return this.promotionsService.validateExcelProducts(file, dto);
  }

  // ==================== Promotion Products Endpoints ====================

  @Post(':id/products')
  @ApiOperation({
    summary: 'Add a single product to a product discount promotion',
  })
  @ApiCreatedResponse({ type: PromotionProduct })
  @HttpCode(HttpStatus.CREATED)
  async addProduct(
    @Param('id') id: string,
    @Body() dto: CreatePromotionProductDto,
  ): Promise<PromotionProduct> {
    return this.promotionsService.addPromotionProduct(id, dto);
  }

  @Post(':id/products/bulk')
  @ApiOperation({
    summary: 'Bulk add products to a product discount promotion',
  })
  @ApiOkResponse({ type: BulkAddPromotionProductsResponseDto })
  @HttpCode(HttpStatus.OK)
  async bulkAddProducts(
    @Param('id') id: string,
    @Body() dto: BulkAddPromotionProductsDto,
  ): Promise<BulkAddPromotionProductsResponseDto> {
    return this.promotionsService.bulkAddPromotionProducts(id, dto);
  }

  @Get(':id/products/product-ids')
  @ApiOperation({
    summary: 'Get all product IDs for a promotion (no pagination)',
  })
  @ApiOkResponse({ description: 'Array of product IDs' })
  async getProductIds(
    @Param('id') id: string,
  ): Promise<{ productIds: string[] }> {
    const productIds = await this.promotionsService.getPromotionProductIds(id);
    return { productIds };
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get paginated products for a promotion' })
  @ApiOkResponse({ description: 'Paginated list of promotion products' })
  async getProducts(
    @Param('id') id: string,
    @Query() query: QueryPromotionProductsDto,
  ) {
    return this.promotionsService.getPromotionProducts(id, query);
  }

  @Patch(':id/products/bulk')
  @ApiOperation({ summary: 'Bulk update products in a promotion' })
  @ApiOkResponse({ description: 'Number of products updated' })
  async bulkUpdateProducts(
    @Param('id') id: string,
    @Body() dto: BulkUpdatePromotionProductsDto,
  ): Promise<{ updatedCount: number }> {
    return this.promotionsService.bulkUpdatePromotionProducts(id, dto);
  }

  @Patch(':id/products/:productId')
  @ApiOperation({ summary: 'Update a product in a promotion' })
  @ApiOkResponse({ type: PromotionProduct })
  async updateProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() dto: UpdatePromotionProductDto,
  ): Promise<PromotionProduct> {
    return this.promotionsService.updatePromotionProduct(id, productId, dto);
  }

  @Delete(':id/products/:productId')
  @ApiOperation({ summary: 'Remove a product from a promotion' })
  @ApiNoContentResponse({ description: 'Product removed' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ): Promise<void> {
    await this.promotionsService.removePromotionProduct(id, productId);
  }

  @Patch(':id/products/:productId/toggle')
  @ApiOperation({ summary: 'Toggle product enabled/disabled in promotion' })
  @ApiOkResponse({ type: PromotionProduct })
  async toggleProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ): Promise<PromotionProduct> {
    return this.promotionsService.togglePromotionProduct(id, productId);
  }

  // ==================== Promotion Statistics Endpoints ====================

  @Get(':id/stats/orders')
  @ApiOperation({ summary: 'Get orders associated with a promotion' })
  @ApiOkResponse({ description: 'Paginated orders with summary totals' })
  async getPromotionOrders(
    @Param('id') id: string,
    @Query() query: QueryPromotionStatsDto,
  ) {
    return this.promotionStatsService.getPromotionOrders(id, query);
  }

  @Get(':id/stats/products')
  @ApiOperation({ summary: 'Get product statistics for a promotion' })
  @ApiOkResponse({ description: 'Product stats with summary totals' })
  async getPromotionProductStats(
    @Param('id') id: string,
    @Query() query: QueryPromotionStatsDto,
  ) {
    return this.promotionStatsService.getPromotionProductStats(id, query);
  }
}
