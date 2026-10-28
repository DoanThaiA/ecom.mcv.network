import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { NhanhProductInventorySnapshot } from '../../nhanh/types/nhanh-snapshots';

export type ProductInventoryDocument =
  HydratedDocument<ProductInventorySchemaClass>;

/**
 * Mongoose schema for ProductInventory entity
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
  collection: 'product-inventories',
})
export class ProductInventorySchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true })
  productId: string;

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
  snapshot?: NhanhProductInventorySnapshot | Record<string, any>;

  @Prop({ type: String })
  barcode?: string;

  @Prop({ type: String })
  productName?: string;

  @Prop({ type: Number, required: true, default: 0 })
  totalRemain: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalAvailable: number;

  @Prop({ type: Number, default: 0 })
  totalShipping?: number;

  @Prop({ type: Number, default: 0 })
  totalDamaged?: number;

  @Prop({ type: Number, default: 0 })
  totalHolding?: number;

  @Prop({
    type: {
      retail: { type: Number },
      wholesale: { type: Number },
      import: { type: Number },
      avgCost: { type: Number },
      _id: false,
    },
  })
  prices?: {
    retail?: number;
    wholesale?: number;
    import?: number;
    avgCost?: number;
  };

  @Prop({
    type: [
      {
        depotId: { type: String, required: true },
        remain: { type: Number, required: true, default: 0 },
        available: { type: Number, required: true, default: 0 },
        shipping: { type: Number, default: 0 },
        damaged: { type: Number, default: 0 },
        holding: { type: Number, default: 0 },
        warranty: {
          type: {
            remain: { type: Number },
            holding: { type: Number },
            _id: false,
          },
        },
        _id: false,
      },
    ],
    default: [],
  })
  depots: Array<{
    depotId: string;
    remain: number;
    available: number;
    shipping?: number;
    damaged?: number;
    holding?: number;
    warranty?: {
      remain?: number;
      holding?: number;
    };
  }>;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const ProductInventorySchema = SchemaFactory.createForClass(
  ProductInventorySchemaClass,
);

// Compound indexes
// Index by snapshot.productId for looking up by source product ID
ProductInventorySchema.index({
  businessId: 1,
  source: 1,
  'snapshot.productId': 1,
});
ProductInventorySchema.index({ businessId: 1, productId: 1 }, { unique: true });
ProductInventorySchema.index({ businessId: 1, totalAvailable: -1 });

ProductInventorySchema.plugin(mongoosePaginate);
