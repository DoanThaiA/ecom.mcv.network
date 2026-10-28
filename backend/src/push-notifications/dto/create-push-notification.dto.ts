import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { PushNotificationStatus } from '../domain/push-notification-status.enum';
import { PushNotificationCategory } from '../domain/push-notification-category.enum';

/**
 * DTO for creating a push notification
 */
export class CreatePushNotificationDto {
  @ApiProperty({ enum: PushNotificationCategory })
  @IsEnum(PushNotificationCategory)
  @IsNotEmpty()
  category: PushNotificationCategory;

  @ApiProperty({ type: String, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ type: String, maxLength: 250 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  subtitle: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({ enum: PushNotificationStatus })
  @IsEnum(PushNotificationStatus)
  @IsNotEmpty()
  status: PushNotificationStatus;
}
