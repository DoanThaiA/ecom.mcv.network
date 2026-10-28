import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ReturnRequestType } from '../domain/return-request-type.enum';
import { ReturnRequestStatus } from '../domain/return-request-status.enum';
import { ReturnReason, ExchangeReason } from '../domain/return-reason.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ReturnRequestDocument = HydratedDocument<ReturnRequestSchemaClass>;

// ==================== Embedded Schema Classes ====================

@Schema({ _id: false })
class ReturnCustomerSchema {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String })
  address?: string;
}

@Schema({ _id: false })
class ReturnOrderItemSchema {
  @Prop({ type: String, required: true })
  productId: string;

  @Prop({ type: String })
  variantId?: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  quantity: number;
}

@Schema({ _id: false })
class ReturnNhanhInfoSchema {
  @Prop({ type: Number })
  orderId?: number;

  @Prop({ type: String })
  syncStatus?: string;
}

@Schema({ _id: false })
class ReturnOrderSnapshotSchema {
  @Prop({ type: String, required: true })
  orderId: string;

  @Prop({ type: String, required: true })
  orderNumber: string;

  @Prop({ type: ReturnNhanhInfoSchema })
  nhanh?: ReturnNhanhInfoSchema;

  @Prop({ type: Number, required: true })
  orderAmount: number;

  @Prop({ type: [ReturnOrderItemSchema], default: [] })
  items: ReturnOrderItemSchema[];
}

@Schema({ _id: false })
class BankInfoSchema {
  @Prop({ type: String, required: true })
  bankName: string;

  @Prop({ type: String, required: true })
  accountNumber: string;

  @Prop({ type: String, required: true })
  accountHolder: string;
}

// ==================== Main Schema ====================

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'return_requests',
})
export class ReturnRequestSchemaClass extends EntityDocumentHelper {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: ReturnCustomerSchema, required: true })
  customer: ReturnCustomerSchema;

  @Prop({ type: ReturnOrderSnapshotSchema, required: true })
  orderSnapshot: ReturnOrderSnapshotSchema;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ReturnRequestType),
    index: true,
  })
  requestType: ReturnRequestType;

  @Prop({ type: [String], enum: Object.values(ReturnReason) })
  returnReasons?: ReturnReason[];

  @Prop({ type: [String], enum: Object.values(ExchangeReason) })
  exchangeReasons?: ExchangeReason[];

  @Prop({ type: String })
  otherReason?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: BankInfoSchema })
  bankInfo?: BankInfoSchema;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ReturnRequestStatus),
    default: ReturnRequestStatus.PENDING,
    index: true,
  })
  status: ReturnRequestStatus;

  @Prop({ type: String })
  adminNote?: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ReturnRequestSchema = SchemaFactory.createForClass(
  ReturnRequestSchemaClass,
);

// Add pagination plugin
ReturnRequestSchema.plugin(mongoosePaginate);

// Add compound index for common queries
ReturnRequestSchema.index({ status: 1, createdAt: -1 });
ReturnRequestSchema.index({ 'orderSnapshot.orderNumber': 1 });
