import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import {
  ReturnRequestRepository,
  ReturnRequestFilters,
} from '../domain/return-request.repository';
import { ReturnRequest } from '../domain/return-request';
import {
  ReturnRequestSchemaClass,
  ReturnRequestDocument,
} from './return-request.schema';
import { ReturnRequestMapper } from './return-request.mapper';
import { escapeRegex } from '../../utils/search';

@Injectable()
export class ReturnRequestRepositoryImpl extends ReturnRequestRepository {
  constructor(
    @InjectModel(ReturnRequestSchemaClass.name)
    private readonly model: PaginateModel<ReturnRequestDocument>,
  ) {
    super();
  }

  async create(
    data: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ReturnRequest> {
    const doc = ReturnRequestMapper.toDocument(data);
    const created = await this.model.create(doc);
    return ReturnRequestMapper.toDomain(created);
  }

  async findById(id: string): Promise<ReturnRequest | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? ReturnRequestMapper.toDomain(doc) : null;
  }

  async findAll(
    filters?: ReturnRequestFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginateResult<ReturnRequest>> {
    const query: any = {};

    if (filters) {
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.requestType) {
        query.requestType = filters.requestType;
      }

      if (filters.userId) {
        query.userId = filters.userId;
      }

      if (filters.orderNumber) {
        query['orderSnapshot.orderNumber'] = {
          $regex: escapeRegex(filters.orderNumber),
          $options: 'i',
        };
      }

      // Date range filter
      if (filters.fromDate || filters.toDate) {
        query.createdAt = {};
        if (filters.fromDate) {
          query.createdAt.$gte = new Date(filters.fromDate);
        }
        if (filters.toDate) {
          query.createdAt.$lte = new Date(filters.toDate);
        }
      }
    }

    const result = await this.model.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ReturnRequestMapper.toDomain(doc)),
    };
  }

  async update(
    id: string,
    data: Partial<ReturnRequest>,
  ): Promise<ReturnRequest | null> {
    const doc = await this.model
      .findByIdAndUpdate(
        id,
        { $set: data, updatedAt: new Date() },
        { new: true },
      )
      .exec();
    return doc ? ReturnRequestMapper.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
