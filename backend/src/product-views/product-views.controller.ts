import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ShopAuthGuard } from '../shop/guards/shop-auth.guard';
import { Customer } from '../shop/decorators/shop-customer.decorator';
import { ShopCustomer } from '../shop/guards/shop-auth.guard';
import { ProductViewsService } from './product-views.service';
import { TrackProductViewDto } from './dto/track-product-view.dto';

/**
 * Controller for tracking product views
 */
@ApiTags('Shop - Product Views')
@ApiHeader({
  name: 'x-session-id',
  description:
    'Session ID for guest identification (required if not authenticated)',
  required: false,
})
@UseGuards(ShopAuthGuard)
@Controller({ path: 'shop/product-views', version: '1' })
export class ProductViewsController {
  constructor(private readonly productViewsService: ProductViewsService) {}

  /**
   * Track a product view
   * Fire-and-forget: returns 201 immediately
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a product view' })
  trackView(
    @Customer() customer: ShopCustomer,
    @Body() dto: TrackProductViewDto,
  ): void {
    // Fire-and-forget: don't await
    void this.productViewsService.trackView(
      dto.productId,
      customer.userId,
      customer.sessionId,
      dto.categoryId,
    );
  }
}
