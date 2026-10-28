import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { MenuStatus } from '../domain/menu-status.enum';
import { MenuType } from '../domain/menu-type.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type MenuDocument = HydratedDocument<MenuSchemaClass>;

/**
 * Mongoose schema for Menu entity
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'menus',
})
export class MenuSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: Object })
  localization?: { vi?: string; en?: string };

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuSchemaClass',
    index: true,
  })
  parentId?: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(MenuType),
    index: true,
  })
  type: MenuType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategorySchemaClass',
    index: true,
  })
  categoryId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TopicSchemaClass',
    index: true,
  })
  topicId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  url?: string;

  @Prop({ type: Number, required: true, default: 0, index: true })
  order: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(MenuStatus),
    default: MenuStatus.ACTIVE,
    index: true,
  })
  status: MenuStatus;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const MenuSchema = SchemaFactory.createForClass(MenuSchemaClass);

// Indexes for efficient queries
// Hierarchical menu queries
MenuSchema.index({ parentId: 1, order: 1, deletedAt: 1 });
// Active menus by status
MenuSchema.index({ status: 1, order: 1, deletedAt: 1 });
// Menus by type and category
MenuSchema.index({ type: 1, categoryId: 1, deletedAt: 1 });
// Menus by type and topic
MenuSchema.index({ type: 1, topicId: 1, deletedAt: 1 });
// Text search
MenuSchema.index({ name: 'text' });

MenuSchema.plugin(mongoosePaginate);
