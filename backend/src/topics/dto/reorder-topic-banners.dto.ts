import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single banner reorder item
 */
export class ReorderTopicBannerItemDto {
  @ApiProperty({ type: String, description: 'Banner item ID' })
  @IsString()
  bannerId: string;

  @ApiProperty({ type: Number, description: 'New display order' })
  @IsNumber()
  @Min(0)
  order: number;
}

/**
 * DTO for reordering banners within a topic
 */
export class ReorderTopicBannersDto {
  @ApiProperty({
    type: [ReorderTopicBannerItemDto],
    description: 'Banners with new order values',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTopicBannerItemDto)
  banners: ReorderTopicBannerItemDto[];
}
