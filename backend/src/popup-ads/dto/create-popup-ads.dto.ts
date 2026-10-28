import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

/**
 * DTO for creating a new popup ads
 */
export class CreatePopupAdsDto {
  @ApiProperty({
    type: String,
    description: 'Image URL (773x464px)',
    example: 'https://cdn.example.com/popup.jpg',
  })
  @IsString()
  image: string;

  @ApiProperty({
    type: String,
    description: 'Display start time (ISO 8601)',
    example: '2025-02-10T00:00:00.000Z',
  })
  @IsDateString()
  startAt: string;

  @ApiProperty({
    type: String,
    description: 'Display end time (ISO 8601)',
    example: '2025-01-25T23:59:59.000Z',
  })
  @IsDateString()
  endAt: string;

  @ApiProperty({
    type: String,
    description: 'Popup name',
    example: 'Summer Sale Popup',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional click-through URL',
    example: 'https://example.com/promotion',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order (lower value = displayed first)',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the popup ads is active (default: true)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
