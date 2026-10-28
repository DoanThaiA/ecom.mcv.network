import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { AuditLog } from './audit-log';
import { FilterAuditLogDto } from '../dto/query-audit-log.dto';
import { PaginateResult } from 'mongoose';

/**
 * Abstract repository interface for AuditLog entity
 * Defines the contract for audit log data access operations
 */
export abstract class AuditLogRepository {
  /**
   * Create a new audit log entry
   * @param data - Audit log data
   * @returns Created audit log
   */
  abstract create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;

  /**
   * Find audit logs with filtering and pagination
   * @param filterOptions - Filter options
   * @param paginationOptions - Pagination options
   * @returns Paginated result with audit logs
   */
  abstract findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterAuditLogDto | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<AuditLog>>;

  /**
   * Find audit log by ID
   * @param id - Audit log ID
   * @returns Audit log or null if not found
   */
  abstract findById(id: AuditLog['id']): Promise<NullableType<AuditLog>>;

  /**
   * Find audit logs by user ID
   * @param userId - User ID
   * @param paginationOptions - Pagination options
   * @returns Paginated result with audit logs
   */
  abstract findByUserId(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<PaginateResult<AuditLog>>;

  /**
   * Find audit logs by action
   * @param action - Action identifier
   * @param paginationOptions - Pagination options
   * @returns Paginated result with audit logs
   */
  abstract findByAction(
    action: string,
    paginationOptions: IPaginationOptions,
  ): Promise<PaginateResult<AuditLog>>;
}
