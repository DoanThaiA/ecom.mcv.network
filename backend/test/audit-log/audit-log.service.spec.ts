import { Test, TestingModule } from '@nestjs/testing';
import {
  AuditLogService,
  CreateAuditLogInput,
} from '../../src/audit-log/audit-log.service';
import { AuditLogRepository } from '../../src/audit-log/domain/audit-log.repository';
import { AuditLog } from '../../src/audit-log/domain/audit-log';
import { AuditLogStatus } from '../../src/audit-log/domain/audit-log-status.enum';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let auditLogRepository: jest.Mocked<AuditLogRepository>;

  const mockAuditLog: AuditLog = {
    id: 'audit-123',
    action: 'user.login',
    category: 'authentication',
    description: 'User logged in successfully',
    userId: 'user-123',
    userEmail: 'test@example.com',
    userType: 'cms',
    status: AuditLogStatus.SUCCESS,
    httpMethod: 'POST',
    endpoint: '/auth/login',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    requestId: 'req-123',
    input: { email: 'test@example.com' },
    output: { token: 'jwt-token' },
    error: null,
    durationMs: 150,
    metadata: { source: 'web' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AuditLog;

  beforeEach(async () => {
    const mockAuditLogRepository = {
      create: jest.fn(),
      findManyWithPagination: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: AuditLogRepository, useValue: mockAuditLogRepository },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    auditLogRepository = module.get(AuditLogRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const fullInput: CreateAuditLogInput = {
      action: 'user.login',
      category: 'authentication',
      description: 'User logged in successfully',
      userId: 'user-123',
      userEmail: 'test@example.com',
      userType: 'cms',
      status: AuditLogStatus.SUCCESS,
      httpMethod: 'POST',
      endpoint: '/auth/login',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      requestId: 'req-123',
      input: { email: 'test@example.com' },
      output: { token: 'jwt-token' },
      error: undefined,
      durationMs: 150,
      metadata: { source: 'web' },
    };

    it('should create audit log with full input', async () => {
      auditLogRepository.create.mockResolvedValue(mockAuditLog);

      const result = await service.create(fullInput);

      expect(result).toEqual(mockAuditLog);
      expect(auditLogRepository.create).toHaveBeenCalledTimes(1);
      expect(auditLogRepository.create).toHaveBeenCalledWith({
        action: 'user.login',
        category: 'authentication',
        description: 'User logged in successfully',
        userId: 'user-123',
        userEmail: 'test@example.com',
        userType: 'cms',
        status: AuditLogStatus.SUCCESS,
        httpMethod: 'POST',
        endpoint: '/auth/login',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        requestId: 'req-123',
        input: { email: 'test@example.com' },
        output: { token: 'jwt-token' },
        error: null,
        durationMs: 150,
        metadata: { source: 'web' },
      });
    });

    it('should create audit log with minimal input and null defaults', async () => {
      const minimalInput: CreateAuditLogInput = {
        action: 'system.task',
        userType: 'system',
        status: AuditLogStatus.SUCCESS,
      };

      const minimalAuditLog: AuditLog = {
        ...mockAuditLog,
        action: 'system.task',
        userType: 'system' as const,
        category: null,
        description: null,
        userId: null,
        userEmail: null,
      };

      auditLogRepository.create.mockResolvedValue(minimalAuditLog);

      const result = await service.create(minimalInput);

      expect(result).toEqual(minimalAuditLog);
      expect(auditLogRepository.create).toHaveBeenCalledWith({
        action: 'system.task',
        category: null,
        description: null,
        userId: null,
        userEmail: null,
        userType: 'system',
        status: AuditLogStatus.SUCCESS,
        httpMethod: null,
        endpoint: null,
        ipAddress: null,
        userAgent: null,
        requestId: null,
        input: null,
        output: null,
        error: null,
        durationMs: null,
        metadata: null,
      });
    });

    it('should create audit log with error information', async () => {
      const inputWithError: CreateAuditLogInput = {
        action: 'user.login.failed',
        userType: 'cms',
        status: AuditLogStatus.FAILURE,
        error: {
          message: 'Invalid credentials',
          name: 'UnauthorizedError',
          stack: 'Error: Invalid credentials\n    at ...',
        },
      };

      auditLogRepository.create.mockResolvedValue(mockAuditLog);

      await service.create(inputWithError);

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            message: 'Invalid credentials',
            name: 'UnauthorizedError',
            stack: 'Error: Invalid credentials\n    at ...',
          },
          status: AuditLogStatus.FAILURE,
        }),
      );
    });

    it('should handle system user type', async () => {
      const systemInput: CreateAuditLogInput = {
        action: 'cron.sync',
        userType: 'system',
        status: AuditLogStatus.SUCCESS,
        description: 'Automated sync completed',
      };

      auditLogRepository.create.mockResolvedValue(mockAuditLog);

      await service.create(systemInput);

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userType: 'system',
          action: 'cron.sync',
        }),
      );
    });

    it('should handle CMS user type', async () => {
      const cmsInput: CreateAuditLogInput = {
        action: 'product.create',
        userType: 'cms',
        status: AuditLogStatus.SUCCESS,
        userId: 'cms-user-123',
        userEmail: 'admin@example.com',
      };

      auditLogRepository.create.mockResolvedValue(mockAuditLog);

      await service.create(cmsInput);

      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userType: 'cms',
          userId: 'cms-user-123',
          userEmail: 'admin@example.com',
        }),
      );
    });
  });

  describe('findManyWithPagination', () => {
    it('should return paginated audit logs', async () => {
      const paginatedResult = {
        docs: [mockAuditLog],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };

      auditLogRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      const result = await service.findManyWithPagination({
        filterOptions: {},
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(result).toEqual(paginatedResult);
      expect(auditLogRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: {},
        paginationOptions: { page: 1, limit: 10 },
      });
    });

    it('should handle filter options', async () => {
      const filterOptions = {
        action: 'user.login',
        status: AuditLogStatus.SUCCESS,
      };

      const paginatedResult = {
        docs: [mockAuditLog],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };

      auditLogRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.findManyWithPagination({
        filterOptions,
        paginationOptions: { page: 1, limit: 10 },
      });

      expect(auditLogRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions,
        paginationOptions: { page: 1, limit: 10 },
      });
    });

    it('should handle null filter options', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
      };

      auditLogRepository.findManyWithPagination.mockResolvedValue(
        paginatedResult as any,
      );

      await service.findManyWithPagination({
        filterOptions: null,
        paginationOptions: { page: 1, limit: 20 },
      });

      expect(auditLogRepository.findManyWithPagination).toHaveBeenCalledWith({
        filterOptions: null,
        paginationOptions: { page: 1, limit: 20 },
      });
    });
  });

  describe('findById', () => {
    it('should return audit log by id', async () => {
      auditLogRepository.findById.mockResolvedValue(mockAuditLog);

      const result = await service.findById('audit-123');

      expect(result).toEqual(mockAuditLog);
      expect(auditLogRepository.findById).toHaveBeenCalledWith('audit-123');
    });

    it('should return null when audit log not found', async () => {
      auditLogRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
      expect(auditLogRepository.findById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('findByUserId', () => {
    it('should return audit logs by user id', async () => {
      const paginatedResult = {
        docs: [mockAuditLog],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };

      auditLogRepository.findByUserId.mockResolvedValue(paginatedResult as any);

      const result = await service.findByUserId('user-123', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(paginatedResult);
      expect(auditLogRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        page: 1,
        limit: 10,
      });
    });

    it('should handle different pagination options', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 50,
        page: 2,
        totalPages: 0,
      };

      auditLogRepository.findByUserId.mockResolvedValue(paginatedResult as any);

      await service.findByUserId('user-456', { page: 2, limit: 50 });

      expect(auditLogRepository.findByUserId).toHaveBeenCalledWith('user-456', {
        page: 2,
        limit: 50,
      });
    });
  });

  describe('findByAction', () => {
    it('should return audit logs by action', async () => {
      const paginatedResult = {
        docs: [mockAuditLog],
        totalDocs: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
      };

      auditLogRepository.findByAction.mockResolvedValue(paginatedResult as any);

      const result = await service.findByAction('user.login', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(paginatedResult);
      expect(auditLogRepository.findByAction).toHaveBeenCalledWith(
        'user.login',
        { page: 1, limit: 10 },
      );
    });

    it('should handle different actions', async () => {
      const paginatedResult = {
        docs: [],
        totalDocs: 0,
        limit: 20,
        page: 1,
        totalPages: 0,
      };

      auditLogRepository.findByAction.mockResolvedValue(paginatedResult as any);

      await service.findByAction('product.create', { page: 1, limit: 20 });

      expect(auditLogRepository.findByAction).toHaveBeenCalledWith(
        'product.create',
        { page: 1, limit: 20 },
      );
    });
  });
});
