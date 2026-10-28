import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type {
  Order,
  OrderFilters,
  OrderSort,
  OrderTab,
  OrderTabCounts,
  OrderStatus,
} from 'src/types/orders';

/**
 * Order State
 */
export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  currentOrderLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: OrderFilters;
  sort?: OrderSort;
  activeTab: OrderTab;
  tabCounts: OrderTabCounts;
}

const initialTabCounts: OrderTabCounts = {
  all: 0,
  pending: 0,
  confirmed: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  currentOrderLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  sort: undefined,
  activeTab: 'all',
  tabCounts: initialTabCounts,
};

/**
 * Saga Action Payload Types
 */
export type GetOrdersPayload = {
  page?: number;
  limit?: number;
  filters?: OrderFilters;
  sort?: OrderSort;
  onSuccess?: () => void;
};

export type GetOrderByIdPayload = {
  id: string;
  onSuccess?: (order: Order) => void;
};

export type UpdateOrderStatusPayload = {
  orderId: string;
  status: OrderStatus;
  reason?: string;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getOrdersRequest = createAction<GetOrdersPayload>('order/getOrdersRequest');
export const getOrderByIdRequest = createAction<GetOrderByIdPayload>('order/getOrderByIdRequest');
export const updateOrderStatusRequest = createAction<UpdateOrderStatusPayload>(
  'order/updateOrderStatusRequest'
);

/**
 * Order Slice
 */
export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setOrdersSuccess: (
      state,
      action: PayloadAction<{
        orders: Order[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    ) => {
      state.orders = action.payload.orders;
      state.pagination = action.payload.pagination;
      state.loading = false;
      state.error = null;
    },

    setOrderError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    setCurrentOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.currentOrderLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setCurrentOrderSuccess: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
      state.currentOrderLoading = false;
      state.error = null;
    },

    setCurrentOrderError: (state, action: PayloadAction<string>) => {
      state.currentOrderLoading = false;
      state.error = action.payload;
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    clearOrderError: (state) => {
      state.error = null;
    },

    setOrderFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = action.payload;
    },

    setOrderSort: (state, action: PayloadAction<OrderSort | undefined>) => {
      state.sort = action.payload;
    },

    setActiveTab: (state, action: PayloadAction<OrderTab>) => {
      state.activeTab = action.payload;
      // Reset pagination when tab changes
      state.pagination.page = 1;
    },

    setTabCounts: (state, action: PayloadAction<OrderTabCounts>) => {
      state.tabCounts = action.payload;
    },

    resetOrderState: (state) => {
      state.orders = [];
      state.loading = false;
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = undefined;
      state.activeTab = 'all';
    },
  },
});

export const {
  setOrderLoading,
  setOrdersSuccess,
  setOrderError,
  setCurrentOrderLoading,
  setCurrentOrderSuccess,
  setCurrentOrderError,
  clearCurrentOrder,
  clearOrderError,
  setOrderFilters,
  setOrderSort,
  setActiveTab,
  setTabCounts,
  resetOrderState,
} = orderSlice.actions;

/**
 * Selectors
 */
export const selectOrders = (state: { order: OrderState }) => state.order.orders;

export const selectCurrentOrder = (state: { order: OrderState }) => state.order.currentOrder;

export const selectOrderLoading = (state: { order: OrderState }) => state.order.loading;

export const selectCurrentOrderLoading = (state: { order: OrderState }) =>
  state.order.currentOrderLoading;

export const selectOrderError = (state: { order: OrderState }) => state.order.error;

export const selectOrderPagination = (state: { order: OrderState }) => state.order.pagination;

export const selectOrderFilters = (state: { order: OrderState }) => state.order.filters;

export const selectOrderSort = (state: { order: OrderState }) => state.order.sort;

export const selectActiveTab = (state: { order: OrderState }) => state.order.activeTab;

export const selectTabCounts = (state: { order: OrderState }) => state.order.tabCounts;

export default orderSlice.reducer;
