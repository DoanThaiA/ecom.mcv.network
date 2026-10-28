import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { Review } from './domain/review';
import { ShopAuthGuard, ShopCustomer } from '../shop/guards/shop-auth.guard';
import { Customer } from '../shop/decorators/shop-customer.decorator';

/**
 * Shop controller for customer reviews
 */
@ApiTags('Shop - Reviews')
@Controller({ path: 'shop', version: '1' })
export class ShopReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Create a review for an order
   */
  @Post('reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(ShopAuthGuard)
  @ApiOperation({ summary: 'Create review for an order' })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Session ID',
    required: false,
  })
  @ApiResponse({ status: 201, type: Review })
  async createReview(
    @Customer() customer: ShopCustomer,
    @Body() dto: CreateReviewDto,
  ): Promise<Review> {
    if (!customer.userId) {
      throw new Error('User must be authenticated to create review');
    }
    return this.reviewsService.createReview(customer.userId, dto);
  }

  /**
   * Check if an order is already reviewed
   */
  @Get('reviews/check/:orderNumber')
  @ApiBearerAuth()
  @UseGuards(ShopAuthGuard)
  @ApiOperation({ summary: 'Check if order is reviewed' })
  @ApiParam({ name: 'orderNumber', description: 'Order number' })
  @ApiResponse({ status: 200 })
  async checkOrderReviewed(
    @Customer() customer: ShopCustomer,
    @Param('orderNumber') orderNumber: string,
  ): Promise<{ reviewed: boolean }> {
    if (!customer.userId) {
      throw new Error('User must be authenticated');
    }
    return this.reviewsService.checkOrderReviewed(orderNumber, customer.userId);
  }

  /**
   * Get review by order number (read-only view)
   */
  @Get('reviews/order/:orderNumber')
  @ApiBearerAuth()
  @UseGuards(ShopAuthGuard)
  @ApiOperation({ summary: 'Get review by order number' })
  @ApiParam({ name: 'orderNumber', description: 'Order number' })
  @ApiResponse({ status: 200, type: Review })
  async getReviewByOrder(
    @Customer() customer: ShopCustomer,
    @Param('orderNumber') orderNumber: string,
  ): Promise<Review> {
    if (!customer.userId) {
      throw new Error('User must be authenticated');
    }
    return this.reviewsService.getReviewByOrderNumber(
      orderNumber,
      customer.userId,
    );
  }

  /**
   * Get all reviews by current authenticated user
   */
  @Get('reviews/my-reviews')
  @ApiBearerAuth()
  @UseGuards(ShopAuthGuard)
  @ApiOperation({ summary: 'Get all reviews by current user' })
  @ApiResponse({ status: 200, type: [Review] })
  async getMyReviews(@Customer() customer: ShopCustomer): Promise<Review[]> {
    if (!customer.userId) {
      throw new Error('User must be authenticated');
    }
    return this.reviewsService.getUserReviews(customer.userId);
  }

  /**
   * Get reviews for a product (public endpoint)
   */
  @Get('products/:productId/reviews')
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200 })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query() query: QueryReviewDto,
  ) {
    const result = await this.reviewsService.getProductReviews(
      productId,
      query,
    );
    return {
      data: result.docs,
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
