import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * DTO for creating a flash sale import session (file upload with form data)
 */
export class CreateImportSessionDto {
  @ApiProperty({
    type: String,
    description: 'Flash sale start time (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    type: String,
    description: 'Flash sale end time (ISO 8601)',
    example: '2024-01-07T23:59:59Z',
  })
  @IsDateString()
  endTime: string;
}

/**
 * DTO for creating a product discount import session (file upload with form data)
 */
export class CreateProductDiscountImportSessionDto {
  @ApiProperty({
    type: String,
    description: 'Promotion start time (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    type: String,
    description: 'Promotion end time (ISO 8601)',
    example: '2024-01-07T23:59:59Z',
  })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Promotion ID (for edit mode conflict exclusion)',
  })
  @IsOptional()
  @IsString()
  promotionId?: string;
}
