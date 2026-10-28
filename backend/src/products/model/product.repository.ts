import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery } from 'mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import {
  ProductRepository,
  PromotionVariantAvailability,
} from '../domain/product.repository';
import { Product } from '../domain/product';
import { ProductBadge } from '../domain/product-badge.enum';
import type { ProductDescriptionMedia } from '../domain/product-description-media';
import { ProductStatus } from '../domain/product-status.enum';
import { ProductType } from '../domain/product-type.enum';
import { ProductSchemaClass } from './product.schema';
import { ProductMapper } from './product.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { FilterProductDto, SortProductDto } from '../dto/query-product.dto';
import { throwException } from '../../utils/errors/throw-exception';
import { generateSlug } from '../../utils/slugify';
import { buildAccentInsensitivePattern } from '../../utils/search';

/**
 * Base projection to exclude snapshot from all API responses.
 * Snapshot is only used for internal sync/processing, never sent to clients.
 */
const BASE_PROJECTION = { snapshot: 0 };

/**
 * Projection for listing pages - excludes additional heavy fields
 * that are only needed for single product detail view.
 */
const LISTING_PROJECTION = {
  ...BASE_PROJECTION,
  description: 0,
  descriptionLocalization: 0,
  content: 0,
  details: 0,
  detailsLocalization: 0,
  sizeGuide: 0,
  descriptionMedia: 0,
  vat: 0,
  barcode: 0,
  attributes: 0,
  parent: 0,
};

/**
 * Mongoose implementation of ProductRepository
 */
