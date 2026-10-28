import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type PromotionProductDocument =
  HydratedDocument<PromotionProductSchemaClass>;

/**
 * Mongoose schema for PromotionProduct - discount pricing + filter/sort fields
 * Product data is stored in this collection for query efficiency.
 */
@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'promotion_products',
})
export class PromotionProductSchemaClass extends EntityDocumentHelper {
  // Promotion reference
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  })
  promotionId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  promotionName: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductSchemaClass',
    required: true,
  })
  productId: mongoose.Types.ObjectId;

  // Fields needed for filtering and sorting
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  category?: { id: string; name: string } | null;

  @Prop({ type: Number, default: 0 })
  stock?: number;

  // Product images - stored for CMS display without full populate
  @Prop({ type: mongoose.Schema.Types.Mixed })
  images?: { avatar?: string | null; others?: string[] };

  // Discount pricing fields
  @Prop({
    type: String,
    required: true,
    enum: Object.values(DiscountType),
  })
  discountType: DiscountType;

  @Prop({ type: Number, required: true })
  discountValue: number;

  @Prop({ type: Number, required: true })
  originalPrice: number;

  @Prop({ type: Number, required: true })
  discountedPrice: number;

  @Prop({ type: Number, required: true })
  discountAmount: number;

  @Prop({ type: Number, required: true, index: true })
  discountPercent: number;

  @Prop({ type: Number, required: true, index: true })
  effectivePrice: number;

  @Prop({ type: Number, required: true, default: 0 })
  soldCount: number;

  @Prop({ type: Boolean, required: true, default: true })
  isEnabled: boolean;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const PromotionProductSchema = SchemaFactory.createForClass(
  PromotionProductSchemaClass,
);

// Compound indexes for efficient queries
PromotionProductSchema.index({
  promotionId: 1,
  isEnabled: 1,
  stock: -1,
});
PromotionProductSchema.index({
  promotionId: 1,
  isEnabled: 1,
  effectivePrice: 1,
});
PromotionProductSchema.index({
  promotionId: 1,
  isEnabled: 1,
  'category.id': 1,
});
PromotionProductSchema.index({
  promotionId: 1,
  isEnabled: 1,
  discountPercent: -1,
});
// Unique key for upsert operations
PromotionProductSchema.index(
  { productId: 1, promotionId: 1 },
  { unique: true },
);
// For conflict checking (find active product discount by productId)
PromotionProductSchema.index({ productId: 1, isEnabled: 1 });

PromotionProductSchema.plugin(mongoosePaginate);
