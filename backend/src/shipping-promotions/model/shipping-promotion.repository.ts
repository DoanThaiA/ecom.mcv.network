import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult, Types } from 'mongoose';
import { ShippingPromotionType } from '../domain/shipping-promotion-type.enum';
import {
  ShippingPromotionRepository,
  ShippingPromotionQueryOptions,
} from '../domain/shipping-promotion.repository';
import { ShippingPromotion } from '../domain/shipping-promotion';
import { ShippingPromotionSchemaClass } from './shipping-promotion.schema';
import { ShippingPromotionMapper } from './shipping-promotion.mapper';
import { ShippingPromotionStatus } from '../domain/shipping-promotion-status.enum';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of ShippingPromotionRepository
 */
@Injectable()
export class ShippingPromotionDocumentRepository extends ShippingPromotionRepository {
  constructor(
    @InjectModel(ShippingPromotionSchemaClass.name)
    private readonly model: PaginateModel<ShippingPromotionSchemaClass>,
  ) {
    super();
  }

  /**
   * Create a new shipping promotion
   */
  async create(
    data: Omit<ShippingPromotion, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ShippingPromotion> {
    const now = new Date();
    const doc = ShippingPromotionMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as ShippingPromotion);

    const created = new this.model(doc);
    const saved = await created.save();
    return ShippingPromotionMapper.toDomain(saved.toObject());
  }

  /**
   * Find shipping promotion by ID
   */
  async findById(id: string): Promise<ShippingPromotion | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.model.findOne({ _id: id, deletedAt: null }).lean();

    return doc ? ShippingPromotionMapper.toDomain(doc) : null;
  }

  /**
   * Find shipping promotions with filtering and pagination
   */
  async findAll(
    options: ShippingPromotionQueryOptions,
    page: number,
    limit: number,
  ): Promise<PaginateResult<ShippingPromotion>> {
    const filter: FilterQuery<ShippingPromotionSchemaClass> = {
      deletedAt: null,
    };
    const now = new Date();

    // Filter by type
    if (options.type) {
      filter.type = options.type;
    }

    // Filter by computed status
    if (options.status) {
      switch (options.status) {
        case ShippingPromotionStatus.ACTIVE:
          filter.isEnabled = true;
          filter.startTime = { $lte: now };
          filter.endTime = { $gte: now };
          break;
        case ShippingPromotionStatus.UPCOMING:
          filter.isEnabled = true;
          filter.startTime = { $gt: now };
          break;
        case ShippingPromotionStatus.ENDED:
          filter.endTime = { $lt: now };
          break;
        case ShippingPromotionStatus.DISABLED:
          filter.isEnabled = false;
          break;
      }
    }

    // Search by name
    if (options.keyword) {
      filter.name = { $regex: escapeRegex(options.keyword), $options: 'i' };
    }

    const result = await this.model.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ShippingPromotionMapper.toDomain(doc)),
    };
  }

  /**
   * Update existing shipping promotion
   */
  async update(
    id: string,
    data: Partial<Omit<ShippingPromotion, 'id' | 'createdAt'>>,
  ): Promise<ShippingPromotion | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
    if (data.freeshippingConfig !== undefined)
      updateData.freeshippingConfig = data.freeshippingConfig;
    if (data.shippingDiscountConfig !== undefined)
      updateData.shippingDiscountConfig = data.shippingDiscountConfig;

    const updated = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return updated ? ShippingPromotionMapper.toDomain(updated) : null;
  }

  /**
   * Soft delete shipping promotion
   */
  async softDelete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.model
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();

    return !!result;
  }

  /**
   * Find an enabled shipping promotion of the given type whose time range overlaps
   */
  async findOverlapping(
    type: ShippingPromotionType,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<ShippingPromotion | null> {
    const filter: FilterQuery<ShippingPromotionSchemaClass> = {
      type,
      isEnabled: true,
      deletedAt: null,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    };

    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const doc = await this.model.findOne(filter).lean();
    return doc ? ShippingPromotionMapper.toDomain(doc) : null;
  }

  /**
   * Find active shipping promotions applicable for the given subtotal
   * Returns promotions that are enabled, within time range, and not deleted
   */
  async findActiveForCheckout(subtotal: number): Promise<ShippingPromotion[]> {
    const now = new Date();

    const docs = await this.model
      .find({
        isEnabled: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter by subtotal applicability
    return docs
      .map((doc) => ShippingPromotionMapper.toDomain(doc))
      .filter((promo) => {
        if (promo.freeshippingConfig) {
          return subtotal >= promo.freeshippingConfig.minimumOrderValue;
        }
        if (promo.shippingDiscountConfig) {
          // At least one tier must be applicable
          return promo.shippingDiscountConfig.tiers.some(
            (tier) => subtotal >= tier.minimumOrderValue,
          );
        }
        return false;
      });
  }

  async findActiveForDisplay(): Promise<ShippingPromotion[]> {
    const now = new Date();
    const docs = await this.model
      .find({
        isEnabled: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
        deletedAt: null,
      })
      .sort({ endTime: 1, name: 1, _id: 1 })
      .lean();

    return docs.map((doc) => ShippingPromotionMapper.toDomain(doc));
  }
}
