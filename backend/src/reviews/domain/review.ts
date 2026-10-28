import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FitLevel } from './fit-level.enum';
import { ReviewStatus } from './review-status.enum';
import { MediaType } from './media-type.enum';

/**
 * Review media (image/video)
 */
export class ReviewMedia {
  @ApiProperty({ description: 'Media URL' })
  url: string;

  @ApiProperty({ enum: MediaType, description: 'Media type' })
  type: MediaType;

  @ApiPropertyOptional({ description: 'Video thumbnail URL' })
  thumbnail?: string;
}

/**
 * User info snapshot
 */
export class ReviewUser {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User full name' })
  fullName: string;
}

/**
 * Order info snapshot
 */
export class ReviewOrderSnapshot {
  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'Order number' })
  orderNumber: string;

  @ApiPropertyOptional({ type: Number, description: 'Nhanh.vn order ID' })
  nhanhOrderId?: number | null;

  @ApiProperty({ description: 'Order date' })
  orderDate: Date;
}

/**
 * Single product review within order
 */
export class ProductReview {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID' })
  variantId?: string;

  @ApiProperty({ description: 'Product name' })
  productName: string;

  @ApiPropertyOptional({ description: 'Product image URL' })
  productImage?: string;

  @ApiProperty({ description: 'Quantity purchased' })
  quantity: number;

  @ApiProperty({ description: 'Rating (1-5 stars)', minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ description: 'Height in cm' })
  heightCm: number;

  @ApiProperty({ description: 'Weight in kg' })
  weightKg: number;

  @ApiProperty({ enum: FitLevel, description: 'Fit level' })
  fitLevel: FitLevel;

  @ApiPropertyOptional({ description: 'Review content' })
  content?: string;

  @ApiProperty({ type: [ReviewMedia], description: 'Media files (max 5)' })
  media: ReviewMedia[];

  @ApiProperty({ enum: ReviewStatus, description: 'Visibility status' })
  status: ReviewStatus;
}

/**
 * Review domain entity - one review per order
 */
export class Review {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ type: ReviewUser, description: 'User info snapshot' })
  user: ReviewUser;

  @ApiProperty({
    type: ReviewOrderSnapshot,
    description: 'Order info snapshot',
  })
  orderSnapshot: ReviewOrderSnapshot;

  @ApiProperty({ type: [ProductReview], description: 'Product reviews' })
  productReviews: ProductReview[];

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}

/**
 * Review stats for product (embedded in Product)
 */
export class ReviewStats {
  @ApiProperty({ description: 'Average rating (e.g., 4.9)' })
  averageRating: number;

  @ApiProperty({ description: 'Total visible review count' })
  reviewCount: number;
}

/**
 * Flattened product review for CMS (each product review is a separate row)
 */
export class CmsProductReview {
  @ApiProperty({ description: 'Review ID (order-level)' })
  reviewId: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID' })
  variantId?: string;

  @ApiProperty({ description: 'Product name (includes variant info)' })
  productName: string;

  @ApiPropertyOptional({ description: 'Product image URL' })
  productImage?: string;

  // Product review data
  @ApiProperty({ description: 'Rating (1-5 stars)', minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ description: 'Height in cm' })
  heightCm: number;

  @ApiProperty({ description: 'Weight in kg' })
  weightKg: number;

  @ApiProperty({ enum: FitLevel, description: 'Fit level' })
  fitLevel: FitLevel;

  @ApiPropertyOptional({ description: 'Review content' })
  content?: string;

  @ApiProperty({ type: [ReviewMedia], description: 'Media files (max 5)' })
  media: ReviewMedia[];

  @ApiProperty({ enum: ReviewStatus, description: 'Visibility status' })
  status: ReviewStatus;

  // Order info
  @ApiProperty({ description: 'Order number' })
  orderNumber: string;

  @ApiPropertyOptional({ type: Number, description: 'Nhanh.vn order ID' })
  nhanhOrderId?: number | null;

  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  // User info
  @ApiProperty({ description: 'User full name' })
  userName: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;
}
