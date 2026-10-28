/**
 * Withdrawal Request Types
 * Re-exports from proto-generated types + CMS-specific helpers.
 */

// ============================================================================
// Re-exports from proto-generated types
// ============================================================================

export type { WithdrawalRequest } from 'src/types/gen/shared/shared/withdrawal-requests/withdrawal-request';

import type { WithdrawalRequestListItem as _WithdrawalRequestListItem } from 'src/types/gen/shared/shared/withdrawal-requests/withdrawal-request';

/** Extended list item — REST API returns processedDate but proto type omits it */
export type WithdrawalRequestListItem = _WithdrawalRequestListItem & {
  processedDate?: Date | undefined;
};

export {
  WithdrawalRequest as WithdrawalRequestMessage,
  WithdrawalRequestListItem as WithdrawalRequestListItemMessage,
} from 'src/types/gen/shared/shared/withdrawal-requests/withdrawal-request';

export type {
  AffiliateBalanceResponse,
  QueryWithdrawalRequestsRequest,
  QueryWithdrawalRequestsResponse,
  RejectWithdrawalRequestRequest,
  BulkWithdrawalRequestActionRequest,
} from 'src/types/gen/cms/cms/withdrawal-requests/withdrawal-request';

export { QueryWithdrawalRequestsResponse as QueryWithdrawalRequestsResponseMessage } from 'src/types/gen/cms/cms/withdrawal-requests/withdrawal-request';

export {
  WithdrawalRequestStatus,
  withdrawalRequestStatusFromJSON,
  withdrawalRequestStatusToJSON,
} from 'src/types/gen/shared/shared/common/enums';

// ============================================================================
// CMS-only types (not in proto)
// ============================================================================

/** Tab filter type for the withdrawal request list view */
export type WithdrawalRequestTab = 'all' | 'pending' | 'approved' | 'paid' | 'rejected';

/** Counts per tab for the withdrawal request list */
export interface WithdrawalRequestTabCounts {
  all: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
}

/** Filters for withdrawal request list (CMS state, not API params) */
export interface WithdrawalRequestFilters {
  search?: string;
  status?: string;
  tab?: WithdrawalRequestTab;
}

/** Sort options for withdrawal request list */
export interface WithdrawalRequestSort {
  orderBy: 'requestDate' | 'amount' | 'affiliateName';
  order: 'asc' | 'desc';
}

// ============================================================================
// Helpers for status handling
// Backend returns lowercase strings ("pending", "approved", etc.)
// Proto enum uses uppercase prefixed format (WITHDRAWAL_REQUEST_STATUS_PENDING)
// These helpers bridge the gap for UI rendering
// ============================================================================

/** Map string status (from REST API) to i18n key */
export const getWithdrawalStatusKey = (status: string | number): string => {
  // Normalize to lowercase string
  const normalizedStatus = typeof status === 'number' ? statusNumberToString(status) : status;

  const statusKeyMap: Record<string, string> = {
    pending: 'withdrawalStatusPending',
    approved: 'withdrawalStatusApproved',
    paid: 'withdrawalStatusPaid',
    rejected: 'withdrawalStatusRejected',
  };
  return statusKeyMap[normalizedStatus] ?? 'withdrawalStatusPending';
};

/** Map string status (from REST API) to MUI Chip color */
export const getWithdrawalStatusColor = (
  status: string | number
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  // Normalize to lowercase string
  const normalizedStatus = typeof status === 'number' ? statusNumberToString(status) : status;

  switch (normalizedStatus) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'info';
    case 'paid':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

/** Convert proto enum number to lowercase string */
const statusNumberToString = (status: number): string => {
  // Import values match WithdrawalRequestStatus enum
  switch (status) {
    case 1: // WITHDRAWAL_REQUEST_STATUS_PENDING
      return 'pending';
    case 2: // WITHDRAWAL_REQUEST_STATUS_APPROVED
      return 'approved';
    case 3: // WITHDRAWAL_REQUEST_STATUS_PAID
      return 'paid';
    case 4: // WITHDRAWAL_REQUEST_STATUS_REJECTED
      return 'rejected';
    default:
      return 'pending';
  }
};

/** Convert lowercase string status to proto enum value */
export const stringStatusToEnum = (status: string): number => {
  switch (status) {
    case 'pending':
      return 1; // WITHDRAWAL_REQUEST_STATUS_PENDING
    case 'approved':
      return 2; // WITHDRAWAL_REQUEST_STATUS_APPROVED
    case 'paid':
      return 3; // WITHDRAWAL_REQUEST_STATUS_PAID
    case 'rejected':
      return 4; // WITHDRAWAL_REQUEST_STATUS_REJECTED
    default:
      return 0; // UNSPECIFIED
  }
};
