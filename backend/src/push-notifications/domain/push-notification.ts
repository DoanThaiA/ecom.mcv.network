import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PushNotificationStatus } from './push-notification-status.enum';
import { PushNotificationCategory } from './push-notification-category.enum';

const idType = String;

/**
 * Push notification domain entity
 */
export class PushNotification {
  @ApiProperty({ type: idType })
  id: string;

  @ApiProperty({ enum: PushNotificationCategory })
  category: PushNotificationCategory;

  @ApiProperty({ type: String, maxLength: 100 })
  title: string;

  @ApiProperty({ type: String, maxLength: 250 })
  subtitle: string;

  @ApiPropertyOptional({ type: String })
  url?: string | null;

  @ApiProperty({ enum: PushNotificationStatus })
  status: PushNotificationStatus;

  @ApiPropertyOptional({ type: Date })
  scheduledAt?: Date | null;

  @ApiPropertyOptional({ type: Date })
  sentAt?: Date | null;

  @ApiProperty({ type: Number, default: 0 })
  readersCount: number;

  @ApiPropertyOptional({ type: String })
  createdBy?: string | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: String })
  queueJobId?: string | null;

  @ApiPropertyOptional({ type: Date })
  deletedAt?: Date | null;
}
