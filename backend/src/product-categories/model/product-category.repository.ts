import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery } from 'mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { ProductCategoryRepository } from '../domain/product-category.repository';
import { ProductCategory } from '../domain/product-category';
import { ProductCategorySchemaClass } from './product-category.schema';
import { ProductCategoryMapper } from './product-category.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import {
  FilterProductCategoryDto,
  SortProductCategoryDto,
} from '../dto/product-query-category.dto';
import { generateSlug } from '../../utils/slugify';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of ProductCategoryRepository
 */
@Injectable()
export class ProductCategoryDocumentRepository
  implements ProductCategoryRepository
{
  constructor(
    @InjectModel(ProductCategorySchemaClass.name)
    private readonly categoryModel: PaginateModel<ProductCategorySchemaClass>,
  ) {}

  /**
   * Create a new category
   */
  async create(
    data: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductCategory> {
    const now = new Date();
    const persistenceModel = ProductCategoryMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as ProductCategory);

    const createdProductCategory = new this.categoryModel(persistenceModel);
    const categoryDocument = await createdProductCategory.save();
    return ProductCategoryMapper.toDomain(categoryDocument);
  }

  /**
   * Find categories with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductCategoryDto | null;
    sortOptions?: SortProductCategoryDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductCategory>> {
    const filter: FilterQuery<ProductCategorySchemaClass> = {};

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

      // Filter by parent ID
      if (filterOptions.parentId) {
        filter.parentId = filterOptions.parentId;
      }

      // Search by name or code
      if (filterOptions.search) {
        filter.$or = [
          { name: { $regex: escapeRegex(filterOptions.search), $options: 'i' } },
          { code: { $regex: escapeRegex(filterOptions.search), $options: 'i' } },
        ];
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
      sort.order = 1;
      sort.name = 1;
    }

    const result = await this.categoryModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ProductCategoryMapper.toDomain(doc)),
    };
  }

  /**
   * Find all categories
   */
  async findAll(): Promise<ProductCategory[]> {
    const categoryDocuments = await this.categoryModel
      .aggregate([
        {
          $addFields: {
            sortOrder: { $ifNull: ['$order', Number.MAX_SAFE_INTEGER] },
          },
        },
        { $sort: { sortOrder: 1, name: 1 } },
        { $unset: 'sortOrder' },
      ])
      .exec();

    return categoryDocuments.map((doc) => ProductCategoryMapper.toDomain(doc));
  }

  /**
   * Find all categories with filtering (no pagination)
   */
  async findAllWithFilter({
    filterOptions,
    sortOptions,
  }: {
    filterOptions?: FilterProductCategoryDto | null;
    sortOptions?: SortProductCategoryDto[] | null;
  }): Promise<ProductCategory[]> {
    const filter: FilterQuery<ProductCategorySchemaClass> = {};

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

      // Filter by parent ID
      if (filterOptions.parentId) {
        filter.parentId = filterOptions.parentId;
      }

      // Filter by businessId
      if ((filterOptions as any).businessId) {
        filter.businessId = (filterOptions as any).businessId;
      }

      // Search by name or code
      if (filterOptions.search) {
        filter.$or = [
          { name: { $regex: escapeRegex(filterOptions.search), $options: 'i' } },
          { code: { $regex: escapeRegex(filterOptions.search), $options: 'i' } },
        ];
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
      sort.order = 1;
      sort.name = 1;
    }

    const categoryDocuments = await this.categoryModel
      .find(filter)
      .sort(sort)
      .lean();

    return categoryDocuments.map((doc) => ProductCategoryMapper.toDomain(doc));
  }

  /**
   * Find category by ID
   */
  async findById(
    id: ProductCategory['id'],
  ): Promise<NullableType<ProductCategory>> {
    const categoryDocument = await this.categoryModel.findById(id).lean();

    return categoryDocument
      ? ProductCategoryMapper.toDomain(categoryDocument)
      : null;
  }

  /**
   * Find multiple categories by IDs
   */
  async findByIds(ids: string[]): Promise<ProductCategory[]> {
    const categoryDocuments = await this.categoryModel
      .find({ _id: { $in: ids } })
      .lean();

    return categoryDocuments.map((doc) => ProductCategoryMapper.toDomain(doc));
  }

  /**
   * Find category by snapshot ID (source ID) and source
   */
  async findBySnapshotId(
    snapshotId: number,
    source: ProductCategory['source'],
  ): Promise<NullableType<ProductCategory>> {
    const categoryDocument = await this.categoryModel
      .findOne({ 'snapshot.id': snapshotId, source })
      .lean();

    return categoryDocument
      ? ProductCategoryMapper.toDomain(categoryDocument)
      : null;
  }

  /**
   * Find category by code
   */
  async findByCode(code: string): Promise<NullableType<ProductCategory>> {
    const categoryDocument = await this.categoryModel.findOne({ code }).lean();

    return categoryDocument
      ? ProductCategoryMapper.toDomain(categoryDocument)
      : null;
  }

  /**
   * Find category by slug within a business
   * @param businessId - Business ID
   * @param slug - SEO-friendly URL slug
   * @returns Category or null if not found
   */
  async findBySlug(
    businessId: string,
    slug: string,
  ): Promise<NullableType<ProductCategory>> {
    const categoryDocument = await this.categoryModel
      .findOne({ businessId, slug })
      .lean();

    return categoryDocument
      ? ProductCategoryMapper.toDomain(categoryDocument)
      : null;
  }

  /**
   * Find child categories by parent ID
   */
  async findByParentId(parentId: string): Promise<ProductCategory[]> {
    const categoryDocuments = await this.categoryModel
      .find({ parentId })
      .sort({ order: 1, name: 1 })
      .exec();

    return categoryDocuments.map((doc) => ProductCategoryMapper.toDomain(doc));
  }

  /**
   * Update existing category
   */
  async update(
    id: ProductCategory['id'],
    payload: Partial<ProductCategory>,
  ): Promise<NullableType<ProductCategory>> {
    const updatedProductCategory = await this.categoryModel
      .findByIdAndUpdate(
        id,
        {
          ...ProductCategoryMapper.toDocument(payload as ProductCategory),
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    return updatedProductCategory
      ? ProductCategoryMapper.toDomain(updatedProductCategory)
      : null;
  }

  /**
   * Delete category
   */
  async remove(id: ProductCategory['id']): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
  }

  /**
   * Bulk upsert categories (create or update by snapshot.id)
   * Uses MongoDB bulkWrite for maximum performance
   * Note: slug is only set on insert to preserve manual overrides
   */
  async bulkUpsert(
    categories: Array<Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<number> {
    if (!categories || categories.length === 0) {
      return 0;
    }

    const now = new Date();
    const bulkOps = categories.map((category) => {
      // Generate slug from category name
      const slug = generateSlug(category.name);

      const persistenceModel = ProductCategoryMapper.toDocument({
        ...category,
        slug,
        createdAt: now,
        updatedAt: now,
      } as unknown as ProductCategory);

      // Extract snapshot.id for filter
      const snapshotId = (category.snapshot as any)?.id;

      // Remove slug from $set - only set on insert to preserve manual overrides
      const { slug: persistenceSlug, ...updateFields } = persistenceModel;

      return {
        updateOne: {
          filter: {
            businessId: category.businessId,
            source: category.source,
            'snapshot.id': snapshotId,
          },
          update: {
            $set: updateFields,
            $setOnInsert: { createdAt: now, slug: persistenceSlug },
          },
          upsert: true,
        },
      };
    });

    const result = await this.categoryModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    return result.upsertedCount + result.modifiedCount;
  }

  /**
   * Build a mapping of source category IDs (snapshot.id) to MongoDB _ids
   * Used for resolving parent relationships after sync
   */
  async buildSnapshotIdMapping(
    businessId: string,
    source: 'nhanh' | 'shopify',
  ): Promise<Map<string, string>> {
    const mapping = new Map<string, string>();

    const categories = await this.categoryModel
      .find({ businessId, source })
      .select({ _id: 1, 'snapshot.id': 1 })
      .lean();

    for (const category of categories) {
      const snapshotId = (category.snapshot as any)?.id;
      if (snapshotId) {
        mapping.set(snapshotId.toString(), category._id.toString());
      }
    }

    return mapping;
  }

  /**
   * Bulk update parentId for categories based on snapshot.parentId mapping
   */
  async bulkUpdateParentIds(
    updates: Array<{ id: string; parentId: string }>,
  ): Promise<number> {
    if (!updates || updates.length === 0) {
      return 0;
    }

    const now = new Date();
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(update.id) },
        update: {
          $set: {
            parentId: new mongoose.Types.ObjectId(update.parentId),
            updatedAt: now,
          },
        },
      },
    }));

    const result = await this.categoryModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    return result.modifiedCount;
  }
}
