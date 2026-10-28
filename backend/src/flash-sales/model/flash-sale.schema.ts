import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type FlashSaleDocument = HydratedDocument<FlashSaleSchemaClass>;

/**
 * Mongoose schema for FlashSale entity
 * Products are stored in the separate flash_sale_products collection
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'flash_sales',
})
export class FlashSaleSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: Date, required: true, index: true })
  startTime: Date;

  @Prop({ type: Date, required: true, index: true })
  endTime: Date;

  @Prop({ type: Boolean, required: true, default: true, index: true })
  isEnabled: boolean;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const FlashSaleSchema =
  SchemaFactory.createForClass(FlashSaleSchemaClass);

// Indexes for efficient queries
FlashSaleSchema.index({ startTime: 1, endTime: 1, isEnabled: 1, deletedAt: 1 });
FlashSaleSchema.index({ name: 'text' });

FlashSaleSchema.plugin(mongoosePaginate);
