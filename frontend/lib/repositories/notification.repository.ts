import axiosInstance from '@/lib/axios';
import { UserNotification as UserNotificationFns } from '@/types/gen/shop/shared/push-notifications/push-notification';
import type { UserNotification } from '@/types/gen/shop/shared/push-notifications/push-notification';

export type { UserNotification };

export interface NotificationListResponse {
  data: UserNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

class NotificationRepository {
  getNotifications = async (
    page: number,
    limit: number,
  ): Promise<NotificationListResponse> => {
    const response = await axiosInstance.get<{
      data: unknown[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
    }>('/shop/notifications', { params: { page, limit } });

    return {
      ...response.data,
      data: response.data.data.map((item) =>
        UserNotificationFns.fromJSON(item),
      ),
    };
  };

  getUnreadCount = async (): Promise<number> => {
    const response = await axiosInstance.get<{ count: number }>(
      '/shop/notifications/unread-count',
    );
    return response.data.count;
  };

  markAsRead = async (notificationId: string): Promise<void> => {
    await axiosInstance.patch(`/shop/notifications/${notificationId}/read`);
  };

  markAllAsRead = async (): Promise<void> => {
    await axiosInstance.patch('/shop/notifications/read-all');
  };
}

export const notificationRepository = new NotificationRepository();
