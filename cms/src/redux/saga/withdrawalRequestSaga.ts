import type { PayloadAction } from '@reduxjs/toolkit';
import { call, delay, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { withdrawalRequestRepository } from 'src/repositories/withdrawal-request.repository';
import type {
  WithdrawalRequest,
  WithdrawalRequestListItem,
  QueryWithdrawalRequestsResponse,
  WithdrawalRequestTabCounts,
  WithdrawalRequestFilters,
  WithdrawalRequestSort,
} from 'src/types/withdrawal-request';
import { WithdrawalRequestStatus } from 'src/types/withdrawal-request';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getWithdrawalRequestsRequest,
  getWithdrawalRequestByIdRequest,
  getWithdrawalRequestTabCountsRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  payWithdrawalRequest,
  bulkApproveWithdrawalRequests,
  bulkRejectWithdrawalRequests,
  bulkPayWithdrawalRequests,
  setWithdrawalRequestLoading,
  setWithdrawalRequestsSuccess,
  setCurrentWithdrawalRequestLoading,
  setCurrentWithdrawalRequestSuccess,
  setWithdrawalRequestTabCounts,
  setActionLoading,
  type GetWithdrawalRequestsPayload,
  type GetWithdrawalRequestByIdPayload,
  type ApproveWithdrawalRequestPayload,
  type RejectWithdrawalRequestPayload,
  type PayWithdrawalRequestPayload,
  type BulkApproveWithdrawalRequestPayload,
  type BulkRejectWithdrawalRequestPayload,
  type BulkPayWithdrawalRequestPayload,
} from '../store/withdrawalRequestSlice';

// ============================================================================
// MOCK DATA - Set ENABLE_MOCK = false to use real API
// ============================================================================
const ENABLE_MOCK = false;

interface GetWithdrawalRequestsParams {
  page: number;
  limit: number;
  filters?: WithdrawalRequestFilters;
  sort?: WithdrawalRequestSort;
}

