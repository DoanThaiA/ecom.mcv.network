import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
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
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FlashSalesService } from './flash-sales.service';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { QueryFlashSaleDto } from './dto/query-flash-sale.dto';
import { CreateFlashSaleProductDto } from './dto/create-flash-sale-product.dto';
import { UpdateFlashSaleProductDto } from './dto/update-flash-sale-product.dto';
import { BulkAddFlashSaleProductsDto } from './dto/bulk-add-flash-sale-products.dto';
import { BulkAddFlashSaleProductsResponseDto } from './dto/bulk-add-flash-sale-products-response.dto';
import { BulkUpdateFlashSaleProductsDto } from './dto/bulk-update-flash-sale-products.dto';
import { BulkUpsertFlashSaleProductsDto } from './dto/bulk-upsert-flash-sale-products.dto';
import { BulkUpsertFlashSaleProductsResponseDto } from './dto/bulk-upsert-flash-sale-products-response.dto';
import { BulkRemoveFlashSaleProductsDto } from './dto/bulk-remove-flash-sale-products.dto';
import {
  ValidateExcelFileDto,
  ValidateExcelProductsResponseDto,
} from './dto/validate-excel-products.dto';
import {
  FlashSaleResponseDto,
  FlashSaleListItemResponseDto,
} from './dto/flash-sale-response.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';
import { QueryFlashSaleProductsDto } from './dto/query-flash-sale-products.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for flash sale endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.flash_sale_management)
@ApiTags('Flash Sales')
@Controller({ path: 'flash-sales', version: '1' })
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  /**
   * Create a new flash sale campaign
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new flash sale campaign' })
  @ApiCreatedResponse({
    description: 'Flash sale created successfully',
    type: FlashSaleResponseDto,
  })
  async create(@Body() dto: CreateFlashSaleDto): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.create(dto);
  }

  /**
   * Get list of flash sales with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of flash sales',
    description:
      'Returns paginated flash sales with filtering by status (active, upcoming, ended, disabled) and sorting options',
  })
  @ApiOkResponse({
    description: 'List of flash sales returned successfully',
    type: InfinityPaginationResponse(FlashSaleListItemResponseDto),
  })
  async findAll(
    @Query() query: QueryFlashSaleDto,
  ): Promise<InfinityPaginationResponseDto<FlashSaleListItemResponseDto>> {
    const result = await this.flashSalesService.findAll(query);
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get all product IDs and their order for a flash sale (no pagination)
   */
  @Get(':id/product-ids')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all product IDs and order for a flash sale',
    description:
      'Returns all product IDs and their display order for a flash sale without pagination.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiOkResponse({
    description: 'Product IDs and order returned successfully',
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async getProductIds(
    @Param('id') id: string,
  ): Promise<{ products: Array<{ productId: string; order: number }> }> {
    const products = await this.flashSalesService.getProductIdsAndOrder(id);
    return { products };
  }

  /**
   * Get flash sale by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get flash sale by ID',
    description:
      'Returns flash sale details with paginated products. Supports optional product filtering and sorting.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiOkResponse({
    description: 'Flash sale found',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async findOne(
    @Param('id') id: string,
    @Query() query: QueryFlashSaleProductsDto,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.findOne(id, query);
  }

  /**
   * Update an existing flash sale
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a flash sale campaign' })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiOkResponse({
    description: 'Flash sale updated successfully',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFlashSaleDto,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.update(id, dto);
  }

  /**
   * Delete a flash sale (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a flash sale campaign' })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiNoContentResponse({ description: 'Flash sale deleted successfully' })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.flashSalesService.remove(id);
  }

  /**
   * Toggle flash sale enabled/disabled status
   */
  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle flash sale enabled/disabled status' })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiOkResponse({
    description: 'Flash sale toggle successful',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async toggleEnabled(@Param('id') id: string): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.toggleEnabled(id);
  }

  // ============== Product Management Endpoints ==============

  /**
   * Add a product to a flash sale
   */
  @Post(':id/products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a product to a flash sale' })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiCreatedResponse({
    description: 'Product added to flash sale successfully',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async addProduct(
    @Param('id') id: string,
    @Body() dto: CreateFlashSaleProductDto,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.addProduct(id, dto);
  }

  /**
   * Bulk add products to a flash sale
   * Supports partial success — returns added/failed counts with error details
   */
  @Post(':id/products/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk add products to a flash sale',
    description:
      'Add multiple products to a flash sale at once. Supports partial success: valid products are added while invalid ones are reported in the errors field.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiCreatedResponse({
    description: 'Bulk add result with added/failed counts',
    type: BulkAddFlashSaleProductsResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async bulkAddProducts(
    @Param('id') id: string,
    @Body() dto: BulkAddFlashSaleProductsDto,
  ): Promise<BulkAddFlashSaleProductsResponseDto> {
    return this.flashSalesService.bulkAddProducts(id, dto);
  }

  /**
   * Bulk upsert products in a flash sale (add new + update existing)
   */
  @Put(':id/products/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk upsert products in a flash sale',
    description:
      'Add new products and update existing products in a flash sale in a single call. New products are validated for stock, images, and conflicts. Existing products skip these checks and preserve their sold count.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiOkResponse({
    description: 'Bulk upsert result with added/updated/failed counts',
    type: BulkUpsertFlashSaleProductsResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async bulkUpsertProducts(
    @Param('id') id: string,
    @Body() dto: BulkUpsertFlashSaleProductsDto,
  ): Promise<BulkUpsertFlashSaleProductsResponseDto> {
    return this.flashSalesService.bulkUpsertProducts(id, dto);
  }

  /**
   * Update a product in a flash sale
   */
  @Patch(':id/products/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product in a flash sale' })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale or product not found' })
  async updateProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateFlashSaleProductDto,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.updateProduct(id, productId, dto);
  }

  /**
   * Bulk remove products from a flash sale
   */
  @Delete(':id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk remove products from a flash sale' })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiOkResponse({
    description: 'Products removed from flash sale successfully',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async bulkRemoveProducts(
    @Param('id') id: string,
    @Body() dto: BulkRemoveFlashSaleProductsDto,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.bulkRemoveProducts(id, dto);
  }

  /**
   * Remove a product from a flash sale
   */
  @Delete(':id/products/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a product from a flash sale' })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product removed from flash sale successfully',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale or product not found' })
  async removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.removeProduct(id, productId);
  }

  /**
   * Toggle a product's enabled/disabled status in a flash sale
   */
  @Patch(':id/products/:productId/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Toggle a product's enabled/disabled status in a flash sale",
  })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product toggle successful',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale or product not found' })
  async toggleProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.toggleProduct(id, productId);
  }

  /**
   * Bulk update products in a flash sale
   */
  @Patch(':id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update products in a flash sale',
    description:
      'Update multiple products in a flash sale at once. Only products that already exist in the flash sale can be updated.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiOkResponse({
    description: 'Products updated successfully',
    type: FlashSaleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Flash sale not found' })
  async bulkUpdateProducts(
    @Param('id') id: string,
    @Body() dto: BulkUpdateFlashSaleProductsDto,
  ): Promise<FlashSaleResponseDto> {
    return this.flashSalesService.bulkUpdateProducts(id, dto);
  }

  /**
   * Validate products from Excel file upload
   * Parses Excel file and validates products for flash sale
   */
  @Post('validate-products')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Validate products from Excel file',
    description:
      'Upload Excel file (.xlsx) with product data. Backend parses and validates products for flash sale. Checks product existence, stock, images, and conflicts.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'startTime', 'endTime'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx) with product data',
        },
        startTime: {
          type: 'string',
          format: 'date-time',
          description: 'Flash sale start time (ISO 8601)',
        },
        endTime: {
          type: 'string',
          format: 'date-time',
          description: 'Flash sale end time (ISO 8601)',
        },
        flashSaleId: {
          type: 'string',
          description: 'Flash sale ID for edit mode (optional)',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Validation result with valid/invalid products',
    type: ValidateExcelProductsResponseDto,
  })
  async validateExcelProducts(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ValidateExcelFileDto,
  ): Promise<ValidateExcelProductsResponseDto> {
    return await this.flashSalesService.validateExcelProducts(file, dto);
  }
}
