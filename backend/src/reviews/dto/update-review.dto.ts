import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO for toggling review visibility
 */
export class ToggleVisibilityDto {
  @ApiPropertyOptional({ description: 'Set to true to show, false to hide' })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
