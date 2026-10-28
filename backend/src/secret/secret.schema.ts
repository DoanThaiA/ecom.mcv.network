import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'secrets',
})
export class SecretSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: Object, required: true })
  value: Record<string, any>;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

export const SecretSchema = SchemaFactory.createForClass(SecretSchemaClass);

export type SecretSchemaDocument = SecretSchemaClass & Document;

// Create unique index on key
SecretSchema.index({ key: 1 }, { unique: true });
