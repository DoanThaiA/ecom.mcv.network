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
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';
import { AffiliateOrderCommissionsService } from './affiliate-order-commissions.service';
import {
  QueryAffiliateOrdersDto,
  QueryAffiliateAnalyticsDto,
  QueryAffiliateProductAnalyticsDto,
} from './dto/query-affiliate-orders.dto';

@ApiBearerAuth()
@RequireModulePermission(ModulePermission.affiliate_management)
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@ApiTags('CMS - Affiliate Analytics')
@Controller({ path: 'cms/affiliates', version: '1' })
export class AffiliateOrderCommissionsController {
  constructor(private readonly service: AffiliateOrderCommissionsService) {}

  /**
   * Get paginated order list for an affiliate
   */
  @Get(':affiliateId/orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get affiliate order list',
    description:
      'Returns paginated list of orders attributed to this affiliate with commission details.',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  @ApiOkResponse({ description: 'Paginated order list' })
  async getOrders(
    @Param('affiliateId') affiliateId: string,
    @Query() query: QueryAffiliateOrdersDto,
  ) {
    const result = await this.service.getOrdersByAffiliate(affiliateId, query);
    return {
      data: result.docs.map((doc) => ({
        id: doc.id,
        orderId: doc.orderId,
        orderNumber: doc.orderNumber,
        orderStatus: doc.orderStatus,
        customer: doc.customer,
        orderTotal: doc.orderTotal,
        totalDiscount: doc.totalDiscount,
        paymentAmount: doc.paymentAmount,
        totalCommission: doc.totalCommission,
        createdAt: doc.createdAt,
      })),
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    };
  }

  /**
   * Get performance overview for an affiliate
   */
  @Get(':affiliateId/analytics/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get affiliate performance overview',
    description:
      'Returns aggregate analytics: clicks, orders, conversion rate, revenue, commission.',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  @ApiOkResponse({ description: 'Performance overview' })
  async getOverview(
    @Param('affiliateId') affiliateId: string,
    @Query() query: QueryAffiliateAnalyticsDto,
  ) {
    return this.service.getOverview(affiliateId, query);
  }

  /**
   * Get commission analytics for an affiliate, grouped by (product, rate).
   * Driven by order history — only products with actual orders appear.
   * Separate rows per commission rate so historical rate changes are visible.
   */
  @Get(':affiliateId/analytics/products/commissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get affiliate commission analytics per product',
    description:
      'Returns per-(product, rate) breakdown: orders, revenue, commission. Driven by order history.',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  @ApiOkResponse({ description: 'Commission analytics per product' })
  async getProductCommissionAnalytics(
    @Param('affiliateId') affiliateId: string,
    @Query() query: QueryAffiliateProductAnalyticsDto,
  ) {
    return this.service.getProductCommissionAnalytics(affiliateId, query);
  }

  /**
   * Get traffic & conversion analytics for an affiliate, grouped by product.
   * Driven by product_commissions so all assigned products appear (including zero-activity).
   */
  @Get(':affiliateId/analytics/products/tracking')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get affiliate tracking & conversion analytics per product',
    description:
      'Returns per-product breakdown: clicks, orders, conversion rate. All assigned products included.',
  })
  @ApiParam({ name: 'affiliateId', description: 'Affiliate ID' })
  @ApiOkResponse({ description: 'Tracking & conversion analytics per product' })
  async getProductTrackingAnalytics(
    @Param('affiliateId') affiliateId: string,
    @Query() query: QueryAffiliateProductAnalyticsDto,
  ) {
    return this.service.getProductTrackingAnalytics(affiliateId, query);
  }
}
