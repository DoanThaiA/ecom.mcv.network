import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single banner order update
 */
export class ReorderBannerItemDto {
  @ApiProperty({
    type: String,
    description: 'Banner ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  bannerId: string;

  @ApiProperty({
    type: Number,
    description: 'New display order',
    example: 1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  order: number;
}

/**
 * DTO for bulk reordering banners
 */
export class ReorderBannersDto {
  @ApiProperty({
    type: [ReorderBannerItemDto],
    description: 'Array of banner ID and order pairs',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderBannerItemDto)
  banners: ReorderBannerItemDto[];
}
