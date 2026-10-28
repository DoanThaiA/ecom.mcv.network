import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order, PaymentMethod } from '@/types/gen/shop/shared/orders/order';
import type { GetOrdersResponse } from '@/types/gen/shop/shop/shop/shop';

interface OrderState {
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  // Order history
  orders: Order[];
  isLoadingOrders: boolean;
  ordersError: string | null;
  // Pagination
  ordersPage: number;
  ordersTotalPages: number;
  ordersTotal: number;
  // Order detail
  orderDetail: Order | null;
  isLoadingOrderDetail: boolean;
  orderDetailError: string | null;
}

const initialState: OrderState = {
  currentOrder: null,
  isLoading: false,
  error: null,
  // Order history
  orders: [],
  isLoadingOrders: false,
  ordersError: null,
  // Pagination
  ordersPage: 1,
  ordersTotalPages: 1,
  ordersTotal: 0,
  // Order detail
  orderDetail: null,
  isLoadingOrderDetail: false,
  orderDetailError: null,
};

// Payload type for fetchOrdersRequest action
export interface FetchOrdersRequestPayload {
  page?: number;
  limit?: number;
}

// Payload type for createOrderRequest action
// Note: selectedItems are fetched from cart state in saga, not passed from component
export interface CreateOrderRequestPayload {
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  shippingAddress: {
    address: string;
    ward: string;
    district: string;
    city: string;
    cityId: number;
    districtId: number;
    wardId: number;
  };
  paymentMethod: PaymentMethod;
  note?: string;
  onSuccess?: (_order: Order) => void;
  onError?: (_error: string) => void;
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Create order actions
    createOrderRequest: (state, _action: PayloadAction<CreateOrderRequestPayload>) => {
      state.isLoading = true;
      state.error = null;
    },
    createOrderSuccess: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    createOrderFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
    },

    // Fetch orders (order history) actions
    fetchOrdersRequest: (state, _action: PayloadAction<FetchOrdersRequestPayload | undefined>) => {
      state.isLoadingOrders = true;
      state.ordersError = null;
    },
    fetchOrdersSuccess: (state, action: PayloadAction<GetOrdersResponse>) => {
      state.orders = action.payload.docs;
      state.ordersPage = action.payload.page;
      state.ordersTotalPages = action.payload.totalPages;
      state.ordersTotal = action.payload.total;
      state.isLoadingOrders = false;
      state.ordersError = null;
    },
    fetchOrdersFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingOrders = false;
      state.ordersError = action.payload;
    },

    // Fetch order detail actions (by ID)
    fetchOrderDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoadingOrderDetail = true;
      state.orderDetailError = null;
    },
    // Fetch order detail by order number (for payment success page)
    fetchOrderByNumberRequest: (state, _action: PayloadAction<string>) => {
      state.isLoadingOrderDetail = true;
      state.orderDetailError = null;
    },
    fetchOrderDetailSuccess: (state, action: PayloadAction<Order>) => {
      state.orderDetail = action.payload;
      state.isLoadingOrderDetail = false;
      state.orderDetailError = null;
    },
    fetchOrderDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingOrderDetail = false;
      state.orderDetailError = action.payload;
    },
    clearOrderDetail: (state) => {
      state.orderDetail = null;
      state.orderDetailError = null;
    },
  },
});

export const {
  createOrderRequest,
  createOrderSuccess,
  createOrderFailure,
  clearCurrentOrder,
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderDetailRequest,
  fetchOrderByNumberRequest,
  fetchOrderDetailSuccess,
  fetchOrderDetailFailure,
  clearOrderDetail,
} = orderSlice.actions;

export default orderSlice.reducer;
