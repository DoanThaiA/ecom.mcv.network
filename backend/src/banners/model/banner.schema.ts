import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { BannerPosition } from './banner-position.enum';
import { BannerMediaType } from './banner-media-type.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type BannerDocument = HydratedDocument<BannerSchemaClass>;

/**
 * Responsive media schema - URLs for different device types
 * At least one of mobile, tablet, or desktop must be provided
 */
@Schema({ _id: false })
export class ResponsiveMediaSchemaClass {
  @Prop({ type: String })
  mobile?: string;

  @Prop({ type: String })
  tablet?: string;

  @Prop({ type: String })
  desktop?: string;
}

/**
 * Mongoose schema for Banner entity
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'banners',
})
export class BannerSchemaClass extends EntityDocumentHelper {
  @Prop({
    type: Number,
    required: true,
    enum: [BannerPosition.HERO_SLIDER, BannerPosition.AD_SECTION], // [1, 2]
    index: true,
  })
  position: BannerPosition;

  @Prop({
    type: Number,
    required: true,
    enum: [BannerMediaType.IMAGE, BannerMediaType.VIDEO], // [1, 2]
    default: BannerMediaType.IMAGE,
  })
  mediaType: BannerMediaType;

  @Prop({ type: ResponsiveMediaSchemaClass, required: true })
  media: ResponsiveMediaSchemaClass;

  @Prop({ type: String })
  link?: string;

  @Prop({ type: Number, required: true, default: 0, index: true })
  order: number;

  @Prop({ type: Boolean, required: true, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const BannerSchema = SchemaFactory.createForClass(BannerSchemaClass);

// Compound index for efficient  queries filtered by position and active status
BannerSchema.index({ position: 1, isActive: 1, order: 1, deletedAt: 1 });

// Pre-validate hook to ensure at least one media URL is provided
BannerSchema.pre('validate', function (next) {
  if (this.media) {
    const { mobile, tablet, desktop } = this.media;
    if (!mobile && !tablet && !desktop) {
      const error = new Error(
        'At least one media URL (mobile, tablet, or desktop) is required',
      );
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

BannerSchema.plugin(mongoosePaginate);
