import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ShopFlashSaleService } from './shop-flash-sale.service';
import {
  ShopFlashSaleDetailResponseDto,
  ShopActiveFlashSaleResponseDto,
  ShopFlashSaleProductsResponseDto,
} from './dto/shop-flash-sale.dto';
import {
  ShopFlashSaleQueryDto,
  ShopFlashSaleByIdQueryDto,
} from '../dto/shop-query-product.dto';

/**
 * Public controller for shop flash sale endpoints
 * No authentication required
 */
@ApiTags('Shop - Flash Sales')
@Controller({ path: 'shop/flash-sale', version: '1' })
export class ShopFlashSaleController {
  constructor(private readonly shopFlashSaleService: ShopFlashSaleService) {}

  /**
   * Get the currently active flash sale with first page of products
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active flash sale',
    description:
      'Returns the currently active flash sale with the first page of products. ' +
      'Returns null if no flash sale is currently active.',
  })
  @ApiOkResponse({
    description: 'Active flash sale or null',
    type: ShopActiveFlashSaleResponseDto,
  })
  async getActiveFlashSale(): Promise<ShopActiveFlashSaleResponseDto | null> {
    return this.shopFlashSaleService.getActiveFlashSale();
  }

  /**
   * Get paginated products from active flash sale with optional filtering and sorting
   */
  @Get('products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get flash sale products with pagination and filtering',
    description:
      'Returns paginated products from the active flash sale. ' +
      'Supports filtering by search, category, price range, and topic. ' +
      'Supports sorting by price, discount, name, and createdAt. ' +
      'Returns empty result if no flash sale is active.',
  })
  @ApiOkResponse({
    description: 'Paginated flash sale products',
    type: ShopFlashSaleProductsResponseDto,
  })
  async getFlashSaleProducts(
    @Query() query: ShopFlashSaleQueryDto,
  ): Promise<ShopFlashSaleProductsResponseDto> {
    return this.shopFlashSaleService.getFlashSaleProducts(query);
  }

  /**
   * Get a single flash sale by ID with paginated products
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get flash sale details by ID',
    description:
      'Returns flash sale details with paginated products. ' +
      'Only returns currently active flash sales.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Flash sale ID' })
  @ApiOkResponse({
    description: 'Flash sale found',
    type: ShopFlashSaleDetailResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Flash sale not found, inactive, or ended',
  })
  async getFlashSaleById(
    @Param('id') id: string,
    @Query() query: ShopFlashSaleByIdQueryDto,
  ): Promise<ShopFlashSaleDetailResponseDto> {
    return this.shopFlashSaleService.getFlashSaleById(id, query);
  }
}
