import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ProductCommissionSchemaDocument =
  HydratedDocument<ProductCommissionSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'product_commissions',
})
export class ProductCommissionSchemaClass extends EntityDocumentHelper {
  @Prop({ type: Types.ObjectId, default: null, index: true })
  affiliateId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  affiliateCode?: string | null;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ type: String, default: null })
  productSlug?: string | null;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Object, default: {} })
  images: { avatar?: string | null; others?: string[] };

  @Prop({ type: Number, default: 0 })
  costPrice: number;

  @Prop({ type: Number, default: 0 })
  stock: number;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  category?: { id: string; name: string } | null;

  @Prop({ type: Number, required: true })
  commissionRate: number;

  @Prop({ type: Number, default: 0 })
  estimatedCommission: number;

  @Prop({ type: Boolean, default: false })
  isCustomRate: boolean;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

export const ProductCommissionSchema = SchemaFactory.createForClass(
  ProductCommissionSchemaClass,
);

// Unique compound: one row per (affiliate, product) pair
ProductCommissionSchema.index(
  { affiliateId: 1, productId: 1 },
  { unique: true },
);

// Filter by category
ProductCommissionSchema.index({ affiliateId: 1, 'category.id': 1 });

ProductCommissionSchema.plugin(mongoosePaginate);
