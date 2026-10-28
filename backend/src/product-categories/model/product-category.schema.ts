import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ProductCategoryStatus } from '../domain/product-category-status.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { NhanhProductCategorySnapshot } from '../../nhanh/types/nhanh-snapshots';

export type ProductCategoryDocument =
  HydratedDocument<ProductCategorySchemaClass>;

/**
 * Mongoose schema for ProductCategory entity
 *
 * Data architecture:
 * - `snapshot`: Raw data from source (Nhanh/Shopify) stored without processing
 * - Other fields: Domain data derived from snapshot, controlled by our system
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'product-categories',
})
export class ProductCategorySchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({
    type: String,
    required: true,
    enum: ['nhanh', 'shopify'],
    index: true,
  })
  source: 'nhanh' | 'shopify';

  /**
   * Raw snapshot from the source system
   * Contains unprocessed data exactly as received from the API
   */
  @Prop({
    type: Object,
    _id: false,
  })
  snapshot?: NhanhProductCategorySnapshot | Record<string, any>;

  @Prop({ type: String, required: true, index: true })
  code: string;

  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: Object })
  nameLocalization?: { vi?: string; en?: string };

  @Prop({ type: String, index: true })
  slug?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategorySchemaClass',
    index: true,
  })
  parentId?: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  order?: number;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: String })
  content?: string;

  @Prop({
    type: Number,
    required: true,
    enum: ProductCategoryStatus,
    default: ProductCategoryStatus.ACTIVE,
    index: true,
  })
  status: ProductCategoryStatus;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const ProductCategorySchema = SchemaFactory.createForClass(
  ProductCategorySchemaClass,
);

// Compound indexes
// Index by snapshot.id for looking up by source ID
ProductCategorySchema.index({
  businessId: 1,
  source: 1,
  'snapshot.id': 1,
});
ProductCategorySchema.index({ businessId: 1, code: 1 });
ProductCategorySchema.index({ businessId: 1, status: 1, order: 1 });
ProductCategorySchema.index({ businessId: 1, parentId: 1, order: 1 });

// Index for SEO-friendly slug lookup (unique per business)
ProductCategorySchema.index(
  { businessId: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: { slug: { $exists: true } },
  },
);

ProductCategorySchema.plugin(mongoosePaginate);
