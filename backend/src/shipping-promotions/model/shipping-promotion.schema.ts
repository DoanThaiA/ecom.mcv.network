import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { ShippingPromotionType } from '../domain/shipping-promotion-type.enum';
import { DiscountType } from '../../combos/domain/discount-type.enum';

export type ShippingPromotionDocument =
  HydratedDocument<ShippingPromotionSchemaClass>;

/**
 * Freeshipping config schema
 */
@Schema({ _id: false })
export class FreeshippingConfigSchemaClass {
  @Prop({ type: Number, required: true })
  minimumOrderValue: number;
}

/**
 * Shipping discount tier schema
 */
@Schema({ _id: false })
export class ShippingDiscountTierSchemaClass {
  @Prop({ type: Number, required: true })
  minimumOrderValue: number;

  @Prop({
    type: String,
    enum: Object.values(DiscountType),
    required: true,
    default: DiscountType.FIXED,
  })
  discountType: DiscountType;

  @Prop({ type: Number, required: true })
  discountValue: number;
}

/**
 * Shipping discount config schema
 */
@Schema({ _id: false })
export class ShippingDiscountConfigSchemaClass {
  @Prop({ type: [ShippingDiscountTierSchemaClass], required: true })
  tiers: ShippingDiscountTierSchemaClass[];
}

/**
 * Mongoose schema for ShippingPromotion entity
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'shipping_promotions',
})
export class ShippingPromotionSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    enum: Object.values(ShippingPromotionType),
    required: true,
    index: true,
  })
  type: ShippingPromotionType;

  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: Date, required: true, index: true })
  startTime: Date;

  @Prop({ type: Date, required: true, index: true })
  endTime: Date;

  @Prop({ type: Boolean, required: true, default: true, index: true })
  isEnabled: boolean;

  @Prop({ type: FreeshippingConfigSchemaClass })
  freeshippingConfig?: FreeshippingConfigSchemaClass;

  @Prop({ type: ShippingDiscountConfigSchemaClass })
  shippingDiscountConfig?: ShippingDiscountConfigSchemaClass;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const ShippingPromotionSchema = SchemaFactory.createForClass(
  ShippingPromotionSchemaClass,
);

// Indexes for efficient queries
ShippingPromotionSchema.index({
  startTime: 1,
  endTime: 1,
  isEnabled: 1,
  deletedAt: 1,
});
ShippingPromotionSchema.index({ type: 1, isEnabled: 1, deletedAt: 1 });
ShippingPromotionSchema.index({ name: 'text' });

ShippingPromotionSchema.plugin(mongoosePaginate);
