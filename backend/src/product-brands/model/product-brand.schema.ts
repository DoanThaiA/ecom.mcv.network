import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { ProductBrandStatus } from '../domain/product-brand-status.enum';
import { NhanhProductBrandSnapshot } from '../../nhanh/types/nhanh-snapshots';

export type ProductBrandDocument = HydratedDocument<ProductBrandSchemaClass>;

/**
 * Mongoose schema for ProductBrand entity
 *
 * Data architecture:
 * - `snapshot`: Raw data from source (Nhanh/Shopify) stored without processing
 * - Other fields: Domain data derived from snapshot, controlled by our system
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'product-brands',
})
export class ProductBrandSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({
    type: String,
    required: true,
    enum: ['nhanh', 'shopify'],
    index: true,
  })
  source: 'nhanh' | 'shopify';

  /**
   * Raw snapshot from the source system
   * Contains unprocessed data exactly as received from the API
   */
  @Prop({
    type: Object,
    _id: false,
  })
  snapshot?: NhanhProductBrandSnapshot | Record<string, any>;

  @Prop({ type: String })
  code?: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: Number,
    required: true,
    enum: [ProductBrandStatus.ACTIVE, ProductBrandStatus.INACTIVE],
    index: true,
  })
  status: ProductBrandStatus;

  @Prop({ type: String })
  parentId?: string;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const ProductBrandSchema = SchemaFactory.createForClass(
  ProductBrandSchemaClass,
);

// Compound indexes
// Index by snapshot.id for looking up by source ID
ProductBrandSchema.index({ businessId: 1, source: 1, 'snapshot.id': 1 });
ProductBrandSchema.index({ businessId: 1, name: 1 });
ProductBrandSchema.index({ businessId: 1, code: 1 }, { sparse: true });

ProductBrandSchema.plugin(mongoosePaginate);
