import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccountTypeEnum } from '../cms-users/permissions/account-type.enum';
import { AffiliatesService } from '../affiliates/affiliates.service';
import { AffiliateOrderCommissionsService } from '../affiliate-order-commissions/affiliate-order-commissions.service';
import { WithdrawalRequestsService } from '../withdrawal-requests/withdrawal-requests.service';
import { ProductCommissionsService } from '../product-commissions/product-commissions.service';
import {
  QueryAffiliateAnalyticsDto,
  QueryAffiliateProductAnalyticsDto,
} from '../affiliate-order-commissions/dto/query-affiliate-orders.dto';
import { QueryWithdrawalRequestsDto } from '../withdrawal-requests/dto/query-withdrawal-requests.dto';
import { CreateWithdrawalRequestDto } from '../withdrawal-requests/dto/create-withdrawal-request.dto';
import { QueryProductCommissionDto } from '../product-commissions/dto/query-product-commission.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'))
@ApiTags('Affiliate Portal')
@Controller({ path: 'affiliate-portal', version: '1' })
export class AffiliatePortalController {
  constructor(
    private readonly affiliatesService: AffiliatesService,
    private readonly analyticsService: AffiliateOrderCommissionsService,
    private readonly withdrawalRequestsService: WithdrawalRequestsService,
    private readonly productCommissionsService: ProductCommissionsService,
  ) {}

  /**
   * Ensure the logged-in CMS user is an affiliate account with a valid affiliateId.
   */
  private ensureAffiliate(req: any): string {
    if (req.user?.accountType !== AccountTypeEnum.affiliate) {
      throw new ForbiddenException(
        'Only affiliate accounts can access this endpoint',
      );
    }
    const affiliateId = req.user?.affiliateId;
    if (!affiliateId) {
      throw new ForbiddenException('No affiliate linked to this account');
    }
    return String(affiliateId);
  }

  /**
   * Get the logged-in affiliate's own profile information.
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my affiliate profile' })
  @ApiOkResponse({ description: 'Affiliate profile information' })
  async getMe(@Request() req: any) {
    const affiliateId = this.ensureAffiliate(req);
    return this.affiliatesService.findById(affiliateId);
  }

  /**
   * Get performance overview for the logged-in affiliate.
   */
  @Get('analytics/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my affiliate performance overview' })
  @ApiOkResponse({
    description: 'Performance overview (clicks, orders, revenue, commission)',
  })
  async getOverview(
    @Query() query: QueryAffiliateAnalyticsDto,
    @Request() req: any,
  ) {
    const affiliateId = this.ensureAffiliate(req);
    return this.analyticsService.getOverview(affiliateId, query);
  }

  /**
   * Get commission analytics for the logged-in affiliate, grouped by (product, rate).
   * Driven by order history — only products with actual orders appear.
   */
  @Get('analytics/products/commissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my commission analytics per product' })
  @ApiOkResponse({ description: 'Commission analytics per product' })
  async getProductCommissionAnalytics(
    @Query() query: QueryAffiliateProductAnalyticsDto,
    @Request() req: any,
  ) {
    const affiliateId = this.ensureAffiliate(req);
    return this.analyticsService.getProductCommissionAnalytics(
      affiliateId,
      query,
    );
  }

  /**
   * Get traffic & conversion analytics for the logged-in affiliate, grouped by product.
   * All assigned products included (even those with no activity).
   */
  @Get('analytics/products/tracking')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my tracking & conversion analytics per product',
  })
  @ApiOkResponse({ description: 'Tracking & conversion analytics per product' })
  async getProductTrackingAnalytics(
    @Query() query: QueryAffiliateProductAnalyticsDto,
    @Request() req: any,
  ) {
    const affiliateId = this.ensureAffiliate(req);
    return this.analyticsService.getProductTrackingAnalytics(
      affiliateId,
      query,
    );
  }

  /**
   * Get available balance for the logged-in affiliate.
   */
  @Get('balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my available commission balance' })
  @ApiOkResponse({
    description: 'Total earned, total withdrawn, and available balance',
  })
  async getBalance(@Request() req: any) {
    const affiliateId = this.ensureAffiliate(req);
    return this.withdrawalRequestsService.getBalance(affiliateId);
  }

  /**
   * Create a new withdrawal request for the logged-in affiliate.
   */
  @Post('withdrawal-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a withdrawal request' })
  async createWithdrawalRequest(
    @Body() dto: CreateWithdrawalRequestDto,
    @Request() req: any,
  ) {
    const affiliateId = this.ensureAffiliate(req);
    return this.withdrawalRequestsService.create(affiliateId, dto);
  }

  /**
   * Get the logged-in affiliate's withdrawal request history.
   */
  @Get('withdrawal-requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my withdrawal request history' })
  @ApiOkResponse({ description: 'Paginated withdrawal request list' })
  async getMyWithdrawalRequests(
    @Query() query: QueryWithdrawalRequestsDto,
    @Request() req: any,
  ) {
    const affiliateId = this.ensureAffiliate(req);
    const result = await this.withdrawalRequestsService.findByAffiliate(
      affiliateId,
      query,
    );
    return {
      data: result.docs.map((r) => ({
        id: r.id,
        agentName: r.agentName,
        recipientName: r.recipientName,
        bankAccountNumber: r.bankAccountNumber,
        bankName: r.bankName,
        amount: r.amount,
        note: r.note,
        status: r.status,
        requestDate: r.requestDate,
        processedDate: r.processedDate,
        rejectionReason: r.rejectionReason,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total: result.totalDocs,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    };
  }

  /**
   * Get product commissions for the logged-in affiliate.
   */
  @Get('product-commissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my product commissions' })
  @ApiOkResponse({
    description: 'Paginated product commission list for the affiliate',
  })
  async getMyProductCommissions(
    @Query() query: QueryProductCommissionDto,
    @Request() req: any,
  ) {
    const affiliateId = this.ensureAffiliate(req);
    return this.productCommissionsService.findManyWithPagination({
      affiliateId,
      filterOptions: query.filters ?? null,
      sortOptions: query.sort ?? null,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      },
    });
  }

  /**
   * Get a single withdrawal request by ID (affiliate can only see their own).
   */
  @Get('withdrawal-requests/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my withdrawal request detail' })
  @ApiParam({ name: 'id', description: 'Withdrawal request ID' })
  async getMyWithdrawalRequest(@Param('id') id: string, @Request() req: any) {
    const affiliateId = this.ensureAffiliate(req);
    const request = await this.withdrawalRequestsService.findOne(
      id,
      affiliateId,
    );
    const processedByName =
      await this.withdrawalRequestsService.resolveProcessorName(
        request.processedBy,
      );
    return { ...request, processedBy: processedByName };
  }
}
