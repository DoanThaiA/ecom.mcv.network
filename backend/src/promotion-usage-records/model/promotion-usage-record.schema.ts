import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type PromotionUsageRecordDocument =
  HydratedDocument<PromotionUsageRecordSchemaClass>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'promotion_usage_records',
})
export class PromotionUsageRecordSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionSchemaClass',
    required: true,
  })
  promotionId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSchemaClass',
    required: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true })
  usedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;
}

export const PromotionUsageRecordSchema = SchemaFactory.createForClass(
  PromotionUsageRecordSchemaClass,
);

// Index for per-user usage count queries
PromotionUsageRecordSchema.index({ promotionId: 1, userId: 1 });

// Index for listing records by promotion
PromotionUsageRecordSchema.index({ promotionId: 1, usedAt: -1 });
