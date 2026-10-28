import { PaginateResult } from 'mongoose';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { PushNotification } from './push-notification';
import { PushNotificationStatus } from './push-notification-status.enum';
import { PushNotificationCategory } from './push-notification-category.enum';

/**
 * Filter options for querying push notifications
 */
export interface FilterPushNotificationDto {
  status?: PushNotificationStatus;
  category?: PushNotificationCategory;
  search?: string;
}

/**
 * Abstract repository interface for PushNotification entity
 */
export abstract class PushNotificationRepository {
  abstract create(
    data: Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PushNotification>;

  abstract findManyWithPagination(params: {
    filterOptions?: FilterPushNotificationDto | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<PushNotification>>;

  abstract findById(
    id: PushNotification['id'],
  ): Promise<NullableType<PushNotification>>;

  abstract update(
    id: PushNotification['id'],
    payload: DeepPartial<PushNotification>,
  ): Promise<NullableType<PushNotification>>;

  abstract remove(id: PushNotification['id']): Promise<void>;

  abstract incrementReadersCount(id: PushNotification['id']): Promise<void>;

  abstract incrementReadersCountMany(
    ids: PushNotification['id'][],
  ): Promise<void>;
}
