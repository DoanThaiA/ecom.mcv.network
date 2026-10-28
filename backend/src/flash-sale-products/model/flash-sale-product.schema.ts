import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { ProductStatus } from '../../products/domain/product-status.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type FlashSaleProductDocument =
  HydratedDocument<FlashSaleProductSchemaClass>;

/**
 * Mongoose schema for FlashSaleProduct - minimal flash sale pricing + filter/sort fields
 * Note: Product data is stored in this collection for query efficiency.
 */
@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'flash_sale_products',
})
export class FlashSaleProductSchemaClass extends EntityDocumentHelper {
  // Flash sale reference
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  })
  flashSaleId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  flashSaleName: string;

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

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ProductStatus),
    index: true,
  })
  status: ProductStatus;

  @Prop({ type: Number, default: 0 })
  stock?: number;

  @Prop({ type: Boolean, default: false })
  hide: boolean;

  // Product images - stored for CMS display without full populate
  @Prop({ type: mongoose.Schema.Types.Mixed })
  images?: { avatar?: string | null; others?: string[] };

  // Flash sale pricing fields
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
  productDiscountPrice: number;

  @Prop({ type: Number, required: true })
  flashSalePrice: number;

  @Prop({ type: Number, required: true })
  discountAmount: number;

  @Prop({ type: Number, required: true, index: true })
  discountPercent: number;

  @Prop({ type: Number, required: true })
  promotionalQuantity: number;

  @Prop({ type: Number, required: true, default: 0 })
  soldCount: number;

  @Prop({ type: Number, required: true, index: true })
  effectivePrice: number;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({ type: Boolean, required: true, default: true })
  isEnabled: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const FlashSaleProductSchema = SchemaFactory.createForClass(
  FlashSaleProductSchemaClass,
);

// Compound indexes for efficient queries
FlashSaleProductSchema.index({
  flashSaleId: 1,
  isEnabled: 1,
  status: 1,
  stock: -1,
});
FlashSaleProductSchema.index({
  flashSaleId: 1,
  isEnabled: 1,
  effectivePrice: 1,
});
FlashSaleProductSchema.index({
  flashSaleId: 1,
  isEnabled: 1,
  'category.id': 1,
});
FlashSaleProductSchema.index({
  flashSaleId: 1,
  isEnabled: 1,
  discountPercent: -1,
});
// Unique key for upsert operations
FlashSaleProductSchema.index(
  { productId: 1, flashSaleId: 1 },
  { unique: true },
);
FlashSaleProductSchema.index({ flashSaleId: 1, isEnabled: 1, order: 1 });

FlashSaleProductSchema.plugin(mongoosePaginate);
