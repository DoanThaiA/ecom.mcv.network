import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { ProductBrandRepository } from '../domain/product-brand.repository';
import { ProductBrandSchemaClass } from './product-brand.schema';
import { ProductBrand } from '../domain/product-brand';
import { ProductBrandMapper } from './product-brand.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import {
  FilterProductBrandDto,
  SortProductBrandDto,
} from '../dto/product-query-brand.dto';
import { escapeRegex } from '../../utils/search';

/**
 * MongoDB implementation of ProductBrandRepository
 */
@Injectable()
export class ProductBrandDocumentRepository implements ProductBrandRepository {
  constructor(
    @InjectModel(ProductBrandSchemaClass.name)
    private readonly brandModel: PaginateModel<ProductBrandSchemaClass>,
  ) {}

  /**
   * Create a new brand
   */
  async create(
    data: Omit<ProductBrand, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductBrand> {
    const now = new Date();
    const persistenceModel = ProductBrandMapper.toDocument({
      ...data,
      id: undefined,
      createdAt: now,
      updatedAt: now,
    } as unknown as ProductBrand);

    const createdProductBrand = new this.brandModel(persistenceModel);
    const brandDocument = await createdProductBrand.save();
    return ProductBrandMapper.toDomain(brandDocument);
  }

  /**
   * Find brands with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductBrandDto | null;
    sortOptions?: SortProductBrandDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductBrand>> {
    const filter: FilterQuery<ProductBrandSchemaClass> = {};

    // Apply filter options
    if (filterOptions) {
      // Filter by status
      if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }

      // Filter by source
      if (filterOptions.source) {
        filter.source = filterOptions.source;
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

    const result = await this.brandModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ProductBrandMapper.toDomain(doc)),
    };
  }

  /**
   * Find brand by ID
   */
  async findById(id: ProductBrand['id']): Promise<NullableType<ProductBrand>> {
    const brandDocument = await this.brandModel.findById(id).lean();
    return brandDocument ? ProductBrandMapper.toDomain(brandDocument) : null;
  }

  /**
   * Find brand by snapshot ID (source ID) and source
   */
  async findBySnapshotId(
    snapshotId: number,
    source: ProductBrand['source'],
  ): Promise<NullableType<ProductBrand>> {
    const brandDocument = await this.brandModel
      .findOne({ 'snapshot.id': snapshotId, source })
      .lean();
    return brandDocument ? ProductBrandMapper.toDomain(brandDocument) : null;
  }

  /**
   * Update brand
   */
  async update(
    id: ProductBrand['id'],
    payload: Partial<ProductBrand>,
  ): Promise<NullableType<ProductBrand>> {
    const updatedDocument = await this.brandModel
      .findByIdAndUpdate(
        id,
        { ...payload, updatedAt: new Date() },
        { new: true },
      )
      .lean();

    return updatedDocument
      ? ProductBrandMapper.toDomain(updatedDocument)
      : null;
  }

  /**
   * Soft delete brand (set status to INACTIVE)
   */
  async remove(id: ProductBrand['id']): Promise<void> {
    await this.brandModel
      .findByIdAndUpdate(id, { status: 2, updatedAt: new Date() })
      .exec();
  }

  /**
   * Bulk upsert brands (create or update by snapshot.id)
   * Uses MongoDB bulkWrite for maximum performance
   */
  async bulkUpsert(
    brands: Array<Omit<ProductBrand, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<number> {
    if (!brands || brands.length === 0) {
      return 0;
    }

    const now = new Date();
    const bulkOps = brands.map((brand) => {
      const persistenceModel = ProductBrandMapper.toDocument({
        ...brand,
        createdAt: now,
        updatedAt: now,
      } as unknown as ProductBrand);

      // Extract snapshot.id for filter
      const snapshotId = (brand.snapshot as any)?.id;

      return {
        updateOne: {
          filter: {
            businessId: brand.businessId,
            source: brand.source,
            'snapshot.id': snapshotId,
          },
          update: {
            $set: {
              ...persistenceModel,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      };
    });

    const result = await this.brandModel.bulkWrite(bulkOps, { ordered: false });
    return result.upsertedCount + result.modifiedCount;
  }
}
