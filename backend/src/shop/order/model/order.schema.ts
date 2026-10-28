import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../../utils/document-entity-helper';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../domain/order.enums';
import { CdpSyncStatus } from '../domain/cdp-sync-status.enum';
import { NhanhSyncStatus } from '../domain/nhanh-sync-status.enum';
import { DiscountDetailType, PaymentEventStatus } from '../domain/order';
import { DiscountType } from '../../../combos/domain/discount-type.enum';
import { CustomerTransaction } from '../../../cdp/types/customerTransaction.types';

export type OrderDocument = HydratedDocument<OrderSchemaClass>;

/**
 * Nhanh.vn sync info schema (nested object without _id)
 */
@Schema({ _id: false })
export class NhanhSyncInfoSchemaClass {
  @Prop({ type: Number })
  orderId?: number;

  @Prop({ type: String })
  trackingUrl?: string;

  @Prop({
    type: String,
    enum: NhanhSyncStatus,
    default: NhanhSyncStatus.PENDING,
  })
  syncStatus?: string;

  @Prop({ type: Date })
  syncedAt?: Date;

  @Prop({ type: String })
  syncError?: string;
}

/**
 * Payment event schema for audit trail - universal format
 */
@Schema({ _id: false })
export class PaymentEventSchemaClass {
  @Prop({ type: String, enum: PaymentEventStatus, required: true })
  status: PaymentEventStatus;

  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: Number })
  amount?: number;

  @Prop({ type: String })
  ref?: string;

  @Prop({ type: String })
  code?: string;

  @Prop({ type: String })
  message?: string;
}

/**
 * InfoCMS payment info schema (nested object without _id)
 */
@Schema({ _id: false })
export class InfocmsInfoSchemaClass {
  @Prop({ type: String })
  transactionUuid?: string;

  @Prop({ type: String })
  ecollectionCd?: string;

  @Prop({ type: String })
  transId?: string;

  @Prop({ type: String })
  bankTransId?: string;
}

/**
 * Shipping carrier snapshot schema (nested object without _id)
 */
@Schema({ _id: false })
export class OrderShippingCarrierSchemaClass {
  @Prop({ type: Number })
  carrierId?: number;

  @Prop({ type: String })
  carrierName?: string;

  @Prop({ type: Number })
  carrierType?: number;

  @Prop({ type: Number })
  serviceId?: number;

  @Prop({ type: String })
  serviceCode?: string;

  @Prop({ type: Number })
  accountId?: number;

  @Prop({ type: String })
  shopId?: string;
}

/**
 * CDP sync info schema (nested object without _id)
 */
@Schema({ _id: false })
export class CdpSyncInfoSchemaClass {
  @Prop({ type: String })
  customerId?: string;

  @Prop({
    type: String,
    enum: CdpSyncStatus,
    default: CdpSyncStatus.PENDING,
  })
  syncStatus?: string;

  @Prop({ type: Date })
  syncedAt?: Date;

  @Prop({ type: String })
  syncError?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  customerTransaction?: CustomerTransaction;
}

/**
 * Order customer schema
 */
@Schema({ _id: false })
export class OrderCustomerSchemaClass {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String })
  email?: string;
}

/**
 * Order address schema
 */
@Schema({ _id: false })
export class OrderAddressSchemaClass {
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
 * Order item discount detail schema
 */
@Schema({ _id: false })
export class OrderItemDiscountDetailSchemaClass {
  @Prop({ type: String, enum: DiscountDetailType, required: true })
  type: DiscountDetailType;

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
 * Order item schema
 */
@Schema({ _id: false })
export class OrderItemSchemaClass {
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

  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  discount: number;

  @Prop({ type: String })
  comboInstanceId?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ComboSchemaClass' })
  comboId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  comboName?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FlashSaleSchemaClass' })
  flashSaleId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  flashSaleName?: string;

  @Prop({ type: Number })
  originalPrice?: number;

