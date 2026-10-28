import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PushNotificationStatus } from '../domain/push-notification-status.enum';
import { PushNotificationCategory } from '../domain/push-notification-category.enum';

/**
 * DTO for querying/filtering push notifications
 */
export class QueryPushNotificationsDto {
  @ApiPropertyOptional({ enum: PushNotificationStatus })
  @IsOptional()
  @IsEnum(PushNotificationStatus)
  status?: PushNotificationStatus;

  @ApiPropertyOptional({ enum: PushNotificationCategory })
  @IsOptional()
  @IsEnum(PushNotificationCategory)
  category?: PushNotificationCategory;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  search?: string;
}
