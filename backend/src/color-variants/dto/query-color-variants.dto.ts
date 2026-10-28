import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ColorVariantDisplayType } from '../domain/color-variant-display-type.enum';

/**
 * DTO for querying/filtering color variants
 */
export class QueryColorVariantsDto {
  @ApiPropertyOptional({
    enum: ColorVariantDisplayType,
    enumName: 'ColorVariantDisplayType',
    description: 'Filter by display type',
    example: ColorVariantDisplayType.SOLID,
  })
  @IsOptional()
  @IsEnum(ColorVariantDisplayType)
  displayType?: ColorVariantDisplayType;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by name (partial match, case-insensitive)',
    example: 'Đen',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
