import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../../utils/document-entity-helper';
import { PaymentMethod } from '../../order/domain/order.enums';
import { DiscountType } from '../../../combos/domain/discount-type.enum';
import { CheckoutSessionStatus } from '../domain/checkout-session-status.enum';
import { CheckoutSessionDiscountDetailType } from '../domain/checkout-session';

export type CheckoutSessionDocument =
  HydratedDocument<CheckoutSessionSchemaClass>;

/**
 * CheckoutSession customer schema
 */
@Schema({ _id: false })
export class CheckoutSessionCustomerSchemaClass {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String })
  email?: string;
}

/**
 * CheckoutSession address schema
 */
@Schema({ _id: false })
export class CheckoutSessionAddressSchemaClass {
  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String })
  ward?: string;

  @Prop({ type: String })
  district?: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, default: 'Vietnam' })
  country?: string;

  @Prop({ type: Number })
  cityId?: number;

  @Prop({ type: Number })
  districtId?: number;

  @Prop({ type: Number })
  wardId?: number;
}

/**
 * CheckoutSession item discount detail schema
 */
@Schema({ _id: false })
export class CheckoutSessionItemDiscountDetailSchemaClass {
  @Prop({
    type: String,
    enum: CheckoutSessionDiscountDetailType,
    required: true,
  })
  type: CheckoutSessionDiscountDetailType;

  @Prop({ type: String, required: true })
  referenceId: string;

  @Prop({ type: String, required: true })
  referenceName: string;

  @Prop({ type: String, enum: DiscountType, required: true })
  discountType: DiscountType;

  @Prop({ type: Number, required: true })
  discountValue: number;

  @Prop({ type: Number, required: true })
  discountAmountPerUnit: number;

  @Prop({ type: Number, required: true })
  discountAmount: number;
}

/**
 * CheckoutSession item schema
 */
@Schema({ _id: false })
export class CheckoutSessionItemSchemaClass {
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
  originalPrice: number;

  @Prop({ type: Number, required: true })
  effectivePrice: number;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  discount: number;

  // Combo tracking
  @Prop({ type: String })
  comboInstanceId?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ComboSchemaClass' })
  comboId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  comboName?: string;

  // Flash sale tracking
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FlashSaleSchemaClass' })
  flashSaleId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  flashSaleName?: string;

  // Product discount tracking (CTKM auto-apply, no min order)
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionSchemaClass',
  })
  productDiscountId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  productDiscountName?: string;

  // Availability status
  @Prop({ type: Boolean, required: true, default: true })
  isAvailable: boolean;

  @Prop({ type: String })
  unavailableReason?: string;

  // Item-level discount details
  @Prop({ type: [CheckoutSessionItemDiscountDetailSchemaClass], default: null })
  discountDetails?: CheckoutSessionItemDiscountDetailSchemaClass[];

  // Gift item tracking (bundle deal promotions)
  @Prop({ type: Boolean, default: false })
  isGift?: boolean;

  @Prop({ type: String })
  giftPromotionId?: string;
}

/**
 * CheckoutSession combo instance schema
 */
@Schema({ _id: false })
export class CheckoutSessionComboInstanceSchemaClass {
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

  @Prop({ type: String, required: true, enum: Object.values(DiscountType) })
  discountType: DiscountType;

  @Prop({ type: Number, required: true })
  discountValue: number;

  @Prop({ type: Number, required: true })
  originalPrice: number;

  @Prop({ type: Number, required: true })
  discountAmount: number;
}

/**
 * CheckoutSession discount detail schema
 */
@Schema({ _id: false })
export class CheckoutSessionDiscountDetailSchemaClass {
  @Prop({
    type: String,
    enum: CheckoutSessionDiscountDetailType,
    required: true,
  })
  type: CheckoutSessionDiscountDetailType;

  @Prop({ type: String, required: true })
  referenceId: string;

  @Prop({ type: String, required: true })
  referenceName: string;

  @Prop({ type: String })
  instanceId?: string;

  @Prop({ type: String, enum: DiscountType, required: true })
  discountType: DiscountType;

  @Prop({ type: Number, required: true })
  discountValue: number;

  @Prop({ type: Number, required: true })
  discountAmount: number;
}

/**
 * CheckoutSession voucher schema
 */
