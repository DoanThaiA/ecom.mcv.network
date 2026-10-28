import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ReviewsService } from '../../src/reviews/reviews.service';
import { ReviewRepository } from '../../src/reviews/domain/review.repository';
import { UserRepository } from '../../src/users/domain/user.repository';
import { OrderService } from '../../src/shop/order/order.service';
import { FilesService } from '../../src/files/files.service';
import { ProductRepository } from '../../src/products/domain/product.repository';
import { SystemTasksService } from '../../src/system-tasks/system-tasks.service';
import { Review } from '../../src/reviews/domain/review';
import { ReviewStatus } from '../../src/reviews/domain/review-status.enum';
import { FitLevel } from '../../src/reviews/domain/fit-level.enum';
import { MediaType } from '../../src/reviews/domain/media-type.enum';
import { OrderStatus } from '../../src/shop/order/domain/order.enums';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: jest.Mocked<ReviewRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let orderService: jest.Mocked<OrderService>;
  let filesService: jest.Mocked<FilesService>;
  let productRepository: jest.Mocked<ProductRepository>;
  let i18n: jest.Mocked<I18nService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-20260107-001',
    userId: 'user-123',
    status: OrderStatus.DELIVERED,
    items: [
      {
        productId: 'product-123',
        variantId: undefined,
        code: 'PROD-001',
        name: 'Test Product',
        price: 100000,
        quantity: 1,
      },
    ],
  };

  const mockReview: Review = {
    id: 'review-123',
    user: {
      userId: 'user-123',
      fullName: 'John Doe',
    },
    orderSnapshot: {
      orderId: 'order-123',
      orderNumber: 'ORD-20260107-001',
      orderDate: new Date('2026-01-07'),
    },
    productReviews: [
      {
        productId: 'product-123',
        variantId: undefined,
        productName: 'Test Product',
        productImage: 'http://example.com/test-product.jpg',
        quantity: 1,
        rating: 5,
        heightCm: 170,
        weightKg: 65,
        fitLevel: FitLevel.FIT,
        content: 'Great product!',
        media: [],
        status: ReviewStatus.VISIBLE,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockReviewRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrderId: jest.fn(),
      findByOrderNumber: jest.fn(),
      findByUserId: jest.fn(),
      findByProductId: jest.fn(),
      findAllFlattened: jest.fn(),
      findManyWithPagination: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      updateProductReviewStatus: jest.fn(),
      calculateProductStats: jest.fn().mockResolvedValue({
        averageRating: 0,
        reviewCount: 0,
      }),
    };

    const mockUserRepository = {
      findById: jest.fn(),
    };

    const mockOrderService = {
      getByOrderNumber: jest.fn(),
    };

    const mockFilesService = {
      findById: jest.fn(),
    };

    const mockProductRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      updateReviewStats: jest.fn().mockResolvedValue(undefined),
    };

    const mockSystemTasksService = {
      queueThumbnailGeneration: jest.fn().mockResolvedValue(undefined),
    };

    const mockI18n = {
      translate: jest.fn((key: string) => Promise.resolve(key)),
      t: jest.fn((key: string) => key),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'file.driver') return 'local';
        if (key === 'app.backendDomain') return 'http://localhost:3000';
        return null;
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'app.backendDomain') return 'http://localhost:3000';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewRepository, useValue: mockReviewRepository },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: OrderService, useValue: mockOrderService },
        { provide: FilesService, useValue: mockFilesService },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: SystemTasksService, useValue: mockSystemTasksService },
        { provide: I18nService, useValue: mockI18n },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get(ReviewRepository);
    userRepository = module.get(UserRepository);
    orderService = module.get(OrderService);
    filesService = module.get(FilesService);
    productRepository = module.get(ProductRepository);
    i18n = module.get(I18nService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create review successfully without media', async () => {
      const createDto = {
        orderNumber: 'ORD-20260107-001',
        productReviews: [
          {
            productId: 'product-123',
            variantId: undefined,
            rating: 5,
            content: 'Great product!',
            heightCm: 170,
            weightKg: 65,
            fitLevel: FitLevel.FIT,
            mediaIds: [],
          },
        ],
      };

      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      reviewRepository.findByOrderId.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);
      reviewRepository.create.mockResolvedValue(mockReview as any);
      reviewRepository.calculateProductStats.mockResolvedValue({
        averageRating: 5,
        reviewCount: 1,
      });

      const result = await service.createReview('user-123', createDto as any);

      expect(result).toEqual(mockReview);
      expect(orderService.getByOrderNumber).toHaveBeenCalledWith(
        'ORD-20260107-001',
      );
      expect(reviewRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            userId: 'user-123',
            fullName: 'John Doe',
          }),
          productReviews: expect.arrayContaining([
            expect.objectContaining({
              productId: 'product-123',
              rating: 5,
              content: 'Great product!',
              status: ReviewStatus.VISIBLE,
            }),
          ]),
        }),
      );
    });

    it('should create review with media', async () => {
      const mockFile = {
        id: '507f1f77bcf86cd799439011',
        path: '/uploads/review-image.jpg',
      };
      const createDto = {
        orderNumber: 'ORD-20260107-001',
        productReviews: [
          {
            productId: 'product-123',
            rating: 5,
            content: 'Great product!',
            heightCm: 170,
            weightKg: 65,
            fitLevel: FitLevel.FIT,
            mediaIds: ['507f1f77bcf86cd799439011'],
          },
        ],
      };

      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      reviewRepository.findByOrderId.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);
      filesService.findById.mockResolvedValue(mockFile as any);
      reviewRepository.create.mockResolvedValue(mockReview as any);

      const result = await service.createReview('user-123', createDto as any);

      expect(filesService.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockReview);
    });

    it('should handle video media type', async () => {
      const mockVideo = {
        id: '507f1f77bcf86cd799439022',
        path: '/uploads/review-video.mp4',
      };
      const createDto = {
        orderNumber: 'ORD-20260107-001',
        productReviews: [
          {
            productId: 'product-123',
            rating: 5,
            content: 'Great product!',
            heightCm: 170,
            weightKg: 65,
            fitLevel: FitLevel.FIT,
            mediaIds: ['507f1f77bcf86cd799439022'],
          },
        ],
      };

      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      reviewRepository.findByOrderId.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);
      filesService.findById.mockResolvedValue(mockVideo as any);
      reviewRepository.create.mockResolvedValue(mockReview as any);

      await service.createReview('user-123', createDto as any);

      expect(reviewRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productReviews: expect.arrayContaining([
            expect.objectContaining({
              media: expect.arrayContaining([
                expect.objectContaining({
                  type: MediaType.VIDEO,
                  url: expect.stringContaining('review-video.mp4'),
                }),
              ]),
            }),
          ]),
        }),
      );
    });

    it('should limit media to 5 items', async () => {
      const createDto = {
        orderNumber: 'ORD-20260107-001',
        productReviews: [
          {
            productId: 'product-123',
            rating: 5,
            content: 'Great product!',
            heightCm: 170,
            weightKg: 65,
            fitLevel: FitLevel.FIT,
            mediaIds: [
              '507f1f77bcf86cd799439011',
              '507f1f77bcf86cd799439022',
              '507f1f77bcf86cd799439033',
              '507f1f77bcf86cd799439044',
              '507f1f77bcf86cd799439055',
              '507f1f77bcf86cd799439066',
              '507f1f77bcf86cd799439077',
            ], // 7 items
          },
        ],
      };

      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      reviewRepository.findByOrderId.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);
      filesService.findById.mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        path: '/test.jpg',
      } as any);
      reviewRepository.create.mockResolvedValue(mockReview as any);

      await service.createReview('user-123', createDto as any);

      // Should only call findById 5 times (limited to 5)
      expect(filesService.findById).toHaveBeenCalledTimes(5);
    });

    it('should throw error when not all order items are reviewed', async () => {
      const orderWithTwoItems = {
        ...mockOrder,
        items: [
          ...mockOrder.items,
          {
            productId: 'product-456',
            code: 'PROD-002',
            name: 'Test Product 2',
            price: 50000,
            quantity: 1,
          },
        ],
      };
      const createDto = {
        orderNumber: 'ORD-20260107-001',
        productReviews: [
          {
            productId: 'product-123',
            rating: 5,
            content: 'Great product!',
            heightCm: 170,
            weightKg: 65,
            fitLevel: FitLevel.FIT,
          },
          // Missing review for product-456
        ],
      };

      orderService.getByOrderNumber.mockResolvedValue(orderWithTwoItems as any);
      reviewRepository.findByOrderId.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);

      await expect(
        service.createReview('user-123', createDto as any),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should throw error when order does not belong to user', async () => {
      const createDto = {
        orderNumber: 'ORD-20260107-001',
        productReviews: [],
      };

      const otherUserOrder = { ...mockOrder, userId: 'other-user' };
      orderService.getByOrderNumber.mockResolvedValue(otherUserOrder as any);

      await expect(
        service.createReview('user-123', createDto),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });

      expect(reviewRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when order is not delivered', async () => {
      const createDto = {
        orderNumber: 'ORD-20260107-001',
        productReviews: [],
      };

      const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
      orderService.getByOrderNumber.mockResolvedValue(pendingOrder as any);

      await expect(
        service.createReview('user-123', createDto),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });

      expect(reviewRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when order already reviewed', async () => {
      const createDto = {
        orderNumber: 'ORD-20260107-001',
        productReviews: [],
      };

      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      reviewRepository.findByOrderId.mockResolvedValue(mockReview as any);

      await expect(
        service.createReview('user-123', createDto),
      ).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });

      expect(reviewRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getReviewById', () => {
    it('should return review by id', async () => {
      reviewRepository.findById.mockResolvedValue(mockReview as any);

      const result = await service.getReviewById('review-123');

      expect(result).toEqual(mockReview);
      expect(reviewRepository.findById).toHaveBeenCalledWith('review-123');
    });

    it('should throw error when review not found', async () => {
      reviewRepository.findById.mockResolvedValue(null);

      await expect(service.getReviewById('non-existent')).rejects.toMatchObject(
        {
          status: HttpStatus.NOT_FOUND,
        },
      );
    });
  });

  describe('getReviewByOrderNumber', () => {
    it('should return review by order number', async () => {
      reviewRepository.findByOrderNumber.mockResolvedValue(mockReview as any);
      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);

      const result = await service.getReviewByOrderNumber(
        'ORD-20260107-001',
        'user-123',
      );

      expect(result).toEqual(mockReview);
      expect(orderService.getByOrderNumber).toHaveBeenCalledWith(
        'ORD-20260107-001',
      );
    });

    it('should throw error when no review exists for order', async () => {
      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      reviewRepository.findByOrderNumber.mockResolvedValue(null);

      await expect(
        service.getReviewByOrderNumber('ORD-20260107-001', 'user-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getUserReviews', () => {
    it('should return all reviews for a user', async () => {
      const mockUserReviews = [mockReview, { ...mockReview, id: 'review-456' }];
      reviewRepository.findByUserId.mockResolvedValue(mockUserReviews as any);

      const result = await service.getUserReviews('user-123');

      expect(result).toHaveLength(2);
      expect(reviewRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array when user has no reviews', async () => {
      reviewRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getUserReviews('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('checkOrderReviewed', () => {
    it('should return reviewed=true when order has review', async () => {
      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      reviewRepository.findByOrderNumber.mockResolvedValue(mockReview as any);

      const result = await service.checkOrderReviewed(
        'ORD-20260107-001',
        'user-123',
      );

      expect(result).toEqual({ reviewed: true });
      expect(orderService.getByOrderNumber).toHaveBeenCalledWith(
        'ORD-20260107-001',
      );
      expect(reviewRepository.findByOrderNumber).toHaveBeenCalledWith(
        'ORD-20260107-001',
      );
    });

    it('should return reviewed=false when order has no review', async () => {
      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      reviewRepository.findByOrderNumber.mockResolvedValue(null);

      const result = await service.checkOrderReviewed(
        'ORD-20260107-001',
        'user-123',
      );

      expect(result).toEqual({ reviewed: false });
    });

    it('should throw error when order does not belong to user', async () => {
      const otherUserOrder = { ...mockOrder, userId: 'other-user' };
      orderService.getByOrderNumber.mockResolvedValue(otherUserOrder as any);

      await expect(
        service.checkOrderReviewed('ORD-20260107-001', 'user-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw error when order has no userId', async () => {
      const guestOrder = { ...mockOrder, userId: null };
      orderService.getByOrderNumber.mockResolvedValue(guestOrder as any);

      await expect(
        service.checkOrderReviewed('ORD-20260107-001', 'user-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('getProductReviews', () => {
    it('should get product reviews with default pagination', async () => {
      const mockPaginateResult = {
        docs: [mockReview],
        totalDocs: 1,
        limit: 5,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
      };
      reviewRepository.findByProductId.mockResolvedValue(
        mockPaginateResult as any,
      );

      const result = await service.getProductReviews('product-123', {});

      expect(reviewRepository.findByProductId).toHaveBeenCalledWith(
        'product-123',
        { sortBy: 'newest' },
        1,
        5,
      );
      expect(result.docs).toHaveLength(1);
      expect(result.limit).toBe(5);
    });

    it('should apply custom pagination and sorting', async () => {
      const mockPaginateResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 2,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
      };
      reviewRepository.findByProductId.mockResolvedValue(
        mockPaginateResult as any,
      );

      await service.getProductReviews('product-123', {
        page: 2,
        limit: 10,
        sortBy: 'highest',
      });

      expect(reviewRepository.findByProductId).toHaveBeenCalledWith(
        'product-123',
        { sortBy: 'highest' },
        2,
        10,
      );
    });

    it('should filter productReviews to only include requested product', async () => {
      const reviewWithMultipleProducts = {
        ...mockReview,
        productReviews: [
          mockReview.productReviews[0]!,
          {
            ...mockReview.productReviews[0]!,
            productId: 'product-456',
            productName: 'Other Product',
          },
        ],
      };
      const mockPaginateResult = {
        docs: [reviewWithMultipleProducts],
        totalDocs: 1,
        limit: 5,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
        pagingCounter: 1,
      };
      reviewRepository.findByProductId.mockResolvedValue(
        mockPaginateResult as any,
      );

      const result = await service.getProductReviews('product-123', {});

      expect(result.docs[0]!.productReviews).toHaveLength(1);
      expect(result.docs[0]!.productReviews[0]!.productId).toBe('product-123');
    });
  });

  describe('getCmsReviews', () => {
    it('should get CMS reviews with default pagination', async () => {
      const mockCmsResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      reviewRepository.findAllFlattened.mockResolvedValue(mockCmsResult);

      const result = await service.getCmsReviews({});

      expect(reviewRepository.findAllFlattened).toHaveBeenCalledWith(
        {
          productId: undefined,
          status: undefined,
          rating: undefined,
          fitLevel: undefined,
          heightCm: undefined,
          weightKg: undefined,
          keyword: undefined,
          sortBy: undefined,
        },
        1,
        10,
      );
      expect(result).toEqual(mockCmsResult);
    });

    it('should apply all filters', async () => {
      const mockCmsResult = {
        data: [],
        total: 0,
        page: 2,
        limit: 20,
        totalPages: 0,
      };
      reviewRepository.findAllFlattened.mockResolvedValue(mockCmsResult);

      await service.getCmsReviews({
        productId: 'product-123',
        status: ReviewStatus.VISIBLE,
        rating: 5,
        fitLevel: FitLevel.FIT,
        heightCm: 170,
        weightKg: 65,
        keyword: 'great',
        sortBy: 'lowest',
        page: 2,
        limit: 20,
      });

      expect(reviewRepository.findAllFlattened).toHaveBeenCalledWith(
        {
          productId: 'product-123',
          status: ReviewStatus.VISIBLE,
          rating: 5,
          fitLevel: FitLevel.FIT,
          heightCm: 170,
          weightKg: 65,
          keyword: 'great',
          sortBy: 'lowest',
        },
        2,
        20,
      );
    });
  });

  describe('toggleProductVisibility', () => {
    it('should toggle product review from VISIBLE to HIDDEN', async () => {
      reviewRepository.findById.mockResolvedValue(mockReview as any);
      const updatedReview = {
        ...mockReview,
        productReviews: [
          { ...mockReview.productReviews[0]!, status: ReviewStatus.HIDDEN },
        ],
      };
      reviewRepository.updateProductReviewStatus.mockResolvedValue(
        updatedReview as any,
      );
      reviewRepository.calculateProductStats.mockResolvedValue({
        averageRating: 4.5,
        reviewCount: 10,
      });

      const result = await service.toggleProductVisibility(
        'review-123',
        'product-123',
      );

      expect(reviewRepository.updateProductReviewStatus).toHaveBeenCalledWith(
        'review-123',
        'product-123',
        ReviewStatus.HIDDEN,
      );
      expect(result).toEqual(updatedReview);
    });

    it('should toggle product review from HIDDEN to VISIBLE', async () => {
      const hiddenReview = {
        ...mockReview,
        productReviews: [
          { ...mockReview.productReviews[0]!, status: ReviewStatus.HIDDEN },
        ],
      };
      reviewRepository.findById.mockResolvedValue(hiddenReview as any);
      const updatedReview = {
        ...hiddenReview,
        productReviews: [
          { ...hiddenReview.productReviews[0]!, status: ReviewStatus.VISIBLE },
        ],
      };
      reviewRepository.updateProductReviewStatus.mockResolvedValue(
        updatedReview as any,
      );

      const result = await service.toggleProductVisibility(
        'review-123',
        'product-123',
      );

      expect(reviewRepository.updateProductReviewStatus).toHaveBeenCalledWith(
        'review-123',
        'product-123',
        ReviewStatus.VISIBLE,
      );
      expect(result).toEqual(updatedReview);
    });

    it('should set explicit visibility to VISIBLE', async () => {
      reviewRepository.findById.mockResolvedValue(mockReview as any);
      const updatedReview = {
        ...mockReview,
        productReviews: [
          { ...mockReview.productReviews[0]!, status: ReviewStatus.VISIBLE },
        ],
      };
      reviewRepository.updateProductReviewStatus.mockResolvedValue(
        updatedReview as any,
      );

      const result = await service.toggleProductVisibility(
        'review-123',
        'product-123',
        true,
      );

      expect(reviewRepository.updateProductReviewStatus).toHaveBeenCalledWith(
        'review-123',
        'product-123',
        ReviewStatus.VISIBLE,
      );
    });

    it('should set explicit visibility to HIDDEN', async () => {
      reviewRepository.findById.mockResolvedValue(mockReview as any);
      const updatedReview = {
        ...mockReview,
        productReviews: [
          { ...mockReview.productReviews[0]!, status: ReviewStatus.HIDDEN },
        ],
      };
      reviewRepository.updateProductReviewStatus.mockResolvedValue(
        updatedReview as any,
      );

      const result = await service.toggleProductVisibility(
        'review-123',
        'product-123',
        false,
      );

      expect(reviewRepository.updateProductReviewStatus).toHaveBeenCalledWith(
        'review-123',
        'product-123',
        ReviewStatus.HIDDEN,
      );
    });

    it('should throw error when review not found', async () => {
      reviewRepository.findById.mockResolvedValue(null);

      await expect(
        service.toggleProductVisibility('nonexistent', 'product-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when product review not found in review', async () => {
      reviewRepository.findById.mockResolvedValue(mockReview as any);

      await expect(
        service.toggleProductVisibility('review-123', 'nonexistent-product'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw error when update fails', async () => {
      reviewRepository.findById.mockResolvedValue(mockReview as any);
      reviewRepository.updateProductReviewStatus.mockResolvedValue(null);

      await expect(
        service.toggleProductVisibility('review-123', 'product-123'),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });
});
