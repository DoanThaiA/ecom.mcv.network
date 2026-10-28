import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProductPromotionHighlightsResponseDto } from './dto/product-promotion-highlights-response.dto';
import { ProductPromotionHighlightsService } from './product-promotion-highlights.service';

/** Public promotion discovery endpoint backed by a short internal cache. */
@ApiTags('Shop - Promotions')
@Controller({ path: 'shop/products', version: '1' })
export class ProductPromotionHighlightsController {
  constructor(
    private readonly productPromotionHighlightsService: ProductPromotionHighlightsService,
  ) {}

  @Get(':productId/promotion-highlights')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Get promotion highlights for a product detail page',
    description:
      'Returns active shipping, order-discount, and relevant gift promotions. ' +
      'The endpoint is customer-neutral, backed by a short shared server cache, and does not apply promotions.',
  })
  @ApiParam({ name: 'productId', description: 'Canonical MongoDB product ID' })
  @ApiOkResponse({
    description: 'Customer-safe PDP promotion highlights',
    type: ProductPromotionHighlightsResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found or not saleable' })
  async getProductPromotionHighlights(
    @Param('productId') productId: string,
  ): Promise<ProductPromotionHighlightsResponseDto> {
    return this.productPromotionHighlightsService.getProductPromotionHighlights(
      productId,
    );
  }
}
