import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type {
  PushNotification,
  PushNotificationPagination,
  CreatePushNotificationRequest,
  UpdatePushNotificationRequest,
} from 'src/types/push-notification';

export interface PushNotificationState {
  list: PushNotification[];
  current: PushNotification | null;
  loading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  sendLoading: boolean;
  recallLoading: boolean;
  pagination: PushNotificationPagination;
  searchQuery: string;
}

const initialState: PushNotificationState = {
  list: [],
  current: null,
  loading: false,
  currentLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  sendLoading: false,
  recallLoading: false,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  searchQuery: '',
};

export type GetPushNotificationListPayload = {
  page?: number;
  limit?: number;
  search?: string;
  onSuccess?: () => void;
};

export type GetPushNotificationByIdPayload = {
  id: string;
  onSuccess?: (item: PushNotification) => void;
};

export type CreatePushNotificationPayload = {
  data: CreatePushNotificationRequest;
  onSuccess?: (item: PushNotification) => void;
};

export type UpdatePushNotificationPayload = {
  id: string;
  data: UpdatePushNotificationRequest;
  silent?: boolean;
  onSuccess?: (item: PushNotification) => void;
};

export type DeletePushNotificationPayload = {
  id: string;
  onSuccess?: () => void;
};

export type SendPushNotificationPayload = {
  id: string;
  onSuccess?: (item: PushNotification) => void;
};

export type RecallPushNotificationPayload = {
  id: string;
  onSuccess?: (item: PushNotification) => void;
};

// Saga Actions
export const getPushNotificationListRequest = createAction<GetPushNotificationListPayload>(
  'pushNotification/getListRequest'
);
export const getPushNotificationByIdRequest = createAction<GetPushNotificationByIdPayload>(
  'pushNotification/getByIdRequest'
);
export const createPushNotificationRequest = createAction<CreatePushNotificationPayload>(
  'pushNotification/createRequest'
);
export const updatePushNotificationRequest = createAction<UpdatePushNotificationPayload>(
  'pushNotification/updateRequest'
);
export const deletePushNotificationRequest = createAction<DeletePushNotificationPayload>(
  'pushNotification/deleteRequest'
);
export const sendPushNotificationRequest = createAction<SendPushNotificationPayload>(
  'pushNotification/sendRequest'
);
export const recallPushNotificationRequest = createAction<RecallPushNotificationPayload>(
  'pushNotification/recallRequest'
);

export const pushNotificationSlice = createSlice({
  name: 'pushNotification',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setListSuccess: (
      state,
      action: PayloadAction<{
        list: PushNotification[];
        pagination: PushNotificationPagination;
      }>
    ) => {
      state.list = action.payload.list;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },
    setListError: (state) => {
      state.loading = false;
    },

    setCurrentLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },
    setCurrentSuccess: (state, action: PayloadAction<PushNotification>) => {
      state.current = action.payload;
      state.currentLoading = false;
    },
    setCurrentError: (state) => {
      state.currentLoading = false;
    },
    clearCurrent: (state) => {
      state.current = null;
    },

    setCreateLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },
    setCreateSuccess: (state, action: PayloadAction<PushNotification>) => {
      state.list.unshift(action.payload);
      state.createLoading = false;
    },
    setCreateError: (state) => {
      state.createLoading = false;
    },

    setUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },
    setUpdateSuccess: (state, action: PayloadAction<PushNotification>) => {
      const index = state.list.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
      if (state.current?.id === action.payload.id) state.current = action.payload;
      state.updateLoading = false;
    },
    setUpdateError: (state) => {
      state.updateLoading = false;
    },

    setDeleteLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },
    setDeleteSuccess: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((n) => n.id !== action.payload);
      if (state.current?.id === action.payload) state.current = null;
      state.deleteLoading = false;
    },
    setDeleteError: (state) => {
      state.deleteLoading = false;
    },

    setSendLoading: (state, action: PayloadAction<boolean>) => {
      state.sendLoading = action.payload;
    },
    setSendSuccess: (state, action: PayloadAction<PushNotification>) => {
      const index = state.list.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
      if (state.current?.id === action.payload.id) state.current = action.payload;
      state.sendLoading = false;
    },
    setSendError: (state) => {
      state.sendLoading = false;
    },

    setRecallLoading: (state, action: PayloadAction<boolean>) => {
      state.recallLoading = action.payload;
    },
    setRecallSuccess: (state, action: PayloadAction<PushNotification>) => {
      const index = state.list.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
      if (state.current?.id === action.payload.id) state.current = action.payload;
      state.recallLoading = false;
    },
    setRecallError: (state) => {
      state.recallLoading = false;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setLoading,
  setListSuccess,
  setListError,
  setCurrentLoading,
  setCurrentSuccess,
  setCurrentError,
  clearCurrent,
  setCreateLoading,
  setCreateSuccess,
  setCreateError,
  setUpdateLoading,
  setUpdateSuccess,
  setUpdateError,
  setDeleteLoading,
  setDeleteSuccess,
  setDeleteError,
  setSendLoading,
  setSendSuccess,
  setSendError,
  setRecallLoading,
  setRecallSuccess,
  setRecallError,
  setSearchQuery,
} = pushNotificationSlice.actions;

export const selectPushNotificationList = (state: { pushNotification: PushNotificationState }) =>
  state.pushNotification.list;
export const selectPushNotificationCurrent = (state: { pushNotification: PushNotificationState }) =>
  state.pushNotification.current;
export const selectPushNotificationLoading = (state: { pushNotification: PushNotificationState }) =>
  state.pushNotification.loading;
export const selectPushNotificationCurrentLoading = (state: {
  pushNotification: PushNotificationState;
}) => state.pushNotification.currentLoading;
export const selectPushNotificationCreateLoading = (state: {
  pushNotification: PushNotificationState;
}) => state.pushNotification.createLoading;
export const selectPushNotificationUpdateLoading = (state: {
  pushNotification: PushNotificationState;
}) => state.pushNotification.updateLoading;
export const selectPushNotificationSendLoading = (state: {
  pushNotification: PushNotificationState;
}) => state.pushNotification.sendLoading;
export const selectPushNotificationRecallLoading = (state: {
  pushNotification: PushNotificationState;
}) => state.pushNotification.recallLoading;
export const selectPushNotificationPagination = (state: {
  pushNotification: PushNotificationState;
}) => state.pushNotification.pagination;

export default pushNotificationSlice.reducer;
