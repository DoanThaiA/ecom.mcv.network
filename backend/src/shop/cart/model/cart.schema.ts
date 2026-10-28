import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../../utils/document-entity-helper';
import { DiscountType } from '../../../combos/domain/discount-type.enum';

export type CartDocument = HydratedDocument<CartSchemaClass>;

/**
 * Cart item schema
 */
@Schema({ _id: false })
export class CartItemSchemaClass {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ProductSchemaClass',
  })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductSchemaClass' })
  variantId?: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: String })
  comboInstanceId?: string;

  @Prop({
    type: [{ id: mongoose.Schema.Types.Mixed, name: String, value: String }],
    default: undefined,
  })
  attributes?: Array<{ id?: number | string; name: string; value: string }>;

  // Gift item fields for "Mua để nhận quà" promotion
  @Prop({ type: Boolean, default: false })
  isGift: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PromotionSchemaClass' })
  promotionId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  promotionTierId?: string;

  @Prop({ type: Number })
  originalPrice?: number;
}

/**
 * Cart combo instance schema - tracks combos added to cart
 */
@Schema({ _id: false })
export class CartComboInstanceSchemaClass {
  @Prop({ type: String, required: true })
  comboInstanceId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ComboSchemaClass',
  })
  comboId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  comboName: string;

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
  discountAmount: number;
}

/**
 * Cart schema
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'carts',
})
export class CartSchemaClass extends EntityDocumentHelper {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSchemaClass' })
  userId?: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  sessionId: string;

  @Prop({ type: [CartItemSchemaClass], default: [] })
  items: CartItemSchemaClass[];

  @Prop({ type: [CartComboInstanceSchemaClass], default: [] })
  comboInstances: CartComboInstanceSchemaClass[];

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(CartSchemaClass);

// Indexes
CartSchema.index({ sessionId: 1 }, { unique: true });
CartSchema.index({ userId: 1 }, { sparse: true });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup
