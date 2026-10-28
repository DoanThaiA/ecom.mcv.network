import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import { ImportSessionRowRepository } from '../domain/import-session-row.repository';
import { ImportSessionRow } from '../domain/import-session-row';
import { ImportSessionRowSchemaClass } from './import-session-row.schema';
import { ImportSessionRowMapper } from './import-session-row.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of ImportSessionRowRepository
 */
@Injectable()
export class ImportSessionRowDocumentRepository
  implements ImportSessionRowRepository
{
  constructor(
    @InjectModel(ImportSessionRowSchemaClass.name)
    private readonly importSessionRowModel: PaginateModel<ImportSessionRowSchemaClass>,
  ) {}

  /**
   * Bulk insert rows
   */
  async insertMany(
    rows: Omit<ImportSessionRow, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<number> {
    if (rows.length === 0) return 0;

    const docs = rows.map((row) => ({
      ...row,
      sessionId: new mongoose.Types.ObjectId(row.sessionId),
    }));

    const result = await this.importSessionRowModel.insertMany(docs, {
      ordered: false,
    });
    return result.length;
  }

  /**
   * Find rows with pagination, optional isValid filter and search
   */
  async findBySessionIdWithPagination(params: {
    sessionId: string;
    isValid?: boolean;
    search?: string;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ImportSessionRow>> {
    const filter: FilterQuery<ImportSessionRowSchemaClass> = {
      sessionId: new mongoose.Types.ObjectId(params.sessionId),
    };

    if (params.isValid !== undefined) {
      filter.isValid = params.isValid;
    }

    if (params.search) {
      filter.$or = [
        { code: { $regex: escapeRegex(params.search), $options: 'i' } },
        { name: { $regex: escapeRegex(params.search), $options: 'i' } },
        { actualName: { $regex: escapeRegex(params.search), $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = { rowNumber: 1, _id: 1 };

    const result = await this.importSessionRowModel.paginate(filter, {
      page: params.paginationOptions.page,
      limit: params.paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ImportSessionRowMapper.toDomain(doc)),
    };
  }

  /**
   * Find a single row by ID
   */
  async findById(id: string): Promise<NullableType<ImportSessionRow>> {
    const doc = await this.importSessionRowModel.findById(id).lean();
    return doc ? ImportSessionRowMapper.toDomain(doc) : null;
  }

  /**
   * Update a single row (inline edit)
   */
  async updateOne(
    id: string,
    data: {
      discountType?: DiscountType;
      discountValue?: number;
      promotionalQuantity?: number;
      flashSalePrice?: number;
      isValid?: boolean;
      errors?: string[];
    },
  ): Promise<NullableType<ImportSessionRow>> {
    const updateFields: Record<string, unknown> = {};

    if (data.discountType !== undefined)
      updateFields.discountType = data.discountType;
    if (data.discountValue !== undefined)
      updateFields.discountValue = data.discountValue;
    if (data.promotionalQuantity !== undefined)
      updateFields.promotionalQuantity = data.promotionalQuantity;
    if (data.flashSalePrice !== undefined)
      updateFields.flashSalePrice = data.flashSalePrice;
    if (data.isValid !== undefined) updateFields.isValid = data.isValid;
    if (data.errors !== undefined) updateFields.errors = data.errors;

    const doc = await this.importSessionRowModel
      .findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .lean();

    return doc ? ImportSessionRowMapper.toDomain(doc) : null;
  }

  /**
   * Delete a single row
   */
  async deleteOne(id: string): Promise<boolean> {
    const result = await this.importSessionRowModel.deleteOne({ _id: id });
    return (result.deletedCount ?? 0) > 0;
  }

  /**
   * Count rows by session ID with optional isValid filter
   */
  async countBySessionId(
    sessionId: string,
    isValid?: boolean,
  ): Promise<number> {
    const filter: FilterQuery<ImportSessionRowSchemaClass> = {
      sessionId: new mongoose.Types.ObjectId(sessionId),
    };
    if (isValid !== undefined) {
      filter.isValid = isValid;
    }
    return this.importSessionRowModel.countDocuments(filter);
  }

  /**
   * Find valid rows for a session in batches (for worker processing)
   */
  async findValidBySessionId(
    sessionId: string,
    skip: number,
    limit: number,
  ): Promise<ImportSessionRow[]> {
    const docs = await this.importSessionRowModel
      .find({
        sessionId: new mongoose.Types.ObjectId(sessionId),
        isValid: true,
      })
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return docs.map((doc) => ImportSessionRowMapper.toDomain(doc));
  }

  /**
   * Delete all rows for a session
   */
  async deleteBySessionId(sessionId: string): Promise<number> {
    const result = await this.importSessionRowModel.deleteMany({
      sessionId: new mongoose.Types.ObjectId(sessionId),
    });
    return result.deletedCount ?? 0;
  }
}
