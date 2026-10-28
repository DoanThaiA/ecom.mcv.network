import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { stripHtml } from '../utils/sanitize';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult, Types } from 'mongoose';
import { ReviewRepository } from './domain/review.repository';
import {
  Review,
  ProductReview,
  ReviewMedia,
  CmsProductReview,
} from './domain/review';
import { ReviewStatus } from './domain/review-status.enum';
import { MediaType } from './domain/media-type.enum';
import {
  CreateReviewDto,
  CreateProductReviewDto,
} from './dto/create-review.dto';
import {
  CreateCmsReviewDto,
  CreateCmsProductReviewDto,
} from './dto/create-cms-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { throwException } from '../utils/errors/throw-exception';
import { UserRepository } from '../users/domain/user.repository';
import { OrderService } from '../shop/order/order.service';
import { OrderStatus } from '../shop/order/domain/order.enums';
import { FilesService } from '../files/files.service';
import { ProductRepository } from '../products/domain/product.repository';
import { AllConfigType } from '../config/config.type';
import { SystemTasksService } from '../system-tasks/system-tasks.service';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly userRepository: UserRepository,
    private readonly orderService: OrderService,
    private readonly filesService: FilesService,
    private readonly productRepository: ProductRepository,
    private readonly systemTasksService: SystemTasksService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  /**
   * Helper to construct full URL for files
   */
  private _getFullImageUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const fileDriver = this.configService.get('file.driver', { infer: true });

    if (fileDriver === 'local') {
      const backendDomain = this.configService.getOrThrow('app.backendDomain', {
        infer: true,
      });
      return `${backendDomain}${path}`;
    } else if (fileDriver === 's3' || fileDriver === 's3-presigned') {
      const bucket = this.configService.get('file.awsDefaultS3Bucket', {
        infer: true,
      });
      const region = this.configService.get('file.awsS3Region', {
        infer: true,
      });
      return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
    }

    return path;
  }

  /**
   * Determine media type from file path/url
   */
  private _getMediaType(path: string): MediaType {
    const lower = path.toLowerCase();
    if (
      lower.endsWith('.mp4') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.webm')
    ) {
      return MediaType.VIDEO;
    }
    return MediaType.IMAGE;
  }

  /**
   * Create review for an order
   */
  async createReview(userId: string, dto: CreateReviewDto): Promise<Review> {
    // 1. Fetch order
    const order = await this.orderService.getByOrderNumber(dto.orderNumber);

    // 2. Validate order belongs to user
    if (!order.userId || order.userId !== userId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: await this.i18n.translate('shop.review.notYourOrder'),
      });
    }

    // 3. Validate order is DELIVERED
    if (order.status !== OrderStatus.DELIVERED) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: await this.i18n.translate('shop.review.orderNotCompleted'),
      });
    }

    // 4. Check not already reviewed
    const existingReview = await this.reviewRepository.findByOrderId(order.id);
    if (existingReview) {
      throwException({
        status: HttpStatus.CONFLICT,
        message: await this.i18n.translate('shop.review.alreadyReviewed'),
      });
    }

    // 5. Fetch user info
    const user = await this.userRepository.findById(userId);

    // 6. Build product reviews from order items
    const productReviews: ProductReview[] = [];

    for (const dtoReview of dto.productReviews) {
      // Find matching order item
      const orderItem = order.items.find(
        (item) =>
          item.productId === dtoReview.productId &&
          (!dtoReview.variantId || item.variantId === dtoReview.variantId),
      );

      if (!orderItem) {
        this.logger.warn(
          `Product ${dtoReview.productId} not found in order ${order.orderNumber}`,
        );
        continue;
      }

      // Resolve media URLs
      const media: ReviewMedia[] = [];
      if (dtoReview.mediaIds && dtoReview.mediaIds.length > 0) {
        try {
          // Filter out invalid ObjectIds
          const validMediaIds = dtoReview.mediaIds
            .slice(0, 5)
            .filter((id) => Types.ObjectId.isValid(id));

          const files = await Promise.all(
            validMediaIds.map((id) => this.filesService.findById(id)),
          );
          for (const file of files) {
            if (file?.path) {
              const url: string = this._getFullImageUrl(file.path);
              media.push({
                url,
                type: this._getMediaType(file.path),
                thumbnail: undefined, // TODO: Generate video thumbnails
              });
            }
          }
        } catch (error) {
          this.logger.warn('Failed to resolve media URLs:', error);
        }
      }

      productReviews.push({
        productId: orderItem.productId,
        variantId: orderItem.variantId ?? undefined,
        productName: orderItem.name,
        productImage: orderItem.image ?? undefined,
        quantity: orderItem.quantity,
        rating: dtoReview.rating,
        heightCm: dtoReview.heightCm,
        weightKg: dtoReview.weightKg,
        fitLevel: Number(dtoReview.fitLevel),
        content: dtoReview.content ? stripHtml(dtoReview.content) : undefined,
        media,
        status: ReviewStatus.VISIBLE, // Default to visible
      });
    }

    // 7. Validate all products reviewed
    if (productReviews.length !== order.items.length) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: await this.i18n.translate('shop.review.incompleteReview'),
      });
    }

    // 8. Create review
    const review = await this.reviewRepository.create({
      user: {
        userId,
        fullName:
          `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
          'Anonymous',
      },
      orderSnapshot: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        nhanhOrderId: order.nhanh?.orderId ?? null,
        orderDate: order.createdAt,
      },
      productReviews,
    });

    this.logger.log(
      `Review created for order ${order.orderNumber} by user ${userId}`,
    );

    // 9. Update product review stats (async, don't block response)
    void this._updateProductStatsAsync(
      productReviews.map((pr) => pr.productId),
    );

    // 10. Queue thumbnail generation for video media (async)
    void this._queueThumbnailJobs(review);

    return review;
  }

  /**
   * Tạo review seeding từ CMS (không cần order thực)
   *
   * Chức năng:
   * - Cho phép admin tạo review để seeding sản phẩm
   * - Không yêu cầu order thực, tạo fake orderSnapshot
   * - Lấy thông tin product từ database
   * - Cập nhật product stats sau khi tạo
   *
   * @param dto - Dữ liệu tạo review từ CMS
   * @returns Review đã tạo
   */
  async createCmsReview(dto: CreateCmsReviewDto): Promise<Review> {
    const productReviews: ProductReview[] = [];

    // 1. Build product reviews từ DTO
    for (const dtoReview of dto.productReviews) {
      // Lấy thông tin product từ database
      const product = await this.productRepository.findById(
        dtoReview.productId,
      );
      if (!product) {
        this.logger.warn(
          `Product ${dtoReview.productId} not found, skipping...`,
        );
        continue;
      }

      // Lấy variant name nếu có
      let productName: string = product.name;
      let productImage: string | undefined =
        product.images?.avatar ?? undefined;

      if (dtoReview.variantId && product.variants) {
        const variant = product.variants.find(
          (v) => v.id === dtoReview.variantId,
        );
        if (variant) {
          // Tạo tên sản phẩm với variant info từ attributes
          const variantParts: string[] = [];
          if (variant.attributes) {
            for (const attr of variant.attributes) {
              if (attr.value) {
                variantParts.push(attr.value);
              }
            }
          }
          if (variantParts.length > 0) {
            productName = `${product.name} - ${variantParts.join(' - ')}`;
          }
          // Sử dụng ảnh variant nếu có
          if (variant.images?.avatar) {
            productImage = variant.images.avatar;
          }
        }
      }

      // Resolve media URLs
      const media: ReviewMedia[] = [];
      if (dtoReview.mediaIds && dtoReview.mediaIds.length > 0) {
        try {
          const validMediaIds: string[] = dtoReview.mediaIds
            .slice(0, 5)
            .filter((id) => Types.ObjectId.isValid(id));

          const files = await Promise.all(
            validMediaIds.map((id) => this.filesService.findById(id)),
          );
          for (const file of files) {
            if (file?.path) {
              const url: string = this._getFullImageUrl(file.path);
              media.push({
                url,
                type: this._getMediaType(file.path),
                thumbnail: undefined,
              });
            }
          }
        } catch (error) {
          this.logger.warn('Failed to resolve media URLs:', error);
        }
      }

      productReviews.push({
        productId: dtoReview.productId,
        variantId: dtoReview.variantId ?? undefined,
        productName,
        productImage,
        quantity: 1, // Default quantity cho seeding
        rating: dtoReview.rating,
        heightCm: dtoReview.heightCm,
        weightKg: dtoReview.weightKg,
        fitLevel: Number(dtoReview.fitLevel),
        content: dtoReview.content ? stripHtml(dtoReview.content) : undefined,
        media,
        status: ReviewStatus.VISIBLE,
      });
    }

    // 2. Validate có ít nhất 1 product review hợp lệ
    if (productReviews.length === 0) {
      throwException({
        status: HttpStatus.BAD_REQUEST,
        message: await this.i18n.translate('shop.review.noValidProducts'),
      });
    }

    // 3. Tạo fake orderSnapshot cho seeding review
    // Sử dụng valid ObjectId thay vì string để tránh lỗi MongoDB validation
    const fakeUserId: Types.ObjectId = new Types.ObjectId();
    const fakeOrderId: Types.ObjectId = new Types.ObjectId();
    const randomSuffix: string = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    const seedingOrderNumber: string = `SEED-${randomSuffix}-${Date.now()}`;

    // 4. Tạo review
    const review: Review = await this.reviewRepository.create({
      user: {
        userId: fakeUserId.toString(),
        fullName: dto.userName,
      },
      orderSnapshot: {
        orderId: fakeOrderId.toString(),
        orderNumber: seedingOrderNumber,
        nhanhOrderId: null,
        orderDate: new Date(),
      },
      productReviews,
    });

    this.logger.log(
      `CMS seeding review created: ${review.id} by "${dto.userName}" for ${productReviews.length} product(s)`,
    );

    // 5. Update product stats (async)
    void this._updateProductStatsAsync(
      productReviews.map((pr) => pr.productId),
    );

    // 6. Queue thumbnail generation for video media (async)
    void this._queueThumbnailJobs(review);

    return review;
  }

  /**
   * Update product review stats asynchronously
   */
  private async _updateProductStatsAsync(productIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(productIds)];

    for (const productId of uniqueIds) {
      try {
        const stats =
          await this.reviewRepository.calculateProductStats(productId);
        await this.productRepository.updateReviewStats(productId, stats);
        this.logger.debug(
          `Product ${productId} reviewStats updated: ${stats.averageRating} avg, ${stats.reviewCount} reviews`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update stats for product ${productId}:`,
          error,
        );
      }
    }
  }

  /**
   * Queue thumbnail generation tasks for video media in a review
   * Runs asynchronously, does not block the response
   */
  private async _queueThumbnailJobs(review: Review): Promise<void> {
    for (let pIdx = 0; pIdx < review.productReviews.length; pIdx++) {
      const pr = review.productReviews[pIdx];
      for (let mIdx = 0; mIdx < pr.media.length; mIdx++) {
        const media = pr.media[mIdx];
        if (media.type === MediaType.VIDEO) {
          try {
            const videoKey = this._extractS3Key(media.url);
            await this.systemTasksService.queueThumbnailGeneration({
              reviewId: review.id,
              productIndex: pIdx,
              mediaIndex: mIdx,
              videoUrl: media.url,
              videoKey,
            });
            this.logger.debug(
              `Queued thumbnail task for review ${review.id}, product ${pIdx}, media ${mIdx}`,
            );
          } catch (error) {
            this.logger.warn(
              `Failed to queue thumbnail task for review ${review.id}: ${error.message}`,
            );
          }
        }
      }
    }
  }

  /**
   * Extract S3 key from full URL or return path as-is for local files
   */
  private _extractS3Key(url: string): string {
    // For S3 URLs: https://bucket.s3.region.amazonaws.com/key
    const s3Match = url.match(/\.s3\.[^/]+\.amazonaws\.com\/(.+)$/);
    if (s3Match) {
      return s3Match[1];
    }
    // For local URLs, extract the path after /api/v1/
    const localMatch = url.match(/\/api\/v1\/(.+)$/);
    if (localMatch) {
      return localMatch[1];
    }
    // Return as-is if no pattern matches
    return url;
  }

  /**
   * Check if order is already reviewed
   */
  async checkOrderReviewed(
    orderNumber: string,
    userId: string,
  ): Promise<{ reviewed: boolean }> {
    const order = await this.orderService.getByOrderNumber(orderNumber);

    // Validate ownership
    if (!order.userId || order.userId !== userId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: await this.i18n.translate('shop.review.notYourOrder'),
      });
    }

    const review = await this.reviewRepository.findByOrderNumber(orderNumber);
    return { reviewed: !!review };
  }

  /**
   * Get review by order number (for read-only view)
   */
  async getReviewByOrderNumber(
    orderNumber: string,
    userId: string,
  ): Promise<Review> {
    const order = await this.orderService.getByOrderNumber(orderNumber);

    // Validate ownership
    if (!order.userId || order.userId !== userId) {
      throwException({
        status: HttpStatus.FORBIDDEN,
        message: await this.i18n.translate('shop.review.notYourOrder'),
      });
    }

    const review = await this.reviewRepository.findByOrderNumber(orderNumber);
    if (!review) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: await this.i18n.translate('shop.review.notFound'),
      });
    }

    return review;
  }

  /**
   * Get all reviews by a specific user
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    return this.reviewRepository.findByUserId(userId);
  }

  /**
   * Get reviews for product page (public)
   */
  async getProductReviews(
    productId: string,
    query: QueryReviewDto,
  ): Promise<PaginateResult<Review>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5; // Default 5 reviews per page

    const result = await this.reviewRepository.findByProductId(
      productId,
      {
        sortBy: query.sortBy ?? 'newest',
      },
      page,
      limit,
    );
    // Filter productReviews to only include the requested product with visible status
    // MongoDB query chỉ filter document level, cần filter thêm ở đây để loại bỏ hidden reviews
    const filteredDocs = result.docs
      .map((review) => ({
        ...review,
        productReviews: review.productReviews.filter(
          (pr) =>
            pr.productId === productId && pr.status === ReviewStatus.VISIBLE,
        ),
      }))
      .filter((review) => review.productReviews.length > 0);

    return {
      ...result,
      docs: filteredDocs,
    };
  }

  /**
   * Get all reviews for CMS (flattened - each product review is a separate row)
   * Uses MongoDB aggregation for performance
   */
  async getCmsReviews(query: QueryReviewDto): Promise<{
    data: CmsProductReview[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    // Use aggregation-based flattening (efficient at DB level)
    return this.reviewRepository.findAllFlattened(
      {
        productId: query.productId,
        status: query.status,
        rating: query.rating,
        fitLevel: query.fitLevel,
        heightCm: query.heightCm,
        weightKg: query.weightKg,
        keyword: query.keyword,
        sortBy: query.sortBy,
      },
      page,
      limit,
    );
  }

  /**
   * Get review by ID (CMS)
   */
  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: await this.i18n.translate('shop.review.notFound'),
      });
    }
    return review;
  }

  /**
   * Toggle product review visibility (CMS)
   * @param reviewId - Review ID
   * @param productId - Product ID to toggle visibility for
   * @param visible - Optional explicit visibility state
   */
  async toggleProductVisibility(
    reviewId: string,
    productId: string,
    visible?: boolean,
  ): Promise<Review> {
    const existing = await this.reviewRepository.findById(reviewId);
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: await this.i18n.translate('shop.review.notFound'),
      });
    }

    // Find product review within this review
    const productReview = existing.productReviews.find(
      (pr) => pr.productId === productId,
    );
    if (!productReview) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: await this.i18n.translate('shop.review.notFound'),
      });
    }

    const newStatus =
      visible !== undefined
        ? visible
          ? ReviewStatus.VISIBLE
          : ReviewStatus.HIDDEN
        : productReview.status === ReviewStatus.VISIBLE
          ? ReviewStatus.HIDDEN
          : ReviewStatus.VISIBLE;

    // Use repository method to update specific product review status
    const updated = await this.reviewRepository.updateProductReviewStatus(
      reviewId,
      productId,
      newStatus,
    );

    if (!updated) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: await this.i18n.translate('common.updateFailed'),
      });
    }

    this.logger.log(
      `ProductReview ${productId} in review ${reviewId} visibility changed to ${newStatus}`,
    );

    // Update product stats for this product
    void this._updateProductStatsAsync([productId]);

    return updated;
  }
}
