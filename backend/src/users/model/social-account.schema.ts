import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';
import { AuthProvidersEnum } from '../../auth/auth-providers.enum';

@Schema({ _id: false })
export class SocialAccountSchemaClass {
  @Prop({
    type: String,
    enum: AuthProvidersEnum,
    required: true,
  })
  provider: AuthProvidersEnum;

  @Prop({
    type: String,
    required: true,
  })
  socialId: string;

  @Prop({
    type: String,
  })
  email?: string | null;

  @Prop({
    type: String,
  })
  firstName?: string | null;

  @Prop({
    type: String,
  })
  lastName?: string | null;

  @Prop({
    type: String,
  })
  avatarUrl?: string | null;

  @Prop({ default: now })
  connectedAt: Date;
}

export const SocialAccountSchema = SchemaFactory.createForClass(
  SocialAccountSchemaClass,
);
