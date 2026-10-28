import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  FilterQuery,
  PaginateModel,
  PaginateResult,
  Types,
} from 'mongoose';
import {
  FlashSaleRepository,
  FilterFlashSaleDto,
  SortFlashSaleDto,
} from '../domain/flash-sale.repository';
import { FlashSale } from '../domain/flash-sale';
import { FlashSaleSchemaClass } from './flash-sale.schema';
import { FlashSaleMapper } from './flash-sale.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { FlashSaleStatus } from '../domain/flash-sale-status.enum';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of FlashSaleRepository
 * Product operations are handled by FlashSaleProductDocumentRepository
 */
@Injectable()
export class FlashSaleDocumentRepository implements FlashSaleRepository {
  constructor(
    @InjectModel(FlashSaleSchemaClass.name)
    private readonly flashSaleModel: PaginateModel<FlashSaleSchemaClass>,
  ) {}

  /**
   * Create a new flash sale
   */
  async create(
    data: Omit<FlashSale, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FlashSale> {
    const now = new Date();
    const persistenceModel = FlashSaleMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as FlashSale);

    const createdFlashSale = new this.flashSaleModel(persistenceModel);
    const flashSaleDocument = await createdFlashSale.save();
    const leanFlashSale = flashSaleDocument.toObject();
    return FlashSaleMapper.toDomain(leanFlashSale);
  }

  /**
   * Find flash sales with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterFlashSaleDto | null;
    sortOptions?: SortFlashSaleDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<FlashSale>> {
    const filter: FilterQuery<FlashSaleSchemaClass> = { deletedAt: null };
    const now = new Date();

    if (filterOptions) {
      // Filter by computed status
      if (filterOptions.status !== undefined) {
        switch (filterOptions.status) {
          case FlashSaleStatus.ACTIVE:
            filter.isEnabled = true;
            filter.startTime = { $lte: now };
            filter.endTime = { $gte: now };
            break;
          case FlashSaleStatus.UPCOMING:
            filter.isEnabled = true;
            filter.startTime = { $gt: now };
            break;
          case FlashSaleStatus.ENDED:
            filter.endTime = { $lt: now };
            break;
          case FlashSaleStatus.DISABLED:
            filter.isEnabled = false;
            break;
        }
      }

      // Search by name
      if (filterOptions.search) {
        filter.name = { $regex: escapeRegex(filterOptions.search), $options: 'i' };
      }
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      // Default sort
      sort.createdAt = -1;
    }

    const result = await this.flashSaleModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => FlashSaleMapper.toDomain(doc)),
    };
  }

  /**
   * Find flash sale by ID
   */
  async findById(id: FlashSale['id']): Promise<NullableType<FlashSale>> {
    if (!Types.ObjectId.isValid(id)) return null;

    const flashSaleDocument = await this.flashSaleModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    return flashSaleDocument
      ? FlashSaleMapper.toDomain(flashSaleDocument)
      : null;
  }

  /**
   * Update existing flash sale
   */
  async update(
    id: FlashSale['id'],
    payload: DeepPartial<FlashSale>,
  ): Promise<NullableType<FlashSale>> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Copy allowed fields
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.startTime !== undefined)
      updateData.startTime = payload.startTime;
    if (payload.endTime !== undefined) updateData.endTime = payload.endTime;
    if (payload.isEnabled !== undefined)
      updateData.isEnabled = payload.isEnabled;

    const updatedFlashSale = await this.flashSaleModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return updatedFlashSale ? FlashSaleMapper.toDomain(updatedFlashSale) : null;
  }

  /**
   * Soft delete flash sale
   */
  async remove(id: FlashSale['id']): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;

    await this.flashSaleModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }

  /**
   * Find the currently active flash sale (only one can be active at a time)
   */
  async findCurrentlyActive(): Promise<FlashSale | null> {
    const now = new Date();

    const flashSaleDoc = await this.flashSaleModel
      .findOne({
        isEnabled: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
        deletedAt: null,
      })
      .lean();

    return flashSaleDoc ? FlashSaleMapper.toDomain(flashSaleDoc) : null;
  }

  /**
   * Check if a flash sale with the given time range would overlap with existing flash sales
   */
  async findOverlapping(
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<FlashSale | null> {
    const filter: FilterQuery<FlashSaleSchemaClass> = {
      isEnabled: true,
      deletedAt: null,
      // Overlap condition: newStart < existingEnd AND newEnd > existingStart
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    };

    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const flashSaleDoc = await this.flashSaleModel.findOne(filter).lean();

    return flashSaleDoc ? FlashSaleMapper.toDomain(flashSaleDoc) : null;
  }

  /**
   * Find all active and upcoming flash sales for customer display
   * Sorted by startTime ascending
   */
  async findActiveAndUpcoming(): Promise<FlashSale[]> {
    const now = new Date();

    const flashSales = await this.flashSaleModel
      .find({
        isEnabled: true,
        endTime: { $gte: now }, // Not ended yet (active or upcoming)
        deletedAt: null,
      })
      .sort({ startTime: 1 })
      .lean();

    return flashSales.map((doc) => FlashSaleMapper.toDomain(doc));
  }
}
