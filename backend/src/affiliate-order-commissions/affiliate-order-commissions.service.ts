import { Injectable, Logger } from '@nestjs/common';
import { PaginateResult } from 'mongoose';
import { AffiliateOrderCommissionRepository } from './domain/affiliate-order-commission.repository';
import { AffiliateOrderCommission } from './domain/affiliate-order-commission';
import { ProductCommissionRepository } from '../product-commissions/domain/product-commission.repository';
import { CommissionSettingsRepository } from '../commission-settings/domain/commission-settings.repository';
import { AffiliateRepository } from '../affiliates/domain/affiliate.repository';
import { AffiliateTrackingRepository } from '../affiliate-tracking/domain/affiliate-tracking.repository';
import { TrackingEventType } from '../affiliate-tracking/domain/tracking-event-type.enum';
import { ProductRepository } from '../products/domain/product.repository';
import { Order } from '../shop/order/domain/order';
import { Affiliate } from '../affiliates/domain/affiliate';
import {
  QueryAffiliateOrdersDto,
  QueryAffiliateAnalyticsDto,
  QueryAffiliateProductAnalyticsDto,
} from './dto/query-affiliate-orders.dto';
import {
  distributeDiscount,
  calculateCommissionAmount,
} from '../utils/helpers/round-price';

@Injectable()
export class AffiliateOrderCommissionsService {
  private readonly logger = new Logger(AffiliateOrderCommissionsService.name);

  constructor(
    private readonly commissionRepository: AffiliateOrderCommissionRepository,
    private readonly productCommissionRepository: ProductCommissionRepository,
    private readonly commissionSettingsRepository: CommissionSettingsRepository,
    private readonly affiliateRepository: AffiliateRepository,
    private readonly trackingRepository: AffiliateTrackingRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Create affiliate order commission record from a placed order
   * Resolves commission rates via cascade: product_commissions -> affiliate default -> global default
   */
  async createFromOrder(
    order: Order,
    affiliateId: string,
    affiliateCode: string,
  ): Promise<AffiliateOrderCommission> {
    // Load affiliate for default rate
    const affiliate = await this.affiliateRepository.findById(affiliateId);
    const settings = await this.commissionSettingsRepository.getOrCreate();
    const globalDefaultRate = settings.defaultCommissionRate;

    // Compute order subtotal and discount for proportional distribution
    const orderSubtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const orderDiscount = order.discount ?? 0;

    // Resolve commission rates for each item
    const items = await Promise.all(
      order.items.map(async (orderItem) => {
        const rate = await this.resolveCommissionRate(
          affiliateId,
          orderItem.productId,
          affiliate,
          globalDefaultRate,
        );

        const itemSubtotal = orderItem.price * orderItem.quantity;

        // Distribute order discount proportionally to each item
        const distributedDiscount = distributeDiscount(
          itemSubtotal,
          orderSubtotal,
          orderDiscount,
        );
        const effectiveSubtotal = itemSubtotal - distributedDiscount;

        const commissionAmount = calculateCommissionAmount(
          effectiveSubtotal,
          rate,
        );

        return {
          productId: orderItem.productId,
          productName: orderItem.name,
          productCode: orderItem.code,
          quantity: orderItem.quantity,
          price: orderItem.price,
          subtotal: itemSubtotal,
          commissionRate: rate,
          commissionAmount,
        };
      }),
    );

    const totalCommission = items.reduce(
      (sum, item) => sum + item.commissionAmount,
      0,
    );

    const commission = await this.commissionRepository.create({
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      affiliateId,
      affiliateCode,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
      },
      items,
      orderTotal: order.subtotal,
      totalDiscount: order.totalDiscount,
      paymentAmount: order.total,
      totalCommission,
    });

    this.logger.log(
      `Created commission record for order ${order.orderNumber}, affiliate ${affiliateCode}, commission=${totalCommission}`,
    );

    return commission;
  }

