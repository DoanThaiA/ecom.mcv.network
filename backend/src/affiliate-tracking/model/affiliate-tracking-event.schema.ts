import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { TrackingEventType } from '../domain/tracking-event-type.enum';

export type AffiliateTrackingEventDocument =
  HydratedDocument<AffiliateTrackingEventSchemaClass>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true, getters: true },
  collection: 'affiliate_tracking_events',
})
export class AffiliateTrackingEventSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    enum: TrackingEventType,
    required: true,
    default: TrackingEventType.CLICK,
  })
  type: TrackingEventType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AffiliateSchemaClass',
  })
  affiliateId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  affiliateCode: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProductSchemaClass' })
  productId?: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  sessionId: string;

  @Prop({ type: String })
  ip?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata?: Record<string, unknown>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const AffiliateTrackingEventSchema = SchemaFactory.createForClass(
  AffiliateTrackingEventSchemaClass,
);

// Indexes
AffiliateTrackingEventSchema.index({
  affiliateId: 1,
  type: 1,
  createdAt: -1,
});
AffiliateTrackingEventSchema.index({ affiliateCode: 1 });
AffiliateTrackingEventSchema.index({
  affiliateId: 1,
  productId: 1,
  type: 1,
  createdAt: -1,
});
