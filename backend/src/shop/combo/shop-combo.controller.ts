import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ShopComboService } from './shop-combo.service';
import {
  ShopComboResponseDto,
  ShopComboListResponseDto,
} from './dto/shop-combo.dto';

/**
 * Public controller for shop combo endpoints
 * No authentication required
 */
@ApiTags('Shop - Combos')
@Controller({ path: 'shop/combos', version: '1' })
export class ShopComboController {
  constructor(private readonly shopComboService: ShopComboService) {}

  /**
   * Get combos for a specific product
   * Returns active combos that include the product
   */
  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get combos for a product',
    description:
      'Returns all active combos that include the specified product. ' +
      'If the product is a variant, also returns combos containing the parent product. ' +
      'Use this to show "Buy with bundle" options on product pages.',
  })
  @ApiParam({
    name: 'productId',
    type: String,
    description: 'Product ID (can be parent or variant)',
  })
  @ApiOkResponse({
    description: 'Combos returned successfully',
    type: ShopComboListResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async getCombosForProduct(
    @Param('productId') productId: string,
  ): Promise<ShopComboListResponseDto> {
    return this.shopComboService.getCombosForProduct(productId);
  }

  /**
   * Get a single combo by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get combo details by ID',
    description:
      'Returns combo details including product information and variant options. ' +
      'Only returns active and valid combos.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Combo ID' })
  @ApiOkResponse({
    description: 'Combo found',
    type: ShopComboResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Combo not found, inactive, or outside valid date range',
  })
  async getComboById(@Param('id') id: string): Promise<ShopComboResponseDto> {
    return this.shopComboService.getComboById(id);
  }
}