  /**
   * Sync order status change to commission record
   */
  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    try {
      const existing = await this.commissionRepository.findByOrderId(orderId);
      if (!existing) return;

      await this.commissionRepository.updateOrderStatus(orderId, newStatus);

      this.logger.debug(
        `Updated commission order status for order ${orderId} to ${newStatus}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update commission order status for ${orderId}: ${error.message}`,
      );
    }
  }

  /**
   * Get paginated order list for an affiliate (CMS)
   */
  async getOrdersByAffiliate(
    affiliateId: string,
    query: QueryAffiliateOrdersDto,
  ): Promise<PaginateResult<AffiliateOrderCommission>> {
    return this.commissionRepository.findManyByAffiliate({
      affiliateId,
      paginationOptions: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      },
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo
        ? new Date(new Date(query.dateTo).setHours(23, 59, 59, 999))
        : undefined,
    });
  }

  /**
   * Get performance overview for an affiliate (CMS)
   */
  async getOverview(
    affiliateId: string,
    query: QueryAffiliateAnalyticsDto,
  ): Promise<{
    totalClicks: number;
    successfulOrders: number;
    conversionRate: number;
    revenueGenerated: number;
    estimatedCommission: number;
  }> {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo
      ? new Date(new Date(query.dateTo).setHours(23, 59, 59, 999))
      : undefined;

    const [totalClicks, orderOverview] = await Promise.all([
      this.trackingRepository.countByAffiliate(
        affiliateId,
        TrackingEventType.CLICK,
        dateFrom,
        dateTo,
      ),
      this.commissionRepository.aggregateOverview(
        affiliateId,
        dateFrom,
        dateTo,
      ),
    ]);

    const conversionRate =
      totalClicks > 0
        ? Math.round((orderOverview.successfulOrders / totalClicks) * 100)
        : 0;

    return {
      totalClicks,
      successfulOrders: orderOverview.successfulOrders,
      conversionRate,
      revenueGenerated: orderOverview.revenueGenerated,
      estimatedCommission: orderOverview.estimatedCommission,
    };
  }

  /**
   * Get commission analytics for an affiliate — grouped by (productId, commissionRate).
   * Driven entirely by affiliate_order_commissions (historical ledger).
   * Only products with at least one successful order appear.
   * Shows separate rows for the same product if it was sold under different commission rates.
   */
  async getProductCommissionAnalytics(
    affiliateId: string,
    query: QueryAffiliateProductAnalyticsDto,
  ): Promise<{
    data: Array<{
      productId: string;
      productCode: string;
      productName: string;
      category: { id: string; name: string } | null;
      commissionRate: number;
      successfulOrders: number;
      revenueGenerated: number;
      estimatedCommission: number;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo
      ? new Date(new Date(query.dateTo).setHours(23, 59, 59, 999))
      : undefined;

    // 1. Paginated aggregation from order history, grouped by (productId, commissionRate)
    const { data: items, total } =
      await this.commissionRepository.aggregateByProducts({
        affiliateId,
        dateFrom,
        dateTo,
        search: query.search,
        paginationOptions: { page, limit },
      });

    if (items.length === 0) {
      return {
        data: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: false,
      };
    }

    // 2. Enrich with category and resolved parent product name
    const uniqueProductIds = [...new Set(items.map((i) => i.productId))];
    const [categoryMap, products] = await Promise.all([
      this.productCommissionRepository.findCategoriesByProductIds(
        uniqueProductIds,
      ),
      this.productRepository.findByIds(uniqueProductIds),
    ]);

    const parentNameMap = new Map<string, string>();
    for (const product of products) {
      parentNameMap.set(product.id, product.parent?.name ?? product.name);
    }

    const totalPages = Math.ceil(total / limit) || 1;
    const data = items.map((item) => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: parentNameMap.get(item.productId) ?? item.productName,
      category: categoryMap.get(item.productId) ?? null,
      commissionRate: item.commissionRate,
      successfulOrders: item.successfulOrders,
      revenueGenerated: item.revenueGenerated,
      estimatedCommission: item.estimatedCommission,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  /**
   * Get traffic & conversion analytics for an affiliate — grouped by productId.
   * Driven by product_commissions (all assigned products) so zero-activity products are included.
   * Joins click counts and total order counts (rate-agnostic) to compute conversion rate.
   */
  async getProductTrackingAnalytics(
    affiliateId: string,
    query: QueryAffiliateProductAnalyticsDto,
  ): Promise<{
    data: Array<{
      productId: string;
      productCode: string;
      productName: string;
      category: { id: string; name: string } | null;
      clicks: number;
      successfulOrders: number;
      conversionRate: number;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo
      ? new Date(new Date(query.dateTo).setHours(23, 59, 59, 999))
      : undefined;

    // 1. Paginated product list from product_commissions (global + affiliate-specific)
    const productPage = await this.productCommissionRepository.findForAnalytics(
      {
        affiliateId,
        search: query.search,
        categoryName: query.categoryName,
        paginationOptions: { page, limit },
      },
    );

    if (productPage.docs.length === 0) {
      return {
        data: [],
        total: productPage.totalDocs,
        page,
        limit,
        totalPages: productPage.totalPages,
        hasNextPage: productPage.hasNextPage,
      };
    }

    // 2. Deduplicate productIds (same product may appear as both global + affiliate row)
    const uniqueProductIds = [
      ...new Set(productPage.docs.map((d) => d.productId)),
    ];

    // 3. Parallel: clicks, total orders (rate-agnostic), and product names
    const [clicksMap, ordersMap, products] = await Promise.all([
      this.trackingRepository.countByProducts(
        affiliateId,
        uniqueProductIds,
        TrackingEventType.CLICK,
        dateFrom,
        dateTo,
      ),
      this.commissionRepository.aggregateTotalOrdersByProductIds({
        affiliateId,
        productIds: uniqueProductIds,
        dateFrom,
        dateTo,
      }),
      this.productRepository.findByIds(uniqueProductIds),
    ]);

    const parentNameMap = new Map<string, string>();
    for (const product of products) {
      parentNameMap.set(product.id, product.parent?.name ?? product.name);
    }

    // 4. Deduplicate rows: one row per productId (product_commissions may have global + affiliate rows)
    const seen = new Set<string>();
    const data: Array<{
      productId: string;
      productCode: string;
      productName: string;
      category: { id: string; name: string } | null;
      clicks: number;
      successfulOrders: number;
      conversionRate: number;
    }> = [];

    for (const commission of productPage.docs) {
      if (seen.has(commission.productId)) continue;
      seen.add(commission.productId);

      const clicks = clicksMap.get(commission.productId) ?? 0;
      const successfulOrders =
        ordersMap.get(commission.productId)?.successfulOrders ?? 0;
      const conversionRate =
        clicks > 0 ? Math.round((successfulOrders / clicks) * 100) : 0;

      data.push({
        productId: commission.productId,
        productCode: commission.code,
        productName: parentNameMap.get(commission.productId) ?? commission.name,
        category: commission.category ?? null,
        clicks,
        successfulOrders,
        conversionRate,
      });
    }

    return {
      data,
      total: productPage.totalDocs,
      page,
      limit,
      totalPages: productPage.totalPages,
      hasNextPage: productPage.hasNextPage,
    };
  }

  /**
   * Resolve commission rate for a product using cascade:
   * 1. product_commissions (affiliate, product) -> commissionRate
   * 2. product_commissions (global, product) -> commissionRate
   * 3. affiliate.defaultCommissionRate
   * 4. commission_settings.defaultCommissionRate
   */
  private async resolveCommissionRate(
    affiliateId: string,
    productId: string,
    affiliate: Affiliate | null,
    globalDefaultRate: number,
  ): Promise<number> {
    // 1. Check affiliate-specific product commission
    const productCommission = await this.productCommissionRepository.findOne(
      affiliateId,
      productId,
    );
    if (productCommission) {
      return productCommission.commissionRate;
    }

    // 2. Check global product commission (affiliateId = null)
    const globalProductCommission =
      await this.productCommissionRepository.findOne(null, productId);
    if (globalProductCommission) {
      return globalProductCommission.commissionRate;
    }

    // 3. Affiliate default
    if (affiliate?.defaultCommissionRate != null) {
      return affiliate.defaultCommissionRate;
    }

    // 4. Global default
    return globalDefaultRate;
  }
}