interface MockWithdrawalRequest {
  id: string;
  affiliateId: string;
  agentName: string;
  recipientName: string;
  bankAccountNumber: string;
  bankName: string;
  amount: number;
  note?: string;
  status: WithdrawalRequestStatus;
  requestDate: Date;
  processedBy?: string;
  processedDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const initialMockData: MockWithdrawalRequest[] = [
  // 5 PENDING
  {
    id: '1',
    affiliateId: 'aff1',
    agentName: 'Nguyễn Văn An',
    recipientName: 'Nguyễn Văn An',
    bankAccountNumber: '1234567890',
    bankName: 'Vietcombank',
    amount: 1500000,
    note: 'Rút tiền hoa hồng tháng 1',
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING,
    requestDate: new Date('2025-01-15T08:30:00Z'),
    createdAt: new Date('2025-01-15T08:30:00Z'),
    updatedAt: new Date('2025-01-15T08:30:00Z'),
  },
  {
    id: '2',
    affiliateId: 'aff2',
    agentName: 'Trần Thị Bình',
    recipientName: 'Trần Thị Bình',
    bankAccountNumber: '9876543210',
    bankName: 'Techcombank',
    amount: 2300000,
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING,
    requestDate: new Date('2025-01-16T10:15:00Z'),
    createdAt: new Date('2025-01-16T10:15:00Z'),
    updatedAt: new Date('2025-01-16T10:15:00Z'),
  },
  {
    id: '3',
    affiliateId: 'aff3',
    agentName: 'Lê Văn Cường',
    recipientName: 'Lê Văn Cường',
    bankAccountNumber: '5555666677',
    bankName: 'MB Bank',
    amount: 3000000,
    note: 'Rút tiền gấp',
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING,
    requestDate: new Date('2025-01-17T14:45:00Z'),
    createdAt: new Date('2025-01-17T14:45:00Z'),
    updatedAt: new Date('2025-01-17T14:45:00Z'),
  },
  {
    id: '4',
    affiliateId: 'aff4',
    agentName: 'Phạm Thị Dung',
    recipientName: 'Phạm Thị Dung',
    bankAccountNumber: '1111222233',
    bankName: 'VPBank',
    amount: 1800000,
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING,
    requestDate: new Date('2025-01-18T09:00:00Z'),
    createdAt: new Date('2025-01-18T09:00:00Z'),
    updatedAt: new Date('2025-01-18T09:00:00Z'),
  },
  {
    id: '5',
    affiliateId: 'aff5',
    agentName: 'Hoàng Văn Em',
    recipientName: 'Hoàng Văn Em',
    bankAccountNumber: '4444555566',
    bankName: 'ACB',
    amount: 4500000,
    note: 'Rút hết số dư',
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING,
    requestDate: new Date('2025-01-19T11:30:00Z'),
    createdAt: new Date('2025-01-19T11:30:00Z'),
    updatedAt: new Date('2025-01-19T11:30:00Z'),
  },
  // 4 APPROVED
  {
    id: '6',
    affiliateId: 'aff6',
    agentName: 'Ngô Thị Phương',
    recipientName: 'Ngô Thị Phương',
    bankAccountNumber: '7777888899',
    bankName: 'Vietcombank',
    amount: 2100000,
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED,
    requestDate: new Date('2025-01-10T08:00:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-11T10:00:00Z'),
    createdAt: new Date('2025-01-10T08:00:00Z'),
    updatedAt: new Date('2025-01-11T10:00:00Z'),
  },
  {
    id: '7',
    affiliateId: 'aff7',
    agentName: 'Đỗ Văn Giang',
    recipientName: 'Đỗ Văn Giang',
    bankAccountNumber: '3333444455',
    bankName: 'BIDV',
    amount: 3200000,
    note: 'Rút tiền hoa hồng',
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED,
    requestDate: new Date('2025-01-11T09:30:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-12T14:00:00Z'),
    createdAt: new Date('2025-01-11T09:30:00Z'),
    updatedAt: new Date('2025-01-12T14:00:00Z'),
  },
  {
    id: '8',
    affiliateId: 'aff8',
    agentName: 'Vũ Thị Hoa',
    recipientName: 'Vũ Thị Hoa',
    bankAccountNumber: '6666777788',
    bankName: 'Sacombank',
    amount: 1900000,
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED,
    requestDate: new Date('2025-01-12T13:15:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-13T09:00:00Z'),
    createdAt: new Date('2025-01-12T13:15:00Z'),
    updatedAt: new Date('2025-01-13T09:00:00Z'),
  },
  {
    id: '9',
    affiliateId: 'aff9',
    agentName: 'Bùi Văn Khánh',
    recipientName: 'Bùi Văn Khánh',
    bankAccountNumber: '2222333344',
    bankName: 'Agribank',
    amount: 2700000,
    note: 'Cần gấp trong tuần',
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED,
    requestDate: new Date('2025-01-13T16:45:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-14T11:30:00Z'),
    createdAt: new Date('2025-01-13T16:45:00Z'),
    updatedAt: new Date('2025-01-14T11:30:00Z'),
  },
  // 3 PAID
  {
    id: '10',
    affiliateId: 'aff10',
    agentName: 'Đặng Thị Linh',
    recipientName: 'Đặng Thị Linh',
    bankAccountNumber: '8888999900',
    bankName: 'Vietinbank',
    amount: 1200000,
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID,
    requestDate: new Date('2025-01-05T10:00:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-07T15:00:00Z'),
    createdAt: new Date('2025-01-05T10:00:00Z'),
    updatedAt: new Date('2025-01-07T15:00:00Z'),
  },
  {
    id: '11',
    affiliateId: 'aff11',
    agentName: 'Lý Văn Minh',
    recipientName: 'Lý Văn Minh',
    bankAccountNumber: '1234123412',
    bankName: 'TPBank',
    amount: 2800000,
    note: 'Rút tiền thưởng',
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID,
    requestDate: new Date('2025-01-06T11:30:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-08T09:45:00Z'),
    createdAt: new Date('2025-01-06T11:30:00Z'),
    updatedAt: new Date('2025-01-08T09:45:00Z'),
  },
  {
    id: '12',
    affiliateId: 'aff12',
    agentName: 'Trương Thị Nga',
    recipientName: 'Trương Thị Nga',
    bankAccountNumber: '5678567856',
    bankName: 'OCB',
    amount: 1600000,
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID,
    requestDate: new Date('2025-01-07T14:20:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-09T16:30:00Z'),
    createdAt: new Date('2025-01-07T14:20:00Z'),
    updatedAt: new Date('2025-01-09T16:30:00Z'),
  },
  // 3 REJECTED
  {
    id: '13',
    affiliateId: 'aff13',
    agentName: 'Mai Văn Phú',
    recipientName: 'Mai Văn Phú',
    bankAccountNumber: '9012901290',
    bankName: 'HDBank',
    amount: 900000,
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED,
    requestDate: new Date('2025-01-08T08:00:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-09T10:00:00Z'),
    rejectionReason: 'Số dư không đủ',
    createdAt: new Date('2025-01-08T08:00:00Z'),
    updatedAt: new Date('2025-01-09T10:00:00Z'),
  },
  {
    id: '14',
    affiliateId: 'aff14',
    agentName: 'Đinh Thị Quỳnh',
    recipientName: 'Đinh Thị Quỳnh',
    bankAccountNumber: '3456345634',
    bankName: 'VIB',
    amount: 1400000,
    note: 'Rút gấp',
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED,
    requestDate: new Date('2025-01-09T09:45:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-10T11:15:00Z'),
    rejectionReason: 'Thông tin tài khoản không hợp lệ',
    createdAt: new Date('2025-01-09T09:45:00Z'),
    updatedAt: new Date('2025-01-10T11:15:00Z'),
  },
  {
    id: '15',
    affiliateId: 'aff15',
    agentName: 'Châu Văn Sơn',
    recipientName: 'Châu Văn Sơn',
    bankAccountNumber: '7890789078',
    bankName: 'SeABank',
    amount: 2000000,
    status: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED,
    requestDate: new Date('2025-01-10T15:30:00Z'),
    processedBy: 'Admin',
    processedDate: new Date('2025-01-11T08:00:00Z'),
    rejectionReason: 'Yêu cầu trùng lặp',
    createdAt: new Date('2025-01-10T15:30:00Z'),
    updatedAt: new Date('2025-01-11T08:00:00Z'),
  },
];

// In-memory store (reset on page refresh)
let mockData: MockWithdrawalRequest[] = [...initialMockData];

// ============================================================================
// MOCK HELPER FUNCTIONS
// ============================================================================

interface MockGetWithdrawalRequestsResponse {
  data: WithdrawalRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

const tabToStatusMap: Record<string, WithdrawalRequestStatus> = {
  pending: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING,
  approved: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED,
  paid: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID,
  rejected: WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED,
};

const getMockWithdrawalRequests = (
  params: GetWithdrawalRequestsParams
): MockGetWithdrawalRequestsResponse => {
  const { page = 1, limit = 10, filters, sort } = params;

  let filteredData = [...mockData];

  // Filter by tab/status
  if (filters?.tab && filters.tab !== 'all') {
    const targetStatus = tabToStatusMap[filters.tab];
    if (targetStatus !== undefined) {
      filteredData = filteredData.filter((r) => r.status === targetStatus);
    }
  }

  // Filter by search (agentName)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredData = filteredData.filter((r) => r.agentName.toLowerCase().includes(searchLower));
  }

