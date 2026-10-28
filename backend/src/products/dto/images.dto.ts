import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

/**
 * DTO for product images
 */
export class ImagesDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Avatar/main image URL',
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Other image URLs',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  others?: string[];
}
