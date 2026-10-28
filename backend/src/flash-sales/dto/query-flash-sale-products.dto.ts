import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { FlashSaleProduct } from '../../flash-sale-products/domain/flash-sale-product';

/**
 * DTO for filtering flash sale products
 */
export class FilterFlashSaleProductDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by product name or code',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by category IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by product IDs (topic products)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicProductIds?: string[];

  @ApiPropertyOptional({
    type: Number,
    description: 'Minimum price filter (effective price)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum price filter (effective price)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}

/**
 * DTO for sorting flash sale products
 */
export class SortFlashSaleProductDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof FlashSaleProduct;

  @ApiPropertyOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc';
}

/**
 * DTO for paginating flash sale products on detail endpoints
 */
export class QueryFlashSaleProductsDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page (max 100)',
    default: 20,
  })
  @Transform(({ value }) => (value ? Number(value) : 20))
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    type: FilterFlashSaleProductDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"search":"iPhone","categoryIds":["123"],"minPrice":1000,"maxPrice":5000}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterFlashSaleProductDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterFlashSaleProductDto)
  filters?: FilterFlashSaleProductDto | null;

  @ApiPropertyOptional({
    type: [SortFlashSaleProductDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"createdAt","order":"desc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(SortFlashSaleProductDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortFlashSaleProductDto)
  sort?: SortFlashSaleProductDto[] | null;
}
