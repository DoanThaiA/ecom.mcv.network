import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ProductViewDocument = HydratedDocument<ProductViewSchemaClass>;

/**
 * Mongoose schema for ProductView entity
 * Tracks product page views for recommendation algorithms
 */
@Schema({
  timestamps: false,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'product_views',
})
export class ProductViewSchemaClass extends EntityDocumentHelper {
  @Prop({ type: mongoose.Schema.Types.ObjectId, sparse: true, index: true })
  userId?: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  sessionId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ProductSchemaClass',
    index: true,
  })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, sparse: true })
  categoryId?: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
  viewedAt: Date;
}

export const ProductViewSchema = SchemaFactory.createForClass(
  ProductViewSchemaClass,
);

// Compound index for user history queries
ProductViewSchema.index({ userId: 1, viewedAt: -1 });

// Compound index for guest history queries
ProductViewSchema.index({ sessionId: 1, viewedAt: -1 });

// Compound index for product popularity queries
ProductViewSchema.index({ productId: 1, viewedAt: -1 });

// TTL index: auto-delete after 90 days
ProductViewSchema.index(
  { viewedAt: 1 },
  { expireAfterSeconds: 90 * 24 * 3600 },
);
