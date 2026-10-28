export {
  PushNotificationStatus,
  PushNotificationCategory,
} from 'src/types/gen/shared/shared/common/enums';

export type {
  PushNotification,
  PushNotificationListItem,
} from 'src/types/gen/shared/shared/push-notifications/push-notification';

export type {
  CreatePushNotificationRequest,
  UpdatePushNotificationRequest,
  FilterPushNotification,
  SortPushNotification,
  QueryPushNotificationsRequest,
  QueryPushNotificationsResponse,
} from 'src/types/gen/cms/cms/push-notifications/push-notification';

export interface GetPushNotificationListRequest {
  page: number;
  limit: number;
  search?: string;
  status?: number;
  category?: number;
}

export interface GetPushNotificationListResponse {
  data: import('src/types/gen/shared/shared/push-notifications/push-notification').PushNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PushNotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
