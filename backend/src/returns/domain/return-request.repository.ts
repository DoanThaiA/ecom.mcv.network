import { PaginateResult } from 'mongoose';
import { ReturnRequest } from './return-request';

/**
 * Filter options for querying return requests
 */
export interface ReturnRequestFilters {
  status?: string;
  requestType?: string;
  orderNumber?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Abstract repository for return requests
 */
export abstract class ReturnRequestRepository {
  abstract create(
    returnRequest: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ReturnRequest>;

  abstract findById(id: string): Promise<ReturnRequest | null>;

  abstract findAll(
    filters?: ReturnRequestFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginateResult<ReturnRequest>>;

  abstract update(
    id: string,
    data: Partial<ReturnRequest>,
  ): Promise<ReturnRequest | null>;

  abstract delete(id: string): Promise<boolean>;
}
