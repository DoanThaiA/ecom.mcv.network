import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, PaginateModel } from 'mongoose';
import {
  WithdrawalRequestRepository,
  WithdrawalRequestFilter,
} from '../domain/withdrawal-request.repository';
import {
  WithdrawalRequest,
  WithdrawalRequestStatus,
} from '../domain/withdrawal-request';
import { WithdrawalRequestSchemaClass } from './withdrawal-request.schema';
import { WithdrawalRequestMapper } from './withdrawal-request.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { escapeRegex } from '../../utils/search';

@Injectable()
export class WithdrawalRequestDocumentRepository
  implements WithdrawalRequestRepository
{
  constructor(
    @InjectModel(WithdrawalRequestSchemaClass.name)
    private readonly model: PaginateModel<WithdrawalRequestSchemaClass>,
  ) {}

  async create(
    data: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WithdrawalRequest> {
    const doc = WithdrawalRequestMapper.toDocument({
      ...data,
      id: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = new this.model(doc);
    const saved = await created.save();
    return WithdrawalRequestMapper.toDomain(saved.toObject());
  }

  async findById(id: string): Promise<NullableType<WithdrawalRequest>> {
    const doc = await this.model
      .findById(new mongoose.Types.ObjectId(id))
      .lean();
    return doc ? WithdrawalRequestMapper.toDomain(doc) : null;
  }

  async findMany(options: {
    paginationOptions: IPaginationOptions;
    filter?: WithdrawalRequestFilter;
  }): Promise<{
    docs: WithdrawalRequest[];
    totalDocs: number;
    totalPages: number;
    hasNextPage: boolean;
    page: number;
    limit: number;
  }> {
    const { paginationOptions, filter } = options;
    const query: FilterQuery<WithdrawalRequestSchemaClass> = {};

    if (filter?.status) {
      query.status = filter.status;
    }

    if (filter?.affiliateId) {
      query.affiliateId = new mongoose.Types.ObjectId(filter.affiliateId);
    }

    if (filter?.search) {
      query.agentName = { $regex: escapeRegex(filter.search), $options: 'i' };
    }

    const result = await this.model.paginate(query, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    return {
      docs: result.docs.map((doc) => WithdrawalRequestMapper.toDomain(doc)),
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      page: result.page ?? paginationOptions.page,
      limit: result.limit,
    };
  }

  async sumWithdrawnByAffiliate(affiliateId: string): Promise<number> {
    const results = await this.model.aggregate([
      {
        $match: {
          affiliateId: new mongoose.Types.ObjectId(affiliateId),
          status: {
            $in: [
              WithdrawalRequestStatus.paid,
              WithdrawalRequestStatus.approved,
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return results.length > 0 ? results[0].total : 0;
  }

  async sumPendingByAffiliate(affiliateId: string): Promise<number> {
    const results = await this.model.aggregate([
      {
        $match: {
          affiliateId: new mongoose.Types.ObjectId(affiliateId),
          status: WithdrawalRequestStatus.pending,
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return results.length > 0 ? results[0].total : 0;
  }

  async updateStatus(
    id: string,
    status: WithdrawalRequestStatus,
    extra?: {
      processedBy?: string;
      rejectionReason?: string;
      processedDate?: Date;
    },
  ): Promise<NullableType<WithdrawalRequest>> {
    const update: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (extra?.processedBy !== undefined) {
      update.processedBy = extra.processedBy;
    }
    if (extra?.rejectionReason !== undefined) {
      update.rejectionReason = extra.rejectionReason;
    }
    if (extra?.processedDate !== undefined) {
      update.processedDate = extra.processedDate;
    }

    const doc = await this.model
      .findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        { $set: update },
        { new: true },
      )
      .lean();

    return doc ? WithdrawalRequestMapper.toDomain(doc) : null;
  }
}
