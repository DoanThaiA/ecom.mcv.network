import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Localization DTO - reusable for any entity with multi-language support
 */
export class LocalizationDto {
  @ApiPropertyOptional({ type: String, description: 'Vietnamese text' })
  @IsOptional()
  @IsString()
  vi?: string;

  @ApiPropertyOptional({ type: String, description: 'English text' })
  @IsOptional()
  @IsString()
  en?: string;
}
