import type {
  WithdrawalRequest,
  QueryWithdrawalRequestsResponse,
  WithdrawalRequestTabCounts,
  WithdrawalRequestFilters,
  WithdrawalRequestSort,
} from 'src/types/withdrawal-request';
import {
  WithdrawalRequestMessage,
  QueryWithdrawalRequestsResponseMessage,
} from 'src/types/withdrawal-request';
import axiosInstance from 'src/utils/axios';

interface GetWithdrawalRequestsParams {
  page: number;
  limit: number;
  filters?: WithdrawalRequestFilters;
  sort?: WithdrawalRequestSort;
}

/**
 * Withdrawal Request Repository
 * Handles all withdrawal request-related API calls
 */
class WithdrawalRequestRepository {
  /**
   * Get withdrawal requests with filters, sorting, and pagination
   */
  getWithdrawalRequests = async (
    params: GetWithdrawalRequestsParams
  ): Promise<QueryWithdrawalRequestsResponse> => {
    const { page = 1, limit = 10, filters } = params;

    // Build query params
    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };

    if (filters) {
      // Map tab to status
      if (filters.tab && filters.tab !== 'all') {
        queryParams.status = filters.tab;
      }

      // Map status directly if specified
      if (filters.status) {
        queryParams.status = filters.status;
      }

      // Search by agent name
      if (filters.search) {
        queryParams.search = filters.search;
      }
    }

    const response = await axiosInstance.get('/withdrawal-requests', {
      params: queryParams,
    });

    // Use proto fromJSON to parse response (handles both camelCase and snake_case)
    return QueryWithdrawalRequestsResponseMessage.fromJSON(response.data);
  };

  /**
   * Get tab counts by making parallel API calls with limit=1 to use total from response
   */
  getTabCounts = async (): Promise<WithdrawalRequestTabCounts> => {
    try {
      // Make parallel requests for each status with limit=1 to get total counts
      const [allResponse, pendingResponse, approvedResponse, paidResponse, rejectedResponse] =
        await Promise.all([
          this.getWithdrawalRequests({ page: 1, limit: 1 }),
          this.getWithdrawalRequests({ page: 1, limit: 1, filters: { status: 'pending' } }),
          this.getWithdrawalRequests({ page: 1, limit: 1, filters: { status: 'approved' } }),
          this.getWithdrawalRequests({ page: 1, limit: 1, filters: { status: 'paid' } }),
          this.getWithdrawalRequests({ page: 1, limit: 1, filters: { status: 'rejected' } }),
        ]);

      return {
        all: allResponse.total,
        pending: pendingResponse.total,
        approved: approvedResponse.total,
        paid: paidResponse.total,
        rejected: rejectedResponse.total,
      };
    } catch {
      return { all: 0, pending: 0, approved: 0, paid: 0, rejected: 0 };
    }
  };

  /**
   * Get withdrawal request by ID
   */
  getWithdrawalRequestById = async (id: string): Promise<WithdrawalRequest> => {
    const response = await axiosInstance.get(`/withdrawal-requests/${id}`);
    return WithdrawalRequestMessage.fromJSON(response.data);
  };

  /**
   * Approve a withdrawal request
   */
  approveRequest = async (id: string): Promise<WithdrawalRequest> => {
    const response = await axiosInstance.patch(`/withdrawal-requests/${id}/approve`);
    return WithdrawalRequestMessage.fromJSON(response.data);
  };

  /**
   * Reject a withdrawal request
   */
  rejectRequest = async (id: string, reason: string): Promise<WithdrawalRequest> => {
    const response = await axiosInstance.patch(`/withdrawal-requests/${id}/reject`, {
      reason,
    });
    return WithdrawalRequestMessage.fromJSON(response.data);
  };

  /**
   * Pay a withdrawal request
   */
  payRequest = async (id: string): Promise<WithdrawalRequest> => {
    const response = await axiosInstance.patch(`/withdrawal-requests/${id}/pay`);
    return WithdrawalRequestMessage.fromJSON(response.data);
  };

  /**
   * Bulk approve withdrawal requests
   */
  bulkApprove = async (ids: string[]): Promise<void> => {
    await axiosInstance.patch('/withdrawal-requests/bulk-approve', { ids });
  };

  /**
   * Bulk reject withdrawal requests
   */
  bulkReject = async (ids: string[], reason: string): Promise<void> => {
    await axiosInstance.patch('/withdrawal-requests/bulk-reject', { ids, reason });
  };

  /**
   * Bulk pay withdrawal requests
   */
  bulkPay = async (ids: string[]): Promise<void> => {
    await axiosInstance.patch('/withdrawal-requests/bulk-pay', { ids });
  };
}

export const withdrawalRequestRepository = new WithdrawalRequestRepository();
