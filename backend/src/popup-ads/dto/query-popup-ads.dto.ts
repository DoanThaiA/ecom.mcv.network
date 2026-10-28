import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for filtering popup ads queries
 */
export class QueryPopupAdsDto {
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Search by popup name (case-insensitive partial match)',
    example: 'sale',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
