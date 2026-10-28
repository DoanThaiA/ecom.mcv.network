import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type SearchKeywordDocument = HydratedDocument<SearchKeywordSchemaClass>;

/**
 * Mongoose schema for SearchKeyword entity.
 * One document per (keyword, date) bucket — count is incremented on each search.
 */
@Schema({
  timestamps: false,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'search_keywords',
})
export class SearchKeywordSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true })
  keyword: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true, default: 0 })
  count: number;
}

export const SearchKeywordSchema = SchemaFactory.createForClass(
  SearchKeywordSchemaClass,
);

// Unique index for upsert: one document per keyword per day
SearchKeywordSchema.index({ keyword: 1, date: 1 }, { unique: true });

// TTL index: auto-delete buckets older than 30 days
SearchKeywordSchema.index(
  { date: 1 },
  { expireAfterSeconds: 30 * 24 * 3600 },
);
