import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type PopupAdsDocument = HydratedDocument<PopupAdsSchemaClass>;

/**
 * Mongoose schema for PopupAds entity
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'popup_ads',
})
export class PopupAdsSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: Date, required: true, index: true })
  startAt: Date;

  @Prop({ type: Date, required: true, index: true })
  endAt: Date;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  link?: string;

  @Prop({ type: Number, required: true, default: 0, index: true })
  order: number;

  @Prop({ type: Boolean, required: true, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const PopupAdsSchema = SchemaFactory.createForClass(PopupAdsSchemaClass);

// Compound index for efficient queries on active popups within time range
PopupAdsSchema.index({ isActive: 1, startAt: 1, endAt: 1, deletedAt: 1 });
// Compound index for sorting by order and createdAt
PopupAdsSchema.index({ order: 1, createdAt: 1 });

PopupAdsSchema.plugin(mongoosePaginate);
