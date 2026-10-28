import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { TopicStatus } from '../domain/topic-status.enum';
import { TopicType } from '../domain/topic-type.enum';
import { BannerMediaType } from '../../banners/model/banner-media-type.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type TopicDocument = HydratedDocument<TopicSchemaClass>;

/**
 * Topic product schema - product reference with display order
 */
@Schema({ _id: false })
export class TopicProductSchemaClass {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductSchemaClass',
    required: true,
  })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  order: number;
}

/**
 * Topic category schema - category reference with display order
 */
@Schema({ _id: false })
export class TopicCategorySchemaClass {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategorySchemaClass',
    required: true,
  })
  categoryId: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  order: number;
}

/**
 * Topic banner media schema - responsive URLs for different device types
 */
@Schema({ _id: false })
export class TopicBannerMediaSchemaClass {
  @Prop({ type: String })
  mobile?: string;

  @Prop({ type: String })
  tablet?: string;

  @Prop({ type: String })
  desktop?: string;
}

/**
 * Topic banner schema - a banner item within a topic
 * Uses auto-generated _id for unique identification
 */
@Schema()
export class TopicBannerSchemaClass {
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    enum: [BannerMediaType.IMAGE, BannerMediaType.VIDEO],
    default: BannerMediaType.IMAGE,
  })
  mediaType: BannerMediaType;

  @Prop({ type: TopicBannerMediaSchemaClass, required: true })
  media: TopicBannerMediaSchemaClass;

  @Prop({ type: String })
  link?: string;

  @Prop({ type: Number, required: true, default: 0 })
  order: number;
}

/**
 * Mongoose schema for Topic entity
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'topics',
})
export class TopicSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: Object })
  localization?: { vi?: string; en?: string };

  @Prop({ type: String, required: true, index: true })
  slug: string;

  @Prop({
    type: Number,
    required: true,
    enum: [TopicType.PRODUCT, TopicType.CATEGORY, TopicType.BANNER],
    default: TopicType.PRODUCT,
    index: true,
  })
  type: TopicType;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Number, required: true, default: 0, index: true })
  order: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TopicStatus),
    default: TopicStatus.ACTIVE,
    index: true,
  })
  status: TopicStatus;

  @Prop({ type: [TopicProductSchemaClass], default: [] })
  products: TopicProductSchemaClass[];

  @Prop({ type: [TopicCategorySchemaClass], default: [] })
  categories: TopicCategorySchemaClass[];

  @Prop({ type: [TopicBannerSchemaClass], default: [] })
  banners: TopicBannerSchemaClass[];

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const TopicSchema = SchemaFactory.createForClass(TopicSchemaClass);

// Indexes for efficient queries
// Unique slug per business (only for non-deleted)
TopicSchema.index(
  { businessId: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);
// Active topics ordered by display order
TopicSchema.index({ businessId: 1, status: 1, order: 1, deletedAt: 1 });
// Find topics by product
TopicSchema.index({ 'products.productId': 1, status: 1, deletedAt: 1 });
// Text search
TopicSchema.index({ name: 'text', description: 'text' });

TopicSchema.plugin(mongoosePaginate);
