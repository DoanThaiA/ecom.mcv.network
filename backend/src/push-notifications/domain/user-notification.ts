import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * User notification domain entity
 * Tracks per-user delivery and read status
 */
export class UserNotification {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String })
  notificationId: string;

  @ApiProperty({ type: Boolean, default: false })
  isRead: boolean;

  @ApiPropertyOptional({ type: Date })
  readAt?: Date | null;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
