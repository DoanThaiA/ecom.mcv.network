import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { AffiliateType } from '../domain/affiliate-type.enum';
import { AffiliateStatus } from '../domain/affiliate-status.enum';

export type AffiliateSchemaDocument = HydratedDocument<AffiliateSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'affiliates',
})
export class AffiliateSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  affiliateCode: string;

  @Prop({ type: Number, enum: AffiliateType, required: true })
  type: AffiliateType;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String })
  bankAccountHolder?: string | null;

  @Prop({ type: String })
  bankName?: string | null;

  @Prop({ type: String })
  bankAccountNumber?: string | null;

  @Prop({ type: String })
  citizenId?: string | null;

  @Prop({ type: String })
  notes?: string | null;

  @Prop({
    type: Number,
    enum: AffiliateStatus,
    default: AffiliateStatus.ACTIVE,
  })
  status: AffiliateStatus;

  @Prop({ type: Number, default: null })
  defaultCommissionRate?: number | null;

  @Prop({ type: Boolean, default: true })
  autoUpdateProducts: boolean;

  @Prop({ type: Number, default: 0 })
  totalEarned: number;

  @Prop({ type: Number, default: 0 })
  totalWithdrawn: number;

  @Prop({ type: Number, default: 0 })
  pendingAmount: number;

  @Prop({ type: Number, default: 0 })
  availableBalance: number;

  @Prop({ type: Date, default: null })
  balanceUpdatedAt?: Date | null;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const AffiliateSchema =
  SchemaFactory.createForClass(AffiliateSchemaClass);

AffiliateSchema.index({ affiliateCode: 1 }, { unique: true });
AffiliateSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
AffiliateSchema.index({ type: 1 });
AffiliateSchema.index({ status: 1 });
AffiliateSchema.index({ name: 1 });

AffiliateSchema.plugin(mongoosePaginate);
