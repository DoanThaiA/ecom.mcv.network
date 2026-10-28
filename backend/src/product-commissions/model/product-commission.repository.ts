import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  PaginateModel,
  PaginateResult,
  PipelineStage,
  Types,
} from 'mongoose';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { ProductCommission } from '../domain/product-commission';
import { ProductCommissionRepository } from '../domain/product-commission.repository';
import {
  FilterProductCommissionDto,
  SortProductCommissionDto,
} from '../dto/query-product-commission.dto';
import { buildAccentInsensitivePattern, escapeRegex } from '../../utils/search';
import { ProductCommissionMapper } from './product-commission.mapper';
import { ProductCommissionSchemaClass } from './product-commission.schema';

@Injectable()
export class ProductCommissionDocumentRepository
  implements ProductCommissionRepository
{
  constructor(
    @InjectModel(ProductCommissionSchemaClass.name)
    private readonly model: PaginateModel<ProductCommissionSchemaClass>,
  ) {}

  async upsertMany(
    products: Omit<ProductCommission, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<number> {
    if (products.length === 0) return 0;

    const now = new Date();
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: {
          affiliateId: product.affiliateId
            ? new Types.ObjectId(product.affiliateId)
            : null,
          productId: new Types.ObjectId(product.productId),
        },
        update: {
          $set: {
            affiliateCode: product.affiliateCode ?? null,
            name: product.name,
            code: product.code,
            images: product.images,
            costPrice: product.costPrice,
            stock: product.stock,
            category: product.category,
            productSlug: product.productSlug ?? null,
            commissionRate: product.commissionRate,
            estimatedCommission: product.estimatedCommission,
            isCustomRate: product.isCustomRate,
            updatedAt: now,
          },
          $setOnInsert: {
            affiliateId: product.affiliateId
              ? new Types.ObjectId(product.affiliateId)
              : null,
            productId: new Types.ObjectId(product.productId),
            createdAt: now,
          },
        },
        upsert: true,
      },
    }));

    const result = await this.model.bulkWrite(bulkOps, { ordered: false });
    return (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
  }

  async findManyWithPagination({
    affiliateId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    affiliateId: string | null;
    filterOptions?: FilterProductCommissionDto | null;
    sortOptions?: SortProductCommissionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductCommission>> {
    const where: FilterQuery<ProductCommissionSchemaClass> = {
      affiliateId: affiliateId ? new Types.ObjectId(affiliateId) : null,
    };

    if (filterOptions?.search) {
      const pattern = buildAccentInsensitivePattern(filterOptions.search);
      where['$or'] = [
        { name: { $regex: pattern, $options: 'i' } },
        { code: { $regex: pattern, $options: 'i' } },
      ];
    }

    if (filterOptions?.categoryNames?.length) {
      where['category.name'] = {
        $in: filterOptions.categoryNames.map((name) => new RegExp(name, 'i')),
      };
    } else if (filterOptions?.categoryName) {
      where['category.name'] = {
        $regex: escapeRegex(filterOptions.categoryName),
        $options: 'i',
      };
    }

    const sort: Record<string, 1 | -1> = sortOptions?.reduce(
      (acc, opt) => ({
        ...acc,
        [opt.orderBy === 'id' ? '_id' : opt.orderBy]:
          opt.order.toUpperCase() === 'ASC' ? 1 : -1,
      }),
      {} as Record<string, 1 | -1>,
    ) || { createdAt: -1 };

    // Add _id as tie-breaker to ensure stable pagination order
    if (!sort['_id']) {
      sort['_id'] = -1;
    }

    const result = await this.model.paginate(where, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ProductCommissionMapper.toDomain(doc)),
    };
  }

  async findOne(
    affiliateId: string | null,
    productId: string,
  ): Promise<NullableType<ProductCommission>> {
    const doc = await this.model.findOne({
      affiliateId: affiliateId ? new Types.ObjectId(affiliateId) : null,
      productId: new Types.ObjectId(productId),
    });
    return doc ? ProductCommissionMapper.toDomain(doc) : null;
  }

  async updateRate(
    affiliateId: string | null,
    productId: string,
    commissionRate: number,
    estimatedCommission: number,
    isCustomRate: boolean,
  ): Promise<NullableType<ProductCommission>> {
    const doc = await this.model.findOneAndUpdate(
      {
        affiliateId: affiliateId ? new Types.ObjectId(affiliateId) : null,
        productId: new Types.ObjectId(productId),
      },
      {
        $set: {
          commissionRate,
          estimatedCommission,
          isCustomRate,
          updatedAt: new Date(),
        },
      },
      { new: true },
    );
    return doc ? ProductCommissionMapper.toDomain(doc) : null;
  }

  async bulkUpdateRate(
    affiliateId: string | null,
    productIds: string[],
    commissionRate: number,
    isCustomRate: boolean,
  ): Promise<number> {
    if (productIds.length === 0) return 0;

    const result = await this.model.updateMany(
      {
        affiliateId: affiliateId ? new Types.ObjectId(affiliateId) : null,
        productId: { $in: productIds.map((id) => new Types.ObjectId(id)) },
      },
      [
        {
          $set: {
            commissionRate,
            isCustomRate,
            estimatedCommission: {
              $multiply: [
                {
                  $round: [
                    {
                      $divide: [
                        { $multiply: ['$costPrice', commissionRate] },
                        10000,
                      ],
                    },
                    0,
                  ],
                },
                100,
              ],
            },
            updatedAt: new Date(),
          },
        },
      ],
    );
    return result.modifiedCount;
  }

  async removeOne(
    affiliateId: string | null,
    productId: string,
  ): Promise<boolean> {
    const result = await this.model.deleteOne({
      affiliateId: affiliateId ? new Types.ObjectId(affiliateId) : null,
      productId: new Types.ObjectId(productId),
    });
    return result.deletedCount > 0;
  }

  async bulkRemove(
    affiliateId: string | null,
    productIds: string[],
  ): Promise<number> {
    if (productIds.length === 0) return 0;

    const result = await this.model.deleteMany({
      affiliateId: affiliateId ? new Types.ObjectId(affiliateId) : null,
      productId: { $in: productIds.map((id) => new Types.ObjectId(id)) },
    });
    return result.deletedCount;
  }

  async findProductIdsByAffiliate(
    affiliateId: string | null,
  ): Promise<string[]> {
    const docs = await this.model
      .find(
        {
          affiliateId: affiliateId ? new Types.ObjectId(affiliateId) : null,
        },
        { productId: 1 },
      )
      .lean();
    return docs.map((d) => d.productId.toString());
  }

  async bulkWrite(operations: any[]): Promise<void> {
    if (operations.length === 0) return;
    await this.model.bulkWrite(operations, { ordered: false });
  }

  async deleteByProductIds(productIds: string[]): Promise<number> {
    if (productIds.length === 0) return 0;
    const result = await this.model.deleteMany({
      productId: { $in: productIds.map((id) => new Types.ObjectId(id)) },
    });
    return result.deletedCount;
  }

  async updateManyByFilter(
    filter: Record<string, any>,
    update: Record<string, any> | any[],
  ): Promise<number> {
    const result = await this.model.updateMany(filter, update);
    return result.modifiedCount;
  }

  async findCategoriesByProductIds(
    productIds: string[],
  ): Promise<Map<string, { id: string; name: string }>> {
    if (productIds.length === 0) return new Map();

    const docs = await this.model
      .find(
        {
          productId: { $in: productIds.map((id) => new Types.ObjectId(id)) },
          'category.id': { $exists: true, $ne: null },
        },
        { productId: 1, category: 1 },
      )
      .lean();

    const map = new Map<string, { id: string; name: string }>();
    for (const doc of docs) {
      const pid = doc.productId.toString();
      if (!map.has(pid) && doc.category) {
        map.set(pid, { id: doc.category.id, name: doc.category.name });
      }
    }
    return map;
  }

  async findProductIdsByCategoryName(categoryName: string): Promise<string[]> {
    const docs = await this.model
      .find(
        { 'category.name': { $regex: escapeRegex(categoryName), $options: 'i' } },
        { productId: 1 },
      )
      .lean();

    const uniqueIds = new Set(docs.map((d) => d.productId.toString()));
    return [...uniqueIds];
  }

  async findForAnalytics(options: {
    affiliateId: string;
    search?: string;
    categoryName?: string;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductCommission>> {
    const affiliateObjectId = new Types.ObjectId(options.affiliateId);
    const page = options.paginationOptions.page ?? 1;
    const limit = options.paginationOptions.limit ?? 10;

    const matchStage: Record<string, unknown> = {
      affiliateId: { $in: [null, affiliateObjectId] },
    };

    if (options.search) {
      const pattern = buildAccentInsensitivePattern(options.search);
      matchStage['$or'] = [
        { name: { $regex: pattern, $options: 'i' } },
        { code: { $regex: pattern, $options: 'i' } },
      ];
    }

    if (options.categoryName) {
      matchStage['category.name'] = {
        $regex: escapeRegex(options.categoryName),
        $options: 'i',
      };
    }

    // Group by productId, prefer affiliate-specific row over global row
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      { $sort: { affiliateId: -1, commissionRate: -1, _id: -1 } },
      {
        $group: {
          _id: '$productId',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { name: 1, commissionRate: -1, _id: -1 } },
    ];

    const [countResult, docs] = await Promise.all([
      this.model.aggregate([...pipeline, { $count: 'total' }]),
      this.model.aggregate([
        ...pipeline,
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    const totalDocs = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      docs: docs.map((doc) =>
        ProductCommissionMapper.toDomain(doc as ProductCommissionSchemaClass),
      ),
      totalDocs,
      limit,
      page,
      totalPages,
      pagingCounter: (page - 1) * limit + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    } as unknown as PaginateResult<ProductCommission>;
  }
}
