import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  TopicRepository,
  FilterTopicDto,
  SortTopicDto,
} from '../domain/topic.repository';
import {
  Topic,
  TopicProduct,
  TopicCategory,
  TopicBanner,
} from '../domain/topic';
import { TopicSchemaClass } from './topic.schema';
import { TopicMapper } from './topic.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { TopicStatus } from '../domain/topic-status.enum';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of TopicRepository
 */
@Injectable()
export class TopicDocumentRepository implements TopicRepository {
  constructor(
    @InjectModel(TopicSchemaClass.name)
    private readonly topicModel: PaginateModel<TopicSchemaClass>,
  ) {}

  /**
   * Create a new topic
   */
  async create(
    data: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Topic> {
    const now = new Date();
    const persistenceModel = TopicMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as Topic);

    const createdTopic = new this.topicModel(persistenceModel);
    const topicDocument = await createdTopic.save();
    const leanTopic = topicDocument.toObject();
    return TopicMapper.toDomain(leanTopic);
  }

  /**
   * Find topics with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterTopicDto | null;
    sortOptions?: SortTopicDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Topic>> {
    const filter: FilterQuery<TopicSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      // Filter by businessId
      if (filterOptions.businessId) {
        filter.businessId = filterOptions.businessId;
      }

      // Filter by status
      if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }

      // Search by name
      if (filterOptions.search) {
        filter.name = {
          $regex: escapeRegex(filterOptions.search),
          $options: 'i',
        };
      }
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      // Default sort by order ascending
      sort.order = 1;
    }

    const result = await this.topicModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => TopicMapper.toDomain(doc)),
    };
  }

  /**
   * Find topic by ID
   */
  async findById(id: Topic['id']): Promise<NullableType<Topic>> {
    const topicDocument = await this.topicModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    return topicDocument ? TopicMapper.toDomain(topicDocument) : null;
  }

  /**
   * Find topic by slug within a business
   */
  async findBySlug(
    businessId: string,
    slug: string,
  ): Promise<NullableType<Topic>> {
    const topicDocument = await this.topicModel
      .findOne({ businessId, slug, deletedAt: null })
      .lean();

    return topicDocument ? TopicMapper.toDomain(topicDocument) : null;
  }

  /**
   * Find active topics by businessId (ordered by 'order' field)
   */
  async findActiveByBusinessId(businessId: string): Promise<Topic[]> {
    const topicDocuments = await this.topicModel
      .find({
        businessId,
        status: TopicStatus.ACTIVE,
        deletedAt: null,
      })
      .sort({ order: 1 })
      .lean();

    return topicDocuments.map((doc) => TopicMapper.toDomain(doc));
  }

  /**
   * Find topics containing a specific product
   */
  async findByProductId(productId: string): Promise<Topic[]> {
    const topicDocuments = await this.topicModel
      .find({
        'products.productId': new mongoose.Types.ObjectId(productId),
        deletedAt: null,
      })
      .lean();

    return topicDocuments.map((doc) => TopicMapper.toDomain(doc));
  }