  // Sort
  if (sort) {
    filteredData.sort((a, b) => {
      let comparison = 0;
      switch (sort.orderBy) {
        case 'requestDate':
          comparison = a.requestDate.getTime() - b.requestDate.getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'affiliateName':
          comparison = a.agentName.localeCompare(b.agentName);
          break;
      }
      return sort.order === 'desc' ? -comparison : comparison;
    });
  }

  // Calculate pagination
  const total = filteredData.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Map to WithdrawalRequestListItem format
  const data: WithdrawalRequestListItem[] = paginatedData.map((r) => ({
    id: r.id,
    affiliateId: r.affiliateId,
    agentName: r.agentName,
    recipientName: r.recipientName,
    bankAccountNumber: r.bankAccountNumber,
    bankName: r.bankName,
    amount: r.amount,
    status: r.status,
    requestDate: r.requestDate,
    rejectionReason: r.rejectionReason,
    createdAt: r.createdAt,
  }));

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
  };
};

const getMockWithdrawalRequestById = (id: string): WithdrawalRequest | undefined => {
  const found = mockData.find((r) => r.id === id);
  if (!found) return undefined;
  return found as WithdrawalRequest;
};

const getMockTabCounts = (): WithdrawalRequestTabCounts => {
  return {
    all: mockData.length,
    pending: mockData.filter(
      (r) => r.status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING
    ).length,
    approved: mockData.filter(
      (r) => r.status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED
    ).length,
    paid: mockData.filter(
      (r) => r.status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID
    ).length,
    rejected: mockData.filter(
      (r) => r.status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED
    ).length,
  };
};

const approveMockRequest = (id: string): WithdrawalRequest | undefined => {
  const request = mockData.find((r) => r.id === id);
  if (request && request.status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING) {
    request.status = WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED;
    request.processedDate = new Date();
    request.processedBy = 'Admin';
    request.updatedAt = new Date();
  }
  return request as WithdrawalRequest | undefined;
};

