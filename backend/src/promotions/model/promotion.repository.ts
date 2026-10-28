import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult, Types } from 'mongoose';
import {
  PromotionRepository,
  PromotionQueryOptions,
} from '../domain/promotion.repository';
import { Promotion } from '../domain/promotion';
import { PromotionSchemaClass, PromotionDocument } from './promotion.schema';
import { PromotionMapper } from './promotion.mapper';
import { PromotionType } from '../domain/promotion-type.enum';
import { PromotionStatus } from '../domain/promotion-status.enum';
import { BundleDealSubType } from '../domain/bundle-deal-sub-type.enum';

@Injectable()
export class PromotionRepositoryImpl extends PromotionRepository {
  constructor(
    @InjectModel(PromotionSchemaClass.name)
    private readonly promotionModel: Model<PromotionDocument> &
      PaginateModel<PromotionDocument>,
  ) {
    super();
  }

  async create(
    data: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Promotion> {
    const persistenceData = PromotionMapper.toPersistence(data);
    const created = await this.promotionModel.create(persistenceData);
    return PromotionMapper.toDomain(created);
  }

  async findById(id: string): Promise<Promotion | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.promotionModel
      .findOne({
        _id: new Types.ObjectId(id),
        deletedAt: null,
      })
      .exec();
    return doc ? PromotionMapper.toDomain(doc) : null;
  }

  async findAll(
    options: PromotionQueryOptions,
    page: number,
    limit: number,
  ): Promise<PaginateResult<Promotion>> {
    const query: any = { deletedAt: null };
    const now = new Date();

    // Type filter
    if (options.type) {
      query.type = options.type;
    }

    // Status filter - convert to DB query conditions
    if (options.status) {
      switch (options.status) {
        case PromotionStatus.ACTIVE:
          // Active: isEnabled=true AND within time range
          query.isEnabled = true;
          query.startTime = { $lte: now };
          query.endTime = { $gte: now };
          break;
        case PromotionStatus.UPCOMING:
          // Upcoming: isEnabled=true AND start time is in the future
          query.isEnabled = true;
          query.startTime = { $gt: now };
          break;
        case PromotionStatus.ENDED:
          // Ended: end time is in the past (regardless of isEnabled)
          query.endTime = { $lt: now };
          break;
        case PromotionStatus.PAUSED:
          // Paused: isEnabled=false AND not ended yet
          query.isEnabled = false;
          query.endTime = { $gte: now };
          break;
      }
    }

    // Keyword search
    if (options.keyword) {
      query.$text = { $search: options.keyword };
    }

    const result = await this.promotionModel.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    // Map to domain entities
    const docs = result.docs.map((doc) => PromotionMapper.toDomain(doc));

    return {
      ...result,
      docs,
    };
  }

  async findActiveByType(type: PromotionType): Promise<Promotion[]> {
    const now = new Date();
    const docs = await this.promotionModel
      .find({
        type,
        isEnabled: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
        deletedAt: null,
      })
      .exec();

    return docs.map((doc) => PromotionMapper.toDomain(doc));
  }

  async findActiveForProductHighlights(
    productId: string,
  ): Promise<Promotion[]> {
    if (!Types.ObjectId.isValid(productId)) return [];

    const now = new Date();
    const docs = await this.promotionModel
      .find({
        isEnabled: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
        deletedAt: null,
        $or: [
          { type: PromotionType.ORDER_DISCOUNT },
          {
            type: PromotionType.BUNDLE_DEAL,
            'bundleDealConfig.subType': BundleDealSubType.BUY_TO_GET_GIFT,
          },
          {
            type: PromotionType.BUNDLE_DEAL,
            'bundleDealConfig.subType': BundleDealSubType.BUY_X_GET_Y,
            'bundleDealConfig.requiredProducts.productId': new Types.ObjectId(
              productId,
            ),
          },
        ],
      })
      .sort({ endTime: 1, name: 1, _id: 1 })
      .exec();

    return docs.map((doc) => PromotionMapper.toDomain(doc));
  }

  async update(
    id: string,
    data: Partial<Omit<Promotion, 'id' | 'createdAt'>>,
  ): Promise<Promotion | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updateData: any = { ...data, updatedAt: new Date() };

    // Handle nested bundleDealConfig update
    if (data.bundleDealConfig) {
      updateData.bundleDealConfig = {
        subType: data.bundleDealConfig.subType,
        tiers: (data.bundleDealConfig.tiers || []).map((tier) => ({
          minOrderValue: tier.minOrderValue,
          giftProducts: tier.giftProducts.map((gp) => ({
            productId: new Types.ObjectId(gp.productId),
            name: gp.name,
            image: gp.image,
          })),
        })),
        requiredQuantity: data.bundleDealConfig.requiredQuantity,
        requiredProducts: (data.bundleDealConfig.requiredProducts || []).map(
          (rp) => ({
            productId: new Types.ObjectId(rp.productId),
            name: rp.name,
            image: rp.image,
          }),
        ),
        giftQuantity: data.bundleDealConfig.giftQuantity,
        giftProducts: (data.bundleDealConfig.giftProducts || []).map((gp) => ({
          productId: new Types.ObjectId(gp.productId),
          name: gp.name,
          image: gp.image,
        })),
        minimumOrderValue: data.bundleDealConfig.minimumOrderValue,
        maxGiftQuantity: data.bundleDealConfig.maxGiftQuantity,
        currentGiftCount: data.bundleDealConfig.currentGiftCount ?? 0,
        notApplicableWithOtherPromotions:
          data.bundleDealConfig.notApplicableWithOtherPromotions ?? false,
      };
    }

