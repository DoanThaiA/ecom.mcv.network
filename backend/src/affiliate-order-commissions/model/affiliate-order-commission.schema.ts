import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type AffiliateOrderCommissionDocument =
  HydratedDocument<AffiliateOrderCommissionSchemaClass>;

@Schema({ _id: false })
export class AffiliateOrderCommissionCustomerSchemaClass {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  phone: string;
}

@Schema({ _id: false })
export class AffiliateOrderCommissionItemSchemaClass {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ProductSchemaClass',
  })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  productName: string;

  @Prop({ type: String, required: true })
  productCode: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number, required: true })
  commissionRate: number;

  @Prop({ type: Number, required: true })
  commissionAmount: number;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'affiliate_order_commissions',
})
export class AffiliateOrderCommissionSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'OrderSchemaClass',
  })
  orderId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  orderNumber: string;

  @Prop({ type: String, required: true })
  orderStatus: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AffiliateSchemaClass',
  })
  affiliateId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  affiliateCode: string;

  @Prop({ type: AffiliateOrderCommissionCustomerSchemaClass, required: true })
  customer: AffiliateOrderCommissionCustomerSchemaClass;

  @Prop({
    type: [AffiliateOrderCommissionItemSchemaClass],
    required: true,
  })
  items: AffiliateOrderCommissionItemSchemaClass[];

  @Prop({ type: Number, required: true })
  orderTotal: number;

  @Prop({ type: Number, required: true })
  totalDiscount: number;

  @Prop({ type: Number, required: true })
  paymentAmount: number;

  @Prop({ type: Number, required: true })
  totalCommission: number;

  @Prop({ type: Date, default: null })
  auditedAt?: Date | null;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const AffiliateOrderCommissionSchema = SchemaFactory.createForClass(
  AffiliateOrderCommissionSchemaClass,
);

// Indexes
AffiliateOrderCommissionSchema.index({ affiliateId: 1, createdAt: -1 });
AffiliateOrderCommissionSchema.index({ orderId: 1 }, { unique: true });
AffiliateOrderCommissionSchema.index({ auditedAt: 1, orderStatus: 1 });

AffiliateOrderCommissionSchema.plugin(mongoosePaginate);
