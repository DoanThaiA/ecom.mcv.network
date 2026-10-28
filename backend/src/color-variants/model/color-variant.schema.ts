import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ColorVariantDisplayType } from '../domain/color-variant-display-type.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ColorVariantDocument = HydratedDocument<ColorVariantSchemaClass>;

/**
 * Display configuration schema - visual representation data
 */
@Schema({ _id: false })
export class ColorVariantDisplaySchemaClass {
  @Prop({ type: String })
  colorValue?: string;

  @Prop({ type: String })
  patternImage?: string;
}

/**
 * Mongoose schema for ColorVariant entity
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'color-variants',
})
export class ColorVariantSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  nameNormalized: string;

  @Prop({
    type: Number,
    required: true,
    enum: [
      ColorVariantDisplayType.SOLID,
      ColorVariantDisplayType.GRADIENT,
      ColorVariantDisplayType.STRIPE_VERTICAL,
      ColorVariantDisplayType.STRIPE_HORIZONTAL,
      ColorVariantDisplayType.DOT,
      ColorVariantDisplayType.CARO,
    ],
    default: ColorVariantDisplayType.SOLID,
  })
  displayType: ColorVariantDisplayType;

  @Prop({ type: ColorVariantDisplaySchemaClass, required: true })
  display: ColorVariantDisplaySchemaClass;

  @Prop({ type: Number, required: true, default: 0, index: true })
  order: number;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const ColorVariantSchema = SchemaFactory.createForClass(
  ColorVariantSchemaClass,
);

// Unique index for normalized name (prevent duplicate colors)
ColorVariantSchema.index({ nameNormalized: 1 }, { unique: true });

ColorVariantSchema.plugin(mongoosePaginate);