  @Prop({ type: [OrderItemDiscountDetailSchemaClass], default: null })
  discountDetails?: OrderItemDiscountDetailSchemaClass[];

  @Prop({ type: Boolean, default: false })
  isGift?: boolean;

  @Prop({ type: String })
  giftPromotionId?: string;
}

/**
 * Order discount detail schema
 */
@Schema({ _id: false })
export class OrderDiscountDetailSchemaClass {
  @Prop({ type: String, enum: DiscountDetailType, required: true })
  type: DiscountDetailType;

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

  @Prop({ type: String })
  source?: string;
}

/**
 * Order schema
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'orders',
})
export class OrderSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true })
  orderNumber: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSchemaClass' })
  userId?: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  sessionId: string;

  @Prop({ type: OrderCustomerSchemaClass, required: true })
  customer: OrderCustomerSchemaClass;

  @Prop({ type: OrderAddressSchemaClass, required: true })
  shippingAddress: OrderAddressSchemaClass;

  @Prop({ type: [OrderItemSchemaClass], required: true })
  items: OrderItemSchemaClass[];

  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number, required: true, default: 0 })
  shippingFee: number;

  @Prop({ type: Number })
  depotId?: number;

  @Prop({ type: OrderShippingCarrierSchemaClass })
  shippingCarrier?: OrderShippingCarrierSchemaClass;

  @Prop({ type: Number, default: 0 })
  discount?: number;

  @Prop({ type: [OrderDiscountDetailSchemaClass], default: [] })
  discountDetails?: OrderDiscountDetailSchemaClass[];

  @Prop({ type: Number, default: 0 })
  totalDiscount: number;

  @Prop({ type: Number, default: 0 })
  shippingDiscount: number;

  @Prop({ type: String, index: true })
  shippingPromotionId?: string;

  @Prop({ type: String })
  shippingPromotionName?: string;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    required: true,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({
    type: String,
    enum: PaymentStatus,
    required: true,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    type: String,
    enum: PaymentMethod,
    required: true,
  })
  paymentMethod: PaymentMethod;

  @Prop({ type: String })
  note?: string;

  // Affiliate tracking
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateSchemaClass',
  })
  affiliateId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  affiliateCode?: string;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: String })
  cancellationReason?: string;

  // CDP sync info (nested object)
  @Prop({ type: CdpSyncInfoSchemaClass })
  cdp?: CdpSyncInfoSchemaClass;

  // Nhanh.vn sync info (nested object)
  @Prop({ type: NhanhSyncInfoSchemaClass })
  nhanh?: NhanhSyncInfoSchemaClass;

  // InfoCMS payment info (nested object)
  @Prop({ type: InfocmsInfoSchemaClass })
  infocms?: InfocmsInfoSchemaClass;

  // Payment history for audit trail
  @Prop({ type: [PaymentEventSchemaClass], default: [] })
  paymentHistory?: PaymentEventSchemaClass[];
}

export const OrderSchema = SchemaFactory.createForClass(OrderSchemaClass);

// Indexes
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ sessionId: 1, createdAt: -1 });
OrderSchema.index({ 'customer.phone': 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'cdp.syncStatus': 1, createdAt: -1 });
OrderSchema.index({ 'nhanh.syncStatus': 1, createdAt: -1 });
OrderSchema.index({ shippingPromotionId: 1, createdAt: -1 }, { sparse: true });
OrderSchema.index({ affiliateId: 1, createdAt: -1 }, { sparse: true });
OrderSchema.index(
  { 'items.discountDetails.referenceId': 1, createdAt: -1 },
  { sparse: true },
);
OrderSchema.index(
  { 'discountDetails.referenceId': 1, createdAt: -1 },
  { sparse: true },
);
OrderSchema.index(
  { 'items.giftPromotionId': 1, createdAt: -1 },
  { sparse: true },
);
OrderSchema.index(
  { 'items.productId': 1, status: 1, createdAt: -1 },
  { background: true },
);

OrderSchema.plugin(mongoosePaginate);