    // Handle nested orderDiscountConfig update
    if (data.orderDiscountConfig) {
      updateData.orderDiscountConfig = {
        subType: data.orderDiscountConfig.subType,
        promoCode: data.orderDiscountConfig.promoCode,
        discountType: data.orderDiscountConfig.discountType,
        discountValue: data.orderDiscountConfig.discountValue,
        maxDiscountValue: data.orderDiscountConfig.maxDiscountValue,
        minimumOrderValue: data.orderDiscountConfig.minimumOrderValue,
        notApplicableWithOtherPromotions:
          data.orderDiscountConfig.notApplicableWithOtherPromotions,
        singleUsePerCustomer: data.orderDiscountConfig.singleUsePerCustomer,
        totalUsageLimit: data.orderDiscountConfig.totalUsageLimit,
        currentUsageCount: data.orderDiscountConfig.currentUsageCount,
      };
    }

    // Handle nested productDiscountConfig update
    if (data.productDiscountConfig) {
      updateData.productDiscountConfig = {
        discountType: data.productDiscountConfig.discountType,
        discountValue: data.productDiscountConfig.discountValue,
        maxDiscountValue: data.productDiscountConfig.maxDiscountValue,
      };
    }

    const updated = await this.promotionModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), deletedAt: null },
        { $set: updateData },
        { new: true },
      )
      .exec();

    return updated ? PromotionMapper.toDomain(updated) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.promotionModel
      .updateOne(
        { _id: new Types.ObjectId(id), deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const query: any = { name, deletedAt: null };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const count = await this.promotionModel.countDocuments(query).exec();
    return count > 0;
  }

  async findByPromoCode(promoCode: string): Promise<Promotion | null> {
    const doc = await this.promotionModel
      .findOne({
        'orderDiscountConfig.promoCode': promoCode,
        deletedAt: null,
      })
      .exec();
    return doc ? PromotionMapper.toDomain(doc) : null;
  }

  /**
   * Atomically increment usage count for order discount promo code
   * Checks totalUsageLimit and singleUsePerCustomer before incrementing
   */
  async incrementOrderDiscountUsage(
    promotionId: string,
  ): Promise<Promotion | null> {
    if (!Types.ObjectId.isValid(promotionId)) return null;

    // Build query conditions
    const conditions: Record<string, unknown> = {
      _id: new Types.ObjectId(promotionId),
      deletedAt: null,
    };

    // Check total usage limit
    conditions.$or = [
      { 'orderDiscountConfig.totalUsageLimit': null },
      { 'orderDiscountConfig.totalUsageLimit': { $exists: false } },
      {
        $expr: {
          $lt: [
            { $ifNull: ['$orderDiscountConfig.currentUsageCount', 0] },
            '$orderDiscountConfig.totalUsageLimit',
          ],
        },
      },
    ];

    // Build update
    const update: Record<string, unknown> = {
      $inc: { 'orderDiscountConfig.currentUsageCount': 1 },
      $set: { updatedAt: new Date() },
    };

    const result = await this.promotionModel
      .findOneAndUpdate(conditions, update, { new: true })
      .exec();

    return result ? PromotionMapper.toDomain(result) : null;
  }

  /**
   * Atomically increment gift count for bundle deal (BUY_X_GET_Y)
   * Checks maxGiftQuantity before incrementing
   */
  async incrementBundleDealGiftCount(
    promotionId: string,
    giftCount: number,
  ): Promise<Promotion | null> {
    if (!Types.ObjectId.isValid(promotionId)) return null;
    if (!giftCount || giftCount <= 0) return null;

    const conditions: Record<string, unknown> = {
      _id: new Types.ObjectId(promotionId),
      deletedAt: null,
      'bundleDealConfig.subType': BundleDealSubType.BUY_X_GET_Y,
    };

    conditions.$or = [
      { 'bundleDealConfig.maxGiftQuantity': null },
      { 'bundleDealConfig.maxGiftQuantity': { $exists: false } },
      {
        $expr: {
          $lte: [
            {
              $add: [
                { $ifNull: ['$bundleDealConfig.currentGiftCount', 0] },
                giftCount,
              ],
            },
            '$bundleDealConfig.maxGiftQuantity',
          ],
        },
      },
    ];

    const update: Record<string, unknown> = {
      $inc: { 'bundleDealConfig.currentGiftCount': giftCount },
      $set: { updatedAt: new Date() },
    };

    const result = await this.promotionModel
      .findOneAndUpdate(conditions, update, { new: true })
      .exec();

    return result ? PromotionMapper.toDomain(result) : null;
  }

  /**
   * Find all active product discount promotions
   */
  async findActiveProductDiscounts(): Promise<Promotion[]> {
    const now = new Date();
    const docs = await this.promotionModel
      .find({
        type: PromotionType.PRODUCT_DISCOUNT,
        isEnabled: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
        deletedAt: null,
      })
      .exec();

    return docs.map((doc) => PromotionMapper.toDomain(doc));
  }
}
