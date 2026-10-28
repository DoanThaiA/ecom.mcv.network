import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PromotionProduct } from '../../promotion-products/domain/promotion-product';

export class SortPromotionProductQueryDto {
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'effectivePrice',
  })
  @IsString()
  orderBy: keyof PromotionProduct;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'] })
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc';
}

export class QueryPromotionProductsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description:
      'JSON string with filter options: { search?, categoryIds?, minPrice?, maxPrice? }',
    example: '{"search":"áo","categoryIds":["id1"]}',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  })
  filters?: {
    search?: string;
    categoryIds?: string[];
    minPrice?: number;
    maxPrice?: number;
  };

  @ApiPropertyOptional({ type: [SortPromotionProductQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => SortPromotionProductQueryDto)
  sort?: SortPromotionProductQueryDto[];
}
