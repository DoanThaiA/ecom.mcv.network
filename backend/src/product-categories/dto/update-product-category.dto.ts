import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for localization (multi-language support)
 */
export class LocalizationDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Vietnamese text',
    example: 'Điện tử',
  })
  @IsOptional()
  vi?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'English text',
    example: 'Electronics',
  })
  @IsOptional()
  en?: string;
}

/**
 * DTO for updating product category localization
 */
export class UpdateProductCategoryDto {
  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized category name (vi, en)',
    example: { vi: 'Điện tử', en: 'Electronics' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  nameLocalization?: LocalizationDto;
}
