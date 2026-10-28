import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ImportSessionRowDocument =
  HydratedDocument<ImportSessionRowSchemaClass>;

/**
 * Mongoose schema for ImportSessionRow - a validated product row from Excel
 */
@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'import_session_rows',
})
export class ImportSessionRowSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  })
  sessionId: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  rowNumber: number;

  @Prop({ type: String, default: '' })
  productId: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String })
  actualName?: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, default: 0 })
  originalPrice: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(DiscountType),
  })
  discountType: DiscountType;

  @Prop({ type: Number, required: true })
  discountValue: number;

  @Prop({ type: Number, default: 0 })
  flashSalePrice: number;

  @Prop({ type: Number, required: true })
  promotionalQuantity: number;

  @Prop({ type: Number, default: 0 })
  stock: number;

  @Prop({ type: Number })
  commissionRate?: number;

  @Prop({ type: Boolean, required: true, default: false })
  isValid: boolean;

  @Prop({ type: [String], default: [] })
  errors: string[];

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const ImportSessionRowSchema = SchemaFactory.createForClass(
  ImportSessionRowSchemaClass,
);

// TTL index: auto-expire after 24 hours
ImportSessionRowSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Primary lookup: paginated rows for a session with validity filter
ImportSessionRowSchema.index({ sessionId: 1, isValid: 1, _id: 1 });

// Search within a session by code
ImportSessionRowSchema.index({ sessionId: 1, code: 1 });

ImportSessionRowSchema.plugin(mongoosePaginate);
