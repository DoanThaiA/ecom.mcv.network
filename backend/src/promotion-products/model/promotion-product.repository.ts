import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  PromotionProductRepository,
  FilterPromotionProductDto,
  SortPromotionProductDto,
  UpdatePromotionProductData,
  IncrementSoldCountResult,
} from '../domain/promotion-product.repository';
import { PromotionProduct } from '../domain/promotion-product';
import { PromotionProductSchemaClass } from './promotion-product.schema';
import { PromotionProductMapper } from './promotion-product.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of PromotionProductRepository
 */
@Injectable()
export class PromotionProductDocumentRepository
  implements PromotionProductRepository
{
  private readonly logger = new Logger(PromotionProductDocumentRepository.name);

  constructor(
    @InjectModel(PromotionProductSchemaClass.name)
    private readonly promotionProductModel: PaginateModel<PromotionProductSchemaClass>,
  ) {}

  /**
   * Upsert many promotion products using bulkWrite
   */
  async upsertMany(
    products: Omit<PromotionProduct, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<number> {
    if (products.length === 0) return 0;

    const now = new Date();
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: {
          productId: new mongoose.Types.ObjectId(product.productId),
          promotionId: new mongoose.Types.ObjectId(product.promotionId),
        },
        update: {
          $set: {
            promotionName: product.promotionName,
            name: product.name,
            code: product.code,
            category: product.category,
            stock: product.stock,
            images: product.images,
            discountType: product.discountType,
            discountValue: product.discountValue,
            originalPrice: product.originalPrice,
            discountedPrice: product.discountedPrice,
            discountAmount: product.discountAmount,
            discountPercent: product.discountPercent,
            effectivePrice: product.effectivePrice,
            soldCount: product.soldCount,
            isEnabled: product.isEnabled,
            endTime: product.endTime,
            updatedAt: now,
          },
          $setOnInsert: {
            productId: new mongoose.Types.ObjectId(product.productId),
            promotionId: new mongoose.Types.ObjectId(product.promotionId),
            createdAt: now,
          },
        },
        upsert: true,
      },
    }));

    const result = await this.promotionProductModel.bulkWrite(bulkOps, {
      ordered: false,
    });

    return (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
  }

  /**
   * Remove all promotion products for a given promotion
   */
  async removeByPromotionId(promotionId: string): Promise<number> {
    const result = await this.promotionProductModel.deleteMany({
      promotionId: new mongoose.Types.ObjectId(promotionId),
    });
    return result.deletedCount ?? 0;
  }

  /**
   * Remove promotion products not in the given product ID list
   */
  async removeNotInProductIds(
    promotionId: string,
    keepProductIds: string[],
  ): Promise<number> {
    const result = await this.promotionProductModel.deleteMany({
      promotionId: new mongoose.Types.ObjectId(promotionId),
      productId: {
        $nin: keepProductIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });
    return result.deletedCount ?? 0;
  }

  /**
   * Find promotion products with pagination (shop-facing, only enabled + saleable)
   */
  async findManyWithPagination(params: {
    promotionId: string;
    filterOptions?: FilterPromotionProductDto | null;
    sortOptions?: SortPromotionProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<PromotionProduct>> {
    const filter: FilterQuery<PromotionProductSchemaClass> = {
      promotionId: new mongoose.Types.ObjectId(params.promotionId),
      isEnabled: true,
      discountedPrice: { $ne: null },
    };

    // Ensure actual discount exists
    filter.$expr = {
      $ne: ['$effectivePrice', '$originalPrice'],
    };

    this.applyFilters(filter, params.filterOptions);

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    if (params.sortOptions && params.sortOptions.length > 0) {
      params.sortOptions.forEach((s) => {
        sort[s.orderBy] = s.order === 'asc' ? 1 : -1;
      });
    } else {
      sort.stock = -1;
    }
    sort._id = 1;

    const paginateOptions: Record<string, unknown> = {
      page: params.paginationOptions.page,
      limit: params.paginationOptions.limit,
      sort,
      lean: true,
    };

    if (sort.name) {
      paginateOptions.collation = { locale: 'vi' };
    }

    const result = await this.promotionProductModel.paginate(
      filter,
      paginateOptions,
    );

    return {
      ...result,
      docs: result.docs.map((doc) => PromotionProductMapper.toDomain(doc)),
    };
  }

  /**
   * Count enabled promotion products for a given promotion
   */
  async countByPromotionId(promotionId: string): Promise<number> {
    return this.promotionProductModel.countDocuments({
      promotionId: new mongoose.Types.ObjectId(promotionId),
      isEnabled: true,
    });
  }

  /**
   * Create a single promotion product
   */
  async createOne(
    product: Omit<PromotionProduct, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PromotionProduct> {
    const doc = await this.promotionProductModel.create({
      ...product,
      productId: new mongoose.Types.ObjectId(product.productId),
      promotionId: new mongoose.Types.ObjectId(product.promotionId),
    });
    const lean = doc.toObject();
    return PromotionProductMapper.toDomain(lean);
  }

  /**
   * Update a single promotion product by promotionId and productId
   */
  async updateOne(
    promotionId: string,
    productId: string,
    data: UpdatePromotionProductData,
  ): Promise<NullableType<PromotionProduct>> {
    const updateFields: Record<string, unknown> = {};
    if (data.discountType !== undefined)
      updateFields.discountType = data.discountType;
    if (data.discountValue !== undefined)
      updateFields.discountValue = data.discountValue;
    if (data.soldCount !== undefined) updateFields.soldCount = data.soldCount;
    if (data.isEnabled !== undefined) updateFields.isEnabled = data.isEnabled;
    if (data.discountedPrice !== undefined)
      updateFields.discountedPrice = data.discountedPrice;
    if (data.discountAmount !== undefined)
      updateFields.discountAmount = data.discountAmount;
    if (data.discountPercent !== undefined)
      updateFields.discountPercent = data.discountPercent;
    if (data.effectivePrice !== undefined)
      updateFields.effectivePrice = data.effectivePrice;

    const doc = await this.promotionProductModel
      .findOneAndUpdate(
        {
          promotionId: new mongoose.Types.ObjectId(promotionId),
          productId: new mongoose.Types.ObjectId(productId),
        },
        { $set: updateFields },
        { new: true },
      )
      .lean();

    return doc ? PromotionProductMapper.toDomain(doc) : null;
  }

  /**
   * Remove a single promotion product
   */
  async removeOne(promotionId: string, productId: string): Promise<boolean> {
    const result = await this.promotionProductModel.deleteOne({
      promotionId: new mongoose.Types.ObjectId(promotionId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    return (result.deletedCount ?? 0) > 0;
  }

  /**
   * Bulk update promotion products
   */
  async bulkUpdate(
    promotionId: string,
    updates: Array<{ productId: string } & UpdatePromotionProductData>,
  ): Promise<number> {
    if (updates.length === 0) return 0;

    const promotionOid = new mongoose.Types.ObjectId(promotionId);

    const bulkOps = updates.map((update) => {
      const updateFields: Record<string, unknown> = {};
      if (update.discountType !== undefined)
        updateFields.discountType = update.discountType;
      if (update.discountValue !== undefined)
        updateFields.discountValue = update.discountValue;
      if (update.isEnabled !== undefined)
        updateFields.isEnabled = update.isEnabled;
      if (update.discountedPrice !== undefined)
        updateFields.discountedPrice = update.discountedPrice;
      if (update.discountAmount !== undefined)
        updateFields.discountAmount = update.discountAmount;
      if (update.discountPercent !== undefined)
        updateFields.discountPercent = update.discountPercent;
      if (update.effectivePrice !== undefined)
        updateFields.effectivePrice = update.effectivePrice;

      return {
        updateOne: {
          filter: {
            promotionId: promotionOid,
            productId: new mongoose.Types.ObjectId(update.productId),
          },
          update: { $set: updateFields },
        },
      };
    });

    const result = await this.promotionProductModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    return result.modifiedCount ?? 0;
  }

  /**
   * Find promotion products for a given promotion with pagination (CMS-facing, all products)
   */
  async findByPromotionIdWithPagination(params: {
    promotionId: string;
    filterOptions?: FilterPromotionProductDto | null;
    sortOptions?: SortPromotionProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<PromotionProduct>> {
    const filter: FilterQuery<PromotionProductSchemaClass> = {
      promotionId: new mongoose.Types.ObjectId(params.promotionId),
    };

    this.applyFilters(filter, params.filterOptions);

    const sort: Record<string, 1 | -1> = {};
    if (params.sortOptions && params.sortOptions.length > 0) {
      params.sortOptions.forEach((s) => {
        sort[s.orderBy] = s.order === 'asc' ? 1 : -1;
      });
    } else {
      sort.createdAt = -1;
    }
    sort._id = 1;

    const paginateOptions: Record<string, unknown> = {
      page: params.paginationOptions.page,
      limit: params.paginationOptions.limit,
      sort,
      lean: true,
    };

    if (sort.name) {
      paginateOptions.collation = { locale: 'vi' };
    }

    const result = await this.promotionProductModel.paginate(
      filter,
      paginateOptions,
    );

    return {
      ...result,
      docs: result.docs.map((doc) => PromotionProductMapper.toDomain(doc)),
    };
  }

  /**
   * Find a single promotion product by promotionId and productId
   */
  async findOneByProductId(
    promotionId: string,
    productId: string,
  ): Promise<NullableType<PromotionProduct>> {
    const doc = await this.promotionProductModel
      .findOne({
        promotionId: new mongoose.Types.ObjectId(promotionId),
        productId: new mongoose.Types.ObjectId(productId),
      })
      .lean();

    return doc ? PromotionProductMapper.toDomain(doc) : null;
  }

  /**
   * Find promotion products by promotionId and multiple productIds
   */
  async findByPromotionIdAndProductIds(
    promotionId: string,
    productIds: string[],
  ): Promise<PromotionProduct[]> {
    if (productIds.length === 0) return [];

    const docs = await this.promotionProductModel
      .find({
        promotionId: new mongoose.Types.ObjectId(promotionId),
        productId: {
          $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      })
      .lean();

    return docs.map((doc) => PromotionProductMapper.toDomain(doc));
  }

  /**
   * Find all product IDs for a given promotion (no pagination)
   */
  async findProductIdsByPromotionId(promotionId: string): Promise<string[]> {
    const docs = await this.promotionProductModel
      .find(
        { promotionId: new mongoose.Types.ObjectId(promotionId) },
        { productId: 1 },
      )
      .lean();

    return docs.map((doc) => doc.productId.toString());
  }

  /**
   * Find active promotion products for multiple product IDs across active promotions
   */
  async findActiveForProducts(
    activePromotionIds: string[],
    productIds: string[],
  ): Promise<Map<string, PromotionProduct>> {
    const result = new Map<string, PromotionProduct>();

    if (activePromotionIds.length === 0 || productIds.length === 0)
      return result;

    const docs = await this.promotionProductModel
      .find({
        promotionId: {
          $in: activePromotionIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        productId: {
          $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        isEnabled: true,
      })
      .lean();

    for (const doc of docs) {
      const entity = PromotionProductMapper.toDomain(doc);
      // Only add if not already mapped (first promotion wins)
      if (!result.has(entity.productId)) {
        result.set(entity.productId, entity);
      }
    }

    return result;
  }

  /**
   * Find an active promotion product for conflict checking
   */
  async findActiveProductByProductId(
    activePromotionIds: string[],
    productId: string,
    excludePromotionId?: string,
  ): Promise<NullableType<PromotionProduct>> {
    if (activePromotionIds.length === 0) return null;

    const filter: FilterQuery<PromotionProductSchemaClass> = {
      promotionId: {
        $in: activePromotionIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      productId: new mongoose.Types.ObjectId(productId),
      isEnabled: true,
    };

    if (excludePromotionId) {
      filter.promotionId = {
        ...filter.promotionId,
        $ne: new mongoose.Types.ObjectId(excludePromotionId),
      } as any;
      // Use $and to combine $in and $ne on same field
      filter.$and = [
        {
          promotionId: {
            $in: activePromotionIds.map(
              (id) => new mongoose.Types.ObjectId(id),
            ),
          },
        },
        {
          promotionId: {
            $ne: new mongoose.Types.ObjectId(excludePromotionId),
          },
        },
      ];
      delete filter.promotionId;
    }

    const doc = await this.promotionProductModel.findOne(filter).lean();

    return doc ? PromotionProductMapper.toDomain(doc) : null;
  }

  /**
   * Find all enabled promotion products for a given promotion (for sync cron)
   * Only filters by isEnabled, no status/hide/discount filters
   */
  async findEnabledByPromotionId(
    promotionId: string,
  ): Promise<PromotionProduct[]> {
    const docs = await this.promotionProductModel
      .find({
        promotionId: new mongoose.Types.ObjectId(promotionId),
        isEnabled: true,
      })
      .lean();

    return docs.map((doc) => PromotionProductMapper.toDomain(doc));
  }

  /**
   * Atomically increment soldCount for a promotion product
   */
  async incrementSoldCount(
    promotionId: string,
    productId: string,
    quantity: number,
  ): Promise<IncrementSoldCountResult> {
    const doc = await this.promotionProductModel
      .findOneAndUpdate(
        {
          promotionId: new mongoose.Types.ObjectId(promotionId),
          productId: new mongoose.Types.ObjectId(productId),
          isEnabled: true,
        },
        { $inc: { soldCount: quantity } },
        { new: true },
      )
      .lean();

    if (!doc) {
      return { success: false, newSoldCount: 0 };
    }

    return {
      success: true,
      newSoldCount: doc.soldCount,
    };
  }

  /**
   * Increment sold count for multiple checkout items (fire-and-forget)
   */
  incrementSoldCountForItems(
    items: Array<{
      promotionId?: string | null;
      productId: string;
      quantity: number;
    }>,
  ): void {
    const promotionItems = items.filter((item) => item.promotionId);

    if (promotionItems.length === 0) return;

    Promise.all(
      promotionItems.map((item) =>
        this.incrementSoldCount(
          item.promotionId!,
          item.productId,
          item.quantity,
        ),
      ),
    ).catch((err) => {
      this.logger.error(
        `Failed to increment promotion product soldCount: ${err.message}`,
      );
    });
  }

  /**
   * Apply filter options to a query filter
   */
  private applyFilters(
    filter: FilterQuery<PromotionProductSchemaClass>,
    filterOptions?: FilterPromotionProductDto | null,
  ): void {
    if (!filterOptions) return;

    const f = filterOptions;

    if (f.search) {
      const searchCondition = {
        $or: [
          { name: { $regex: escapeRegex(f.search), $options: 'i' } },
          { code: { $regex: escapeRegex(f.search), $options: 'i' } },
        ],
      };
      filter.$and = filter.$and || [];
      filter.$and.push(searchCondition);
    }

    if (f.categoryIds?.length) {
      filter['category.id'] = { $in: f.categoryIds };
    }

    if (f.minPrice !== undefined || f.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (f.minPrice !== undefined) {
        priceFilter.$gte = f.minPrice;
      }
      if (f.maxPrice !== undefined) {
        priceFilter.$lte = f.maxPrice;
      }
      filter.effectivePrice = priceFilter;
    }
  }
}
