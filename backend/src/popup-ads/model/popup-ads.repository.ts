import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  PopupAdsRepository,
  FilterPopupAdsDto,
  SortPopupAdsDto,
} from '../domain/popup-ads.repository';
import { PopupAds } from '../domain/popup-ads';
import { PopupAdsSchemaClass } from './popup-ads.schema';
import { PopupAdsMapper } from './popup-ads.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of PopupAdsRepository
 */
@Injectable()
export class PopupAdsDocumentRepository implements PopupAdsRepository {
  constructor(
    @InjectModel(PopupAdsSchemaClass.name)
    private readonly popupAdsModel: PaginateModel<PopupAdsSchemaClass>,
  ) {}

  /**
   * Create a new popup ads
   */
  async create(
    data: Omit<PopupAds, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PopupAds> {
    const now = new Date();
    const persistenceModel = PopupAdsMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as PopupAds);

    const createdPopupAds = new this.popupAdsModel(persistenceModel);
    const document = await createdPopupAds.save();
    return PopupAdsMapper.toDomain(document.toObject());
  }

  /**
   * Find popup ads with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterPopupAdsDto | null;
    sortOptions?: SortPopupAdsDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<PopupAds>> {
    const filter: FilterQuery<PopupAdsSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      if (filterOptions.isActive !== undefined) {
        filter.isActive = filterOptions.isActive;
      }
      if (filterOptions.name) {
        filter.name = { $regex: escapeRegex(filterOptions.name), $options: 'i' };
      }
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      sort.order = 1;
      sort.createdAt = 1;
    }

    const result = await this.popupAdsModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => PopupAdsMapper.toDomain(doc)),
    };
  }

  /**
   * Find popup ads by ID
   */
  async findById(id: PopupAds['id']): Promise<NullableType<PopupAds>> {
    const document = await this.popupAdsModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    return document ? PopupAdsMapper.toDomain(document) : null;
  }

  /**
   * Find active popup ads within the current time range
   * Returns popups where startAt <= now <= endAt and isActive = true
   * Ordered by order ASC, createdAt ASC (handles duplicated/missing order values)
   */
  async findActiveInRange(): Promise<PopupAds[]> {
    const now = new Date();
    const docs = await this.popupAdsModel
      .find({
        isActive: true,
        deletedAt: null,
        startAt: { $lte: now },
        endAt: { $gte: now },
      })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return docs.map((doc) => PopupAdsMapper.toDomain(doc));
  }

  /**
   * Update existing popup ads
   */
  async update(
    id: PopupAds['id'],
    payload: DeepPartial<PopupAds>,
  ): Promise<NullableType<PopupAds>> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (payload.image !== undefined) updateData.image = payload.image;
    if (payload.startAt !== undefined) updateData.startAt = payload.startAt;
    if (payload.endAt !== undefined) updateData.endAt = payload.endAt;
    if (payload.name !== undefined) updateData.name = payload.name;
    if ('link' in payload) updateData.link = payload.link;
    if (payload.order !== undefined) updateData.order = payload.order;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    const updated = await this.popupAdsModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return updated ? PopupAdsMapper.toDomain(updated) : null;
  }

  /**
   * Soft delete popup ads
   */
  async remove(id: PopupAds['id']): Promise<void> {
    await this.popupAdsModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }
}
