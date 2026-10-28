/**
 * Return Request Types
 * Re-exports proto-generated types with CMS-specific additions
 */

// Re-export proto generated types
export {
  type ReturnRequest as ProtoReturnRequest,
  type ReturnCustomer,
  type ReturnOrderItem,
  type BankInfo,
  type CreateReturnRequestDto,
  type UpdateReturnRequestDto as ProtoUpdateReturnRequestDto,
  type QueryReturnRequestDto,
  type ReturnRequestListResponse,
  ReturnRequestType,
  ReturnRequestStatus,
  ReturnReason as ProtoReturnReason,
  ExchangeReason,
} from 'src/types/gen/shared/shared/returns/return';

import { ReturnNhanhInfo } from 'src/types/gen/shared/shared/returns/return';
import type { OrderItem } from './orders';

/**
 * CMS Return Status - Maps to proto ReturnRequestStatus
 * CMS uses different naming for UI (confirmed/refunded vs approved/completed)
 */
export enum ReturnStatus {
  PENDING = 'pending', // Chờ xử lý
  CONFIRMED = 'confirmed', // Xác nhận hoàn (= APPROVED in proto)
  REFUNDED = 'refunded', // Hoàn tiền thành công (= COMPLETED in proto)
  REJECTED = 'rejected', // Từ chối yêu cầu
}

/**
 * Return Request Type - Đơn trả hàng/hoàn tiền vs Đổi hàng
 */
export enum ReturnType {
  REFUND = 'refund', // Đơn trả hàng/hoàn tiền
  EXCHANGE = 'exchange', // Đổi hàng
}

/**
 * Return Reason - CMS display values
 */
export enum ReturnReason {
  DEFECTIVE = 'defective', // Lỗi sản phẩm
  WRONG_ITEM = 'wrong_item', // Giao sai sản phẩm
  NOT_AS_DESCRIBED = 'not_as_described', // Không đúng mô tả
  CHANGED_MIND = 'changed_mind', // Đổi ý
  OTHER = 'other', // Lý do khác
}

/**
 * Return Request Tab Types
 */
export type ReturnTab = 'all' | 'pending' | 'confirmed' | 'refunded' | 'rejected';

/**
 * Return Item - Product in return request
 */
export interface ReturnItem {
  productId: string;
  variantId?: string | null;
  code: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

/**
 * Return Request Entity - CMS view model
 */
export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
  };
  items: ReturnItem[];
  type: ReturnType;
  reason: ReturnReason;
  reasonDetail?: string | null;
  amount: number;
  status: ReturnStatus;
  shippingCarrier?: string | null; // Đơn vị vận chuyển
  images?: string[] | null; // Hình ảnh sản phẩm lỗi
  adminNote?: string | null; // Ghi chú của admin
  processedBy?: string | null; // Admin xử lý
  processedAt?: string | null;
  // Bank info for refund
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  createdAt: string;
  updatedAt: string;
  orderSnapshot: ReturnOrderSnapshot | null;
}

/** Thông tin đơn hàng (snapshot lúc tạo request) */
export interface ReturnOrderSnapshot {
  orderId: string;
  orderNumber: string;
  orderAmount: number;
  /** Nhanh.vn sync info */
  nhanh?: ReturnNhanhInfo | null;
}

/**
 * Return Request Filters
 */
export interface ReturnFilters {
  search?: string;
  orderNumber?: string;
  phone?: string;
  status?: ReturnStatus;
  type?: ReturnType;
  reason?: ReturnReason;
  fromDate?: string;
  toDate?: string;
  tab?: ReturnTab;
}

/**
 * Return Request Sort
 */
export interface ReturnSort {
  orderBy: 'createdAt' | 'amount' | 'returnNumber';
  order: 'asc' | 'desc';
}

/**
 * Get Return Requests Request
 */
export interface GetReturnsRequest {
  page: number;
  limit: number;
  filters?: ReturnFilters;
  sort?: ReturnSort;
}

/**
 * Get Return Requests Response
 */
export interface GetReturnsResponse {
  data: ReturnRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * Tab Count Response
 */
export interface ReturnTabCounts {
  all: number;
  pending: number;
  confirmed: number;
  refunded: number;
  rejected: number;
}

/**
 * Update Return Status Request
 */
export interface UpdateReturnStatusRequest {
  status: ReturnStatus;
  adminNote?: string;
}

/**
 * Helper: Get status translation key
 */
export const getReturnStatusKey = (status: ReturnStatus): string => {
  const statusKeyMap: Record<ReturnStatus, string> = {
    [ReturnStatus.PENDING]: 'returnStatusPending',
    [ReturnStatus.CONFIRMED]: 'returnStatusConfirmed',
    [ReturnStatus.REFUNDED]: 'returnStatusRefunded',
    [ReturnStatus.REJECTED]: 'returnStatusRejected',
  };
  return statusKeyMap[status] || 'returnStatusPending';
};

/**
 * Helper: Get status color for MUI Chip
 */
export const getReturnStatusColor = (
  status: ReturnStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case ReturnStatus.PENDING:
      return 'warning';
    case ReturnStatus.CONFIRMED:
      return 'info';
    case ReturnStatus.REFUNDED:
      return 'success';
    case ReturnStatus.REJECTED:
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Helper: Get return type translation key
 */
export const getReturnTypeKey = (type: ReturnType): string => {
  const typeKeyMap: Record<ReturnType, string> = {
    [ReturnType.REFUND]: 'returnTypeRefund',
    [ReturnType.EXCHANGE]: 'returnTypeExchange',
  };
  return typeKeyMap[type] || 'returnTypeRefund';
};

/**
 * Helper: Get return reason translation key
 */
export const getReturnReasonKey = (reason: ReturnReason): string => {
  const reasonKeyMap: Record<ReturnReason, string> = {
    [ReturnReason.DEFECTIVE]: 'returnReasonDefective',
    [ReturnReason.WRONG_ITEM]: 'returnReasonWrongItem',
    [ReturnReason.NOT_AS_DESCRIBED]: 'returnReasonNotAsDescribed',
    [ReturnReason.CHANGED_MIND]: 'returnReasonChangedMind',
    [ReturnReason.OTHER]: 'returnReasonOther',
  };
  return reasonKeyMap[reason] || 'returnReasonOther';
};
