import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ArticleStatus } from '../domain/article-status.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';

export type ArticleDocument = HydratedDocument<ArticleSchemaClass>;

/**
 * Mongoose schema for Article entity
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'articles',
})
export class ArticleSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, maxlength: 200 })
  title: string;

  @Prop({ type: Object })
  titleLocalization?: { vi?: string; en?: string };

  @Prop({ type: String, required: true, maxlength: 100000 })
  content: string;

  @Prop({ type: Object })
  contentLocalization?: { vi?: string; en?: string };

  @Prop({ type: String, required: true })
  thumbnail: string;

  @Prop({
    type: Number,
    required: true,
    enum: [ArticleStatus.ACTIVE, ArticleStatus.INACTIVE],
    default: ArticleStatus.ACTIVE,
    index: true,
  })
  status: ArticleStatus;

  @Prop({ type: Date, default: now, index: true })
  publishedAt: Date;

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(ArticleSchemaClass);

// Compound index for efficient shop queries (active articles by date)
ArticleSchema.index({ status: 1, publishedAt: -1, deletedAt: 1 });

ArticleSchema.plugin(mongoosePaginate);
