import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ProductRecommendationRepository } from '../domain/product-recommendation.repository';
import { ProductRecommendation } from '../domain/product-recommendation';
import { ProductRecommendationSchemaClass } from './product-recommendation.schema';
import { ProductRecommendationMapper } from './product-recommendation.mapper';
import { NullableType } from '../../utils/types/nullable.type';

/**
 * Mongoose implementation of ProductRecommendationRepository
 */
@Injectable()
export class ProductRecommendationDocumentRepository
  implements ProductRecommendationRepository
{
  constructor(
    @InjectModel(ProductRecommendationSchemaClass.name)
    private readonly model: Model<ProductRecommendationSchemaClass>,
  ) {}

  /**
   * Upsert personalized recommendations for a user
   */
  async upsertPersonalized(
    userId: string,
    productIds: string[],
  ): Promise<void> {
    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));

    await this.model.updateOne(
      { type: 'personalized', userId: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          recommendedProductIds: objectIds,
          computedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  /**
   * Upsert cross-sell recommendations for a product set
   */
  async upsertCrossSell(
    productIdsHash: string,
    productIds: string[],
  ): Promise<void> {
    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));

    await this.model.updateOne(
      { type: 'cross_sell', productIdsHash },
      {
        $set: {
          recommendedProductIds: objectIds,
          computedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  /**
   * Upsert global trending recommendations
   */
  async upsertTrending(productIds: string[]): Promise<void> {
    const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));

    await this.model.updateOne(
      { type: 'trending' },
      {
        $set: {
          recommendedProductIds: objectIds,
          computedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  /**
   * Find personalized recommendations for a user
   */
  async findPersonalized(
    userId: string,
  ): Promise<NullableType<ProductRecommendation>> {
    const doc = await this.model
      .findOne({
        type: 'personalized',
        userId: new mongoose.Types.ObjectId(userId),
      })
      .lean();

    return doc ? ProductRecommendationMapper.toDomain(doc) : null;
  }

  /**
   * Find cross-sell recommendations for a product set
   */
  async findCrossSell(
    productIdsHash: string,
  ): Promise<NullableType<ProductRecommendation>> {
    const doc = await this.model
      .findOne({ type: 'cross_sell', productIdsHash })
      .lean();

    return doc ? ProductRecommendationMapper.toDomain(doc) : null;
  }

  /**
   * Find global trending recommendations
   */
  async findTrending(): Promise<NullableType<ProductRecommendation>> {
    const doc = await this.model.findOne({ type: 'trending' }).lean();

    return doc ? ProductRecommendationMapper.toDomain(doc) : null;
  }
}
