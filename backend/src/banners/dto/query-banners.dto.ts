import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { BannerPosition } from '../model/banner-position.enum';

/**
 * DTO for querying/filtering banners
 */
export class QueryBannersDto {
  @ApiPropertyOptional({
    enum: BannerPosition,
    enumName: 'BannerPosition',
    description: 'Filter by banner position',
    example: BannerPosition.HERO_SLIDER,
  })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