@Injectable()
export class ProductDocumentRepository implements ProductRepository {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: PaginateModel<ProductSchemaClass>,
  ) {}

  /**
   * Create a new product
   */
  async create(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    // Manual uniqueness check for businessId + source + snapshot.id
    const snapshotId = (data.snapshot as any)?.id;
    if (snapshotId) {
      const existing = await this.findByBusinessIdSourceAndSnapshotId(
        data.businessId,
        data.source,
        snapshotId,
      );
      if (existing) {
        throwException({
          status: HttpStatus.CONFLICT,
          message: `Product with snapshot.id ${snapshotId} already exists for this business and source`,
          errors: { snapshotId: 'already exists' },
        });
      }
    }

    const now = new Date();
    const persistenceModel = ProductMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as Product);

    const createdProduct = new this.productModel(persistenceModel);
    const productDocument = await createdProduct.save();
    // Convert to lean object to avoid Mongoose document serialization issues
    const leanProduct = productDocument.toObject();
    return ProductMapper.toDomain(leanProduct);
  }

  /**
   * Find products with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductDto | null;
    sortOptions?: SortProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Product>> {
    const filter: FilterQuery<ProductSchemaClass> = { deletedAt: null };

    // Apply filter options
    if (filterOptions) {
      // Filter by status (single or multiple)
      if (filterOptions.statuses?.length) {
        filter.status = { $in: filterOptions.statuses };
      } else if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }

      // Filter by source
      if (filterOptions.source) {
        filter.source = filterOptions.source;
      }

      // Filter by category ID (single or multiple)
      if (filterOptions.categoryIds?.length) {
        filter['category.id'] = { $in: filterOptions.categoryIds };
      } else if (filterOptions.categoryId) {
        filter['category.id'] = filterOptions.categoryId;
      }

      // Filter by brand ID
      if (filterOptions.brandId) {
        filter['brand.id'] = filterOptions.brandId;
      }

      // Filter by product type
      if (filterOptions.type) {
        filter.type = filterOptions.type;
      }

      // Filter by businessId
      if (filterOptions.businessId) {
        filter.businessId = filterOptions.businessId;
      }

      // Filter by specific product IDs
      if (filterOptions.productIds?.length) {
        filter._id = { $in: filterOptions.productIds };
      }

      // Filter by price range (using prices.retail)
      if (
        filterOptions.minPrice !== undefined ||
        filterOptions.maxPrice !== undefined
      ) {
        filter['prices.retail'] = {};
        if (filterOptions.minPrice !== undefined) {
          filter['prices.retail'].$gte = filterOptions.minPrice;
        }
        if (filterOptions.maxPrice !== undefined) {
          filter['prices.retail'].$lte = filterOptions.maxPrice;
        }
      }

      // Only return products with a valid retail price (> 0)
      if (filterOptions.hasRetailPrice) {
        filter['prices.retail'] = {
          ...(filter['prices.retail'] ?? {}),
          $gt: 0,
        };
      }

      // Search by name or code (accent-insensitive)
      if (filterOptions.search) {
        const pattern = buildAccentInsensitivePattern(filterOptions.search);
        filter.$or = [
          { name: { $regex: pattern, $options: 'i' } },
          { code: { $regex: pattern, $options: 'i' } },
        ];
      }
    }

    // Always exclude child variants from listing results
    // Parent products have parentId = -2 (has variants), -1 (standalone), or field doesn't exist
    // Child variants have parentId > 0 (points to parent's snapshot.id)
    const parentsOnlyCondition = {
      $or: [
        { 'snapshot.parentId': { $in: [-2, -1] } },
        { 'snapshot.parentId': { $exists: false } },
      ],
    };

    if (filter.$or) {
      // Wrap existing $or (search) and parents-only condition in $and
      const searchCondition = { $or: filter.$or };
      delete filter.$or;
      filter.$and = [searchCondition, parentsOnlyCondition];
    } else {
      filter.$or = parentsOnlyCondition.$or;
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      // Default sort
      sort.createdAt = 1;
    }

    // Ensure stable pagination by adding _id as tie-breaker
    if (!sort._id) {
      sort._id = 1;
    }

    // Use Vietnamese collation when sorting by name for proper diacritics ordering
    const paginateOptions: Record<string, any> = {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
      // Exclude heavy fields not needed for listing pages
      select: LISTING_PROJECTION,
    };

    if (sort.name) {
      paginateOptions.collation = { locale: 'vi' };
    }

    const result = await this.productModel.paginate(filter, paginateOptions);

    return {
      ...result,
      docs: result.docs.map((doc) => ProductMapper.toDomain(doc)),
    };
  }

  /**
   * Find product by ID
   */
  async findById(id: Product['id']): Promise<NullableType<Product>> {
    const productDocument = await this.productModel
      .findOne({ _id: id, deletedAt: null }, BASE_PROJECTION)
      .lean();

    return productDocument ? ProductMapper.toDomain(productDocument) : null;
  }

  /**
   * Find product by snapshot ID (source ID) and source
   */
  async findBySnapshotId(
    snapshotId: number,
    source: Product['source'],
  ): Promise<NullableType<Product>> {
    const productDocument = await this.productModel
      .findOne({ 'snapshot.id': snapshotId, source, deletedAt: null })
      .lean();

    return productDocument ? ProductMapper.toDomain(productDocument) : null;
  }

  /**
   * Find product by businessId, source, and snapshot.id
   */
  async findByBusinessIdSourceAndSnapshotId(
    businessId: string,
    source: Product['source'],
    snapshotId: number,
  ): Promise<NullableType<Product>> {
    const productDocument = await this.productModel
      .findOne({
        businessId,
        source,
        'snapshot.id': snapshotId,
        deletedAt: null,
      })
      .lean();

    return productDocument ? ProductMapper.toDomain(productDocument) : null;
  }

  /**
   * Find product by code
   */
  async findByCode(code: string): Promise<NullableType<Product>> {
    const productDocument = await this.productModel
      .findOne({ code, deletedAt: null }, BASE_PROJECTION)
      .lean();

    return productDocument ? ProductMapper.toDomain(productDocument) : null;
  }

  /**
   * Find product by slug within a business
   * @param businessId - Business ID
   * @param slug - SEO-friendly URL slug
   * @returns Product or null if not found
   */
  async findBySlug(
    businessId: string,
    slug: string,
  ): Promise<NullableType<Product>> {
    const productDocument = await this.productModel
      .findOne({ businessId, slug, deletedAt: null }, BASE_PROJECTION)
      .lean();

    return productDocument ? ProductMapper.toDomain(productDocument) : null;
  }

  /**
   * Find product by businessId and code
   */
  async findByBusinessIdAndCode(
    businessId: string,
    code: string,
  ): Promise<NullableType<Product>> {
    const productDocument = await this.productModel
      .findOne({ businessId, code, deletedAt: null }, BASE_PROJECTION)
      .lean();

    return productDocument ? ProductMapper.toDomain(productDocument) : null;
  }

  /**
   * Find multiple products by IDs
   */
  async findByIds(ids: string[]): Promise<Product[]> {
    const productDocuments = await this.productModel
      .find({ _id: { $in: ids }, deletedAt: null })
      .lean();

    return productDocuments.map((doc) => ProductMapper.toDomain(doc));
  }

  async findPromotionDisplayByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const productDocuments = await this.productModel
      .find(
        { _id: { $in: ids }, deletedAt: null },
        {
          name: 1,
          'prices.retail': 1,
          'images.avatar': 1,
          'inventory.available': 1,
          status: 1,
          hide: 1,
          'parent.id': 1,
          'parent.name': 1,
          'parent.code': 1,
          'parent.images.avatar': 1,
          'parent.prices.retail': 1,
          'variants._id': 1,
          'variants.name': 1,
          'variants.prices.retail': 1,
          'variants.images.avatar': 1,
          'variants.inventory.available': 1,
          'variants.status': 1,
          'variants.hide': 1,
        },
      )
      .lean();

    return productDocuments.map((doc) => ProductMapper.toDomain(doc));
  }

  async findPromotionVariantAvailabilityByParentIds(
    parentIds: string[],
  ): Promise<PromotionVariantAvailability[]> {
    const validParentIds = [...new Set(parentIds)]
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    if (validParentIds.length === 0) return [];

    const variantDocuments = await this.productModel
      .find(
        {
          'parent.id': { $in: validParentIds },
          deletedAt: null,
        },
        {
          'parent.id': 1,
          status: 1,
          hide: 1,
          'inventory.available': 1,
        },
      )
      .lean();

    return variantDocuments.flatMap((variant) => {
      const parentProductId = variant.parent?.id?.toString();
      if (!parentProductId) return [];

      return [
        {
          parentProductId,
          variantId: variant._id.toString(),
          hide: variant.hide ?? false,
          status: variant.status,
          available: variant.inventory?.available ?? 0,
        },
      ];
    });
  }

  /**
   * Find multiple products by codes
   */
  async findByCodes(codes: string[]): Promise<Product[]> {
    const productDocuments = await this.productModel
      .find({ code: { $in: codes }, deletedAt: null }, BASE_PROJECTION)
      .lean();

    return productDocuments.map((doc) => ProductMapper.toDomain(doc));
  }

  /**
   * Update existing product
   * Only updates fields that are explicitly provided in the payload
   */
  async update(
    id: Product['id'],
    payload: Partial<Product>,
  ): Promise<NullableType<Product>> {
    // Build update object with only defined fields
    const updateFields: Record<string, any> = {};

    // Only include fields that are explicitly set in payload
    if (payload.businessId !== undefined)
      updateFields.businessId = payload.businessId;
    if (payload.source !== undefined) updateFields.source = payload.source;
    if (payload.snapshot !== undefined)
      updateFields.snapshot = payload.snapshot;
    if (payload.code !== undefined) updateFields.code = payload.code;
    if (payload.barcode !== undefined) updateFields.barcode = payload.barcode;
    if (payload.name !== undefined) updateFields.name = payload.name;
    if (payload.description !== undefined)
      updateFields.description = payload.description;
    if (payload.content !== undefined) updateFields.content = payload.content;
    if (payload.prices !== undefined) updateFields.prices = payload.prices;
    if (payload.vat !== undefined) updateFields.vat = payload.vat;
    if (payload.images !== undefined) {
      updateFields.images = {
        avatar: payload.images.avatar ?? undefined,
        others: payload.images.others ?? [],
      };
    }
    if (payload.inventory !== undefined)
      updateFields.inventory = payload.inventory;
    if (payload.status !== undefined) updateFields.status = payload.status;
    if (payload.type !== undefined) updateFields.type = payload.type;
    if (payload.category !== undefined) {
      updateFields.category = payload.category
        ? {
            id: new mongoose.Types.ObjectId(payload.category.id),
            name: payload.category.name,
          }
        : null;
    }
    if (payload.hide !== undefined) updateFields.hide = payload.hide;
    if (payload.attributes !== undefined)
      updateFields.attributes = payload.attributes;
    if (payload.parent !== undefined) {
      updateFields.parent = payload.parent
        ? {
            id: new mongoose.Types.ObjectId(payload.parent.id),
            name: payload.parent.name,
            code: payload.parent.code,
            images: payload.parent.images,
            prices: payload.parent.prices,
            category: payload.parent.category
              ? {
                  id: new mongoose.Types.ObjectId(payload.parent.category.id),
                  name: payload.parent.category.name,
                }
              : undefined,
          }
        : null;
    }
    if (payload.variants !== undefined)
      updateFields.variants = payload.variants;
    if (payload.variantOptions !== undefined)
      updateFields.variantOptions = payload.variantOptions;
    if (payload.stock !== undefined) updateFields.stock = payload.stock;
    if (payload.flashSale !== undefined)
      updateFields.flashSale = payload.flashSale;
    if (payload.reviewStats !== undefined)
      updateFields.reviewStats = payload.reviewStats;
    if (payload.details !== undefined) updateFields.details = payload.details;
    if (payload.deletedAt !== undefined)
      updateFields.deletedAt = payload.deletedAt;

    // Always update timestamp
    updateFields.updatedAt = new Date();

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .lean();

    return updatedProduct ? ProductMapper.toDomain(updatedProduct) : null;
  }

  /**
   * Soft delete product
   */
  async remove(id: Product['id']): Promise<void> {
    await this.productModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }

  /**
   * Bulk upsert products (create or update by snapshot.id)
   * Uses MongoDB bulkWrite for maximum performance
   *
   * - slug: only set on insert (not updated to avoid breaking shared links)
   * - description, content: only set on insert (CMS-managed, preserved across syncs)
   */
  async bulkUpsert(
    products: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<number> {
    if (!products || products.length === 0) {
      return 0;
    }

    const now = new Date();
    const bulkOps = products.map((product) => {
      // Variants (snapshot.parentId > 0) are reached through their parent and
      // never queried by slug, so they don't need one. Skipping slug for them
      // keeps variants out of the unique { businessId, slug } index and avoids
      // E11000 collisions when two variants share the same name.
      const parentId = (product.snapshot as any)?.parentId;
      const isVariant = typeof parentId === 'number' && parentId > 0;

      const snapshotId = (product.snapshot as any)?.id;
      const slug = isVariant
        ? undefined
        : `${generateSlug(product.name)}-${snapshotId}`;

      const persistenceModel = ProductMapper.toDocument({
        ...product,
        slug,
        createdAt: now,
        updatedAt: now,
      } as unknown as Product);

      // Remove _id, createdAt, updatedAt, slug from $set to avoid conflicts
      // Also remove description and content - these are CMS-managed fields
      // slug is only set on insert to preserve manual overrides
      const {
        _id,
        createdAt,
        updatedAt,
        description,
        content,
        slug: persistenceSlug,
        ...updateFields
      } = persistenceModel;

      // Only set createdAt, description, content, and slug on insert.
      // slug is not updated on existing products to avoid breaking shared links.
      const setOnInsert: Record<string, unknown> = {
        createdAt: now,
        description,
        content,
      };
      if (persistenceSlug !== undefined) {
        setOnInsert.slug = persistenceSlug;
      }

      return {
        updateOne: {
          filter: {
            businessId: product.businessId,
            source: product.source,
            'snapshot.id': snapshotId,
          },
          update: {
            $set: { ...updateFields, updatedAt: now },
            $setOnInsert: setOnInsert,
          },
          upsert: true,
        },
      };
    });

    try {
      const result = await this.productModel.bulkWrite(bulkOps, {
        ordered: false,
      });

      return result.upsertedCount + result.modifiedCount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find products that need syncing of full details
   */
  async findProductsNeedingDetailSync(
    filters?: Record<string, any>,
  ): Promise<Array<{ id: string; snapshotId: number }>> {
    const query: FilterQuery<ProductSchemaClass> = {
      source: 'nhanh',
      deletedAt: null,
      'snapshot.id': { $exists: true },
      description: null,
    };

    // Apply additional filters if provided
    if (filters?.categoryId) {
      query['category.id'] = filters.categoryId;
    }
    if (filters?.status !== undefined) {
      query.status = filters.status;
    }
    // Filter by snapshot.updatedAt for incremental sync
    // snapshot.updatedAt is Nhanh's Unix timestamp (seconds)
    // updatedAtFrom is always Unix timestamp for product sync
    // Subtract 1 day padding to avoid missing products near sync boundary
    if (filters?.updatedAtFrom) {
      const fromTimestamp =
        typeof filters.updatedAtFrom === 'number'
          ? filters.updatedAtFrom
          : Math.floor(new Date(filters.updatedAtFrom).getTime() / 1000);
      const paddedTimestamp = fromTimestamp - 24 * 60 * 60; // 1 day in seconds
      query['snapshot.updatedAt'] = { $gte: paddedTimestamp };
    }

    const products = await this.productModel
      .find(query)
      .select({ _id: 1, 'snapshot.id': 1 })
      .lean();

    return products
      .map((p) => ({
        id: p._id.toString(),
        snapshotId: (p.snapshot as any)?.id,
      }))
      .filter((p) => p.snapshotId !== undefined);
  }

  /**
   * Update only description and content fields
   */
  async updateDescriptionContent(
    id: string,
    description?: string,
    content?: string,
  ): Promise<void> {
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (description !== undefined) {
      updateFields.description = description;
    }
    if (content !== undefined) {
      updateFields.content = content;
    }

    await this.productModel.updateOne({ _id: id }, { $set: updateFields });
  }

  /**
   * Find child variant products by parent's snapshot ID
   */
  async findVariantsByParentSnapshotId(
    businessId: string,
    source: Product['source'],
    parentSnapshotId: number,
  ): Promise<Product[]> {
    const productDocuments = await this.productModel
      .find({
        businessId,
        source,
        'snapshot.parentId': parentSnapshotId,
        deletedAt: null,
      })
      .sort({ 'snapshot.id': 1 })
      .lean();

    return productDocuments.map((doc) => ProductMapper.toDomain(doc));
  }

  /**
   * Embed variants into parent products for a business
   * Processes one parent at a time to avoid OOM with large datasets
   * Variants are stored without snapshot to reduce document size
   * Also pre-computes variantOptions to avoid runtime aggregation
   */
  async embedVariantsInParents(
    businessId: string,
    source: Product['source'],
  ): Promise<number> {
    let updatedCount = 0;
    let cursor: any = null;
    const batchSize = 100;

    // Process parent products in batches using cursor-based pagination
    while (true) {
      // Find parent products (parentId === -2) in batches
      const query: any = {
        businessId,
        source,
        'snapshot.parentId': -2,
        deletedAt: null,
      };

      if (cursor) {
        query['snapshot.id'] = { $gt: cursor };
      }

      const parents = await this.productModel
        .find(query)
        .select('_id snapshot.id')
        .sort({ 'snapshot.id': 1 })
        .limit(batchSize)
        .lean();

      if (parents.length === 0) {
        break;
      }

      // Process each parent individually
      for (const parent of parents) {
        const parentSnapshotId = (parent.snapshot as any)?.id;
        if (!parentSnapshotId) continue;

        // Find variants for this specific parent
        const variants = await this.productModel
          .find({
            businessId,
            source,
            'snapshot.parentId': parentSnapshotId,
            deletedAt: null,
          })
          .sort({ 'snapshot.id': 1 })
          .lean();

        // Update parent with embedded variants (only essential fields to reduce size)
        if (variants.length > 0) {
          // Extract only essential fields from variants for listing pages
          // This reduces variant size from ~1.4KB to ~400 bytes each
          const strippedVariants = variants.map((variant: any) => ({
            _id: variant._id,
            code: variant.code,
            barcode: variant.barcode,
            name: variant.name,
            attributes: variant.attributes,
            images: variant.images,
            prices: variant.prices,
            inventory: variant.inventory,
            status: variant.status,
            hide: variant.hide,
          }));

          // Pre-compute variant options from stripped variants
          const variantOptions = this.aggregateVariantOptions(strippedVariants);

          // Compute total stock from all variants
          const stock = strippedVariants.reduce(
            (sum, v) => sum + (v.inventory?.available ?? 0),
            0,
          );

          // Aggregate inventory from all variants
          const inventory = this.aggregateVariantInventory(strippedVariants);

          await this.productModel.updateOne(
            { _id: parent._id },
            {
              $set: {
                variants: strippedVariants,
                variantOptions,
                stock,
                inventory,
                updatedAt: new Date(),
              },
            },
          );
          updatedCount++;
        }
      }

      // Move cursor to last processed parent
      cursor = (parents[parents.length - 1].snapshot as any)?.id;

      // If we got fewer than batchSize, we're done
      if (parents.length < batchSize) {
        break;
      }
    }

    return updatedCount;
  }

  /**
   * Embed variants into a specific parent product
   * Much more efficient than embedVariantsInParents for single product updates
   */
  async embedVariantsForParent(
    parentSnapshotId: number,
    businessId: string,
    source: Product['source'],
  ): Promise<boolean> {
    // Find the parent product
    const parent = await this.productModel
      .findOne({
        businessId,
        source,
        'snapshot.id': parentSnapshotId,
        'snapshot.parentId': -2, // Must be a parent product
        deletedAt: null,
      })
      .select('_id snapshot.id')
      .lean();

    if (!parent) {
      return false;
    }

    // Find variants for this specific parent
    const variants = await this.productModel
      .find({
        businessId,
        source,
        'snapshot.parentId': parentSnapshotId,
        deletedAt: null,
      })
      .sort({ 'snapshot.id': 1 })
      .lean();

    if (variants.length === 0) {
      return false;
    }

    // Extract only essential fields from variants for listing pages
    // This reduces variant size from ~1.4KB to ~400 bytes each
    const strippedVariants = variants.map((variant: any) => ({
      _id: variant._id,
      code: variant.code,
      barcode: variant.barcode,
      name: variant.name,
      attributes: variant.attributes,
      images: variant.images,
      prices: variant.prices,
      inventory: variant.inventory,
      status: variant.status,
      hide: variant.hide,
    }));

    // Pre-compute variant options
    const variantOptions = this.aggregateVariantOptions(strippedVariants);

    // Compute total stock from all variants
    const stock = strippedVariants.reduce(
      (sum, v) => sum + (v.inventory?.available ?? 0),
      0,
    );

    // Aggregate inventory from all variants
    const inventory = this.aggregateVariantInventory(strippedVariants);

    // Update the parent with embedded variants
    await this.productModel.updateOne(
      { _id: parent._id },
      {
        $set: {
          variants: strippedVariants,
          variantOptions,
          stock,
          inventory,
          updatedAt: new Date(),
        },
      },
    );

    return true;
  }

  /**
   * Populate parent metadata for all variant products
   * Links variants to their parent products with full metadata
   * This enables efficient parent lookup in shopping flow (cart, checkout)
   */
  async populateParentMetadata(
    businessId: string,
    source: Product['source'],
  ): Promise<number> {
    // Step 1: Build mapping from snapshot.id to full parent data
    const parentMapping = new Map<
      number,
      {
        id: mongoose.Types.ObjectId;
        name: string;
        code: string;
        images: { avatar?: string; others?: string[] };
        prices: {
          retail: number;
          wholesale?: number;
          import?: number;
          old?: number;
          avgCost?: number;
        };
        category?: { id: mongoose.Types.ObjectId; name: string };
      }
    >();

    const parentProducts = await this.productModel
      .find({
        businessId,
        source,
        'snapshot.parentId': -2, // Parent products have parentId === -2
        deletedAt: null,
      })
      .select('_id snapshot.id name code images prices category')
      .lean();

    for (const parent of parentProducts) {
      const snapshotId = (parent.snapshot as any)?.id;
      if (snapshotId && parent._id) {
        parentMapping.set(snapshotId, {
          id: new mongoose.Types.ObjectId(parent._id.toString()),
          name: parent.name,
          code: parent.code,
          images: {
            avatar: parent.images?.avatar,
            others: parent.images?.others,
          },
          prices: parent.prices,
          category: parent.category
            ? {
                id: new mongoose.Types.ObjectId(parent.category.id.toString()),
                name: parent.category.name,
              }
            : undefined,
        });
      }
    }

    if (parentMapping.size === 0) {
      return 0;
    }

    // Step 2: Find all variants and build bulk update operations
    const bulkOps: any[] = [];

    // Process variants in batches using cursor
    let cursor: number | null = null;
    const batchSize = 100;

    while (true) {
      const query: any = {
        businessId,
        source,
        'snapshot.parentId': { $gt: 0 }, // Variants have positive parentId
        deletedAt: null,
      };

      if (cursor !== null) {
        query['snapshot.id'] = { $gt: cursor };
      }

      const variants = await this.productModel
        .find(query)
        .select('_id snapshot.id snapshot.parentId')
        .sort({ 'snapshot.id': 1 })
        .limit(batchSize)
        .lean();

      if (variants.length === 0) {
        break;
      }

      for (const variant of variants) {
        const parentSnapshotId = (variant.snapshot as any)?.parentId;
        const parentData = parentMapping.get(parentSnapshotId);

        if (parentData) {
          bulkOps.push({
            updateOne: {
              filter: { _id: variant._id },
              update: {
                $set: {
                  parent: parentData,
                  updatedAt: new Date(),
                },
              },
            },
          });
        }
      }

      cursor = (variants[variants.length - 1].snapshot as any)?.id;

      if (variants.length < batchSize) {
        break;
      }
    }

    // Step 3: Execute bulk update
    if (bulkOps.length === 0) {
      return 0;
    }

    const result = await this.productModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    return result.modifiedCount;
  }

  /**
   * Aggregate variant options from child variants' attributes
   * Used during sync to pre-compute variantOptions
   */
  private aggregateVariantOptions(
    variants: Array<{
      attributes?: Array<{ id?: number | string; name: string; value: string }>;
    }>,
  ): Array<{ id: string; name: string; values: string[] }> {
    const optionsMap = new Map<
      string,
      { id: string; name: string; values: Set<string> }
    >();

    for (const variant of variants) {
      const attributes = variant.attributes;
      if (!attributes) continue;

      for (const attr of attributes) {
        const attrName = attr.name;

        if (!optionsMap.has(attrName)) {
          // Store the first ID encountered for this attribute name
          optionsMap.set(attrName, {
            id: String(attr.id ?? attrName),
            name: attrName,
            values: new Set(),
          });
        }

        optionsMap.get(attrName)!.values.add(attr.value);
      }
    }

    return Array.from(optionsMap.values()).map(({ id, name, values }) => ({
      id,
      name,
      values: Array.from(values).sort(),
    }));
  }

  /**
   * Aggregate inventory from all variants
   * Sums all inventory fields across variants to compute parent's total inventory
   */
  private aggregateVariantInventory(
    variants: Array<{
      inventory?: {
        remain?: number;
        shipping?: number;
        damaged?: number;
        holding?: number;
        warranty?: number;
        warrantyHolding?: number;
        holdingNew?: number;
        shippingExport?: number;
        available?: number;
      };
    }>,
  ): {
    remain: number;
    shipping: number;
    damaged: number;
    holding: number;
    warranty: number;
    warrantyHolding: number;
    holdingNew: number;
    shippingExport: number;
    available: number;
  } {
    return variants.reduce(
      (acc, v) => {
        const inv = v.inventory;
        if (!inv) return acc;

        return {
          remain: acc.remain + (inv.remain ?? 0),
          shipping: acc.shipping + (inv.shipping ?? 0),
          damaged: acc.damaged + (inv.damaged ?? 0),
          holding: acc.holding + (inv.holding ?? 0),
          warranty: acc.warranty + (inv.warranty ?? 0),
          warrantyHolding: acc.warrantyHolding + (inv.warrantyHolding ?? 0),
          holdingNew: acc.holdingNew + (inv.holdingNew ?? 0),
          shippingExport: acc.shippingExport + (inv.shippingExport ?? 0),
          available: acc.available + (inv.available ?? 0),
        };
      },
      {
        remain: 0,
        shipping: 0,
        damaged: 0,
        holding: 0,
        warranty: 0,
        warrantyHolding: 0,
        holdingNew: 0,
        shippingExport: 0,
        available: 0,
      },
    );
  }

  /**
   * Update flash sale data for specific products
   * Used by the flash sale sync cron job
   */
  async updateFlashSaleData(
    updates: Array<{ productId: string; flashSale: Product['flashSale'] }>,
  ): Promise<void> {
    if (!updates || updates.length === 0) {
      return;
    }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.productId },
        update: {
          $set: {
            flashSale: update.flashSale,
            updatedAt: new Date(),
          },
        },
      },
    }));

    await this.productModel.bulkWrite(bulkOps, { ordered: false });
  }

  /**
   * Clear flash sale data for products not in the current flash sale
   * Resets flashSale to default values based on retail price
   */
  async clearFlashSaleData(excludeProductIds: string[]): Promise<void> {
    const filter: FilterQuery<ProductSchemaClass> = {
      deletedAt: null,
      'flashSale.flashSaleId': { $ne: null },
    };

    if (excludeProductIds.length > 0) {
      filter._id = { $nin: excludeProductIds };
    }

    // Use aggregation pipeline update to set default values from prices.retail
    await this.productModel.updateMany(filter, [
      {
        $set: {
          flashSale: {
            flashSaleId: null,
            flashSaleName: null,
            originalPrice: '$prices.retail',
            flashSalePrice: null,
            discountType: null,
            discountValue: 0,
            discountAmount: 0,
            discountPercent: 0,
            promotionalQuantity: 0,
            soldCount: 0,
            remainingStock: 0,
            endTime: null,
            effectivePrice: '$prices.retail',
          },
          updatedAt: new Date(),
        },
      },
    ]);
  }

  /**
   * Set default flash sale values for all products
   * Used when no flash sale is active
   */
  async setDefaultFlashSaleForAll(): Promise<void> {
    // Use aggregation pipeline update to set default values from prices.retail
    await this.productModel.updateMany({ deletedAt: null }, [
      {
        $set: {
          flashSale: {
            flashSaleId: null,
            flashSaleName: null,
            originalPrice: '$prices.retail',
            flashSalePrice: null,
            discountType: null,
            discountValue: 0,
            discountAmount: 0,
            discountPercent: 0,
            promotionalQuantity: 0,
            soldCount: 0,
            remainingStock: 0,
            endTime: null,
            effectivePrice: '$prices.retail',
          },
          updatedAt: new Date(),
        },
      },
    ]);
  }

  /**
   * Initialize flash sale defaults for products that don't have the field
   * Used on app startup to ensure all products have flashSale.effectivePrice for sorting
   * @returns Number of products updated
   */
  async initializeFlashSaleDefaults(): Promise<number> {
    const result = await this.productModel.updateMany(
      {
        deletedAt: null,
        $or: [
          { flashSale: { $exists: false } },
          { 'flashSale.effectivePrice': null },
        ],
      },
      [
        {
          $set: {
            flashSale: {
              flashSaleId: null,
              flashSaleName: null,
              originalPrice: '$prices.retail',
              flashSalePrice: null,
              discountType: null,
              discountValue: 0,
              discountAmount: 0,
              discountPercent: 0,
              promotionalQuantity: 0,
              soldCount: 0,
              remainingStock: 0,
              endTime: null,
              effectivePrice: '$prices.retail',
            },
          },
        },
      ],
    );
    return result.modifiedCount;
  }

  /**
   * Update product discount data for specific products
   * Used by the product discount sync cron job
   */
  async updateProductDiscountData(
    updates: Array<{
      productId: string;
      productDiscount: Product['productDiscount'];
    }>,
  ): Promise<void> {
    if (!updates || updates.length === 0) {
      return;
    }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.productId },
        update: {
          $set: {
            productDiscount: update.productDiscount,
            updatedAt: new Date(),
          },
        },
      },
    }));

    await this.productModel.bulkWrite(bulkOps, { ordered: false });
  }

  /**
   * Clear product discount data for products not in the current promotion
   */
  async clearProductDiscountData(excludeProductIds: string[]): Promise<void> {
    const filter: FilterQuery<ProductSchemaClass> = {
      deletedAt: null,
      'productDiscount.promotionId': { $ne: null },
    };

    if (excludeProductIds.length > 0) {
      filter._id = { $nin: excludeProductIds };
    }

    // Reset to default values
    await this.productModel.updateMany(filter, [
      {
        $set: {
          productDiscount: {
            promotionId: null,
            promotionName: null,
            originalPrice: '$prices.retail',
            discountedPrice: null,
            discountType: null,
            discountValue: 0,
            discountAmount: 0,
            discountPercent: 0,
            soldCount: 0,
            endTime: null,
            effectivePrice: '$prices.retail',
          },
          updatedAt: new Date(),
        },
      },
    ]);
  }

  /**
   * Update review statistics for a product
   * Called when reviews are created or visibility is toggled
   */
  async updateReviewStats(
    productId: string,
    stats: { averageRating: number; reviewCount: number },
  ): Promise<void> {
    await this.productModel.updateOne(
      { _id: productId },
      {
        $set: {
          reviewStats: stats,
          updatedAt: new Date(),
        },
      },
    );
  }

  /**
   * Update product details (CMS-only data)
   */
  async updateDetails(
    productId: string,
    data: {
      nameLocalization?: { vi?: string; en?: string };
      description?: string;
      descriptionLocalization?: { vi?: string; en?: string };
      content?: string;
      details?: {
        material?: string;
        style?: string;
        highlights?: string;
        suitableFor?: string;
        careInstructions?: string;
      };
      detailsLocalization?: {
        material?: { vi?: string; en?: string };
        style?: { vi?: string; en?: string };
        highlights?: { vi?: string; en?: string };
        suitableFor?: { vi?: string; en?: string };
        careInstructions?: { vi?: string; en?: string };
      };
      badge?: ProductBadge | null;
      sizeGuide?: string | null;
      descriptionMedia?: Partial<ProductDescriptionMedia>;
    },
  ): Promise<NullableType<Product>> {
    // Build update object, only including fields that are defined
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };
    const unsetFields: Record<string, 1> = {};

    // Update localization fields
    if (data.nameLocalization !== undefined) {
      updateFields.nameLocalization = data.nameLocalization;
    }
    if (data.descriptionLocalization !== undefined) {
      updateFields.descriptionLocalization = data.descriptionLocalization;
    }

    // Update top-level fields
    if (data.description !== undefined) {
      updateFields.description = data.description;
    }
    if (data.content !== undefined) {
      updateFields.content = data.content;
    }

    // Set each detail field individually to allow partial updates
    if (data.details) {
      if (data.details.material !== undefined) {
        updateFields['details.material'] = data.details.material;
      }
      if (data.details.style !== undefined) {
        updateFields['details.style'] = data.details.style;
      }
      if (data.details.highlights !== undefined) {
        updateFields['details.highlights'] = data.details.highlights;
      }
      if (data.details.suitableFor !== undefined) {
        updateFields['details.suitableFor'] = data.details.suitableFor;
      }
      if (data.details.careInstructions !== undefined) {
        updateFields['details.careInstructions'] =
          data.details.careInstructions;
      }
    }

    // Set each details localization field individually to allow partial updates
    if (data.detailsLocalization) {
      updateFields.detailsLocalization = data.detailsLocalization;
    }

    // Handle badge field (null removes the badge)
    if (data.badge !== undefined) {
      if (data.badge === null) {
        unsetFields.badge = 1;
      } else {
        updateFields.badge = data.badge;
      }
    }

    // Handle sizeGuide field (null removes it)
    if (data.sizeGuide !== undefined) {
      if (data.sizeGuide === null || data.sizeGuide === '') {
        unsetFields.sizeGuide = 1;
      } else {
        updateFields.sizeGuide = data.sizeGuide;
      }
    }

    if (data.descriptionMedia !== undefined) {
      if (data.descriptionMedia.topImages !== undefined) {
        updateFields['descriptionMedia.topImages'] =
          data.descriptionMedia.topImages;
      }
      if (data.descriptionMedia.sliderImages !== undefined) {
        updateFields['descriptionMedia.sliderImages'] =
          data.descriptionMedia.sliderImages;
      }
      if (data.descriptionMedia.bottomImages !== undefined) {
        updateFields['descriptionMedia.bottomImages'] =
          data.descriptionMedia.bottomImages;
      }
    }

    // Build update operation
    const updateOp: Record<string, any> = { $set: updateFields };
    if (Object.keys(unsetFields).length > 0) {
      updateOp.$unset = unsetFields;
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(productId, updateOp, { new: true })
      .lean();

    return updatedProduct ? ProductMapper.toDomain(updatedProduct) : null;
  }

  /**
   * Bulk update hide status for multiple products
   */
  async bulkUpdateHide(
    items: Array<{ productId: string; hide: boolean }>,
  ): Promise<number> {
    if (!items || items.length === 0) {
      return 0;
    }

    const now = new Date();
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, deletedAt: null },
        update: { $set: { hide: item.hide, updatedAt: now } },
      },
    }));

    const result = await this.productModel.bulkWrite(bulkOps, {
      ordered: false,
    });

    return result.modifiedCount;
  }

  /**
   * Update product banner for multiple products (bulk operation)
   * Used when syncing banner data to products
   */
  async updateProductBanner(
    productIds: string[],
    banner: {
      id: string;
      name: string;
      image: string;
      position: number;
      ratio?: number | null;
    } | null,
  ): Promise<number> {
    if (!productIds || productIds.length === 0) {
      return 0;
    }

    const now = new Date();
    const updateData: Record<string, any> = { updatedAt: now };

    if (banner) {
      updateData.productBanner = {
        id: new mongoose.Types.ObjectId(banner.id),
        name: banner.name,
        image: banner.image,
        position: banner.position,
        ...(banner.ratio !== null &&
          banner.ratio !== undefined && { ratio: banner.ratio }),
      };
    }

    const updateOp: Record<string, any> = { $set: updateData };
    if (!banner) {
      updateOp.$unset = { productBanner: 1 };
    }

    const result = await this.productModel.updateMany(
      {
        _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
        deletedAt: null,
      },
      updateOp,
    );

    return result.modifiedCount;
  }

  /**
   * Clear product banner from all products that have a specific banner ID
   * Used when deleting a product banner
   */
  async clearProductBanner(bannerId: string): Promise<number> {
    const now = new Date();

    const result = await this.productModel.updateMany(
      {
        'productBanner.id': new mongoose.Types.ObjectId(bannerId),
        deletedAt: null,
      },
      {
        $unset: { productBanner: 1 },
        $set: { updatedAt: now },
      },
    );

    return result.modifiedCount;
  }

  /**
   * Find products updated since a given date, returning lightweight data
   * Used by commission product sync cron to detect changes
   */
  async findUpdatedSince(
    since: Date,
    limit: number,
  ): Promise<
    Array<{
      id: string;
      name: string;
      code: string;
      slug?: string | null;
      images: { avatar?: string | null; others?: string[] };
      costPrice: number;
      stock: number;
      category?: { id: string; name: string } | null;
      updatedAt: Date;
      deletedAt: Date | null;
    }>
  > {
    const docs = await this.productModel
      .find(
        {
          updatedAt: { $gt: since },
          // Only parent/standalone products — exclude child variants
          $or: [
            { 'snapshot.parentId': { $in: [-2, -1] } },
            { 'snapshot.parentId': { $exists: false } },
          ],
        },
        {
          _id: 1,
          name: 1,
          code: 1,
          slug: 1,
          images: 1,
          'prices.import': 1,
          'prices.retail': 1,
          stock: 1,
          category: 1,
          updatedAt: 1,
          deletedAt: 1,
        },
      )
      .sort({ updatedAt: 1 })
      .limit(limit)
      .lean();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      slug: doc.slug ?? null,
      images: doc.images ?? {},
      costPrice: doc.prices?.retail ?? 0,
      stock: doc.stock ?? 0,
      category: doc.category
        ? { id: doc.category.id.toString(), name: doc.category.name }
        : null,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt ?? null,
    }));
  }

  /**
   * Find active products by IDs
   *
   * Excludes child variants (snapshot.parentId > 0) vì chúng không phải
   * sản phẩm bán độc lập trên storefront — cùng pattern với list
   * endpoint để recommendation không lộ SKU variant.
   */
  async findActiveByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    const docs = await this.productModel
      .find({
        _id: { $in: objectIds },
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        type: ProductType.REGULAR,
        $or: [
          { 'snapshot.parentId': { $in: [-2, -1] } },
          { 'snapshot.parentId': { $exists: false } },
        ],
      })
      .select(LISTING_PROJECTION)
      .lean();

    return docs.map((doc) => ProductMapper.toDomain(doc));
  }

  /**
   * Find popular products from given category IDs
   *
   * Excludes child variants (snapshot.parentId > 0) — xem chú thích ở
   * `findActiveByIds`.
   */
  async findPopularByCategories(
    categoryIds: string[],
    excludeIds: string[],
    limit: number,
  ): Promise<Product[]> {
    if (categoryIds.length === 0) return [];

    const categoryObjectIds = categoryIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    const excludeObjectIds = excludeIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    const docs = await this.productModel
      .find({
        'category.id': { $in: categoryObjectIds },
        _id: { $nin: excludeObjectIds },
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        type: ProductType.REGULAR,
        $or: [
          { 'snapshot.parentId': { $in: [-2, -1] } },
          { 'snapshot.parentId': { $exists: false } },
        ],
      })
      .select(LISTING_PROJECTION)
      .sort({ 'reviewStats.reviewCount': -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return docs.map((doc) => ProductMapper.toDomain(doc));
  }

  /**
   * Stream variant products in batches for Excel export
   * Uses MongoDB cursor to avoid loading all documents into memory at once
   */
  async *streamVariantsForExport(
    filters: {
      search?: string;
      status?: ProductStatus;
      categoryIds?: string[];
      businessId?: string;
    },
    batchSize = 500,
  ): AsyncGenerator<Record<string, any>[]> {
    const filter: FilterQuery<ProductSchemaClass> = {
      'snapshot.parentId': { $gt: 0 },
    };

    if (filters.businessId) {
      filter.businessId = filters.businessId;
    }

    if (filters.search) {
      const pattern = buildAccentInsensitivePattern(filters.search);
      filter.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { code: { $regex: pattern, $options: 'i' } },
      ];
    }

    if (filters.status !== undefined) {
      filter.status = filters.status;
    }

    if (filters.categoryIds?.length) {
      filter['category.id'] = { $in: filters.categoryIds };
    }

    const cursor = this.productModel
      .find(filter, {
        description: 0,
        descriptionLocalization: 0,
        content: 0,
        details: 0,
        detailsLocalization: 0,
        sizeGuide: 0,
        descriptionMedia: 0,
        variants: 0,
        variantOptions: 0,
        flashSale: 0,
        productDiscount: 0,
        reviewStats: 0,
        productBanner: 0,
        badge: 0,
      })
      .lean()
      .cursor({ batchSize });

    let batch: Record<string, any>[] = [];
    for await (const doc of cursor) {
      batch.push(doc as Record<string, any>);
      if (batch.length >= batchSize) {
        yield batch;
        batch = [];
      }
    }
    if (batch.length > 0) yield batch;
  }

  /**
   * Find trending products by IDs
   */
  async findTrendingByIds(
    productIds: string[],
    limit: number,
  ): Promise<Product[]> {
    if (productIds.length === 0) return [];

    const objectIds = productIds
      .slice(0, limit)
      .map((id) => new mongoose.Types.ObjectId(id));

    const docs = await this.productModel
      .find({
        _id: { $in: objectIds },
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        type: ProductType.REGULAR,
      })
      .select(LISTING_PROJECTION)
      .lean();

    return docs.map((doc) => ProductMapper.toDomain(doc));
  }
  /**
   * Get mapping of Nhanh Product ID -> Internal Product ID
   * Lightweight query using only _id and snapshot.id fields
   * Handles nested variant IDs stored in snapshot.childs[].id
   */
  async getNhanhIdMapping(): Promise<Map<string, string>> {
    const mapping = new Map<string, string>();

    const docs = await this.productModel
      .find({ source: 'nhanh', deletedAt: null })
      .select({ _id: 1, 'snapshot.id': 1, 'snapshot.childs': 1 })
      .lean();

    for (const doc of docs) {
      const snapshot = doc.snapshot as any;
      if (snapshot?.id) {
        mapping.set(snapshot.id.toString(), doc._id.toString());
      }
      // Also map child variant IDs if present in snapshot
      if (Array.isArray(snapshot?.childs)) {
        for (const child of snapshot.childs) {
          if (child?.id) {
            const childDoc = docs.find(
              (d) =>
                (d.snapshot as any)?.id?.toString() === child.id.toString(),
            );
            if (childDoc) {
              mapping.set(child.id.toString(), childDoc._id.toString());
            }
          }
        }
      }
    }

    return mapping;
  }
}
