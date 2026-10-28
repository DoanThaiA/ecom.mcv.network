import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderSchemaClass } from '../shop/order/model/order.schema';
import { PromotionRepository } from './domain/promotion.repository';
import { PromotionType } from './domain/promotion-type.enum';
import { QueryPromotionStatsDto } from './dto/query-promotion-stats.dto';
import { DiscountDetailType } from '../shop/order/domain/order';
import { PromotionProductRepository } from '../promotion-products/domain/promotion-product.repository';

/**
 * Service for computing promotion statistics from order data
 */
@Injectable()
export class PromotionStatsService {
  constructor(
    @InjectModel(OrderSchemaClass.name)
    private readonly orderModel: Model<OrderSchemaClass>,
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
  ) {}

  /**
   * Get orders for a promotion, dispatching by promotion type
   */
  async getPromotionOrders(promotionId: string, query: QueryPromotionStatsDto) {
    const promotion = await this.promotionRepository.findById(promotionId);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    switch (promotion.type) {
      case PromotionType.PRODUCT_DISCOUNT:
        return this.getProductDiscountOrders(promotion, query);
      case PromotionType.ORDER_DISCOUNT:
        return this.getOrderDiscountOrders(promotion, query);
      case PromotionType.BUNDLE_DEAL:
        return this.getBundleDealOrders(promotionId, query);
      default:
        throw new NotFoundException('Unsupported promotion type');
    }
  }

  /**
   * Get product statistics for a promotion, dispatching by type
   */
  async getPromotionProductStats(
    promotionId: string,
    query: QueryPromotionStatsDto,
  ) {
    const promotion = await this.promotionRepository.findById(promotionId);
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    switch (promotion.type) {
      case PromotionType.PRODUCT_DISCOUNT:
        return this.getProductDiscountProductStats(promotion, query);
      case PromotionType.BUNDLE_DEAL:
        return this.getBundleDealGiftProductStats(promotionId, query);
      default:
        throw new NotFoundException(
          'Product stats not available for this promotion type',
        );
    }
  }

  /**
   * Product Discount: Get order stats
   */
  private async getProductDiscountOrders(
    promotion: any,
    query: QueryPromotionStatsDto,
  ) {
    return this.getProductDiscountAutoApplyOrders(promotion.id, query);
  }

