import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  ProductBannerRepository,
  FilterProductBannerDto,
  SortProductBannerDto,
} from '../domain/product-banner.repository';
import { ProductBanner, ProductBannerProduct } from '../domain/product-banner';
import { ProductBannerSchemaClass } from './product-banner.schema';
import { ProductBannerMapper } from './product-banner.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of ProductBannerRepository
 */
@Injectable()
export class ProductBannerDocumentRepository
  implements ProductBannerRepository
{
  constructor(
    @InjectModel(ProductBannerSchemaClass.name)
    private readonly productBannerModel: PaginateModel<ProductBannerSchemaClass>,
  ) {}

  /**
   * Create a new product banner
   */
  async create(
    data: Omit<ProductBanner, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductBanner> {
    const now = new Date();
    const persistenceModel = ProductBannerMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as ProductBanner);

    const createdBanner = new this.productBannerModel(persistenceModel);
    const bannerDocument = await createdBanner.save();
    const leanBanner = bannerDocument.toObject();
    return ProductBannerMapper.toDomain(leanBanner);
  }

  /**
   * Find product banners with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductBannerDto | null;
    sortOptions?: SortProductBannerDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductBanner>> {
    const filter: FilterQuery<ProductBannerSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      // Search by name (case-insensitive)
      if (filterOptions.search) {
        filter.name = { $regex: escapeRegex(filterOptions.search), $options: 'i' };
      }
      // Filter by active status
      if (filterOptions.isActive !== undefined) {
        filter.isActive = filterOptions.isActive;
      }
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      // Default sort by creation date descending
      sort.createdAt = -1;
    }

    const result = await this.productBannerModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ProductBannerMapper.toDomain(doc)),
    };
  }

  /**
   * Find product banner by ID
   */
  async findById(
    id: ProductBanner['id'],
  ): Promise<NullableType<ProductBanner>> {
    const bannerDocument = await this.productBannerModel
      .findOne({ _id: id, deletedAt: null })
      .lean();

    return bannerDocument ? ProductBannerMapper.toDomain(bannerDocument) : null;
  }

  /**
   * Find product banner by product ID
   */
  async findByProductId(
    productId: string,
  ): Promise<NullableType<ProductBanner>> {
    const bannerDocument = await this.productBannerModel
      .findOne({
        'products.id': new mongoose.Types.ObjectId(productId),
        deletedAt: null,
      })
      .lean();

    return bannerDocument ? ProductBannerMapper.toDomain(bannerDocument) : null;
  }

  /**
   * Update existing product banner
   */
  async update(
    id: ProductBanner['id'],
    payload: DeepPartial<ProductBanner>,
  ): Promise<NullableType<ProductBanner>> {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Copy allowed fields
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.image !== undefined) updateData.image = payload.image;
    if (payload.position !== undefined) updateData.position = payload.position;
    if ('ratio' in payload) updateData.ratio = payload.ratio;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
    if (payload.products !== undefined) {
      updateData.products = (payload.products as ProductBannerProduct[]).map(
        (p) => ({
          id: new mongoose.Types.ObjectId(p.id),
          name: p.name,
          code: p.code,
          images: p.images,
        }),
      );
    }

    const updatedBanner = await this.productBannerModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return updatedBanner ? ProductBannerMapper.toDomain(updatedBanner) : null;
  }

  /**
   * Soft delete product banner
   */
  async remove(id: ProductBanner['id']): Promise<void> {
    await this.productBannerModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }

  /**
   * Add products to a banner
   */
  async addProducts(
    id: ProductBanner['id'],
    products: ProductBannerProduct[],
  ): Promise<NullableType<ProductBanner>> {
    const productDocs = products.map((p) => ({
      id: new mongoose.Types.ObjectId(p.id),
      name: p.name,
      code: p.code,
      images: p.images,
    }));

    const updatedBanner = await this.productBannerModel
      .findByIdAndUpdate(
        id,
        {
          $addToSet: { products: { $each: productDocs } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedBanner ? ProductBannerMapper.toDomain(updatedBanner) : null;
  }

  /**
   * Remove products from a banner
   */
  async removeProducts(
    id: ProductBanner['id'],
    productIds: string[],
  ): Promise<NullableType<ProductBanner>> {
    const objectIds = productIds.map((pid) => new mongoose.Types.ObjectId(pid));

    const updatedBanner = await this.productBannerModel
      .findByIdAndUpdate(
        id,
        {
          $pull: { products: { id: { $in: objectIds } } },
          $set: { updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updatedBanner ? ProductBannerMapper.toDomain(updatedBanner) : null;
  }
}
