import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { ShopAuthGuard } from '../shop/guards/shop-auth.guard';
import { Customer } from '../shop/decorators/shop-customer.decorator';
import { ShopCustomer } from '../shop/guards/shop-auth.guard';
import { RecommendationsService } from './recommendations.service';
import {
  PersonalizedRecommendationQueryDto,
  CrossSellRecommendationQueryDto,
} from './dto/recommendation-query.dto';
import { Product } from '../products/domain/product';

/**
 * Controller for product recommendations
 */
@ApiTags('Shop - Recommendations')
@ApiHeader({
  name: 'x-session-id',
  description:
    'Session ID for guest identification (required if not authenticated)',
  required: false,
})
@UseGuards(ShopAuthGuard)
@Controller({ path: 'shop/recommendations', version: '1' })
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Get personalized product recommendations
   * Uses purchase history + view history for authenticated users
   * Falls back to trending products for guests
   */
  @Get('personalized')
  @ApiOperation({ summary: 'Get personalized product recommendations' })
  @ApiOkResponse({ type: [Product] })
  async getPersonalized(
    @Customer() customer: ShopCustomer,
    @Query() query: PersonalizedRecommendationQueryDto,
  ): Promise<Product[]> {
    return this.recommendationsService.getPersonalizedRecommendations(
      customer.userId,
      customer.sessionId,
      query.limit,
    );
  }

  /**
   * Get cross-sell recommendations based on product IDs
   * Used on post-checkout or product detail pages
   */
  @Get('cross-sell')
  @ApiOperation({ summary: 'Get cross-sell product recommendations' })
  @ApiOkResponse({ type: [Product] })
  async getCrossSell(
    @Query() query: CrossSellRecommendationQueryDto,
  ): Promise<Product[]> {
    const productIds = query.productIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (productIds.length === 0) {
      return [];
    }

    return this.recommendationsService.getCrossSellRecommendations(
      productIds,
      query.limit,
    );
  }
}