  /**
   * Product Discount AUTO_APPLY: Get per-item order rows from both storage paths.
   * Path 1 (item-level): items[].discountDetails with type=PRODUCT_DISCOUNT — discount info
   *   is read directly from item's discountDetails.
   * Path 2 (order-level): order.discountDetails with type=PRODUCT_DISCOUNT (user-applied
   *   promotions) — discount info is computed from promotion_products config.
   * Each eligible item per order becomes one row.
   */
  private async getProductDiscountAutoApplyOrders(
    promotionId: string,
    query: QueryPromotionStatsDto,
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const dateFilter = this.buildDateFilter(query);

    // Fetch eligible products for order-level path enrichment
    const promoProducts =
      await this.promotionProductRepository.findByPromotionIdWithPagination({
        promotionId,
        paginationOptions: { page: 1, limit: 10000 },
      });
    const promoProductMap = new Map(
      promoProducts.docs.map((p) => [p.productId, p]),
    );
    const eligibleObjectIds = Array.from(promoProductMap.keys()).map(
      (id) => new Types.ObjectId(id),
    );

    // --- Path 1: item-level rows ---
    const itemLevelMatch: any = {
      'items.discountDetails': {
        $elemMatch: {
          type: DiscountDetailType.PRODUCT_DISCOUNT,
          referenceId: promotionId,
        },
      },
      ...dateFilter,
    };

    const itemLevelResult = await this.orderModel.aggregate([
      { $match: itemLevelMatch },
      { $unwind: '$items' },
      { $unwind: '$items.discountDetails' },
      {
        $match: {
          'items.discountDetails.type': DiscountDetailType.PRODUCT_DISCOUNT,
          'items.discountDetails.referenceId': promotionId,
        },
      },
      {
        $project: {
          _orderId: '$_id',
          orderNumber: 1,
          nhanhOrderId: '$nhanh.orderId',
          customerName: '$customer.name',
          customerPhone: '$customer.phone',
          productName: '$items.name',
          quantity: '$items.quantity',
          discountedPrice: {
            $subtract: [
              '$items.originalPrice',
              '$items.discountDetails.discountAmountPerUnit',
            ],
          },
          totalDiscount: '$items.discountDetails.discountAmount',
          paymentAmount: '$total',
          createdAt: 1,
        },
      },
    ]);

    // --- Path 2: order-level rows (user-applied product discount promotions) ---
    let orderLevelResult: Array<{
      _orderId: unknown;
      orderNumber: string;
      nhanhOrderId?: string;
      customerName: string;
      customerPhone: string;
      productName: string;
      quantity: number;
      discountedPrice: number | null;
      totalDiscount: number;
      paymentAmount: number;
      createdAt: Date;
      _productId: unknown;
    }> = [];

    if (eligibleObjectIds.length > 0) {
      const orderLevelMatch: any = {
        discountDetails: {
          $elemMatch: {
            type: DiscountDetailType.PRODUCT_DISCOUNT,
            referenceId: promotionId,
          },
        },
        // Exclude orders already covered by item-level path
        'items.discountDetails': {
          $not: {
            $elemMatch: {
              type: DiscountDetailType.PRODUCT_DISCOUNT,
              referenceId: promotionId,
            },
          },
        },
        ...dateFilter,
      };

      const rawOrderLevel = await this.orderModel.aggregate([
        { $match: orderLevelMatch },
        { $unwind: '$items' },
        {
          $match: {
            'items.productId': { $in: eligibleObjectIds },
            'items.isGift': { $ne: true },
          },
        },
        {
          $project: {
            _orderId: '$_id',
            orderNumber: 1,
            nhanhOrderId: '$nhanh.orderId',
            customerName: '$customer.name',
            customerPhone: '$customer.phone',
            productName: '$items.name',
            quantity: '$items.quantity',
            paymentAmount: '$total',
            createdAt: 1,
            _productId: '$items.productId',
          },
        },
      ]);

      // Enrich with discountedPrice and totalDiscount from promoProductMap
      orderLevelResult = rawOrderLevel.map((row) => {
        const pp = promoProductMap.get(String(row._productId));
        return {
          ...row,
          discountedPrice: pp ? pp.discountedPrice : null,
          totalDiscount: pp ? pp.discountAmount * row.quantity : 0,
        };
      });
    }

    // Merge both paths and sort by createdAt desc
    const allRows = [...itemLevelResult, ...orderLevelResult].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const totalDocs = allRows.length;
    const pagedDocs = allRows.slice(skip, skip + limit).map((row) => ({
      orderId: row._orderId,
      orderNumber: row.orderNumber,
      nhanhOrderId: row.nhanhOrderId,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      productName: row.productName,
      quantity: row.quantity,
      discountedPrice: row.discountedPrice,
      totalDiscount: row.totalDiscount,
      paymentAmount: row.paymentAmount,
      createdAt: row.createdAt,
    }));

    const totalQuantity = allRows.reduce((sum, r) => sum + r.quantity, 0);
    const totalDiscountAmount = allRows.reduce(
      (sum, r) => sum + r.totalDiscount,
      0,
    );
    // De-duplicate orders for totalOrders and totalPaymentAmount
    const orderMap = new Map<string, number>();
    for (const row of allRows) {
      const key = String(row._orderId);
      if (!orderMap.has(key)) {
        orderMap.set(key, row.paymentAmount);
      }
    }
    const totalOrders = orderMap.size;
    const totalPaymentAmount = Array.from(orderMap.values()).reduce(
      (sum, v) => sum + v,
      0,
    );

    return {
      docs: pagedDocs,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      summary: {
        totalOrders,
        totalQuantity,
        totalDiscountAmount,
        totalPaymentAmount,
      },
    };
  }

