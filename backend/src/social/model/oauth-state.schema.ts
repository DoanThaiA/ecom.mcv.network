import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OAuthStateDocument = HydratedDocument<OAuthStateSchemaClass>;

@Schema({
  timestamps: true,
  collection: 'oauth_states',
})
export class OAuthStateSchemaClass {
  @Prop({ required: true, unique: true, index: true })
  state: string;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  codeVerifier: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const OAuthStateSchema = SchemaFactory.createForClass(
  OAuthStateSchemaClass,
);

// Create TTL index to automatically delete expired states
OAuthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
