import axiosInstance from 'src/utils/axios';
import { PushNotification as PushNotificationFns } from 'src/types/gen/shared/shared/push-notifications/push-notification';
import type { PushNotification } from 'src/types/gen/shared/shared/push-notifications/push-notification';
import type {
  CreatePushNotificationRequest,
  UpdatePushNotificationRequest,
} from 'src/types/gen/cms/cms/push-notifications/push-notification';
import type {
  GetPushNotificationListRequest,
  GetPushNotificationListResponse,
} from 'src/types/push-notification';

class PushNotificationRepository {
  getList = async (
    params: GetPushNotificationListRequest
  ): Promise<GetPushNotificationListResponse> => {
    const queryParams: Record<string, string> = {};

    if (params.page !== undefined) {
      queryParams.page = params.page.toString();
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }

    const filters: Record<string, unknown> = {};
    if (params.search) filters.search = params.search;
    if (params.status !== undefined) filters.status = params.status;
    if (params.category !== undefined) filters.category = params.category;

    if (Object.keys(filters).length > 0) {
      queryParams.filters = JSON.stringify(filters);
    }

    const response = await axiosInstance.get<{
      data: unknown[];
      hasNextPage: boolean;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/cms/push-notifications', {
      params: queryParams,
    });

    const result = response.data;

    return {
      data: result.data.map((item) => PushNotificationFns.fromJSON(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  };

  getById = async (id: string): Promise<PushNotification | null> => {
    const response = await axiosInstance.get<unknown>(`/cms/push-notifications/${id}`);
    return PushNotificationFns.fromJSON(response.data);
  };

  create = async (data: CreatePushNotificationRequest): Promise<PushNotification> => {
    const response = await axiosInstance.post<unknown>('/cms/push-notifications', data);
    return PushNotificationFns.fromJSON(response.data);
  };

  update = async (id: string, data: UpdatePushNotificationRequest): Promise<PushNotification> => {
    const response = await axiosInstance.patch<unknown>(`/cms/push-notifications/${id}`, data);
    return PushNotificationFns.fromJSON(response.data);
  };

  delete = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cms/push-notifications/${id}`);
  };

  send = async (id: string): Promise<PushNotification> => {
    const response = await axiosInstance.post<unknown>(`/cms/push-notifications/${id}/send`);
    return PushNotificationFns.fromJSON(response.data);
  };

  recall = async (id: string): Promise<PushNotification> => {
    const response = await axiosInstance.post<unknown>(`/cms/push-notifications/${id}/recall`);
    return PushNotificationFns.fromJSON(response.data);
  };
}

export const pushNotificationRepository = new PushNotificationRepository();
