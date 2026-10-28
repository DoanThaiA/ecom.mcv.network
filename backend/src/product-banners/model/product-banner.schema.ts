import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ProductBannerPosition } from '../domain/product-banner-position.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ProductBannerDocument = HydratedDocument<ProductBannerSchemaClass>;

/**
 * Embedded product info in ProductBanner
 */
export class ProductBannerProductSchema {
  id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  images?: {
    avatar?: string;
  };
}

/**
 * Mongoose schema for ProductBanner entity
 * Represents a banner overlay that can be applied to product images
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'product_banners',
})
export class ProductBannerSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({
    type: Number,
    required: true,
    enum: [ProductBannerPosition.TOP, ProductBannerPosition.BOTTOM],
    default: ProductBannerPosition.BOTTOM,
  })
  position: ProductBannerPosition;

  @Prop({ type: Number })
  ratio?: number;

  @Prop({ type: Boolean, required: true, default: true, index: true })
  isActive: boolean;

  @Prop({
    type: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductSchemaClass' },
        name: { type: String, required: true },
        code: { type: String, required: true },
        images: {
          type: {
            avatar: { type: String },
            _id: false,
          },
        },
        _id: false,
      },
    ],
    default: [],
  })
  products: ProductBannerProductSchema[];

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const ProductBannerSchema = SchemaFactory.createForClass(
  ProductBannerSchemaClass,
);

// Compound index for efficient queries filtered by active status
ProductBannerSchema.index({ isActive: 1, deletedAt: 1 });

// Index for finding banners by product
ProductBannerSchema.index({ 'products.id': 1, deletedAt: 1 });

// Index for listing banners ordered by creation date
ProductBannerSchema.index({ createdAt: -1, deletedAt: 1 });

ProductBannerSchema.plugin(mongoosePaginate);
