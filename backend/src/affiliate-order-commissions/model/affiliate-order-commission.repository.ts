import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  AffiliateOrderCommissionRepository,
  AffiliateOrderOverview,
  AffiliateProductAnalyticsItem,
} from '../domain/affiliate-order-commission.repository';
import { AffiliateOrderCommission } from '../domain/affiliate-order-commission';
import { AffiliateOrderCommissionSchemaClass } from './affiliate-order-commission.schema';
import { AffiliateOrderCommissionMapper } from './affiliate-order-commission.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { buildAccentInsensitivePattern } from '../../utils/search';

/** Order statuses considered "successful" for analytics */
const SUCCESSFUL_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
];

@Injectable()
export class AffiliateOrderCommissionDocumentRepository
  implements AffiliateOrderCommissionRepository
{
  constructor(
    @InjectModel(AffiliateOrderCommissionSchemaClass.name)
    private readonly model: PaginateModel<AffiliateOrderCommissionSchemaClass>,
  ) {}

  async create(
    data: Omit<AffiliateOrderCommission, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AffiliateOrderCommission> {
    const doc = AffiliateOrderCommissionMapper.toDocument({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AffiliateOrderCommission);

    const created = new this.model(doc);
    const saved = await created.save();
    return AffiliateOrderCommissionMapper.toDomain(saved.toObject());
  }

  async findByOrderId(
    orderId: string,
  ): Promise<NullableType<AffiliateOrderCommission>> {
    const doc = await this.model
      .findOne({ orderId: new mongoose.Types.ObjectId(orderId) })
      .lean();
    return doc ? AffiliateOrderCommissionMapper.toDomain(doc) : null;
  }

  async updateOrderStatus(orderId: string, orderStatus: string): Promise<void> {
    await this.model.updateOne(
      { orderId: new mongoose.Types.ObjectId(orderId) },
      { $set: { orderStatus, updatedAt: new Date() } },
    );
  }

  async findManyByAffiliate(options: {
    affiliateId: string;
    paginationOptions: IPaginationOptions;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<PaginateResult<AffiliateOrderCommission>> {
    const { affiliateId, paginationOptions, dateFrom, dateTo } = options;

    const filter: FilterQuery<AffiliateOrderCommissionSchemaClass> = {
      affiliateId: new mongoose.Types.ObjectId(affiliateId),
    };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = dateFrom;
      if (dateTo) filter.createdAt.$lte = dateTo;
    }

    const result = await this.model.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) =>
        AffiliateOrderCommissionMapper.toDomain(doc),
      ),
    };
  }

  async aggregateOverview(
    affiliateId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<AffiliateOrderOverview> {
    const matchStage: Record<string, unknown> = {
      affiliateId: new mongoose.Types.ObjectId(affiliateId),
    };

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.$gte = dateFrom;
      if (dateTo) createdAt.$lte = dateTo;
      matchStage.createdAt = createdAt;
    }

    const results = await this.model.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          successfulOrders: {
            $sum: {
              $cond: [{ $in: ['$orderStatus', SUCCESSFUL_STATUSES] }, 1, 0],
            },
          },
          revenueGenerated: {
            $sum: {
              $cond: [
                { $in: ['$orderStatus', SUCCESSFUL_STATUSES] },
                '$orderTotal',
                0,
              ],
            },
          },
          estimatedCommission: {
            $sum: {
              $cond: [
                { $in: ['$orderStatus', SUCCESSFUL_STATUSES] },
                '$totalCommission',
                0,
              ],
            },
          },
        },
      },
    ]);

    if (results.length === 0) {
      return {
        successfulOrders: 0,
        revenueGenerated: 0,
        estimatedCommission: 0,
      };
    }

    return {
      successfulOrders: results[0].successfulOrders,
      revenueGenerated: results[0].revenueGenerated,
      estimatedCommission: results[0].estimatedCommission,
    };
  }

  async sumTotalCommission(affiliateId: string): Promise<number> {
    const results = await this.model.aggregate([
      {
        $match: {
          affiliateId: new mongoose.Types.ObjectId(affiliateId),
          orderStatus: { $in: SUCCESSFUL_STATUSES },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalCommission' } } },
    ]);
    return results.length > 0 ? results[0].total : 0;
  }

  async aggregateByProducts(options: {
    affiliateId: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    productIds?: string[];
    paginationOptions: IPaginationOptions;
  }): Promise<{ data: AffiliateProductAnalyticsItem[]; total: number }> {
    const {
      affiliateId,
      dateFrom,
      dateTo,
      search,
      productIds,
      paginationOptions,
    } = options;

    const matchStage: Record<string, unknown> = {
      affiliateId: new mongoose.Types.ObjectId(affiliateId),
      orderStatus: { $in: SUCCESSFUL_STATUSES },
    };

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.$gte = dateFrom;
      if (dateTo) createdAt.$lte = dateTo;
      matchStage.createdAt = createdAt;
    }

    // Post-unwind filter for search and productIds
    const itemsMatch: Record<string, unknown> = {};
    if (search) {
      const pattern = buildAccentInsensitivePattern(search);
      itemsMatch['$or'] = [
        { 'items.productName': { $regex: pattern, $options: 'i' } },
        { 'items.productCode': { $regex: pattern, $options: 'i' } },
      ];
    }
    if (productIds?.length) {
      itemsMatch['items.productId'] = {
        $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const skip = (paginationOptions.page - 1) * paginationOptions.limit;

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      { $unwind: '$items' },
    ];

    if (Object.keys(itemsMatch).length > 0) {
      pipeline.push({ $match: itemsMatch });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            productId: '$items.productId',
            commissionRate: '$items.commissionRate',
          },
          productName: { $first: '$items.productName' },
          productCode: { $first: '$items.productCode' },
          successfulOrders: { $sum: 1 },
          revenueGenerated: { $sum: '$items.subtotal' },
          estimatedCommission: { $sum: '$items.commissionAmount' },
        },
      },
      { $sort: { productName: 1 as const, '_id.commissionRate': -1 as const } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: paginationOptions.limit }],
          total: [{ $count: 'count' }],
        },
      },
    );

    const results = await this.model.aggregate(pipeline);
    const facet = results[0] || { data: [], total: [] };
    const total = facet.total[0]?.count ?? 0;

    return {
      data: facet.data.map((r: any) => ({
        productId: r._id.productId.toString(),
        productName: r.productName,
        productCode: r.productCode,
        commissionRate: r._id.commissionRate,
        successfulOrders: r.successfulOrders,
        revenueGenerated: r.revenueGenerated,
        estimatedCommission: r.estimatedCommission,
      })),
      total,
    };
  }

  async findUnaudited(batchSize: number): Promise<AffiliateOrderCommission[]> {
    const docs = await this.model
      .find({
        auditedAt: null,
        orderStatus: { $in: SUCCESSFUL_STATUSES },
      })
      .sort({ createdAt: 1 })
      .limit(batchSize)
      .lean();
    return docs.map((doc) => AffiliateOrderCommissionMapper.toDomain(doc));
  }

  async markAudited(ids: string[]): Promise<void> {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    await this.model.updateMany(
      { _id: { $in: objectIds } },
      { $set: { auditedAt: new Date() } },
    );
  }

  async deauditNonSuccessful(): Promise<number> {
    const result = await this.model.updateMany(
      {
        auditedAt: { $ne: null },
        orderStatus: { $nin: SUCCESSFUL_STATUSES },
      },
      { $set: { auditedAt: null } },
    );
    return result.modifiedCount;
  }

  async sumAuditedCommission(affiliateId: string): Promise<number> {
    const results = await this.model.aggregate([
      {
        $match: {
          affiliateId: new mongoose.Types.ObjectId(affiliateId),
          auditedAt: { $ne: null },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalCommission' } } },
    ]);
    return results.length > 0 ? results[0].total : 0;
  }

  async aggregateTotalOrdersByProductIds(options: {
    affiliateId: string;
    productIds: string[];
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Map<string, { successfulOrders: number }>> {
    if (options.productIds.length === 0) return new Map();

    const matchStage: Record<string, unknown> = {
      affiliateId: new mongoose.Types.ObjectId(options.affiliateId),
      orderStatus: { $in: SUCCESSFUL_STATUSES },
    };

    if (options.dateFrom || options.dateTo) {
      const createdAt: Record<string, Date> = {};
      if (options.dateFrom) createdAt.$gte = options.dateFrom;
      if (options.dateTo) createdAt.$lte = options.dateTo;
      matchStage.createdAt = createdAt;
    }

    const productObjectIds = options.productIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      { $unwind: '$items' },
      { $match: { 'items.productId': { $in: productObjectIds } } },
      {
        $group: {
          _id: '$items.productId',
          successfulOrders: { $sum: 1 },
        },
      },
    ];

    const results = await this.model.aggregate(pipeline);

    const map = new Map<string, { successfulOrders: number }>();
    for (const r of results) {
      map.set(r._id.toString(), { successfulOrders: r.successfulOrders });
    }
    return map;
  }
}
