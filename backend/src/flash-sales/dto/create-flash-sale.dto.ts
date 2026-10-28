import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';

/**
 * DTO for creating a new flash sale campaign
 */
export class CreateFlashSaleDto {
  @ApiProperty({
    type: String,
    description: 'Flash sale campaign name',
    example: 'Flash Sale Tháng 12',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Flash sale start time (ISO 8601)',
    example: '2025-12-01T17:00:00.000Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Flash sale end time (ISO 8601)',
    example: '2025-12-10T17:00:00.000Z',
  })
  @IsDateString()
  endTime: string;
}