const rejectMockRequest = (id: string, reason: string): WithdrawalRequest | undefined => {
  const request = mockData.find((r) => r.id === id);
  if (request && request.status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PENDING) {
    request.status = WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_REJECTED;
    request.processedDate = new Date();
    request.processedBy = 'Admin';
    request.rejectionReason = reason;
    request.updatedAt = new Date();
  }
  return request as WithdrawalRequest | undefined;
};

const payMockRequest = (id: string): WithdrawalRequest | undefined => {
  const request = mockData.find((r) => r.id === id);
  if (request && request.status === WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_APPROVED) {
    request.status = WithdrawalRequestStatus.WITHDRAWAL_REQUEST_STATUS_PAID;
    request.processedDate = new Date();
    request.updatedAt = new Date();
  }
  return request as WithdrawalRequest | undefined;
};

const bulkApproveMockRequests = (ids: string[]): void => {
  ids.forEach((id) => approveMockRequest(id));
};

const bulkRejectMockRequests = (ids: string[], reason: string): void => {
  ids.forEach((id) => rejectMockRequest(id, reason));
};

const bulkPayMockRequests = (ids: string[]): void => {
  ids.forEach((id) => payMockRequest(id));
};

// ============================================================================
// SAGAS
// ============================================================================

/**
 * Get Withdrawal Requests Saga
 */
function* getWithdrawalRequestsSaga(action: PayloadAction<GetWithdrawalRequestsPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setWithdrawalRequestLoading(true));

    let response: QueryWithdrawalRequestsResponse;

    if (ENABLE_MOCK) {
      yield delay(400);
      response = getMockWithdrawalRequests({ page, limit, filters, sort });
    } else {
      response = yield call(withdrawalRequestRepository.getWithdrawalRequests, {
        page,
        limit,
        filters,
        sort,
      });
    }

    yield put(
      setWithdrawalRequestsSuccess({
        requests: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setWithdrawalRequestLoading(false));
    showError(error);
  }
}

/**
 * Get Withdrawal Request Tab Counts Saga
 */
function* getWithdrawalRequestTabCountsSaga() {
  try {
    let tabCounts: WithdrawalRequestTabCounts;

    if (ENABLE_MOCK) {
      yield delay(300);
      tabCounts = getMockTabCounts();
    } else {
      tabCounts = yield call(withdrawalRequestRepository.getTabCounts);
    }

    yield put(setWithdrawalRequestTabCounts(tabCounts));
  } catch (error) {
    console.error('Failed to fetch withdrawal request tab counts:', error);
  }
}

/**
 * Get Withdrawal Request By ID Saga
 */
function* getWithdrawalRequestByIdSaga(action: PayloadAction<GetWithdrawalRequestByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentWithdrawalRequestLoading(true));

    let request: WithdrawalRequest | undefined;

    if (ENABLE_MOCK) {
      yield delay(300);
      request = getMockWithdrawalRequestById(id);
      if (!request) {
        throw new Error('Withdrawal request not found');
      }
    } else {
      request = yield call(withdrawalRequestRepository.getWithdrawalRequestById, id);
    }

    yield put(setCurrentWithdrawalRequestSuccess(request));

    if (onSuccess) {
      onSuccess(request);
    }
  } catch (error) {
    yield put(setCurrentWithdrawalRequestLoading(false));
    showError(error);
  }
}

/**
 * Approve Withdrawal Request Saga
 */
function* approveWithdrawalRequestSaga(action: PayloadAction<ApproveWithdrawalRequestPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setActionLoading(true));

    let request: WithdrawalRequest | undefined;

    if (ENABLE_MOCK) {
      yield delay(400);
      request = approveMockRequest(id);
      if (!request) {
        throw new Error('Failed to approve withdrawal request');
      }
    } else {
      request = yield call(withdrawalRequestRepository.approveRequest, id);
    }

    yield put(setCurrentWithdrawalRequestSuccess(request));
    showSuccess(i18next.t('approveWithdrawalSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    showError(error);
  } finally {
    yield put(setActionLoading(false));
  }
}

/**
 * Reject Withdrawal Request Saga
 */
