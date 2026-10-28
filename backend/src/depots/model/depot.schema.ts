import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { NhanhDepotSnapshot } from '../../nhanh/types/nhanh-snapshots';

export type DepotDocument = HydratedDocument<DepotSchemaClass>;

/**
 * Mongoose schema for Depot entity
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
  collection: 'depots',
})
export class DepotSchemaClass extends EntityDocumentHelper {
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
  snapshot?: NhanhDepotSnapshot | Record<string, any>;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: Number })
  cityId?: number;

  @Prop({ type: Number })
  districtId?: number;

  @Prop({ type: Number })
  wardId?: number;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;
}

export const DepotSchema = SchemaFactory.createForClass(DepotSchemaClass);

// Compound indexes
// Index by snapshot.id for looking up by source ID
DepotSchema.index(
  { businessId: 1, source: 1, 'snapshot.id': 1 },
  { unique: true },
);
