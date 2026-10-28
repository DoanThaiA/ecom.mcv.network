import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO for querying paginated import session rows
 */
export class QueryImportSessionRowsDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (1-based)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by validity (true = valid, false = invalid)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isValid?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Search by product code or name',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
