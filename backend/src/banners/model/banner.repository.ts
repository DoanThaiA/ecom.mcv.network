import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  BannerRepository,
  FilterBannerDto,
  SortBannerDto,
} from '../domain/banner.repository';
import { Banner } from '../domain/banner';
import { BannerSchemaClass } from './banner.schema';
import { BannerMapper } from './banner.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { BannerPosition } from './banner-position.enum';

/**
 * Mongoose implementation of BannerRepository
 */
@Injectable()
export class BannerDocumentRepository implements BannerRepository {
  constructor(
    @InjectModel(BannerSchemaClass.name)
    private readonly bannerModel: PaginateModel<BannerSchemaClass>,
  ) {}

  /**
   * Create a new banner
   */
  async create(
    data: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Banner> {
    const now = new Date();
    const persistenceModel = BannerMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as Banner);

    const createdBanner = new this.bannerModel(persistenceModel);
    const bannerDocument = await createdBanner.save();
    const leanBanner = bannerDocument.toObject();
    return BannerMapper.toDomain(leanBanner);
  }

  /**
   * Find banners with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBannerDto | null;
    sortOptions?: SortBannerDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Banner>> {
    const filter: FilterQuery<BannerSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      // Filter by position
      if (filterOptions.position !== undefined) {
        filter.position = filterOptions.position;
      }

      // Filter by active status
      if (filterOptions.isActive !== undefined) {
        filter.isActive = filterOptions.isActive;
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

    const result = await this.bannerModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => BannerMapper.toDomain(doc)),
    };
  }

  /**
   * Find banner by ID
   */
  async findById(id: Banner['id']): Promise<NullableType<Banner>> {
    const bannerDocument = await this.bannerModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    return bannerDocument ? BannerMapper.toDomain(bannerDocument) : null;
  }

  /**
   * Find active banners by position (ordered by order field)
   */
  async findActiveByPosition(position: BannerPosition): Promise<Banner[]> {
    const banners = await this.bannerModel
      .find({
        position,
        isActive: true,
        deletedAt: null,
      })
      .sort({ order: 1 }) // Sort by order ascending
      .lean();

    return banners.map((doc) => BannerMapper.toDomain(doc));
  }

  /**
   * Update existing banner
   */
  async update(
    id: Banner['id'],
    payload: DeepPartial<Banner>,
  ): Promise<NullableType<Banner>> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Copy allowed fields
    if (payload.position !== undefined) updateData.position = payload.position;
    if (payload.mediaType !== undefined)
      updateData.mediaType = payload.mediaType;
    if (payload.media !== undefined) updateData.media = payload.media;
    if ('link' in payload) updateData.link = payload.link;
    if (payload.order !== undefined) updateData.order = payload.order;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    const updatedBanner = await this.bannerModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return updatedBanner ? BannerMapper.toDomain(updatedBanner) : null;
  }

  /**
   * Soft delete banner
   */
  async remove(id: Banner['id']): Promise<void> {
    await this.bannerModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }

  /**
   * Bulk update banner order
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

    if (bulkOps.length > 0) {
      await this.bannerModel.bulkWrite(bulkOps, { ordered: false });
    }
  }
}
