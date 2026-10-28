import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult, Types } from 'mongoose';
import {
  ReviewRepository,
  ReviewQueryOptions,
} from '../domain/review.repository';
import { Review } from '../domain/review';
import { ReviewSchemaClass, ReviewDocument } from './review.schema';
import { ReviewMapper } from './review.mapper';
import { ReviewStatus } from '../domain/review-status.enum';

@Injectable()
export class ReviewRepositoryImpl extends ReviewRepository {
  constructor(
    @InjectModel(ReviewSchemaClass.name)
    private readonly reviewModel: Model<ReviewDocument> &
      PaginateModel<ReviewDocument>,
  ) {
    super();
  }

  async create(
    data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Review> {
    const persistenceData = ReviewMapper.toPersistence(data);
    const created = await this.reviewModel.create(persistenceData);
    return ReviewMapper.toDomain(created);
  }

  async findById(id: string): Promise<Review | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.reviewModel.findById(id).lean().exec();
    return doc ? ReviewMapper.toDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<Review | null> {
    if (!Types.ObjectId.isValid(orderId)) return null;
    const doc = await this.reviewModel
      .findOne({ 'orderSnapshot.orderId': new Types.ObjectId(orderId) })
      .lean()
      .exec();
    return doc ? ReviewMapper.toDomain(doc) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Review | null> {
    const doc = await this.reviewModel
      .findOne({ 'orderSnapshot.orderNumber': orderNumber })
      .lean()
      .exec();
    return doc ? ReviewMapper.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Review[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const docs = await this.reviewModel
      .find({ 'user.userId': new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map((doc) => ReviewMapper.toDomain(doc));
  }

  async findByProductId(
    productId: string,
    options: ReviewQueryOptions,
    page: number,
    limit: number,
  ): Promise<PaginateResult<Review>> {
    if (!Types.ObjectId.isValid(productId)) {
      return {
        docs: [],
        totalDocs: 0,
        limit,
        page,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
        pagingCounter: 1,
        offset: 0,
      };
    }

    const query: any = {
      'productReviews.productId': new Types.ObjectId(productId),
      'productReviews.status': ReviewStatus.VISIBLE, // Only show visible product reviews
    };

    // Build sort
    let sort: any = { createdAt: -1 }; // default: newest
    if (options.sortBy === 'highest') {
      sort = { 'productReviews.rating': -1, createdAt: -1 };
    } else if (options.sortBy === 'lowest') {
      sort = { 'productReviews.rating': 1, createdAt: -1 };
    }

    const result = await this.reviewModel.paginate(query, {
      page,
      limit,
      sort,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ReviewMapper.toDomain(doc)),
    };
  }

  async findAll(
    options: ReviewQueryOptions,
    page: number,
    limit: number,
  ): Promise<PaginateResult<Review>> {
    const query: any = {};

    // Status filter (now at productReviews level)
    if (options.status) {
      query['productReviews.status'] = options.status;
    }

    // Rating filter
    if (options.rating) {
      query['productReviews.rating'] = options.rating;
    }

    // Fit level filter
    if (options.fitLevel != null) {
      query['productReviews.fitLevel'] = options.fitLevel;
    }

    // Height filter
    if (options.heightCm) {
      query['productReviews.heightCm'] = options.heightCm;
    }

    // Weight filter
    if (options.weightKg) {
      query['productReviews.weightKg'] = options.weightKg;
    }

    // Product ID filter
    if (options.productId && Types.ObjectId.isValid(options.productId)) {
      query['productReviews.productId'] = new Types.ObjectId(options.productId);
    }

    // Keyword search using regex $or for better matching
    if (options.keyword) {
      const regex = new RegExp(options.keyword, 'i');
      query.$or = [
        { 'orderSnapshot.orderNumber': regex },
        { 'orderSnapshot.nhanhOrderId': Number(options.keyword) || -1 },
        { 'productReviews.productName': regex },
        { 'productReviews.content': regex },
      ];
    }

    const result = await this.reviewModel.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ReviewMapper.toDomain(doc)),
    };
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.reviewModel.findByIdAndDelete(id).lean().exec();
    return !!result;
  }

  async getProductIdsFromReview(reviewId: string): Promise<string[]> {
    if (!Types.ObjectId.isValid(reviewId)) return [];

    const doc = await this.reviewModel.findById(reviewId).lean().exec();
    if (!doc) return [];

    return doc.productReviews.map((pr) => pr.productId.toString());
  }

  async calculateProductStats(
    productId: string,
  ): Promise<{ averageRating: number; reviewCount: number }> {
    if (!Types.ObjectId.isValid(productId)) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const pipeline = [
      // Match reviews containing this product
      {
        $match: {
          'productReviews.productId': new Types.ObjectId(productId),
        },
      },
      // Unwind to get individual product reviews
      { $unwind: '$productReviews' },
      // Filter only matching product AND visible status
      {
        $match: {
          'productReviews.productId': new Types.ObjectId(productId),
          'productReviews.status': ReviewStatus.VISIBLE,
        },
      },
      // Calculate stats
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$productReviews.rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ];

    const result = await this.reviewModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: result[0].reviewCount,
    };
  }

  /**
   * Update status of a specific product review within a review
   * Uses MongoDB positional operator to update specific array element
   */
  async updateProductReviewStatus(
    reviewId: string,
    productId: string,
    status: ReviewStatus,
  ): Promise<Review | null> {
    if (
      !Types.ObjectId.isValid(reviewId) ||
      !Types.ObjectId.isValid(productId)
    ) {
      return null;
    }

    const updated = await this.reviewModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(reviewId),
          'productReviews.productId': new Types.ObjectId(productId),
        },
        {
          $set: {
            'productReviews.$.status': status,
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();

    return updated ? ReviewMapper.toDomain(updated) : null;
  }

  /**
   * Find all product reviews flattened using aggregation pipeline
   * Each product review becomes a separate document
   */
  async findAllFlattened(
    options: ReviewQueryOptions,
    page: number,
    limit: number,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const matchStage: any = {};

    // Pre-unwind keyword search (search at order level)
    if (options.keyword) {
      const regex = new RegExp(options.keyword, 'i');
      const numericKeyword = Number(options.keyword);
      matchStage.$or = [
        { 'orderSnapshot.orderNumber': regex },
        ...(Number.isFinite(numericKeyword)
          ? [{ 'orderSnapshot.nhanhOrderId': numericKeyword }]
          : []),
        { 'productReviews.productName': regex },
        { 'productReviews.content': regex },
      ];
    }

    // Post-unwind filters (filter at product review level)
    const postUnwindMatch: any = {};

    // Keyword search after unwind (filter individual product reviews)
    if (options.keyword) {
      const regex = new RegExp(options.keyword, 'i');
      const numericKeyword = Number(options.keyword);
      postUnwindMatch.$or = [
        { 'orderSnapshot.orderNumber': regex },
        ...(Number.isFinite(numericKeyword)
          ? [{ 'orderSnapshot.nhanhOrderId': numericKeyword }]
          : []),
        { 'productReview.productName': regex },
        { 'productReview.content': regex },
      ];
    }

    if (options.status) {
      postUnwindMatch['productReview.status'] = options.status;
    }
    if (options.rating) {
      postUnwindMatch['productReview.rating'] = options.rating;
    }
    if (options.fitLevel != null) {
      postUnwindMatch['productReview.fitLevel'] = options.fitLevel;
    }
    if (options.heightCm) {
      postUnwindMatch['productReview.heightCm'] = options.heightCm;
    }
    if (options.weightKg) {
      postUnwindMatch['productReview.weightKg'] = options.weightKg;
    }
    if (options.productId && Types.ObjectId.isValid(options.productId)) {
      postUnwindMatch['productReview.productId'] = new Types.ObjectId(
        options.productId,
      );
    }

    // Build sort
    let sortStage: any = { createdAt: -1 };
    if (options.sortBy === 'highest') {
      sortStage = { 'productReview.rating': -1, createdAt: -1 };
    } else if (options.sortBy === 'lowest') {
      sortStage = { 'productReview.rating': 1, createdAt: -1 };
    }

    const pipeline: any[] = [
      // Match pre-unwind filters
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      // Unwind product reviews
      { $unwind: '$productReviews' },
      // Rename for clarity
      {
        $addFields: {
          productReview: '$productReviews',
        },
      },
      // Match post-unwind filters
      ...(Object.keys(postUnwindMatch).length > 0
        ? [{ $match: postUnwindMatch }]
        : []),
      // Sort
      { $sort: sortStage },
      // Project to CmsProductReview shape
      {
        $project: {
          _id: 0,
          reviewId: { $toString: '$_id' },
          productId: { $toString: '$productReview.productId' },
          variantId: {
            $cond: {
              if: '$productReview.variantId',
              then: { $toString: '$productReview.variantId' },
              else: null,
            },
          },
          productName: '$productReview.productName',
          productImage: '$productReview.productImage',
          rating: '$productReview.rating',
          heightCm: '$productReview.heightCm',
          weightKg: '$productReview.weightKg',
          fitLevel: '$productReview.fitLevel',
          content: '$productReview.content',
          media: '$productReview.media',
          status: '$productReview.status',
          orderNumber: '$orderSnapshot.orderNumber',
          nhanhOrderId: '$orderSnapshot.nhanhOrderId',
          userName: '$user.fullName',
          createdAt: '$createdAt',
          orderId: { $toString: '$orderSnapshot.orderId' },
        },
      },
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.reviewModel.aggregate(countPipeline).exec();
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    const data = await this.reviewModel.aggregate(pipeline).exec();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update thumbnail URL for a specific media item in a product review
   * Uses MongoDB positional syntax with array indices
   */
  async updateMediaThumbnail(
    reviewId: string,
    productIndex: number,
    mediaIndex: number,
    thumbnailUrl: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(reviewId)) return false;

    const fieldPath = `productReviews.${productIndex}.media.${mediaIndex}.thumbnail`;

    const result = await this.reviewModel.updateOne(
      { _id: new Types.ObjectId(reviewId) },
      {
        $set: {
          [fieldPath]: thumbnailUrl,
          updatedAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  }
}
