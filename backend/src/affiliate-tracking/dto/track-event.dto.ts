import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TrackingEventType } from '../domain/tracking-event-type.enum';

export class TrackEventDto {
  @ApiProperty({
    type: String,
    description: 'Affiliate code (AFF-XXXXXX)',
    example: 'AFF-ABC123',
  })
  @IsNotEmpty()
  @IsString()
  affiliateCode: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Product ID being viewed',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    enum: TrackingEventType,
    description: 'Event type (defaults to CLICK)',
    default: TrackingEventType.CLICK,
  })
  @IsOptional()
  @IsEnum(TrackingEventType)
  type?: TrackingEventType;
}
