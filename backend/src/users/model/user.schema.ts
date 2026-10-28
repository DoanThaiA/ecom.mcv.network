import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { AuthProvidersEnum } from '../../auth/auth-providers.enum';
import { FileSchemaClass } from '../../files/infrastructure/persistence/document/entities/file.schema';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { StatusEnum } from '../../statuses/statuses.enum';
import { SocialAccountSchemaClass } from './social-account.schema';

export type UserSchemaDocument = HydratedDocument<UserSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'users',
})
export class UserSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
  })
  email?: string;

  @Prop({
    type: String,
  })
  phone?: string;

  @Prop()
  password?: string;

  @Prop({
    type: String,
  })
  cdpCustomerId?: string;

  @Prop({
    type: String,
  })
  cdpCustomerCode?: string;

  @Prop({
    default: AuthProvidersEnum.email,
  })
  provider: string;

  @Prop({
    type: String,
    default: null,
  })
  socialId?: string | null;

  @Prop({
    type: String,
  })
  firstName: string | null;

  @Prop({
    type: String,
  })
  lastName?: string | null;

  @Prop({
    type: FileSchemaClass,
  })
  photo?: FileSchemaClass | null;

  @Prop({
    type: String,
  })
  socialAvatarUrl?: string | null;

  @Prop({
    type: Number,
    enum: StatusEnum,
  })
  status?: StatusEnum | null;

  @Prop({
    type: [SocialAccountSchemaClass],
    default: [],
  })
  socialAccounts?: SocialAccountSchemaClass[];

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({
  'socialAccounts.provider': 1,
  'socialAccounts.socialId': 1,
});

UserSchema.plugin(mongoosePaginate);
