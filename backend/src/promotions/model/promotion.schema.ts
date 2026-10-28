import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { PromotionType } from '../domain/promotion-type.enum';
import { BundleDealSubType } from '../domain/bundle-deal-sub-type.enum';
import { OrderDiscountSubType } from '../domain/order-discount-sub-type.enum';

export type PromotionDocument = HydratedDocument<PromotionSchemaClass>;

// ==================== Bundle Deal Config Schema ====================

@Schema({ _id: false })
class GiftProductSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductSchemaClass',
    required: true,
  })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  image: string;
}

@Schema({ _id: false })
class RequiredProductSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductSchemaClass',
    required: true,
  })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  image: string;
}

@Schema({ _id: false })
class BundleDealTierSchema {
  @Prop({ type: Number, required: true, min: 0 })
  minOrderValue: number;

  @Prop({ type: [GiftProductSchema], required: true })
  giftProducts: GiftProductSchema[];
}

@Schema({ _id: false })
class BundleDealConfigSchema {
  @Prop({
    type: Number,
    required: true,
    enum: Object.values(BundleDealSubType).filter((v) => typeof v === 'number'),
  })
  subType: BundleDealSubType;

  @Prop({ type: [BundleDealTierSchema], default: [] })
  tiers: BundleDealTierSchema[];

  @Prop({ type: Number, min: 1 })
  requiredQuantity?: number;

  @Prop({ type: [RequiredProductSchema], default: [] })
  requiredProducts?: RequiredProductSchema[];

  @Prop({ type: Number, min: 1 })
  giftQuantity?: number;

  @Prop({ type: [GiftProductSchema], default: [] })
  giftProducts?: GiftProductSchema[];

  @Prop({ type: Number, min: 0 })
  minimumOrderValue?: number;

  @Prop({ type: Number, min: 1 })
  maxGiftQuantity?: number;

  @Prop({ type: Number, default: 0 })
  currentGiftCount?: number;

  @Prop({ type: Boolean, default: false })
  notApplicableWithOtherPromotions: boolean;
}

// ==================== Order Discount Config Schema ====================

@Schema({ _id: false })
class OrderDiscountConfigSchema {
  @Prop({
    type: Number,
    required: true,
    enum: Object.values(OrderDiscountSubType).filter(
      (v) => typeof v === 'number',
    ),
  })
  subType: OrderDiscountSubType;

  @Prop({ type: String })
  promoCode?: string;

  @Prop({ type: String, required: true, enum: ['fixed', 'percentage'] })
  discountType: string;

  @Prop({ type: Number, required: true, min: 0 })
  discountValue: number;

  @Prop({ type: Number, min: 0 })
  maxDiscountValue?: number;

  @Prop({ type: Number, required: true, min: 0 })
  minimumOrderValue: number;

  @Prop({ type: Boolean, default: false })
  notApplicableWithOtherPromotions: boolean;

  @Prop({ type: Boolean, default: false })
  singleUsePerCustomer: boolean;

  @Prop({ type: Number, min: 0 })
  totalUsageLimit?: number;

  @Prop({ type: Number, default: 0 })
  currentUsageCount: number;
}

// ==================== Product Discount Config Schema ====================
// Note: Products are stored in a separate 'promotion_products' collection

@Schema({ _id: false })
class ProductDiscountConfigSchema {
  /** @deprecated Promotion-level discount. Per-product discount is used instead. */
  @Prop({ type: String, enum: ['fixed', 'percentage'] })
  discountType?: string;

  /** @deprecated Promotion-level discount. Per-product discount is used instead. */
  @Prop({ type: Number, min: 0 })
  discountValue?: number;

  /** @deprecated No longer used. */
  @Prop({ type: Number, min: 0 })
  maxDiscountValue?: number;
}

// ==================== Main Promotion Schema ====================

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'promotions',
})
export class PromotionSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Number,
    required: true,
    enum: Object.values(PromotionType).filter((v) => typeof v === 'number'),
    index: true,
  })
  type: PromotionType;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Date, required: true, index: true })
  startTime: Date;

  @Prop({ type: Date, required: true, index: true })
  endTime: Date;

  @Prop({ type: Boolean, required: true, default: true, index: true })
  isEnabled: boolean;

  // Type-specific config (polymorphic)
  @Prop({ type: BundleDealConfigSchema })
  bundleDealConfig?: BundleDealConfigSchema;

  @Prop({ type: OrderDiscountConfigSchema })
  orderDiscountConfig?: OrderDiscountConfigSchema;

  @Prop({ type: ProductDiscountConfigSchema })
  productDiscountConfig?: ProductDiscountConfigSchema;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const PromotionSchema =
  SchemaFactory.createForClass(PromotionSchemaClass);

// ==================== Indexes ====================

// Composite index for active promotions query
PromotionSchema.index({
  type: 1,
  startTime: 1,
  endTime: 1,
  isEnabled: 1,
  deletedAt: 1,
});

// Supports the product-targeted BUY_X_GET_Y branch of PDP highlight queries.
PromotionSchema.index({
  type: 1,
  'bundleDealConfig.subType': 1,
  'bundleDealConfig.requiredProducts.productId': 1,
  isEnabled: 1,
  startTime: 1,
  endTime: 1,
  deletedAt: 1,
});

// Text search on name
PromotionSchema.index({ name: 'text' });

// Unique name constraint (only for non-deleted)
PromotionSchema.index({ name: 1 });

// Unique promo code constraint (sparse for null values)
PromotionSchema.index(
  { 'orderDiscountConfig.promoCode': 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      'orderDiscountConfig.promoCode': { $exists: true, $ne: null },
    },
  },
);

// Pagination plugin
PromotionSchema.plugin(mongoosePaginate);
