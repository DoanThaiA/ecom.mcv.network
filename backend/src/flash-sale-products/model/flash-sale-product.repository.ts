import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  FlashSaleProductRepository,
  FilterFlashSaleProductDto,
  SortFlashSaleProductDto,
  UpdateFlashSaleProductData,
  IncrementSoldCountResult,
} from '../domain/flash-sale-product.repository';
import { FlashSaleProduct } from '../domain/flash-sale-product';
import { FlashSaleProductSchemaClass } from './flash-sale-product.schema';
import { FlashSaleProductMapper } from './flash-sale-product.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { SALEABLE_STATUSES } from '../../products/domain/product-status.enum';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of FlashSaleProductRepository
 */
@Injectable()
export class FlashSaleProductDocumentRepository
  implements FlashSaleProductRepository
{
  private readonly logger = new Logger(FlashSaleProductDocumentRepository.name);

  constructor(
    @InjectModel(FlashSaleProductSchemaClass.name)
    private readonly flashSaleProductModel: PaginateModel<FlashSaleProductSchemaClass>,
  ) {}

  /**
   * Upsert many flash sale products using bulkWrite
   */
  async upsertMany(
    products: Omit<
      FlashSaleProduct,
      'id' | 'createdAt' | 'updatedAt' | 'remainingStock'
    >[],
  ): Promise<number> {
    if (products.length === 0) return 0;

    const now = new Date();
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: {
          productId: new mongoose.Types.ObjectId(product.productId),
          flashSaleId: new mongoose.Types.ObjectId(product.flashSaleId),
        },
        update: {
          $set: {
            flashSaleName: product.flashSaleName,
            name: product.name,
            code: product.code,
            category: product.category,
            status: product.status,
            stock: product.stock,
            hide: product.hide,
            images: product.images,
            discountType: product.discountType,
            discountValue: product.discountValue,
            originalPrice: product.originalPrice,
            productDiscountPrice: product.productDiscountPrice,
            flashSalePrice: product.flashSalePrice,
            discountAmount: product.discountAmount,
            discountPercent: product.discountPercent,
            promotionalQuantity: product.promotionalQuantity,
            soldCount: product.soldCount,
            effectivePrice: product.effectivePrice,
            endTime: product.endTime,
            isEnabled: product.isEnabled,
            order: product.order ?? 0,
            deletedAt: null,
            updatedAt: now,
          },
          $setOnInsert: {
            productId: new mongoose.Types.ObjectId(product.productId),
            flashSaleId: new mongoose.Types.ObjectId(product.flashSaleId),
            createdAt: now,
          },
        },
        upsert: true,
      },
    }));

    const result = await this.flashSaleProductModel.bulkWrite(bulkOps, {
      ordered: false,
    });

    return (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
  }

  /**
   * Soft delete all flash sale products for a given flash sale
   */
  async removeByFlashSaleId(flashSaleId: string): Promise<number> {
    const result = await this.flashSaleProductModel.updateMany(
      {
        flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
        deletedAt: null,
      },
      { $set: { deletedAt: new Date() } },
    );
    return result.modifiedCount ?? 0;
  }

  /**
   * Soft delete flash sale products not in the given product ID list
   */
  async removeNotInProductIds(
    flashSaleId: string,
    keepProductIds: string[],
  ): Promise<number> {
    const result = await this.flashSaleProductModel.updateMany(
      {
        flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
        deletedAt: null,
        productId: {
          $nin: keepProductIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
      { $set: { deletedAt: new Date() } },
    );
    return result.modifiedCount ?? 0;
  }

  /**
   * Soft delete multiple flash sale products by product IDs
   */
  async removeByProductIds(
    flashSaleId: string,
    productIds: string[],
  ): Promise<number> {
    if (productIds.length === 0) return 0;
    const result = await this.flashSaleProductModel.updateMany(
      {
        flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
        deletedAt: null,
        productId: {
          $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
      { $set: { deletedAt: new Date() } },
    );
    return result.modifiedCount ?? 0;
  }

  /**
   * Find flash sale products with pagination, filtering, and sorting
   */
  async findManyWithPagination(params: {
    flashSaleId: string;
    filterOptions?: FilterFlashSaleProductDto | null;
    sortOptions?: SortFlashSaleProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<FlashSaleProduct>> {
    const filter: FilterQuery<FlashSaleProductSchemaClass> = {
      flashSaleId: new mongoose.Types.ObjectId(params.flashSaleId),
      isEnabled: true,
      status: { $in: SALEABLE_STATUSES },
      hide: { $ne: true },
      flashSalePrice: { $ne: null },
      deletedAt: null,
    };

    // Ensure actual discount exists
    filter.$expr = {
      $ne: ['$effectivePrice', '$originalPrice'],
    };

    if (params.filterOptions) {
      const f = params.filterOptions;

      // Search by name or code
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

      // Filter by category IDs
      if (f.categoryIds?.length) {
        filter['category.id'] = { $in: f.categoryIds };
      }

      // Filter by topic product IDs
      if (f.topicProductIds?.length) {
        filter.productId = {
          $in: f.topicProductIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }

      // Price range filter on effective price
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

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    if (params.sortOptions && params.sortOptions.length > 0) {
      params.sortOptions.forEach((s) => {
        sort[s.orderBy] = s.order === 'asc' ? 1 : -1;
      });
    } else {
      // Default: admin-defined order first, then in-stock products
      sort.order = 1;
      sort.stock = -1;
    }
    // Tiebreaker for stable pagination
    sort._id = 1;

    const paginateOptions: Record<string, unknown> = {
      page: params.paginationOptions.page,
      limit: params.paginationOptions.limit,
      sort,
      lean: true,
    };

    // Use Vietnamese collation when sorting by name
    if (sort.name) {
      paginateOptions.collation = { locale: 'vi' };
    }

    const result = await this.flashSaleProductModel.paginate(
      filter,
      paginateOptions,
    );

    return {
      ...result,
      docs: result.docs.map((doc) => FlashSaleProductMapper.toDomain(doc)),
    };
  }

  /**
   * Count enabled flash sale products for a given flash sale
   */
  async countByFlashSaleId(flashSaleId: string): Promise<number> {
    return this.flashSaleProductModel.countDocuments({
      flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
      isEnabled: true,
      deletedAt: null,
    });
  }

  /**
   * Soft delete all flash sale products
   */
  async removeAll(): Promise<number> {
    const result = await this.flashSaleProductModel.updateMany(
      { deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );
    return result.modifiedCount ?? 0;
  }

  /**
   * Create a single flash sale product
   */
  async createOne(
    product: Omit<
      FlashSaleProduct,
      'id' | 'createdAt' | 'updatedAt' | 'remainingStock'
    >,
  ): Promise<FlashSaleProduct> {
    const doc = await this.flashSaleProductModel.create({
      ...product,
      productId: new mongoose.Types.ObjectId(product.productId),
      flashSaleId: new mongoose.Types.ObjectId(product.flashSaleId),
    });
    const lean = doc.toObject();
    return FlashSaleProductMapper.toDomain(lean);
  }

  /**
   * Update a single flash sale product by flashSaleId and productId
   */
  async updateOne(
    flashSaleId: string,
    productId: string,
    data: UpdateFlashSaleProductData,
  ): Promise<NullableType<FlashSaleProduct>> {
    const updateFields: Record<string, unknown> = {};
    if (data.discountType !== undefined)
      updateFields.discountType = data.discountType;
    if (data.discountValue !== undefined)
      updateFields.discountValue = data.discountValue;
    if (data.promotionalQuantity !== undefined)
      updateFields.promotionalQuantity = data.promotionalQuantity;
    if (data.soldCount !== undefined) updateFields.soldCount = data.soldCount;
    if (data.isEnabled !== undefined) updateFields.isEnabled = data.isEnabled;
    if (data.order !== undefined) updateFields.order = data.order;

    const doc = await this.flashSaleProductModel
      .findOneAndUpdate(
        {
          flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
          productId: new mongoose.Types.ObjectId(productId),
          deletedAt: null,
        },
        { $set: updateFields },
        { new: true },
      )
      .lean();

    return doc ? FlashSaleProductMapper.toDomain(doc) : null;
  }

  /**
   * Soft delete a single flash sale product
   */
  async removeOne(flashSaleId: string, productId: string): Promise<boolean> {
    const result = await this.flashSaleProductModel.updateOne(
      {
        flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
        productId: new mongoose.Types.ObjectId(productId),
        deletedAt: null,
      },
      { $set: { deletedAt: new Date() } },
    );
    return (result.modifiedCount ?? 0) > 0;
  }

  /**
   * Bulk update flash sale products
   */
  async bulkUpdate(
    flashSaleId: string,
    updates: Array<{ productId: string } & UpdateFlashSaleProductData>,
  ): Promise<number> {
    if (updates.length === 0) return 0;

    const flashSaleOid = new mongoose.Types.ObjectId(flashSaleId);

    const bulkOps = updates.map((update) => {
      const updateFields: Record<string, unknown> = {};
      if (update.discountType !== undefined)
        updateFields.discountType = update.discountType;
      if (update.discountValue !== undefined)
        updateFields.discountValue = update.discountValue;
      if (update.promotionalQuantity !== undefined)
        updateFields.promotionalQuantity = update.promotionalQuantity;
      if (update.isEnabled !== undefined)
        updateFields.isEnabled = update.isEnabled;
      if (update.order !== undefined) updateFields.order = update.order;

      return {
        updateOne: {
          filter: {
            flashSaleId: flashSaleOid,
            productId: new mongoose.Types.ObjectId(update.productId),
            deletedAt: null,
          },
          update: { $set: updateFields },
        },
      };
    });

    const result = await this.flashSaleProductModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    return result.modifiedCount ?? 0;
  }

  /**
   * Find flash sale products for a given flash sale with pagination
   */
  async findByFlashSaleIdWithPagination(params: {
    flashSaleId: string;
    filterOptions?: FilterFlashSaleProductDto | null;
    sortOptions?: SortFlashSaleProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<FlashSaleProduct>> {
    const filter: FilterQuery<FlashSaleProductSchemaClass> = {
      flashSaleId: new mongoose.Types.ObjectId(params.flashSaleId),
      deletedAt: null,
    };

    if (params.filterOptions) {
      const f = params.filterOptions;

      // Search by name or code
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

      // Filter by category IDs
      if (f.categoryIds?.length) {
        filter['category.id'] = { $in: f.categoryIds };
      }

      // Filter by topic product IDs
      if (f.topicProductIds?.length) {
        filter.productId = {
          $in: f.topicProductIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }

      // Price range filter on effective price
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

    const sort: Record<string, 1 | -1> = {};
    if (params.sortOptions && params.sortOptions.length > 0) {
      params.sortOptions.forEach((s) => {
        sort[s.orderBy] = s.order === 'asc' ? 1 : -1;
      });
    } else {
      sort.order = 1;
      sort.createdAt = -1;
    }
    // Tiebreaker for stable pagination
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

    const result = await this.flashSaleProductModel.paginate(
      filter,
      paginateOptions,
    );

    return {
      ...result,
      docs: result.docs.map((doc) => FlashSaleProductMapper.toDomain(doc)),
    };
  }

  /**
   * Find a single flash sale product by flashSaleId and productId
   */
  async findOneByProductId(
    flashSaleId: string,
    productId: string,
  ): Promise<NullableType<FlashSaleProduct>> {
    const doc = await this.flashSaleProductModel
      .findOne({
        flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
        productId: new mongoose.Types.ObjectId(productId),
        deletedAt: null,
      })
      .lean();

    return doc ? FlashSaleProductMapper.toDomain(doc) : null;
  }

  /**
   * Find a single flash sale product by flashSaleId and productId, including soft-deleted records
   */
  async findOneByProductIdIncludingDeleted(
    flashSaleId: string,
    productId: string,
  ): Promise<NullableType<FlashSaleProduct>> {
    const doc = await this.flashSaleProductModel
      .findOne({
        flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
        productId: new mongoose.Types.ObjectId(productId),
      })
      .lean();

    return doc ? FlashSaleProductMapper.toDomain(doc) : null;
  }

  /**
   * Find flash sale products by flashSaleId and multiple productIds
   */
  async findByFlashSaleIdAndProductIds(
    flashSaleId: string,
    productIds: string[],
  ): Promise<FlashSaleProduct[]> {
    if (productIds.length === 0) return [];

    const docs = await this.flashSaleProductModel
      .find({
        flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
        productId: {
          $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        deletedAt: null,
      })
      .lean();

    return docs.map((doc) => FlashSaleProductMapper.toDomain(doc));
  }

  /**
   * Find a flash sale product for a given active flash sale and product ID
   */
  async findByActiveFlashSaleAndProductId(
    activeFlashSaleId: string,
    productId: string,
  ): Promise<NullableType<FlashSaleProduct>> {
    const doc = await this.flashSaleProductModel
      .findOne({
        flashSaleId: new mongoose.Types.ObjectId(activeFlashSaleId),
        productId: new mongoose.Types.ObjectId(productId),
        isEnabled: true,
        deletedAt: null,
      })
      .lean();

    return doc ? FlashSaleProductMapper.toDomain(doc) : null;
  }

  /**
   * Atomically increment soldCount for a flash sale product
   */
  async incrementSoldCount(
    flashSaleId: string,
    productId: string,
    quantity: number,
  ): Promise<IncrementSoldCountResult> {
    const doc = await this.flashSaleProductModel
      .findOneAndUpdate(
        {
          flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
          productId: new mongoose.Types.ObjectId(productId),
          isEnabled: true,
          deletedAt: null,
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
      flashSaleId?: string | null;
      productId: string;
      variantId?: string | null;
      quantity: number;
    }>,
  ): void {
    const flashSaleItems = items.filter((item) => item.flashSaleId);

    if (flashSaleItems.length === 0) return;

    Promise.all(
      flashSaleItems.map((item) =>
        this.incrementSoldCount(
          item.flashSaleId!,
          item.productId,
          item.quantity,
        ),
      ),
    ).catch((err) => {
      this.logger.error(
        `Failed to increment flash sale soldCount: ${err.message}`,
      );
    });
  }

  /**
   * Find flash sale products for multiple product IDs from the active flash sale
   */
  async findActiveForProducts(
    activeFlashSaleId: string,
    productIds: string[],
  ): Promise<Map<string, FlashSaleProduct>> {
    const result = new Map<string, FlashSaleProduct>();

    if (productIds.length === 0) return result;

    const docs = await this.flashSaleProductModel
      .find({
        flashSaleId: new mongoose.Types.ObjectId(activeFlashSaleId),
        productId: {
          $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        isEnabled: true,
        deletedAt: null,
      })
      .lean();

    for (const doc of docs) {
      const entity = FlashSaleProductMapper.toDomain(doc);
      result.set(entity.productId, entity);
    }

    return result;
  }

  /**
   * Find all product IDs and their order for a given flash sale (no pagination)
   */
  async findProductIdsAndOrderByFlashSaleId(
    flashSaleId: string,
  ): Promise<Array<{ productId: string; order: number }>> {
    const docs = await this.flashSaleProductModel
      .find(
        {
          flashSaleId: new mongoose.Types.ObjectId(flashSaleId),
          isEnabled: true,
          deletedAt: null,
        },
        { productId: 1, order: 1 },
      )
      .sort({ order: 1 })
      .lean();

    return docs.map((doc) => ({
      productId: doc.productId.toString(),
      order: doc.order ?? 0,
    }));
  }
}
