import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO for updating a flash sale campaign
 */
export class UpdateFlashSaleDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Flash sale campaign name',
    example: 'Flash Sale Tháng 12',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Flash sale start time (ISO 8601)',
    example: '2025-12-01T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Flash sale end time (ISO 8601)',
    example: '2025-12-10T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether the flash sale is enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
