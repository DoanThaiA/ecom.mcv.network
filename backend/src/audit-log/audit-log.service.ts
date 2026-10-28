import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from './domain/audit-log.repository';
import { AuditLog } from './domain/audit-log';
import { AuditLogStatus } from './domain/audit-log-status.enum';
import { FilterAuditLogDto } from './dto/query-audit-log.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { PaginateResult } from 'mongoose';
import { NullableType } from '../utils/types/nullable.type';

/**
 * Input for creating an audit log entry
 */
export interface CreateAuditLogInput {
  action: string;
  category?: string;
  description?: string;
  userId?: string | null;
  userEmail?: string | null;
  userType: 'cms' | 'system';
  status: AuditLogStatus;
  httpMethod?: string;
  endpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: {
    message: string;
    name?: string;
    stack?: string;
  };
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Service for managing audit logs
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * Create a new audit log entry
   * This method is async but designed to be fire-and-forget
   */
  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    return this.auditLogRepository.create({
      action: input.action,
      category: input.category ?? null,
      description: input.description ?? null,
      userId: input.userId ?? null,
      userEmail: input.userEmail ?? null,
      userType: input.userType,
      status: input.status,
      httpMethod: input.httpMethod ?? null,
      endpoint: input.endpoint ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      requestId: input.requestId ?? null,
      input: input.input ?? null,
      output: input.output ?? null,
      error: input.error ?? null,
      durationMs: input.durationMs ?? null,
      metadata: input.metadata ?? null,
    });
  }

  /**
   * Find audit logs with filtering and pagination
   */
  async findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterAuditLogDto | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<AuditLog>> {
    return this.auditLogRepository.findManyWithPagination({
      filterOptions,
      paginationOptions,
    });
  }

  /**
   * Find audit log by ID
   */
  async findById(id: string): Promise<NullableType<AuditLog>> {
    return this.auditLogRepository.findById(id);
  }

  /**
   * Find audit logs by user ID
   */
  async findByUserId(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<PaginateResult<AuditLog>> {
    return this.auditLogRepository.findByUserId(userId, paginationOptions);
  }

  /**
   * Find audit logs by action
   */
  async findByAction(
    action: string,
    paginationOptions: IPaginationOptions,
  ): Promise<PaginateResult<AuditLog>> {
    return this.auditLogRepository.findByAction(action, paginationOptions);
  }
}
