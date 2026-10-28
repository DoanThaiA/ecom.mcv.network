import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { ShippingCalculationMethod } from '../domain/shipping-calculation-method.enum';

export type ShippingSettingsSchemaDocument =
  HydratedDocument<ShippingSettingsSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'shipping_settings',
})
export class ShippingSettingsSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    enum: Object.values(ShippingCalculationMethod),
    default: ShippingCalculationMethod.FIXED,
  })
  calculationMethod: ShippingCalculationMethod;

  @Prop({ type: Number, default: 30000 })
  fixedShippingFee: number;

  @Prop({ default: now })
  updatedAt: Date;
}

export const ShippingSettingsSchema = SchemaFactory.createForClass(
  ShippingSettingsSchemaClass,
);
