import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { AuditLogRepository } from '../domain/audit-log.repository';
import { AuditLog } from '../domain/audit-log';
import { AuditLogSchemaClass } from './audit-log.schema';
import { AuditLogMapper } from './audit-log.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { FilterAuditLogDto } from '../dto/query-audit-log.dto';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of AuditLogRepository
 */
@Injectable()
export class AuditLogDocumentRepository implements AuditLogRepository {
  constructor(
    @InjectModel(AuditLogSchemaClass.name)
    private readonly auditLogModel: PaginateModel<AuditLogSchemaClass>,
  ) {}

  /**
   * Create a new audit log entry
   */
  async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const now = new Date();
    const persistenceModel = AuditLogMapper.toDocument({
      ...data,
      createdAt: now,
    } as unknown as AuditLog);

    const createdAuditLog = new this.auditLogModel(persistenceModel);
    const auditLogDocument = await createdAuditLog.save();
    const leanAuditLog = auditLogDocument.toObject();
    return AuditLogMapper.toDomain(leanAuditLog);
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
    const filter: FilterQuery<AuditLogSchemaClass> = {};

    if (filterOptions) {
      // Filter by action
      if (filterOptions.action) {
        filter.action = filterOptions.action;
      }

      // Filter by category
      if (filterOptions.category) {
        filter.category = filterOptions.category;
      }

      // Filter by userId
      if (filterOptions.userId) {
        filter.userId = filterOptions.userId;
      }

      // Filter by userType
      if (filterOptions.userType) {
        filter.userType = filterOptions.userType;
      }

      // Filter by status
      if (filterOptions.status) {
        filter.status = filterOptions.status;
      }

      // Filter by date range
      if (filterOptions.startDate || filterOptions.endDate) {
        filter.createdAt = {};
        if (filterOptions.startDate) {
          filter.createdAt.$gte = filterOptions.startDate;
        }
        if (filterOptions.endDate) {
          filter.createdAt.$lte = filterOptions.endDate;
        }
      }

      // Search by action or description
      if (filterOptions.search) {
        filter.$or = [
          { action: { $regex: escapeRegex(filterOptions.search), $options: 'i' } },
          { description: { $regex: escapeRegex(filterOptions.search), $options: 'i' } },
        ];
      }
    }

    const result = await this.auditLogModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => AuditLogMapper.toDomain(doc)),
    };
  }

  /**
   * Find audit log by ID
   */
  async findById(id: AuditLog['id']): Promise<NullableType<AuditLog>> {
    const auditLogDocument = await this.auditLogModel.findById(id).lean();

    return auditLogDocument ? AuditLogMapper.toDomain(auditLogDocument) : null;
  }

  /**
   * Find audit logs by user ID
   */
  async findByUserId(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<PaginateResult<AuditLog>> {
    const result = await this.auditLogModel.paginate(
      { userId },
      {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        sort: { createdAt: -1 },
        lean: true,
      },
    );

    return {
      ...result,
      docs: result.docs.map((doc) => AuditLogMapper.toDomain(doc)),
    };
  }

  /**
   * Find audit logs by action
   */
  async findByAction(
    action: string,
    paginationOptions: IPaginationOptions,
  ): Promise<PaginateResult<AuditLog>> {
    const result = await this.auditLogModel.paginate(
      { action },
      {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        sort: { createdAt: -1 },
        lean: true,
      },
    );

    return {
      ...result,
      docs: result.docs.map((doc) => AuditLogMapper.toDomain(doc)),
    };
  }
}
