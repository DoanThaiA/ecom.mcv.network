import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { ProductInventoryRepository } from '../domain/product-inventory.repository';
import { ProductInventory } from '../domain/product-inventory';
import { ProductInventorySchemaClass } from './product-inventory.schema';
import { ProductInventoryMapper } from './product-inventory.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import {
  FilterProductInventoryDto,
  SortProductInventoryDto,
} from '../dto/query-product-inventory.dto';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of ProductInventoryRepository
 */
@Injectable()
export class ProductInventoryDocumentRepository
  implements ProductInventoryRepository
{
  constructor(
    @InjectModel(ProductInventorySchemaClass.name)
    private readonly inventoryModel: PaginateModel<ProductInventorySchemaClass>,
  ) {}

  /**
   * Create or update inventory record (upsert by productId)
   */
  async upsert(
    data: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductInventory> {
    const now = new Date();
    const persistenceModel = ProductInventoryMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as ProductInventory);

    const inventoryDocument = await this.inventoryModel
      .findOneAndUpdate(
        { productId: data.productId },
        {
          ...persistenceModel,
          updatedAt: now,
        },
        { new: true, upsert: true },
      )
      .lean();

    return ProductInventoryMapper.toDomain(inventoryDocument);
  }

  /**
   * Find inventory records with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductInventoryDto | null;
    sortOptions?: SortProductInventoryDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductInventory>> {
    const filter: FilterQuery<ProductInventorySchemaClass> = {};

    // Apply filter options
    if (filterOptions) {
      // Filter by product ID
      if (filterOptions.productId) {
        filter.productId = filterOptions.productId;
      }

      // Filter by source
      if (filterOptions.source) {
        filter.source = filterOptions.source;
      }

      // Filter by in stock (available > 0)
      if (filterOptions.inStock !== undefined) {
        if (filterOptions.inStock) {
          filter.totalAvailable = { $gt: 0 };
        } else {
          filter.totalAvailable = { $lte: 0 };
        }
      }

      // Search by product name or barcode
      if (filterOptions.search) {
        filter.$or = [
          { productName: { $regex: escapeRegex(filterOptions.search), $options: 'i' } },
          { barcode: { $regex: escapeRegex(filterOptions.search), $options: 'i' } },
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
      sort.updatedAt = -1;
    }

    const result = await this.inventoryModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ProductInventoryMapper.toDomain(doc)),
    };
  }

  /**
   * Find inventory by ID
   */
  async findById(
    id: ProductInventory['id'],
  ): Promise<NullableType<ProductInventory>> {
    const inventoryDocument = await this.inventoryModel.findById(id).lean();

    return inventoryDocument
      ? ProductInventoryMapper.toDomain(inventoryDocument)
      : null;
  }

  /**
   * Find inventory by product ID
   */
  async findByProductId(
    productId: string,
  ): Promise<NullableType<ProductInventory>> {
    const inventoryDocument = await this.inventoryModel
      .findOne({ productId })
      .lean();

    return inventoryDocument
      ? ProductInventoryMapper.toDomain(inventoryDocument)
      : null;
  }

  /**
   * Find inventories by multiple product IDs
   */
  async findByProductIds(productIds: string[]): Promise<ProductInventory[]> {
    const inventoryDocuments = await this.inventoryModel
      .find({ productId: { $in: productIds } })
      .lean();

    return inventoryDocuments.map((doc) =>
      ProductInventoryMapper.toDomain(doc),
    );
  }

  /**
   * Find inventory by snapshot product ID (source product ID) and source
   */
  async findBySnapshotProductId(
    snapshotProductId: number,
    source: ProductInventory['source'],
  ): Promise<NullableType<ProductInventory>> {
    const inventoryDocument = await this.inventoryModel
      .findOne({ 'snapshot.productId': snapshotProductId, source })
      .lean();

    return inventoryDocument
      ? ProductInventoryMapper.toDomain(inventoryDocument)
      : null;
  }

  /**
   * Update existing inventory
   */
  async update(
    id: ProductInventory['id'],
    payload: Partial<ProductInventory>,
  ): Promise<NullableType<ProductInventory>> {
    const updatedProductInventory = await this.inventoryModel
      .findByIdAndUpdate(
        id,
        {
          ...ProductInventoryMapper.toDocument(payload as ProductInventory),
          updatedAt: new Date(),
        },
        { new: true },
      )
      .lean();

    return updatedProductInventory
      ? ProductInventoryMapper.toDomain(updatedProductInventory)
      : null;
  }

  /**
   * Delete inventory record
   */
  async remove(id: ProductInventory['id']): Promise<void> {
    await this.inventoryModel.findByIdAndDelete(id).exec();
  }

  /**
   * Bulk upsert inventory (create or update by productId)
   * Uses MongoDB bulkWrite for maximum performance
   */
  async bulkUpsert(
    inventories: Array<
      Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<number> {
    if (!inventories || inventories.length === 0) {
      return 0;
    }

    const now = new Date();
    const bulkOps = inventories.map((inventory) => {
      const persistenceModel = ProductInventoryMapper.toDocument({
        ...inventory,
        createdAt: now,
        updatedAt: now,
      } as unknown as ProductInventory);

      return {
        updateOne: {
          filter: {
            productId: inventory.productId,
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

    const result = await this.inventoryModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    return result.upsertedCount + result.modifiedCount;
  }
}
