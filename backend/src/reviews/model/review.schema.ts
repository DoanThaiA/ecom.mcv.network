import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { FitLevel } from '../domain/fit-level.enum';
import { ReviewStatus } from '../domain/review-status.enum';
import { MediaType } from '../domain/media-type.enum';

export type ReviewDocument = HydratedDocument<ReviewSchemaClass>;

// ==================== Embedded Schemas ====================

@Schema({ _id: false })
class ReviewMediaSchema {
  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, required: true, enum: Object.values(MediaType) })
  type: MediaType;

  @Prop({ type: String })
  thumbnail?: string;
}

@Schema({ _id: false })
class ReviewUserSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;
}

@Schema({ _id: false })
class ReviewOrderSnapshotSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  orderId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  orderNumber: string;

  @Prop({ type: Number })
  nhanhOrderId?: number;

  @Prop({ type: Date, required: true })
  orderDate: Date;
}

@Schema({ _id: false })
class ProductReviewSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  productId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  variantId?: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  productName: string;

  @Prop({ type: String })
  productImage?: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: Number, required: true })
  heightCm: number;

  @Prop({ type: Number, required: true })
  weightKg: number;

  @Prop({
    type: Number,
    required: true,
    enum: Object.values(FitLevel).filter((v) => typeof v === 'number'),
  })
  fitLevel: FitLevel;

  @Prop({ type: String })
  content?: string;

  @Prop({ type: [ReviewMediaSchema], default: [] })
  media: ReviewMediaSchema[];

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ReviewStatus),
    default: ReviewStatus.VISIBLE,
  })
  status: ReviewStatus;
}

// ==================== Main Schema ====================

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'reviews',
})
export class ReviewSchemaClass extends EntityDocumentHelper {
  @Prop({ type: ReviewUserSchema, required: true })
  user: ReviewUserSchema;

  @Prop({ type: ReviewOrderSnapshotSchema, required: true })
  orderSnapshot: ReviewOrderSnapshotSchema;

  @Prop({ type: [ProductReviewSchema], required: true })
  productReviews: ProductReviewSchema[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(ReviewSchemaClass);

// ==================== Indexes ====================

// Unique constraint: one review per order
ReviewSchema.index({ 'orderSnapshot.orderId': 1 }, { unique: true });

// User reviews
ReviewSchema.index({ 'user.userId': 1, createdAt: -1 });

// Product reviews (for product page) - filter by productReviews.status
ReviewSchema.index({
  'productReviews.productId': 1,
  'productReviews.status': 1,
  createdAt: -1,
});

// CMS filters
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ 'productReviews.status': 1 });
ReviewSchema.index({ 'productReviews.rating': 1 });
ReviewSchema.index({ 'productReviews.fitLevel': 1 });
ReviewSchema.index({ 'productReviews.heightCm': 1 });
ReviewSchema.index({ 'productReviews.weightKg': 1 });

// Text search for keyword (ID đơn, tên SP, nội dung)
ReviewSchema.index({
  'orderSnapshot.orderNumber': 'text',
  'orderSnapshot.nhanhOrderId': 'text',
  'productReviews.productName': 'text',
  'productReviews.content': 'text',
});

// Add pagination plugin
ReviewSchema.plugin(mongoosePaginate);
