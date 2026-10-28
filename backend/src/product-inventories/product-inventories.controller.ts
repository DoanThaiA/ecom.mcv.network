import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductInventoriesService } from './product-inventories.service';
import { ProductInventory } from './domain/product-inventory';
import { QueryProductInventoryDto } from './dto/query-product-inventory.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for product inventories endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.product_management)
@ApiTags('Product Inventories')
@Controller({ path: 'product-inventories', version: '1' })
export class ProductInventoriesController {
  constructor(private readonly inventoryService: ProductInventoriesService) {}

  /**
   * Get list of inventory records with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of inventory records' })
  @ApiOkResponse({
    description: 'List of inventory records returned successfully',
    type: InfinityPaginationResponse(ProductInventory),
  })
  async findAll(
    @Query() query: QueryProductInventoryDto,
  ): Promise<InfinityPaginationResponseDto<ProductInventory>> {
    const result = await this.inventoryService.findAll(query);

    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get inventory statistics
   */
  @Get('stats/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get inventory statistics' })
  @ApiOkResponse({ description: 'Statistics returned successfully' })
  getStatistics() {
    return this.inventoryService.getStatistics();
  }

  /**
   * Get inventory by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get inventory by ID' })
  @ApiOkResponse({
    description: 'ProductInventory record found',
    type: ProductInventory,
  })
  @ApiNotFoundResponse({ description: 'ProductInventory record not found' })
  async findOne(@Param('id') id: string): Promise<ProductInventory> {
    return this.inventoryService.findOne(id);
  }

  /**
   * Get inventory by product ID
   * For parent products, returns variant inventories in variantInventories array
   */
  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get inventory by product ID',
    description:
      'Returns inventory for a product. For parent products without their own inventory, returns a synthetic record with variantInventories containing all variant inventories.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiOkResponse({
    description: 'ProductInventory record found',
    type: ProductInventory,
  })
  @ApiNotFoundResponse({ description: 'ProductInventory record not found' })
  async findByProductId(
    @Param('productId') productId: string,
  ): Promise<ProductInventory> {
    return this.inventoryService.findByProductId(productId);
  }

  /**
   * Check product availability
   */
  @Get('product/:productId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if product is available' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Availability status returned',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        quantity: { type: 'number' },
      },
    },
  })
  async checkAvailability(@Param('productId') productId: string) {
    const available = await this.inventoryService.checkAvailability(productId);
    const quantity =
      await this.inventoryService.getAvailableQuantity(productId);

    return { available, quantity };
  }
}
