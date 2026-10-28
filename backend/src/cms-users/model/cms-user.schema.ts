import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { FileSchemaClass } from '../../files/infrastructure/persistence/document/entities/file.schema';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AccountTypeEnum } from '../permissions/account-type.enum';
import { ModulePermission } from '../permissions/module-permission.enum';

export type CmsUserSchemaDocument = HydratedDocument<CmsUserSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'cms_users',
})
export class CmsUserSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: String,
    required: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    type: String,
  })
  firstName: string | null;

  @Prop({
    type: String,
  })
  lastName?: string | null;

  @Prop({
    type: String,
  })
  phone?: string | null;

  @Prop({
    type: FileSchemaClass,
  })
  photo?: FileSchemaClass | null;

  /** @deprecated No longer used – module permissions are the sole access control mechanism. */
  @Prop({
    type: Number,
    required: false,
  })
  permissionGroup?: number;

  @Prop({
    type: Number,
    enum: AccountTypeEnum,
    default: AccountTypeEnum.website_admin,
  })
  accountType: AccountTypeEnum;

  @Prop({
    type: [Number],
    enum: ModulePermission,
    default: [],
  })
  permissions: ModulePermission[];

  @Prop({
    type: String,
    default: null,
  })
  affiliateId?: string | null;

  @Prop({
    type: Number,
    enum: StatusEnum,
    default: StatusEnum.active,
  })
  status: StatusEnum;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const CmsUserSchema = SchemaFactory.createForClass(CmsUserSchemaClass);

CmsUserSchema.index({ email: 1 }, { unique: true });
CmsUserSchema.index({ affiliateId: 1 });

CmsUserSchema.plugin(mongoosePaginate);
