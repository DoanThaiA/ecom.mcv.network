import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { ImportSessionStatus } from '../domain/import-session-status.enum';

export type ImportSessionDocument = HydratedDocument<ImportSessionSchemaClass>;

/**
 * Mongoose schema for ImportSession - metadata for flash sale or product discount Excel import
 */
@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'import_sessions',
})
export class ImportSessionSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
    enum: [
      'flash_sale',
      'product_discount',
      'topic',
      'affiliate_product_commission',
    ],
    default: 'flash_sale',
  })
  type: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  })
  flashSaleId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  })
  promotionId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  })
  topicId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  })
  affiliateId?: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ImportSessionStatus),
    default: ImportSessionStatus.PENDING,
  })
  status: ImportSessionStatus;

  @Prop({ type: Number, default: 0 })
  totalRows: number;

  @Prop({ type: Number, default: 0 })
  validCount: number;

  @Prop({ type: Number, default: 0 })
  invalidCount: number;

  @Prop({ type: String })
  jobId?: string;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const ImportSessionSchema = SchemaFactory.createForClass(
  ImportSessionSchemaClass,
);

// TTL index: auto-expire after 24 hours
ImportSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Lookup by flash sale
ImportSessionSchema.index({ flashSaleId: 1, status: 1 });

// Lookup by promotion
ImportSessionSchema.index({ promotionId: 1, status: 1 });

// Lookup by topic
ImportSessionSchema.index({ topicId: 1, status: 1 });

// Lookup by affiliate (null = global commission settings)
ImportSessionSchema.index({ affiliateId: 1, status: 1 });

// Lookup by type
ImportSessionSchema.index({ type: 1, status: 1 });