function* rejectWithdrawalRequestSaga(action: PayloadAction<RejectWithdrawalRequestPayload>) {
  const { id, reason, onSuccess } = action.payload;

  try {
    yield put(setActionLoading(true));

    let request: WithdrawalRequest | undefined;

    if (ENABLE_MOCK) {
      yield delay(400);
      request = rejectMockRequest(id, reason);
      if (!request) {
        throw new Error('Failed to reject withdrawal request');
      }
    } else {
      request = yield call(withdrawalRequestRepository.rejectRequest, id, reason);
    }

    yield put(setCurrentWithdrawalRequestSuccess(request));
    showSuccess(i18next.t('rejectWithdrawalSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    showError(error);
  } finally {
    yield put(setActionLoading(false));
  }
}

/**
 * Pay Withdrawal Request Saga
 */
function* payWithdrawalRequestSaga(action: PayloadAction<PayWithdrawalRequestPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setActionLoading(true));

    let request: WithdrawalRequest | undefined;

    if (ENABLE_MOCK) {
      yield delay(400);
      request = payMockRequest(id);
      if (!request) {
        throw new Error('Failed to pay withdrawal request');
      }
    } else {
      request = yield call(withdrawalRequestRepository.payRequest, id);
    }

    yield put(setCurrentWithdrawalRequestSuccess(request));
    showSuccess(i18next.t('payWithdrawalSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    showError(error);
  } finally {
    yield put(setActionLoading(false));
  }
}

/**
 * Bulk Approve Withdrawal Requests Saga
 */
function* bulkApproveWithdrawalRequestsSaga(
  action: PayloadAction<BulkApproveWithdrawalRequestPayload>
) {
  const { ids, onSuccess } = action.payload;

  try {
    yield put(setActionLoading(true));

    if (ENABLE_MOCK) {
      yield delay(500);
      bulkApproveMockRequests(ids);
    } else {
      yield call(withdrawalRequestRepository.bulkApprove, ids);
    }

    showSuccess(i18next.t('bulkApproved'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    showError(error);
  } finally {
    yield put(setActionLoading(false));
  }
}

/**
 * Bulk Reject Withdrawal Requests Saga
 */
function* bulkRejectWithdrawalRequestsSaga(
  action: PayloadAction<BulkRejectWithdrawalRequestPayload>
) {
  const { ids, reason, onSuccess } = action.payload;

  try {
    yield put(setActionLoading(true));

    if (ENABLE_MOCK) {
      yield delay(500);
      bulkRejectMockRequests(ids, reason);
    } else {
      yield call(withdrawalRequestRepository.bulkReject, ids, reason);
    }

    showSuccess(i18next.t('bulkRejected'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    showError(error);
  } finally {
    yield put(setActionLoading(false));
  }
}

/**
 * Bulk Pay Withdrawal Requests Saga
 */
function* bulkPayWithdrawalRequestsSaga(action: PayloadAction<BulkPayWithdrawalRequestPayload>) {
  const { ids, onSuccess } = action.payload;

  try {
    yield put(setActionLoading(true));

    if (ENABLE_MOCK) {
      yield delay(500);
      bulkPayMockRequests(ids);
    } else {
      yield call(withdrawalRequestRepository.bulkPay, ids);
    }

    showSuccess(i18next.t('bulkPaid'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    showError(error);
  } finally {
    yield put(setActionLoading(false));
  }
}

/**
 * Root Withdrawal Request Saga Watcher
 */
function* watchWithdrawalRequest() {
  yield takeLatest(getWithdrawalRequestsRequest.type, getWithdrawalRequestsSaga);
  yield takeLatest(getWithdrawalRequestByIdRequest.type, getWithdrawalRequestByIdSaga);
  yield takeLatest(getWithdrawalRequestTabCountsRequest.type, getWithdrawalRequestTabCountsSaga);
  yield takeLatest(approveWithdrawalRequest.type, approveWithdrawalRequestSaga);
  yield takeLatest(rejectWithdrawalRequest.type, rejectWithdrawalRequestSaga);
  yield takeLatest(payWithdrawalRequest.type, payWithdrawalRequestSaga);
  yield takeLatest(bulkApproveWithdrawalRequests.type, bulkApproveWithdrawalRequestsSaga);
  yield takeLatest(bulkRejectWithdrawalRequests.type, bulkRejectWithdrawalRequestsSaga);
  yield takeLatest(bulkPayWithdrawalRequests.type, bulkPayWithdrawalRequestsSaga);
}

/**
 * Root Withdrawal Request Saga
 */
export function* withdrawalRequestSaga() {
  yield call(watchWithdrawalRequest);
}
