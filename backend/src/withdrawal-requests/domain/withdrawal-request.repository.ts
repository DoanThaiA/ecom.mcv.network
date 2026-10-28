import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import type {
  WithdrawalRequest,
  WithdrawalRequestStatus,
} from './withdrawal-request';

export interface WithdrawalRequestFilter {
  status?: WithdrawalRequestStatus;
  affiliateId?: string;
  search?: string;
}

export abstract class WithdrawalRequestRepository {
  abstract create(
    data: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WithdrawalRequest>;

  abstract findById(id: string): Promise<NullableType<WithdrawalRequest>>;

  abstract findMany(options: {
    paginationOptions: IPaginationOptions;
    filter?: WithdrawalRequestFilter;
  }): Promise<{
    docs: WithdrawalRequest[];
    totalDocs: number;
    totalPages: number;
    hasNextPage: boolean;
    page: number;
    limit: number;
  }>;

  abstract updateStatus(
    id: string,
    status: WithdrawalRequestStatus,
    extra?: {
      processedBy?: string;
      rejectionReason?: string;
      processedDate?: Date;
    },
  ): Promise<NullableType<WithdrawalRequest>>;

  /**
   * Sum total withdrawn amount for an affiliate (paid + approved statuses)
   */
  abstract sumWithdrawnByAffiliate(affiliateId: string): Promise<number>;

  /**
   * Sum pending commission amount for an affiliate (pending status only)
   */
  abstract sumPendingByAffiliate(affiliateId: string): Promise<number>;
}
