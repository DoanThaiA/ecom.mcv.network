import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ProductRecommendationDocument =
  HydratedDocument<ProductRecommendationSchemaClass>;

/**
 * Mongoose schema for ProductRecommendation entity
 * Stores pre-computed recommendation results
 */
@Schema({
  timestamps: false,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'product_recommendations',
})
export class ProductRecommendationSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
    enum: ['personalized', 'cross_sell', 'trending'],
  })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, sparse: true })
  userId?: mongoose.Types.ObjectId;

  @Prop({ type: String, sparse: true })
  productIdsHash?: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [] })
  recommendedProductIds: mongoose.Types.ObjectId[];

  @Prop({ type: Date, required: true, default: Date.now })
  computedAt: Date;
}

export const ProductRecommendationSchema = SchemaFactory.createForClass(
  ProductRecommendationSchemaClass,
);

// Unique compound index for personalized recommendations
ProductRecommendationSchema.index(
  { type: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } },
);

// Unique compound index for cross-sell recommendations
ProductRecommendationSchema.index(
  { type: 1, productIdsHash: 1 },
  {
    unique: true,
    partialFilterExpression: { productIdsHash: { $exists: true } },
  },
);

// TTL index on computedAt: auto-delete after 7 days (also serves staleness queries)
ProductRecommendationSchema.index(
  { computedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 3600 },
);
