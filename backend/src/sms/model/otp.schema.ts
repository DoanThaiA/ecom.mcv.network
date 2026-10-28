import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type OtpSchemaDocument = HydratedDocument<OtpSchemaClass>;

@Schema({
  timestamps: true,
  collection: 'otps',
})
export class OtpSchemaClass {
  @Prop({
    type: String,
    required: true,
    index: true,
  })
  phone: string;

  @Prop({
    type: String,
    required: true,
  })
  otp: string;

  @Prop({
    type: Date,
    required: true,
    index: true,
  })
  expiresAt: Date;

  @Prop({
    type: Date,
    required: false,
    default: null,
    index: { expires: 0 }, // TTL index - will auto-delete when removeAt is reached
  })
  removeAt: Date | null;

  @Prop({
    type: String,
    default: null,
  })
  firstName: string | null;

  @Prop({
    type: String,
    default: null,
  })
  lastName: string | null;

  @Prop({
    type: String,
    default: null,
  })
  password: string | null;

  @Prop({
    type: Boolean,
    default: false,
  })
  isRegistration: boolean;

  @Prop({
    type: String,
    default: null,
  })
  userId: string | null;

  @Prop({
    type: Boolean,
    default: false,
  })
  isPhoneLink: boolean;

  @Prop({
    type: String,
    default: null,
  })
  resetToken: string | null;

  @Prop({
    type: Date,
    default: null,
  })
  resetTokenExpiresAt: Date | null;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(OtpSchemaClass);

// Index for phone number to quickly find OTPs
OtpSchema.index({ phone: 1, createdAt: -1 });