  /**
   * Order Discount: Get orders where discountDetails has COUPON type
   * with referenceId matching the promo code
   */
  private async getOrderDiscountOrders(
    promotion: any,
    query: QueryPromotionStatsDto,
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const dateFilter = this.buildDateFilter(query);

    // Order discount uses promo code as referenceId in order discountDetails
    const promoCode = promotion.orderDiscountConfig?.promoCode;
    const promotionId = promotion.id;

    // Build match: either by promo code (COUPON type) or by promotionId
    const refMatchConditions: any[] = [];

    if (promoCode) {
      refMatchConditions.push({
        'discountDetails.type': DiscountDetailType.COUPON,
        'discountDetails.referenceId': promoCode,
      });
    }

    // Auto-apply order discounts may store referenceId as promotionId
    refMatchConditions.push({
      'discountDetails.referenceId': promotionId,
    });

    const matchStage: any = {
      $or: refMatchConditions,
      ...dateFilter,
    };

    const result = await this.orderModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          matchedDiscount: {
            $filter: {
              input: { $ifNull: ['$discountDetails', []] },
              cond: {
                $or: [
                  ...(promoCode
                    ? [
                        {
                          $and: [
                            {
                              $eq: [
                                '$$this.type',
                                DiscountDetailType.COUPON as string,
                              ],
                            },
                            { $eq: ['$$this.referenceId', promoCode] },
                          ],
                        },
                      ]
                    : []),
                  { $eq: ['$$this.referenceId', promotionId] },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          discountValue: {
            $reduce: {
              input: '$matchedDiscount',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.discountAmount'] },
            },
          },
        },
      },
      {
        $facet: {
          docs: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                orderId: '$_id',
                orderNumber: 1,
                nhanhOrderId: '$nhanh.orderId',
                customerName: '$customer.name',
                customerPhone: '$customer.phone',
                preDiscountValue: '$subtotal',
                discountValue: 1,
                paymentAmount: '$total',
                createdAt: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalPreDiscountValue: { $sum: '$subtotal' },
                totalDiscountAmount: { $sum: '$discountValue' },
                totalPaymentAmount: { $sum: '$total' },
              },
            },
          ],
        },
      },
    ]);

    const data = result[0];
    const totalDocs = data.totalCount[0]?.count || 0;
    const summary = data.summary[0] || {
      totalOrders: 0,
      totalPreDiscountValue: 0,
      totalDiscountAmount: 0,
      totalPaymentAmount: 0,
    };

    return {
      docs: data.docs,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      summary: {
        totalOrders: summary.totalOrders,
        totalPreDiscountValue: summary.totalPreDiscountValue,
        totalDiscountAmount: summary.totalDiscountAmount,
        totalPaymentAmount: summary.totalPaymentAmount,
      },
    };
  }

  /**
   * Bundle Deal: Get orders where items are gifts from this promotion.
   * Each order is returned as a single row with aggregated gift products list.
   */
  private async getBundleDealOrders(
    promotionId: string,
    query: QueryPromotionStatsDto,
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const dateFilter = this.buildDateFilter(query);

    const matchStage: any = {
      'items.giftPromotionId': promotionId,
      'items.isGift': true,
      ...dateFilter,
    };

    const result = await this.orderModel.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $match: {
          'items.giftPromotionId': promotionId,
          'items.isGift': true,
        },
      },
      // Group gift items back by order
      {
        $group: {
          _id: '$_id',
          orderNumber: { $first: '$orderNumber' },
          nhanhOrderId: { $first: '$nhanh.orderId' },
          customerName: { $first: '$customer.name' },
          customerPhone: { $first: '$customer.phone' },
          paymentAmount: { $first: '$total' },
          createdAt: { $first: '$createdAt' },
          giftProducts: {
            $push: {
              name: '$items.name',
              quantity: '$items.quantity',
              unitPrice: '$items.originalPrice',
              value: {
                $multiply: ['$items.originalPrice', '$items.quantity'],
              },
            },
          },
          totalGiftQuantity: { $sum: '$items.quantity' },
          totalGiftValue: {
            $sum: {
              $multiply: ['$items.originalPrice', '$items.quantity'],
            },
          },
        },
      },
      {
        $facet: {
          docs: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                orderId: '$_id',
                orderNumber: 1,
                nhanhOrderId: 1,
                customerName: 1,
                customerPhone: 1,
                giftProducts: 1,
                totalGiftQuantity: 1,
                totalGiftValue: 1,
                paymentAmount: 1,
                createdAt: 1,
                _id: 0,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
          summary: [
            {
              $group: {
                _id: null,
                totalQuantity: { $sum: '$totalGiftQuantity' },
                totalGiftValue: { $sum: '$totalGiftValue' },
                totalPaymentAmount: { $sum: '$paymentAmount' },
                totalOrders: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const data = result[0];
    const totalDocs = data.totalCount[0]?.count || 0;
    const summary = data.summary[0] || {
      totalOrders: 0,
      totalQuantity: 0,
      totalGiftValue: 0,
      totalPaymentAmount: 0,
    };

    return {
      docs: data.docs,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      summary: {
        totalOrders: summary.totalOrders,
        totalQuantity: summary.totalQuantity,
        totalGiftValue: summary.totalGiftValue,
        totalPaymentAmount: summary.totalPaymentAmount,
      },
    };
  }

  /**
   * Product Discount: Get product-level stats
   */
  private async getProductDiscountProductStats(
    promotion: any,
    query: QueryPromotionStatsDto,
  ) {
    return this.getProductDiscountAutoApplyProductStats(promotion.id, query);
  }

  /**
   * Product Discount AUTO_APPLY: Aggregate product-level stats from both storage paths.
   * Path 1 (item-level): items[].discountDetails with type=PRODUCT_DISCOUNT.
   * Path 2 (order-level): order.discountDetails with type=PRODUCT_DISCOUNT — items matched
   * against eligible products from promotion_products collection.
   */
  private async getProductDiscountAutoApplyProductStats(
    promotionId: string,
    query: QueryPromotionStatsDto,
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const dateFilter = this.buildDateFilter(query);

    // Fetch eligible products for order-level path enrichment
    const promoProducts =
      await this.promotionProductRepository.findByPromotionIdWithPagination({
        promotionId,
        paginationOptions: { page: 1, limit: 10000 },
      });
    const promoProductMap = new Map(
      promoProducts.docs.map((p) => [p.productId, p]),
    );
    const eligibleProductIds = Array.from(promoProductMap.keys());
    const eligibleObjectIds = eligibleProductIds.map(
      (id) => new Types.ObjectId(id),
    );

    // --- Path 1: item-level ---
    const itemLevelMatch: any = {
      'items.discountDetails': {
        $elemMatch: {
          type: DiscountDetailType.PRODUCT_DISCOUNT,
          referenceId: promotionId,
        },
      },
      ...dateFilter,
    };

    const itemLevelResult = await this.orderModel.aggregate([
      { $match: itemLevelMatch },
      { $unwind: '$items' },
      { $unwind: '$items.discountDetails' },
      {
        $match: {
          'items.discountDetails.type': DiscountDetailType.PRODUCT_DISCOUNT,
          'items.discountDetails.referenceId': promotionId,
        },
      },
      {
        $group: {
          _id: '$items.productId',
          code: { $first: '$items.code' },
          image: { $first: '$items.image' },
          name: { $first: '$items.name' },
          sellingPrice: { $first: '$items.originalPrice' },
          discountedPrice: {
            $first: {
              $subtract: [
                '$items.originalPrice',
                '$items.discountDetails.discountAmountPerUnit',
              ],
            },
          },
          quantityDiscounted: { $sum: '$items.quantity' },
          totalDiscountValue: { $sum: '$items.discountDetails.discountAmount' },
        },
      },
    ]);

    // --- Path 2: order-level (user-applied product discount promotions) ---
    let orderLevelRows: Array<{
      _id: unknown;
      code: string;
      image: string | null;
      name: string;
      sellingPrice: number;
      discountedPrice: number | null;
      quantityDiscounted: number;
      totalDiscountValue: number;
    }> = [];

    if (eligibleObjectIds.length > 0) {
      const orderLevelMatch: any = {
        discountDetails: {
          $elemMatch: {
            type: DiscountDetailType.PRODUCT_DISCOUNT,
            referenceId: promotionId,
          },
        },
        // Exclude orders already covered by item-level path
        'items.discountDetails': {
          $not: {
            $elemMatch: {
              type: DiscountDetailType.PRODUCT_DISCOUNT,
              referenceId: promotionId,
            },
          },
        },
        ...dateFilter,
      };

      orderLevelRows = await this.orderModel.aggregate([
        { $match: orderLevelMatch },
        { $unwind: '$items' },
        {
          $match: {
            'items.productId': { $in: eligibleObjectIds },
            'items.isGift': { $ne: true },
          },
        },
        {
          $group: {
            _id: '$items.productId',
            code: { $first: '$items.code' },
            image: { $first: '$items.image' },
            name: { $first: '$items.name' },
            sellingPrice: { $first: '$items.originalPrice' },
            quantityDiscounted: { $sum: '$items.quantity' },
          },
        },
      ]);
    }

    // Merge both paths by productId
    const mergedMap = new Map<
      string,
      {
        _id: unknown;
        code: string;
        image: string | null;
        name: string;
        sellingPrice: number;
        discountedPrice: number | null;
        quantityDiscounted: number;
        totalDiscountValue: number;
      }
    >();

    for (const row of itemLevelResult) {
      if (row._id == null) continue;
      mergedMap.set(String(row._id), row);
    }

    for (const row of orderLevelRows) {
      if (row._id == null) continue;
      const key = String(row._id);
      const pp = promoProductMap.get(key);
      const discountedPrice = pp ? pp.discountedPrice : null;
      const discountValue = pp ? pp.discountAmount * row.quantityDiscounted : 0;
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!;
        existing.quantityDiscounted += row.quantityDiscounted;
        existing.totalDiscountValue += discountValue;
      } else {
        mergedMap.set(key, {
          ...row,
          discountedPrice,
          totalDiscountValue: discountValue,
        });
      }
    }

    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => b.quantityDiscounted - a.quantityDiscounted,
    );

    const totalDocs = merged.length;
    const pagedDocs = merged.slice(skip, skip + limit).map((row) => ({
      productId: row._id,
      code: row.code,
      image: row.image,
      name: row.name,
      sellingPrice: row.sellingPrice,
      discountedPrice: row.discountedPrice,
      quantityDiscounted: row.quantityDiscounted,
      totalDiscountValue: row.totalDiscountValue,
    }));

    const totalQuantity = merged.reduce(
      (sum, r) => sum + r.quantityDiscounted,
      0,
    );
    const totalDiscountValue = merged.reduce(
      (sum, r) => sum + r.totalDiscountValue,
      0,
    );

    return {
      docs: pagedDocs,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      summary: {
        totalQuantity,
        totalDiscountValue,
      },
    };
  }

  /**
   * Bundle Deal: Aggregate gift product stats from orders, grouped by parent product.
   * Variants belonging to the same parent product are merged into a single row.
   */
  private async getBundleDealGiftProductStats(
    promotionId: string,
    query: QueryPromotionStatsDto,
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const dateFilter = this.buildDateFilter(query);

    const matchStage: any = {
      'items.giftPromotionId': promotionId,
      'items.isGift': true,
      ...dateFilter,
    };

    const result = await this.orderModel.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $match: {
          'items.giftPromotionId': promotionId,
          'items.isGift': true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$items.variantId', '$items.productId'] },
          productId: { $first: '$items.productId' },
          code: { $first: '$items.code' },
          image: { $first: '$items.image' },
          name: { $first: '$items.name' },
          sellingPrice: { $first: '$items.originalPrice' },
          quantityGifted: { $sum: '$items.quantity' },
          giftValue: {
            $sum: {
              $multiply: ['$items.originalPrice', '$items.quantity'],
            },
          },
        },
      },
      {
        $facet: {
          docs: [
            { $sort: { quantityGifted: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                productId: 1,
                variantId: '$_id',
                code: 1,
                image: 1,
                name: 1,
                sellingPrice: 1,
                quantityGifted: 1,
                giftValue: 1,
                _id: 0,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
          summary: [
            {
              $group: {
                _id: null,
                totalQuantity: { $sum: '$quantityGifted' },
                totalGiftValue: { $sum: '$giftValue' },
              },
            },
          ],
        },
      },
    ]);

    const data = result[0];
    const totalDocs = data.totalCount[0]?.count || 0;
    const summary = data.summary[0] || {
      totalQuantity: 0,
      totalGiftValue: 0,
    };

    return {
      docs: data.docs,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      summary: {
        totalQuantity: summary.totalQuantity,
        totalGiftValue: summary.totalGiftValue,
      },
    };
  }

  /**
   * Build date filter for createdAt field
   */
  private buildDateFilter(query: QueryPromotionStatsDto): any {
    const filter: any = {};
    if (query.fromDate || query.toDate) {
      filter.createdAt = {};
      if (query.fromDate) {
        filter.createdAt.$gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        filter.createdAt.$lte = new Date(query.toDate);
      }
    }
    return filter;
  }
}
