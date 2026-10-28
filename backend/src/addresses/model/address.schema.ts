import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type AddressSchemaDocument = HydratedDocument<AddressSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'addresses',
})
export class AddressSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true, index: true, type: Number })
  cityId: number;

  @Prop({ required: true })
  cityName: string;

  @Prop({ required: true, index: true, type: Number })
  districtId: number;

  @Prop({ required: true })
  districtName: string;

  @Prop({ required: true, type: Number })
  wardId: number;

  @Prop({ required: true })
  wardName: string;

  @Prop({ default: false, index: true })
  isDefault: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt?: Date;
}

export const AddressSchema = SchemaFactory.createForClass(AddressSchemaClass);

// Indexes for better query performance
AddressSchema.index({ userId: 1, isDefault: 1 });
AddressSchema.index({ userId: 1, createdAt: -1 });
AddressSchema.index({ cityId: 1, districtId: 1 });
