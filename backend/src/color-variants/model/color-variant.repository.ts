import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  ColorVariantRepository,
  FilterColorVariantDto,
  SortColorVariantDto,
} from '../domain/color-variant.repository';
import { ColorVariant } from '../domain/color-variant';
import { ColorVariantSchemaClass } from './color-variant.schema';
import { ColorVariantMapper } from './color-variant.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of ColorVariantRepository
 */
@Injectable()
export class ColorVariantDocumentRepository implements ColorVariantRepository {
  constructor(
    @InjectModel(ColorVariantSchemaClass.name)
    private readonly colorVariantModel: PaginateModel<ColorVariantSchemaClass>,
  ) {}

  /**
   * Create a new color variant
   */
  async create(
    data: Omit<ColorVariant, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ColorVariant> {
    const now = new Date();
    const persistenceModel = ColorVariantMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as ColorVariant);

    const createdColorVariant = new this.colorVariantModel(persistenceModel);
    const colorVariantDocument = await createdColorVariant.save();
    const leanColorVariant = colorVariantDocument.toObject();
    return ColorVariantMapper.toDomain(leanColorVariant);
  }

  /**
   * Find color variants with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterColorVariantDto | null;
    sortOptions?: SortColorVariantDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ColorVariant>> {
    const filter: FilterQuery<ColorVariantSchemaClass> = {};

    if (filterOptions) {
      if (filterOptions.displayType !== undefined) {
        filter.displayType = filterOptions.displayType;
      }

      if (filterOptions.name !== undefined) {
        // Search on nameNormalized (indexed) with normalized input
        const normalizedSearch = filterOptions.name.toLowerCase().trim();
        filter.nameNormalized = { $regex: escapeRegex(normalizedSearch), $options: 'i' };
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

    const result = await this.colorVariantModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ColorVariantMapper.toDomain(doc)),
    };
  }

  /**
   * Find color variant by ID
   */
  async findById(id: ColorVariant['id']): Promise<NullableType<ColorVariant>> {
    const colorVariantDocument = await this.colorVariantModel
      .findOne({ _id: id })
      .lean();

    return colorVariantDocument
      ? ColorVariantMapper.toDomain(colorVariantDocument)
      : null;
  }

  /**
   * Find all color variants (ordered by order field)
   */
  async findAll(): Promise<ColorVariant[]> {
    const colorVariants = await this.colorVariantModel
      .find({})
      .sort({ order: 1 })
      .lean();

    return colorVariants.map((doc) => ColorVariantMapper.toDomain(doc));
  }

  /**
   * Find color variants by normalized names (batch lookup)
   */
  async findByNormalizedNames(
    normalizedNames: string[],
  ): Promise<ColorVariant[]> {
    const colorVariants = await this.colorVariantModel
      .find({
        nameNormalized: { $in: normalizedNames },
      })
      .lean();

    return colorVariants.map((doc) => ColorVariantMapper.toDomain(doc));
  }

  /**
   * Check if a color variant with the given normalized name exists
   */
  async existsByNormalizedName(
    nameNormalized: string,
    excludeId?: string,
  ): Promise<boolean> {
    const filter: FilterQuery<ColorVariantSchemaClass> = {
      nameNormalized,
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const count = await this.colorVariantModel.countDocuments(filter);
    return count > 0;
  }

  /**
   * Update existing color variant
   */
  async update(
    id: ColorVariant['id'],
    payload: DeepPartial<ColorVariant>,
  ): Promise<NullableType<ColorVariant>> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Copy allowed fields
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.nameNormalized !== undefined)
      updateData.nameNormalized = payload.nameNormalized;
    if (payload.displayType !== undefined)
      updateData.displayType = payload.displayType;
    if (payload.display !== undefined) updateData.display = payload.display;
    if (payload.order !== undefined) updateData.order = payload.order;

    const updatedColorVariant = await this.colorVariantModel
      .findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true })
      .lean();

    return updatedColorVariant
      ? ColorVariantMapper.toDomain(updatedColorVariant)
      : null;
  }

  /**
   * Hard delete color variant
   */
  async remove(id: ColorVariant['id']): Promise<void> {
    await this.colorVariantModel.deleteOne({ _id: id }).exec();
  }
}
