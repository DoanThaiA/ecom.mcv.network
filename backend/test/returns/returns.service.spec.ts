import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ReturnsService } from '../../src/returns/returns.service';
import { ReturnRequestRepository } from '../../src/returns/domain/return-request.repository';
import { UserRepository } from '../../src/users/domain/user.repository';
import { OrderService } from '../../src/shop/order/order.service';
import { FilesService } from '../../src/files/files.service';
import { ReturnRequest } from '../../src/returns/domain/return-request';
import { ReturnRequestStatus } from '../../src/returns/domain/return-request-status.enum';
import { ReturnRequestType } from '../../src/returns/domain/return-request-type.enum';
import { ReturnReason } from '../../src/returns/domain/return-reason.enum';

describe('ReturnsService', () => {
  let service: ReturnsService;
  let returnRequestRepository: jest.Mocked<ReturnRequestRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let orderService: jest.Mocked<OrderService>;
  let filesService: jest.Mocked<FilesService>;
  let i18n: jest.Mocked<I18nService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    phone: '0901234567',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockOrder = {
    id: 'order-123',
    orderNumber: 'ORD-20260107-001',
    userId: 'user-123',
    total: 500000,
    customer: {
      name: 'John Doe',
      phone: '0901234567',
      email: 'test@example.com',
    },
    shippingAddress: {
      address: '123 Test St',
      ward: 'Ward 1',
      district: 'District 1',
      city: 'Ho Chi Minh',
    },
    items: [
      {
        productId: 'product-123',
        variantId: null,
        code: 'PROD-001',
        name: 'Test Product',
        image: 'http://example.com/image.jpg',
        price: 500000,
        quantity: 1,
      },
    ],
  };

  const mockReturnRequest: ReturnRequest = {
    id: 'return-123',
    userId: 'user-123',
    customer: {
      name: 'John Doe',
      phone: '0901234567',
      email: 'test@example.com',
      address: '123 Test St, Ward 1, District 1, Ho Chi Minh',
    },
    orderSnapshot: {
      orderId: 'order-123',
      orderNumber: 'ORD-20260107-001',
      orderAmount: 500000,
      items: [
        {
          productId: 'product-123',
          code: 'PROD-001',
          name: 'Test Product',
          price: 500000,
          quantity: 1,
        },
      ],
    },
    requestType: ReturnRequestType.RETURN,
    returnReasons: [ReturnReason.DEFECTIVE],
    status: ReturnRequestStatus.PENDING,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ReturnRequest;

  beforeEach(async () => {
    const mockReturnRequestRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

    const mockI18n = {
      t: jest.fn((key: string) => key),
      translate: jest.fn((key: string) => Promise.resolve(key)),
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
        ReturnsService,
        {
          provide: ReturnRequestRepository,
          useValue: mockReturnRequestRepository,
        },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: OrderService, useValue: mockOrderService },
        { provide: FilesService, useValue: mockFilesService },
        { provide: I18nService, useValue: mockI18n },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ReturnsService>(ReturnsService);
    returnRequestRepository = module.get(ReturnRequestRepository);
    userRepository = module.get(UserRepository);
    orderService = module.get(OrderService);
    filesService = module.get(FilesService);
    i18n = module.get(I18nService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReturnRequest', () => {
    const createDto = {
      orderNumber: 'ORD-20260107-001',
      requestType: ReturnRequestType.RETURN,
      returnReasons: [ReturnReason.DEFECTIVE],
      imageIds: [],
    };

    it('should create return request successfully', async () => {
      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      returnRequestRepository.create.mockResolvedValue(mockReturnRequest);

      const result = await service.createReturnRequest('user-123', createDto);

      expect(result).toEqual(mockReturnRequest);
      expect(orderService.getByOrderNumber).toHaveBeenCalledWith(
        'ORD-20260107-001',
      );
      expect(userRepository.findById).toHaveBeenCalledWith('user-123');
      expect(returnRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          requestType: ReturnRequestType.RETURN,
          status: ReturnRequestStatus.PENDING,
        }),
      );
    });

    it('should throw error when order does not belong to user', async () => {
      const otherUserOrder = { ...mockOrder, userId: 'other-user' };
      orderService.getByOrderNumber.mockResolvedValue(otherUserOrder as any);

      await expect(
        service.createReturnRequest('user-123', createDto),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });

      expect(returnRequestRepository.create).not.toHaveBeenCalled();
    });

    it('should resolve image URLs from file IDs', async () => {
      const dtoWithImages = {
        ...createDto,
        imageIds: ['file-1', 'file-2'],
      };

      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      filesService.findById.mockImplementation((id: string) =>
        Promise.resolve({
          id,
          path: `/uploads/${id}.jpg`,
        } as any),
      );
      returnRequestRepository.create.mockResolvedValue(mockReturnRequest);

      await service.createReturnRequest('user-123', dtoWithImages);

      expect(filesService.findById).toHaveBeenCalledTimes(2);
      expect(returnRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          images: [
            'http://localhost:3000/uploads/file-1.jpg',
            'http://localhost:3000/uploads/file-2.jpg',
          ],
        }),
      );
    });

    it('should handle missing images gracefully', async () => {
      const dtoWithImages = {
        ...createDto,
        imageIds: ['file-1', 'file-2'],
      };

      orderService.getByOrderNumber.mockResolvedValue(mockOrder as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      filesService.findById.mockResolvedValue(null);
      returnRequestRepository.create.mockResolvedValue(mockReturnRequest);

      await service.createReturnRequest('user-123', dtoWithImages);

      expect(returnRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          images: [],
        }),
      );
    });
  });

  describe('getReturnRequests', () => {
    it('should return paginated return requests', async () => {
      const paginatedResult = {
        docs: [mockReturnRequest],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };
      returnRequestRepository.findAll.mockResolvedValue(paginatedResult as any);

      const result = await service.getReturnRequests({ page: 1, limit: 10 });

      expect(result).toEqual(paginatedResult);
      expect(returnRequestRepository.findAll).toHaveBeenCalledWith({}, 1, 10);
    });

    it('should use default pagination values', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
      };
      returnRequestRepository.findAll.mockResolvedValue(paginatedResult as any);

      await service.getReturnRequests({});

      expect(returnRequestRepository.findAll).toHaveBeenCalledWith({}, 1, 10);
    });
  });

  describe('getMyReturnRequests', () => {
    it('should return user-specific return requests', async () => {
      const paginatedResult = {
        docs: [mockReturnRequest],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };
      returnRequestRepository.findAll.mockResolvedValue(paginatedResult as any);

      const result = await service.getMyReturnRequests('user-123', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(paginatedResult);
      expect(returnRequestRepository.findAll).toHaveBeenCalledWith(
        { userId: 'user-123' },
        1,
        10,
      );
    });
  });

  describe('getReturnRequestById', () => {
    it('should return return request by id', async () => {
      returnRequestRepository.findById.mockResolvedValue(mockReturnRequest);

      const result = await service.getReturnRequestById('return-123');

      expect(result).toEqual(mockReturnRequest);
      expect(returnRequestRepository.findById).toHaveBeenCalledWith(
        'return-123',
      );
    });

    it('should throw error when return request not found', async () => {
      returnRequestRepository.findById.mockResolvedValue(null);

      await expect(
        service.getReturnRequestById('non-existent'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('updateReturnRequest', () => {
    const updateDto = {
      status: ReturnRequestStatus.APPROVED,
    };

    it('should update return request successfully', async () => {
      const updatedRequest = { ...mockReturnRequest, ...updateDto };
      returnRequestRepository.findById.mockResolvedValue(mockReturnRequest);
      returnRequestRepository.update.mockResolvedValue(updatedRequest);

      const result = await service.updateReturnRequest('return-123', updateDto);

      expect(result).toEqual(updatedRequest);
      expect(returnRequestRepository.update).toHaveBeenCalledWith(
        'return-123',
        updateDto,
      );
    });

    it('should throw error when return request not found', async () => {
      returnRequestRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateReturnRequest('non-existent', updateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });

      expect(returnRequestRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      returnRequestRepository.findById.mockResolvedValue(mockReturnRequest);
      returnRequestRepository.update.mockResolvedValue(null);

      await expect(
        service.updateReturnRequest('return-123', updateDto),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('deleteReturnRequest', () => {
    it('should delete return request successfully', async () => {
      returnRequestRepository.delete.mockResolvedValue(true);

      await service.deleteReturnRequest('return-123');

      expect(returnRequestRepository.delete).toHaveBeenCalledWith('return-123');
    });

    it('should throw error when return request not found', async () => {
      returnRequestRepository.delete.mockResolvedValue(false);

      await expect(
        service.deleteReturnRequest('non-existent'),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });
});
