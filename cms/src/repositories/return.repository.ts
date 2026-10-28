import type {
  GetReturnsRequest,
  GetReturnsResponse,
  ReturnRequest,
  ReturnTabCounts,
  UpdateReturnStatusRequest,
  ReturnStatus,
  ReturnType,
  ReturnReason,
} from 'src/types/returns';
import axiosInstance from 'src/utils/axios';

/**
 * Map CMS status to backend status values
 */
const STATUS_MAP: Record<string, string> = {
  pending: 'pending',
  confirmed: 'approved',
  refunded: 'completed',
  rejected: 'rejected',
};

/**
 * Map CMS type to backend requestType values
 */
const TYPE_MAP: Record<string, string> = {
  refund: 'return',
  exchange: 'exchange',
};

/**
 * Map backend response to CMS ReturnRequest format
 */
const mapBackendToFrontend = (item: any): ReturnRequest => {
  // Map status
  const statusReverseMap: Record<string, ReturnStatus> = {
    pending: 'pending' as ReturnStatus,
    approved: 'confirmed' as ReturnStatus,
    completed: 'refunded' as ReturnStatus,
    rejected: 'rejected' as ReturnStatus,
  };

  // Map type
  const typeReverseMap: Record<string, ReturnType> = {
    return: 'refund' as ReturnType,
    exchange: 'exchange' as ReturnType,
  };

  // Map reason
  const reasonMap: Record<string, ReturnReason> = {
    wrong_product: 'wrongItem' as ReturnReason,
    defective: 'defective' as ReturnReason,
    damaged: 'notAsDescribed' as ReturnReason,
    poor_quality: 'notAsDescribed' as ReturnReason,
    other: 'other' as ReturnReason,
  };

  const firstReason = item.returnReasons?.[0] || item.exchangeReasons?.[0] || 'other';

  return {
    id: item.id,
    returnNumber: `RET-${item.orderSnapshot?.orderNumber || 'N/A'}`,
    orderId: item.orderSnapshot?.orderId || '',
    orderNumber: item.orderSnapshot?.orderNumber || '',
    customer: {
      name: item.customer?.name || 'N/A',
      phone: item.customer?.phone || 'N/A',
      email: item.customer?.email || null,
      address: item.customer?.address || null,
    },
    items: (item.orderSnapshot?.items || []).map((orderItem: any) => ({
      productId: orderItem.productId,
      variantId: orderItem.variantId || null,
      code: orderItem.code,
      name: orderItem.name,
      image: orderItem.image || null,
      price: orderItem.price,
      quantity: orderItem.quantity,
      subtotal: orderItem.price * orderItem.quantity,
    })),
    type: typeReverseMap[item.requestType] || ('refund' as ReturnType),
    reason: reasonMap[firstReason] || ('other' as ReturnReason),
    reasonDetail: item.otherReason || null,
    amount: item.orderSnapshot?.orderAmount || 0,
    status: statusReverseMap[item.status] || ('pending' as ReturnStatus),
    shippingCarrier: null,
    images: item.images || [],
    adminNote: item.adminNote || null,
    processedBy: null,
    processedAt: null,
    bankName: item.bankInfo?.bankName || null,
    bankAccountNumber: item.bankInfo?.accountNumber || null,
    bankAccountName: item.bankInfo?.accountHolder || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    orderSnapshot: item.orderSnapshot
      ? {
          orderId: item.orderSnapshot.orderId || '',
          orderNumber: item.orderSnapshot.orderNumber || '',
          orderAmount: item.orderSnapshot.orderAmount || 0,
          nhanh: item.orderSnapshot.nhanh || null,
        }
      : null,
  };
};

/**
 * Return Repository
 * Handles all return/refund-related API calls
 */
class ReturnRepository {
  /**
   * Get return requests with filters, sorting, and pagination
   */
  getReturns = async (params: GetReturnsRequest): Promise<GetReturnsResponse> => {
    const { page = 1, limit = 10, filters } = params;

    // Build query params - flat structure (no nested JSON)
    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };

    if (filters) {
      // Map tab to status
      if (filters.tab && filters.tab !== 'all') {
        queryParams.status = STATUS_MAP[filters.tab] || filters.tab;
      }

      // Map status directly if specified
      if (filters.status) {
        queryParams.status = STATUS_MAP[filters.status] || filters.status;
      }

      // Map type to requestType
      if (filters.type) {
        queryParams.requestType = TYPE_MAP[filters.type] || filters.type;
      }

      // Order number search
      if (filters.orderNumber) {
        queryParams.orderNumber = filters.orderNumber;
      }

      // Date range
      if (filters.fromDate) {
        queryParams.fromDate = filters.fromDate;
      }
      if (filters.toDate) {
        queryParams.toDate = filters.toDate;
      }
    }

    const response = await axiosInstance.get<any>('/return-requests', {
      params: queryParams,
    });

    const backendData = response.data;

    return {
      data: (backendData.data || []).map(mapBackendToFrontend),
      total: backendData.total || 0,
      page: backendData.page || page,
      limit: backendData.limit || limit,
      totalPages: backendData.totalPages || Math.ceil((backendData.total || 0) / limit),
      hasNextPage: (backendData.page || page) < (backendData.totalPages || 0),
    };
  };

  /**
   * Get tab counts by fetching all and counting
   * @param type - Optional filter by return type (refund/exchange)
   */
  getTabCounts = async (type?: 'refund' | 'exchange'): Promise<ReturnTabCounts> => {
    try {
      // Fetch all with type filter if specified
      const filters = type ? { type: type as ReturnType } : undefined;
      const all = await this.getReturns({ page: 1, limit: 1000, filters });

      const counts: ReturnTabCounts = {
        all: all.total,
        pending: 0,
        confirmed: 0,
        refunded: 0,
        rejected: 0,
      };

      all.data.forEach((item) => {
        switch (item.status) {
          case 'pending':
            counts.pending++;
            break;
          case 'confirmed':
            counts.confirmed++;
            break;
          case 'refunded':
            counts.refunded++;
            break;
          case 'rejected':
            counts.rejected++;
            break;
        }
      });

      return counts;
    } catch {
      return { all: 0, pending: 0, confirmed: 0, refunded: 0, rejected: 0 };
    }
  };

  /**
   * Get return request by ID
   */
  getReturnById = async (id: string): Promise<ReturnRequest> => {
    const response = await axiosInstance.get<any>(`/return-requests/${id}`);
    return mapBackendToFrontend(response.data);
  };

  /**
   * Update return request status
   */
  updateReturnStatus = async (
    returnId: string,
    data: UpdateReturnStatusRequest
  ): Promise<ReturnRequest> => {
    const backendStatus = STATUS_MAP[data.status] || data.status;

    const response = await axiosInstance.patch<any>(`/return-requests/${returnId}`, {
      status: backendStatus,
      adminNote: data.adminNote,
    });
    return mapBackendToFrontend(response.data);
  };
}

export const returnRepository = new ReturnRepository();
