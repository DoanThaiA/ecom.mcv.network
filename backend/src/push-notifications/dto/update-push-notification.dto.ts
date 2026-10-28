import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { PushNotificationCategory } from '../domain/push-notification-category.enum';

/**
 * DTO for updating a push notification (only DRAFT status)
 */
export class UpdatePushNotificationDto {
  @ApiPropertyOptional({ enum: PushNotificationCategory })
  @IsOptional()
  @IsEnum(PushNotificationCategory)
  category?: PushNotificationCategory;

  @ApiPropertyOptional({ type: String, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ type: String, maxLength: 250 })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  subtitle?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
