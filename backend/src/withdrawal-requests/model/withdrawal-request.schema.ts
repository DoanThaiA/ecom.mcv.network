import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { WithdrawalRequestStatus } from '../domain/withdrawal-request';

export type WithdrawalRequestDocument =
  HydratedDocument<WithdrawalRequestSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'withdrawal_requests',
})
export class WithdrawalRequestSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AffiliateSchemaClass',
  })
  affiliateId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  agentName: string;

  @Prop({ type: String, required: true })
  recipientName: string;

  @Prop({ type: String, required: true })
  bankAccountNumber: string;

  @Prop({ type: String, required: true })
  bankName: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, default: null })
  note: string | null;

  @Prop({
    type: Number,
    enum: Object.values(WithdrawalRequestStatus).filter(
      (v) => typeof v === 'number',
    ),
    default: WithdrawalRequestStatus.pending,
  })
  status: WithdrawalRequestStatus;

  @Prop({ type: Date, required: true })
  requestDate: Date;

  @Prop({ type: String, default: null })
  processedBy: string | null;

  @Prop({ type: Date, default: null })
  processedDate: Date | null;

  @Prop({ type: String, default: null })
  rejectionReason: string | null;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const WithdrawalRequestSchema = SchemaFactory.createForClass(
  WithdrawalRequestSchemaClass,
);

WithdrawalRequestSchema.plugin(mongoosePaginate);

WithdrawalRequestSchema.index({ affiliateId: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ status: 1 });