  /**
   * Update existing topic
   */
  async update(
    id: Topic['id'],
    payload: DeepPartial<Topic>,
  ): Promise<NullableType<Topic>> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Copy allowed fields
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.localization !== undefined) {
      updateData.localization = payload.localization
        ? { vi: payload.localization.vi, en: payload.localization.en }
        : null;
    }
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.description !== undefined)
      updateData.description = payload.description;
    if (payload.image !== undefined) updateData.image = payload.image;
    if (payload.order !== undefined) updateData.order = payload.order;
    if (payload.status !== undefined) updateData.status = payload.status;

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: updateData },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Add products to topic
   */
  async addProducts(
    id: Topic['id'],
    products: TopicProduct[],
  ): Promise<NullableType<Topic>> {
    const schemaProducts = products.map((p) =>
      TopicMapper.toDocumentProduct(p),
    );

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $push: { products: { $each: schemaProducts } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Remove products from topic
   */
  async removeProducts(
    id: Topic['id'],
    productIds: string[],
  ): Promise<NullableType<Topic>> {
    const objectIds = productIds.map((pid) => new mongoose.Types.ObjectId(pid));

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $pull: { products: { productId: { $in: objectIds } } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Reorder products within topic
   */
  async reorderProducts(
    id: Topic['id'],
    products: TopicProduct[],
  ): Promise<NullableType<Topic>> {
    const schemaProducts = products.map((p) =>
      TopicMapper.toDocumentProduct(p),
    );

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $set: { products: schemaProducts, updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Add categories to topic
   */
  async addCategories(
    id: Topic['id'],
    categories: TopicCategory[],
  ): Promise<NullableType<Topic>> {
    const schemaCategories = categories.map((c) =>
      TopicMapper.toDocumentCategory(c),
    );

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $push: { categories: { $each: schemaCategories } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Remove categories from topic
   */
  async removeCategories(
    id: Topic['id'],
    categoryIds: string[],
  ): Promise<NullableType<Topic>> {
    const objectIds = categoryIds.map(
      (cid) => new mongoose.Types.ObjectId(cid),
    );

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $pull: { categories: { categoryId: { $in: objectIds } } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Reorder categories within topic
   */
  async reorderCategories(
    id: Topic['id'],
    categories: TopicCategory[],
  ): Promise<NullableType<Topic>> {
    const schemaCategories = categories.map((c) =>
      TopicMapper.toDocumentCategory(c),
    );

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $set: { categories: schemaCategories, updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Add banners to topic
   */
  async addBanners(
    id: Topic['id'],
    banners: TopicBanner[],
  ): Promise<NullableType<Topic>> {
    const schemaBanners = banners.map((b) => TopicMapper.toDocumentBanner(b));

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $push: { banners: { $each: schemaBanners } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Remove banners from topic
   */
  async removeBanners(
    id: Topic['id'],
    bannerIds: string[],
  ): Promise<NullableType<Topic>> {
    const objectIds = bannerIds.map((bid) => new mongoose.Types.ObjectId(bid));

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $pull: { banners: { _id: { $in: objectIds } } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Update a single banner within topic
   */
  async updateBanner(
    id: Topic['id'],
    bannerId: string,
    data: Partial<TopicBanner>,
  ): Promise<NullableType<Topic>> {
    const updateFields: Record<string, any> = { updatedAt: new Date() };

    if (data.mediaType !== undefined) {
      updateFields['banners.$.mediaType'] = data.mediaType;
    }
    if (data.media !== undefined) {
      updateFields['banners.$.media'] = data.media;
    }
    if (data.link !== undefined) {
      updateFields['banners.$.link'] = data.link;
    }
    if (data.order !== undefined) {
      updateFields['banners.$.order'] = data.order;
    }

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
          'banners._id': new mongoose.Types.ObjectId(bannerId),
        },
        { $set: updateFields },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Reorder banners within topic
   */
  async reorderBanners(
    id: Topic['id'],
    banners: TopicBanner[],
  ): Promise<NullableType<Topic>> {
    const schemaBanners = banners.map((b) => TopicMapper.toDocumentBanner(b));

    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        {
          $set: { banners: schemaBanners, updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedTopic ? TopicMapper.toDomain(updatedTopic) : null;
  }

  /**
   * Bulk update topic orders
   */
  async bulkUpdateOrder(
    updates: Array<{ id: string; order: number }>,
  ): Promise<void> {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(update.id),
          deletedAt: null,
        },
        update: { $set: { order: update.order, updatedAt: new Date() } },
      },
    }));

    await this.topicModel.bulkWrite(bulkOps);
  }

  /**
   * Soft delete topic
   */
  async remove(id: Topic['id']): Promise<void> {
    await this.topicModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }
}
