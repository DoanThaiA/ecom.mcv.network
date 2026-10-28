import {
  Review,
  ProductReview,
  ReviewMedia,
  ReviewUser,
  ReviewOrderSnapshot,
} from '../domain/review';
import { ReviewSchemaClass } from './review.schema';

/**
 * Map MongoDB document to domain entity
 */
export class ReviewMapper {
  static toDomain(raw: ReviewSchemaClass): Review {
    const review = new Review();

    review.id = raw._id.toString();

    review.user = {
      userId: raw.user.userId.toString(),
      fullName: raw.user.fullName,
    };

    review.orderSnapshot = {
      orderId: raw.orderSnapshot.orderId.toString(),
      orderNumber: raw.orderSnapshot.orderNumber,
      nhanhOrderId: raw.orderSnapshot.nhanhOrderId ?? null,
      orderDate: raw.orderSnapshot.orderDate,
    };

    review.productReviews = (raw.productReviews || []).map((pr) => {
      const productReview = new ProductReview();
      productReview.productId = pr.productId.toString();
      productReview.variantId = pr.variantId?.toString();
      productReview.productName = pr.productName;
      productReview.productImage = pr.productImage;
      productReview.quantity = pr.quantity;
      productReview.rating = pr.rating;
      productReview.heightCm = pr.heightCm;
      productReview.weightKg = pr.weightKg;
      productReview.fitLevel = pr.fitLevel;
      productReview.content = pr.content;
      productReview.media = (pr.media || []).map((m) => ({
        url: m.url,
        type: m.type,
        thumbnail: m.thumbnail,
      }));
      productReview.status = (pr as any).status;
      return productReview;
    });

    review.createdAt = raw.createdAt;
    review.updatedAt = raw.updatedAt;

    return review;
  }

  /**
   * Map domain entity to persistence (for create)
   */
  static toPersistence(
    review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>,
  ): Partial<ReviewSchemaClass> {
    return {
      user: {
        userId: review.user.userId as any,
        fullName: review.user.fullName,
      },
      orderSnapshot: {
        orderId: review.orderSnapshot.orderId as any,
        orderNumber: review.orderSnapshot.orderNumber,
        nhanhOrderId: review.orderSnapshot.nhanhOrderId ?? undefined,
        orderDate: review.orderSnapshot.orderDate,
      },
      productReviews: review.productReviews.map((pr) => ({
        productId: pr.productId as any,
        variantId: pr.variantId as any,
        productName: pr.productName,
        productImage: pr.productImage,
        quantity: pr.quantity,
        rating: pr.rating,
        heightCm: pr.heightCm,
        weightKg: pr.weightKg,
        fitLevel: pr.fitLevel,
        content: pr.content,
        media: pr.media,
        status: pr.status,
      })),
    } as Partial<ReviewSchemaClass>;
  }
}
