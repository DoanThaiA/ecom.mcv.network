import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { QueryReviewDto } from './dto/query-review.dto';
import { ToggleVisibilityDto } from './dto/update-review.dto';
import { CreateCmsReviewDto } from './dto/create-cms-review.dto';
import { Review } from './domain/review';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * CMS controller for admin review management
 */
@ApiTags('CMS - Reviews')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.product_management)
@Controller({ path: 'reviews', version: '1' })
export class CmsReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Tạo review seeding (không cần order thực)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create seeding review (CMS)' })
  @ApiResponse({ status: 201, type: Review })
  async createReview(@Body() dto: CreateCmsReviewDto): Promise<Review> {
    return this.reviewsService.createCmsReview(dto);
  }

  /**
   * Get all reviews with filters (flattened - each product review is a row)
   */
  @Get()
  @ApiOperation({ summary: 'Get all product reviews (CMS)' })
  @ApiResponse({ status: 200 })
  async getReviews(@Query() query: QueryReviewDto) {
    return this.reviewsService.getCmsReviews(query);
  }

  /**
   * Get review by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, type: Review })
  async getReviewById(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.getReviewById(id);
  }

  /**
   * Toggle product review visibility (show/hide)
   */
  @Patch(':id/products/:productId/visibility')
  @ApiOperation({ summary: 'Toggle product review visibility' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, type: Review })
  async toggleProductVisibility(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() dto: ToggleVisibilityDto,
  ): Promise<Review> {
    return this.reviewsService.toggleProductVisibility(
      id,
      productId,
      dto.visible,
    );
  }
}
