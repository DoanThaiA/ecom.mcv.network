import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategory } from './domain/product-category';
import { QueryProductCategoryDto } from './dto/product-query-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for product category endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('Product Categories')
@Controller({ path: 'product-categories', version: '1' })
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  /**
   * Get list of categories with filtering
   */
  @Get()
  @RequireModulePermission(
    ModulePermission.product_management,
    ModulePermission.homepage_management,
    ModulePermission.flash_sale_management,
    ModulePermission.promotion_management,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of categories' })
  @ApiOkResponse({
    description: 'List of categories returned successfully',
    type: [ProductCategory],
  })
  async findAll(
    @Query() query: QueryProductCategoryDto,
  ): Promise<ProductCategory[]> {
    return this.categoriesService.findAll(query);
  }

  /**
   * Get category tree (hierarchical structure)
   */
  @Get('tree')
  @RequireModulePermission(
    ModulePermission.product_management,
    ModulePermission.homepage_management,
    ModulePermission.flash_sale_management,
    ModulePermission.promotion_management,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get category tree with parent-child relationships',
  })
  @ApiOkResponse({ description: 'ProductCategory tree returned successfully' })
  async getProductCategoryTree() {
    return this.categoriesService.getProductCategoryTree();
  }

  /**
   * Get category by ID
   */
  @Get(':id')
  @RequireModulePermission(
    ModulePermission.product_management,
    ModulePermission.homepage_management,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiOkResponse({
    description: 'ProductCategory found',
    type: ProductCategory,
  })
  @ApiNotFoundResponse({ description: 'ProductCategory not found' })
  async findOne(@Param('id') id: string): Promise<ProductCategory> {
    return this.categoriesService.findOne(id);
  }

  /**
   * Get child categories by parent ID
   */
  @Get('parent/:parentId')
  @RequireModulePermission(
    ModulePermission.product_management,
    ModulePermission.homepage_management,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get child categories by parent ID' })
  @ApiOkResponse({
    description: 'Child categories returned successfully',
    type: [ProductCategory],
  })
  async findByParentId(
    @Param('parentId') parentId: string,
  ): Promise<ProductCategory[]> {
    return this.categoriesService.findByParentId(parentId);
  }

  /**
   * Update category localization
   */
  @Patch(':id/localization')
  @RequireModulePermission(ModulePermission.product_management)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update category localization' })
  @ApiOkResponse({
    description: 'ProductCategory localization updated successfully',
    type: ProductCategory,
  })
  @ApiNotFoundResponse({ description: 'ProductCategory not found' })
  async updateLocalization(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    return this.categoriesService.updateLocalization(id, updateDto);
  }
}
