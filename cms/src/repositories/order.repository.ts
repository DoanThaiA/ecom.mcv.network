import type {
  GetOrdersRequest,
  GetOrdersResponse,
  Order,
  OrderStatus,
  PaymentStatus,
} from 'src/types/orders';
import axiosInstance from 'src/utils/axios';

/**
 * Order Repository
 * Handles all order-related API calls
 */
class OrderRepository {
  /**
   * Get orders with filters, sorting, and pagination
   */
  getOrders = async (params: GetOrdersRequest): Promise<GetOrdersResponse> => {
    const { page = 1, limit = 10, filters, sort } = params;

    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };

    if (filters && Object.keys(filters).length > 0) {
      // Map frontend filters to backend format
      const backendFilters: Record<string, string | boolean> = {};

      // Status filter: use explicit status if provided, otherwise use tab (if it's a real status)
      const STATUS_TABS: ReadonlyArray<string> = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ];
      if (filters.status) {
        backendFilters.status = filters.status;
      } else if (filters.tab && STATUS_TABS.includes(filters.tab)) {
        backendFilters.status = filters.tab;
      }

      if (filters.paymentStatus) backendFilters.paymentStatus = filters.paymentStatus;
      if (filters.orderNumber) backendFilters.orderNumber = filters.orderNumber;
      if (filters.phone) backendFilters.phone = filters.phone;
      if (filters.fromDate) backendFilters.fromDate = filters.fromDate;
      if (filters.toDate) backendFilters.toDate = filters.toDate;
      if (filters.nhanhSynced !== undefined) {
        backendFilters.nhanhSynced = filters.nhanhSynced;
      } else if (filters.tab === 'nhanhUnsynced') {
        backendFilters.nhanhSynced = false;
      }

      if (Object.keys(backendFilters).length > 0) {
        queryParams.filters = JSON.stringify(backendFilters);
      }
    }

    if (sort) {
      queryParams.sort = JSON.stringify(sort);
    }

    const response = await axiosInstance.get<GetOrdersResponse>('/orders', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Count orders that have not been synced to Nhanh.vn yet
   */
  getNhanhUnsyncedCount = async (): Promise<number> => {
    const response = await axiosInstance.get<{ count: number }>('/orders/nhanh-sync/count');
    return response.data.count;
  };

  /**
   * Manually trigger sync of an order to Nhanh.vn (retry for failed syncs)
   */
  retrySyncNhanh = async (
    orderId: string
  ): Promise<{
    success: boolean;
    nhanhOrderId: number | null;
    trackingUrl: string | null;
    error: string | null;
  }> => {
    const response = await axiosInstance.post<{
      success: boolean;
      nhanhOrderId: number | null;
      trackingUrl: string | null;
      error: string | null;
    }>(`/orders/${orderId}/sync-nhanh`);
    return response.data;
  };

  /**
   * Get single order by ID
   */
  getOrderById = async (id: string): Promise<Order> => {
    const response = await axiosInstance.get<Order>(`/orders/${id}`);
    return response.data;
  };

  /**
   * Update order status
   */
  updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    reason?: string
  ): Promise<Order> => {
    const response = await axiosInstance.patch<Order>(`/orders/${orderId}/status`, {
      status,
      reason,
    });
    return response.data;
  };

  /**
   * Update payment status
   */
  updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus): Promise<Order> => {
    const response = await axiosInstance.patch<Order>(`/orders/${orderId}/payment-status`, {
      paymentStatus,
    });
    return response.data;
  };
}

export const orderRepository = new OrderRepository();
