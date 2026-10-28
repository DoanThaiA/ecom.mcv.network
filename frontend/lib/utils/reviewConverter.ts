import type {
  Review as GeneratedReview,
  CreateReviewDto,
  CreateProductReviewDto,
  FitLevel,
} from '@/types/gen/shared/shared/reviews/review';
import { MediaType } from '@/types/gen/shared/shared/reviews/review';

// Helper type for star rating (1-5)
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

// Frontend Review interface (flattened from generated Review for easier use)
export interface FrontendReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  rating: ReviewRating;
  comment?: string;
  height?: number;
  weight?: number;
  productFit?: FitLevel;
  images?: FrontendReviewMedia[];
  createdAt: string;
  updatedAt?: string;
  isVerifiedPurchase: boolean;
  orderId?: string;
  orderNumber?: string;
  quantity?: number;
}

// Frontend Review Media interface
export interface FrontendReviewMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

type ReviewMediaType = MediaType | FrontendReviewMedia['type'];

function normalizeReviewMediaType(
  type: ReviewMediaType
): FrontendReviewMedia['type'] {
  return type === MediaType.MEDIA_TYPE_IMAGE || type === 'image'
    ? 'image'
    : 'video';
}

// Review Status (for tracking which products have been reviewed)
export interface ReviewStatus {
  productId: string;
  variantId?: string;
  hasReview: boolean;
  reviewId?: string;
}

// Create Review Payload (frontend format)
export interface CreateReviewPayload {
  orderNumber: string;
  productId: string;
  variantId?: string | null;
  rating: ReviewRating;
  comment?: string;
  height?: number;
  weight?: number;
  productFit?: FitLevel;
  images?: string[]; // File IDs
  onSuccess?: () => void;
}

/**
 * Convert generated Review (from API) to frontend Review format (flattened)
 * API returns nested structure, we flatten it for easier frontend use
 */
export function convertGeneratedReviewToFrontend(
  generatedReview: GeneratedReview
): FrontendReview[] {
  const reviews: FrontendReview[] = [];

  // Extract user info
  const userId = generatedReview.user?.userId || '';
  const userName = generatedReview.user?.fullName || '';

  // Extract order info
  const orderId = generatedReview.orderSnapshot?.orderId;
  const orderNumber = generatedReview.orderSnapshot?.orderNumber || '';

  // Flatten each product review into separate Review objects
  for (const productReview of generatedReview.productReviews || []) {
    reviews.push({
      id: generatedReview.id,
      userId,
      userName,
      productId: productReview.productId,
      productName: productReview.productName,
      productImage: productReview.productImage,
      variantId: productReview.variantId,
      rating: productReview.rating as ReviewRating,
      comment: productReview.content,
      height: productReview.heightCm,
      weight: productReview.weightKg,
      productFit: productReview.fitLevel,
      images: productReview.media.map((m) => ({
        id: "", // Media doesn't have ID in generated type
        url: m.url,
        type: normalizeReviewMediaType(m.type),
        thumbnail: m.thumbnail,
      })),
      createdAt:
        typeof generatedReview.createdAt === "string"
          ? generatedReview.createdAt
          : generatedReview.createdAt?.toISOString() ||
            new Date().toISOString(),
      updatedAt:
        typeof generatedReview.updatedAt === "string"
          ? generatedReview.updatedAt
          : generatedReview.updatedAt?.toISOString(),
      isVerifiedPurchase: true, // All order-based reviews are verified purchases
      orderId,
      orderNumber,
      quantity: productReview.quantity,
    });
  }

  return reviews;
}

/**
 * Convert CreateReviewPayload (frontend format) to CreateReviewDto (API format)
 */
export function convertPayloadToDto(
  payload: Omit<CreateReviewPayload, 'onSuccess'>
): CreateReviewDto {
  const productReview: CreateProductReviewDto = {
    productId: payload.productId,
    variantId: payload.variantId || undefined,
    rating: payload.rating,
    heightCm: payload.height || 0,
    weightKg: payload.weight || 0,
    fitLevel: payload.productFit || 0,
    content: payload.comment || undefined,
    mediaIds: payload.images || [],
  };

  return {
    orderNumber: payload.orderNumber,
    productReviews: [productReview],
  };
}

/**
 * Convert multiple review payloads to batch CreateReviewDto (API format)
 * Used when submitting reviews for multiple products in a single order
 */
export function convertPayloadsToBatchDto(
  orderNumber: string,
  payloads: Array<Omit<CreateReviewPayload, 'onSuccess' | 'orderNumber'>>
): CreateReviewDto {
  const productReviews: CreateProductReviewDto[] = payloads.map((payload) => ({
    productId: payload.productId,
    variantId: payload.variantId || undefined,
    rating: payload.rating,
    heightCm: payload.height || 0,
    weightKg: payload.weight || 0,
    fitLevel: payload.productFit || 0,
    content: payload.comment || undefined,
    mediaIds: payload.images || [],
  }));

  return {
    orderNumber,
    productReviews,
  };
}
