import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { Product } from './domain/product';
import { ProductStatus } from './domain/product-status.enum';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDetailsDto } from './dto/update-product-details.dto';
import { BulkUpdateHideDto } from './dto/bulk-update-hide.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import { formatVietnamDateISO } from '../utils/helpers/format-date';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for product endpoints (CMS only)
 * Products are synced from external sources (Nhanh)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Get list of products with filtering and pagination
   */
  @Get()
  @RequireModulePermission(
    ModulePermission.product_management,
    ModulePermission.flash_sale_management,
    ModulePermission.promotion_management,
    ModulePermission.homepage_management,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of products',
    description:
      'Returns paginated products. Only parent/standalone products are returned with their variants included.',
  })
  @ApiOkResponse({
    description: 'List of products returned successfully',
    type: InfinityPaginationResponse(Product),
  })
  async findAll(
    @Query() query: QueryProductDto,
  ): Promise<InfinityPaginationResponseDto<Product>> {
    const result = await this.productsService.findAll(query);
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get product statistics
   */
  @Get('stats/summary')
  @RequireModulePermission(
    ModulePermission.product_management,
    ModulePermission.flash_sale_management,
    ModulePermission.promotion_management,
    ModulePermission.homepage_management,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiOkResponse({ description: 'Statistics returned successfully' })
  getStatistics() {
    return this.productsService.getStatistics();
  }

  /**
   * Export all variant products to Excel (.xlsx)
   * Returns a file download with 61-column format matching the standard product export template.
   * Uses cursor streaming internally so memory usage stays low even for large catalogs.
   */
  @Get('export')
  @RequireModulePermission(ModulePermission.product_management)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOperation({ summary: 'Export products to Excel' })
  async exportExcel(
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @Query('categoryIds') categoryIds: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    let parsedCategoryIds: string[] | undefined;
    if (categoryIds) {
      try {
        const parsed = JSON.parse(categoryIds);
        if (
          Array.isArray(parsed) &&
          parsed.every((v) => typeof v === 'string')
        ) {
          parsedCategoryIds = parsed.length > 0 ? parsed : undefined;
        }
      } catch {
        parsedCategoryIds = undefined;
      }
    }

    const buffer = await this.productsService.exportToExcel({
      search: search || undefined,
      status: status ? (Number(status) as ProductStatus) : undefined,
      categoryIds: parsedCategoryIds,
    });

    const date = formatVietnamDateISO(new Date());
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="san-pham-${date}.xlsx"`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  /**
   * Get product by ID with variants
   */
  @Get(':id')
  @RequireModulePermission(
    ModulePermission.product_management,
    ModulePermission.flash_sale_management,
    ModulePermission.promotion_management,
    ModulePermission.homepage_management,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product by ID with variants' })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product found with variants',
    type: Product,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOneWithVariants(id);
  }

  /**
   * Update product details (CMS-only data)
   * Only owner and manager can update product details
   */
  @Patch(':id/details')
  @RequireModulePermission(ModulePermission.product_management)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update product details',
    description:
      'Update product description, content, and CMS-only details like material, style, highlights, suitable for, and care instructions. Only accessible to owners and managers.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product details updated successfully',
    type: Product,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async updateDetails(
    @Param('id') id: string,
    @Body() dto: UpdateProductDetailsDto,
  ): Promise<Product> {
    return this.productsService.updateDetails(id, {
      nameLocalization: dto.nameLocalization,
      description: dto.description,
      descriptionLocalization: dto.descriptionLocalization,
      content: dto.content,
      details: dto.details,
      detailsLocalization: dto.detailsLocalization,
      badge: dto.badge,
      sizeGuide: dto.sizeGuide,
      descriptionMedia: dto.descriptionMedia,
    });
  }

  /**
   * Bulk update hide status for multiple products
   * Only owner and manager can update product visibility
   */
  @Post('bulk/hide')
  @RequireModulePermission(ModulePermission.product_management)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update hide status',
    description:
      'Update hide status for multiple products at once. Hidden products will not be shown to shopping clients. Only accessible to owners and managers.',
  })
  @ApiOkResponse({
    description: 'Products updated successfully',
    schema: {
      type: 'object',
      properties: {
        updatedCount: {
          type: 'number',
          description: 'Number of products updated',
        },
      },
    },
  })
  async bulkUpdateHide(
    @Body() dto: BulkUpdateHideDto,
  ): Promise<{ updatedCount: number }> {
    const updatedCount = await this.productsService.bulkUpdateHide(dto.items);
    return { updatedCount };
  }
}