@Schema({ _id: false })
export class CheckoutSessionVoucherSchemaClass {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: ['CMS', 'CDP'], required: true })
  source: 'CMS' | 'CDP';

  @Prop({ type: String })
  id?: string;

  @Prop({ type: Number, required: true })
  discountAmount: number;

  @Prop({ type: Number })
  discountType?: number;

  @Prop({ type: Number })
  discountValue?: number;

  @Prop({ type: Number })
  minimumOrderValue?: number;

  @Prop({ type: Number })
  maxDiscountValue?: number;

  @Prop({ type: Boolean })
  notApplicableWithOtherPromotions?: boolean;

  @Prop({ type: [String] })
  eligibleProductIds?: string[];
}

/**
 * CheckoutSession shipping info schema
 */
@Schema({ _id: false })
export class CheckoutSessionShippingSchemaClass {
  @Prop({ type: Number, required: true, default: 0 })
  fee: number;

  @Prop({ type: Number })
  depotId?: number;

  @Prop({ type: String })
  depotName?: string;

  @Prop({ type: Number })
  carrierId?: number;

  @Prop({ type: String })
  carrierName?: string;

  @Prop({ type: Number })
  serviceId?: number;

  @Prop({ type: Number })
  carrierType?: number;

  @Prop({ type: Number })
  accountId?: number;

  @Prop({ type: String })
  serviceCode?: string;

  @Prop({ type: String })
  shopId?: string;
}

/**
 * CheckoutSession shipping promotion schema (applied shipping discount)
 */
@Schema({ _id: false })
export class CheckoutSessionShippingPromotionSchemaClass {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Number, required: true })
  discountAmount: number;
}

/**
 * CheckoutSession schema
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'checkout_sessions',
})
export class CheckoutSessionSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, unique: true })
  sessionNumber: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSchemaClass' })
  userId?: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  sessionId: string;

  // Customer and shipping
  @Prop({ type: CheckoutSessionCustomerSchemaClass })
  customer?: CheckoutSessionCustomerSchemaClass;

  @Prop({ type: CheckoutSessionAddressSchemaClass })
  shippingAddress?: CheckoutSessionAddressSchemaClass;

  // Items
  @Prop({ type: [CheckoutSessionItemSchemaClass], required: true })
  items: CheckoutSessionItemSchemaClass[];

  @Prop({ type: [CheckoutSessionComboInstanceSchemaClass], default: [] })
  comboInstances: CheckoutSessionComboInstanceSchemaClass[];

  // Pricing
  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number, required: true, default: 0 })
  shippingFee: number;

  @Prop({ type: Number, default: 0 })
  discount: number;

  @Prop({ type: [CheckoutSessionDiscountDetailSchemaClass], default: [] })
  discountDetails: CheckoutSessionDiscountDetailSchemaClass[];

  @Prop({ type: [CheckoutSessionVoucherSchemaClass], default: [] })
  appliedVouchers: CheckoutSessionVoucherSchemaClass[];

  @Prop({ type: Number, default: 0 })
  totalDiscount: number;

  @Prop({ type: Number, default: 0 })
  shippingDiscount: number;

  @Prop({ type: CheckoutSessionShippingPromotionSchemaClass })
  shippingPromotion?: CheckoutSessionShippingPromotionSchemaClass;

  @Prop({ type: CheckoutSessionShippingSchemaClass })
  shipping?: CheckoutSessionShippingSchemaClass;

  @Prop({ type: Number, required: true })
  total: number;

  // Payment
  @Prop({ type: String, enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @Prop({ type: String })
  note?: string;

  // Affiliate tracking
  @Prop({ type: String })
  affiliateCode?: string;

  // Status
  @Prop({
    type: String,
    enum: CheckoutSessionStatus,
    required: true,
    default: CheckoutSessionStatus.ACTIVE,
  })
  status: CheckoutSessionStatus;

  // Timestamps
  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  // Order reference (when completed)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'OrderSchemaClass' })
  orderId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  orderNumber?: string;
}

export const CheckoutSessionSchema = SchemaFactory.createForClass(
  CheckoutSessionSchemaClass,
);

// Indexes
CheckoutSessionSchema.index({ sessionId: 1, status: 1 });
CheckoutSessionSchema.index({ userId: 1, status: 1 }, { sparse: true });
CheckoutSessionSchema.index({ orderId: 1 }, { sparse: true });
CheckoutSessionSchema.index({ createdAt: -1 });
// TTL index for automatic cleanup of expired sessions
CheckoutSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
