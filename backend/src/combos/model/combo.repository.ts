import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  ComboRepository,
  FilterComboDto,
  SortComboDto,
} from '../domain/combo.repository';
import { Combo } from '../domain/combo';
import { ComboSchemaClass } from './combo.schema';
import { ComboMapper } from './combo.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ComboStatus } from '../domain/combo-status.enum';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of ComboRepository
 */
@Injectable()
export class ComboDocumentRepository implements ComboRepository {
  constructor(
    @InjectModel(ComboSchemaClass.name)
    private readonly comboModel: PaginateModel<ComboSchemaClass>,
  ) {}

  /**
   * Create a new combo
   */
  async create(
    data: Omit<Combo, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Combo> {
    const now = new Date();
    const persistenceModel = ComboMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as Combo);

    const createdCombo = new this.comboModel(persistenceModel);
    const comboDocument = await createdCombo.save();
    const leanCombo = comboDocument.toObject();
    return ComboMapper.toDomain(leanCombo);
  }

  /**
   * Find combos with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterComboDto | null;
    sortOptions?: SortComboDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Combo>> {
    const filter: FilterQuery<ComboSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      // Filter by status
      if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }

      // Search by name
      if (filterOptions.search) {
        filter.name = { $regex: escapeRegex(filterOptions.search), $options: 'i' };
      }

      // Filter by validity (active date range)
      if (filterOptions.isValid) {
        const now = new Date();
        filter.$and = [
          {
            $or: [
              { validFrom: { $exists: false } },
              { validFrom: null },
              { validFrom: { $lte: now } },
            ],
          },
          {
            $or: [
              { validTo: { $exists: false } },
              { validTo: null },
              { validTo: { $gte: now } },
            ],
          },
        ];
      }

      // Filter by product ID
      if (filterOptions.productId) {
        filter['items.productId'] = filterOptions.productId;
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

    const result = await this.comboModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ComboMapper.toDomain(doc)),
    };
  }

  /**
   * Find combo by ID
   */
  async findById(id: Combo['id']): Promise<NullableType<Combo>> {
    const comboDocument = await this.comboModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    return comboDocument ? ComboMapper.toDomain(comboDocument) : null;
  }

  /**
   * Find multiple combos by IDs
   */
  async findByIds(ids: string[]): Promise<Combo[]> {
    const comboDocuments = await this.comboModel
      .find({ _id: { $in: ids }, deletedAt: null })
      .lean();

    return comboDocuments.map((doc) => ComboMapper.toDomain(doc));
  }

  /**
   * Find active combos that contain a specific product
   */
  async findActiveByProductId(productId: string): Promise<Combo[]> {
    const now = new Date();

    const comboDocuments = await this.comboModel
      .find({
        'items.productId': productId,
        status: ComboStatus.ACTIVE,
        deletedAt: null,
        $and: [
          {
            $or: [
              { validFrom: { $exists: false } },
              { validFrom: null },
              { validFrom: { $lte: now } },
            ],
          },
          {
            $or: [
              { validTo: { $exists: false } },
              { validTo: null },
              { validTo: { $gte: now } },
            ],
          },
        ],
      })
      .lean();

    return comboDocuments.map((doc) => ComboMapper.toDomain(doc));
  }

  /**
   * Find active combos that contain any of the specified products
   */
  async findActiveByProductIds(productIds: string[]): Promise<Combo[]> {
    const now = new Date();

    const comboDocuments = await this.comboModel
      .find({
        'items.productId': { $in: productIds },
        status: ComboStatus.ACTIVE,
        deletedAt: null,
        $and: [
          {
            $or: [
              { validFrom: { $exists: false } },
              { validFrom: null },
              { validFrom: { $lte: now } },
            ],
          },
          {
            $or: [
              { validTo: { $exists: false } },
              { validTo: null },
              { validTo: { $gte: now } },
            ],
          },
        ],
      })
      .lean();

    return comboDocuments.map((doc) => ComboMapper.toDomain(doc));
  }

  /**
   * Update existing combo
   */
  async update(
    id: Combo['id'],
    payload: DeepPartial<Combo>,
  ): Promise<NullableType<Combo>> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Copy allowed fields
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description;
    if (payload.image !== undefined) updateData.image = payload.image;
    if (payload.items !== undefined) {
      updateData.items = payload.items.map((item: any) =>
        ComboMapper.toDocumentItem(item),
      );
    }
    if (payload.discountType !== undefined)
      updateData.discountType = payload.discountType;
    if (payload.discountValue !== undefined)
      updateData.discountValue = payload.discountValue;
    if (payload.originalPrice !== undefined)
      updateData.originalPrice = payload.originalPrice;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.validFrom !== undefined)
      updateData.validFrom = payload.validFrom;
    if (payload.validTo !== undefined) updateData.validTo = payload.validTo;
    if (payload.nameLocalization !== undefined)
      updateData.nameLocalization = payload.nameLocalization;

    const updatedCombo = await this.comboModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return updatedCombo ? ComboMapper.toDomain(updatedCombo) : null;
  }

  /**
   * Soft delete combo
   */
  async remove(id: Combo['id']): Promise<void> {
    await this.comboModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }
}
