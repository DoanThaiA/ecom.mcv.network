import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ProductViewRepository } from '../domain/product-view.repository';
import { ProductView } from '../domain/product-view';
import { ProductViewSchemaClass } from './product-view.schema';
import { ProductViewMapper } from './product-view.mapper';

/**
 * Mongoose implementation of ProductViewRepository
 */
@Injectable()
export class ProductViewDocumentRepository implements ProductViewRepository {
  constructor(
    @InjectModel(ProductViewSchemaClass.name)
    private readonly productViewModel: Model<ProductViewSchemaClass>,
  ) {}

  /**
   * Create a new product view record
   */
  async create(view: Omit<ProductView, 'id'>): Promise<ProductView> {
    const doc = ProductViewMapper.toDocument(view);
    const created = new this.productViewModel(doc);
    const saved = await created.save();
    return ProductViewMapper.toDomain(saved.toObject());
  }

  /**
   * Find recent product views by user ID
   */
  async findByUserId(userId: string, limit: number): Promise<ProductView[]> {
    const docs = await this.productViewModel
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ viewedAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((doc) => ProductViewMapper.toDomain(doc));
  }

  /**
   * Find recent product views by session ID
   */
  async findBySessionId(
    sessionId: string,
    limit: number,
  ): Promise<ProductView[]> {
    const docs = await this.productViewModel
      .find({ sessionId })
      .sort({ viewedAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((doc) => ProductViewMapper.toDomain(doc));
  }

  /**
   * Get top viewed product IDs globally within a time range
   */
  async getTopViewedProductIds(days: number, limit: number): Promise<string[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await this.productViewModel.aggregate([
      { $match: { viewedAt: { $gte: since } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return result.map((r) => r._id.toString());
  }
}
