import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ComboStatus } from '../domain/combo-status.enum';
import { DiscountType } from '../domain/discount-type.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ComboDocument = HydratedDocument<ComboSchemaClass>;

/**
 * Combo item schema - product reference with quantity
 */
@Schema({ _id: false })
export class ComboItemSchemaClass {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductSchemaClass',
    required: true,
  })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;
}

/**
 * Mongoose schema for Combo entity
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'combos',
})
export class ComboSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  image?: string;

  @Prop({
    type: [ComboItemSchemaClass],
    required: true,
    validate: {
      validator: (items: ComboItemSchemaClass[]) =>
        items.length >= 1 && items.length <= 5,
      message: 'Combo must have between 1 and 5 items',
    },
  })
  items: ComboItemSchemaClass[];

  @Prop({
    type: String,
    required: true,
    enum: Object.values(DiscountType),
  })
  discountType: DiscountType;

  @Prop({ type: Number, required: true, min: 0 })
  discountValue: number;

  @Prop({ type: Number, required: true, min: 0 })
  originalPrice: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ComboStatus),
    default: ComboStatus.ACTIVE,
    index: true,
  })
  status: ComboStatus;

  @Prop({ type: Date, index: true })
  validFrom?: Date;

  @Prop({ type: Date, index: true })
  validTo?: Date;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;

  @Prop({ type: Object })
  nameLocalization?: { vi?: string; en?: string };
}

export const ComboSchema = SchemaFactory.createForClass(ComboSchemaClass);

// Indexes for efficient queries
ComboSchema.index({ status: 1, deletedAt: 1 });
ComboSchema.index({ 'items.productId': 1, status: 1, deletedAt: 1 });
ComboSchema.index({ validFrom: 1, validTo: 1 });
ComboSchema.index({ name: 'text' });

ComboSchema.plugin(mongoosePaginate);
