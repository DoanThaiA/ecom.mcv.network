import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

/**
 * DTO for product pricing information
 */
export class PricesDto {
  @ApiProperty({
    type: Number,
    description: 'Retail price',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  retail: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Wholesale price',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  wholesale?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Import/cost price',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  import?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Old/original price',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  old?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Average cost',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  avgCost?: number;
}
