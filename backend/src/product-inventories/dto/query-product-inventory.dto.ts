import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ProductInventory } from '../domain/product-inventory';

/**
 * DTO for filtering inventory
 */
export class FilterProductInventoryDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Filter by product ID',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Search by product name or barcode',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['nhanh', 'shopify'],
    description: 'Filter by data source',
  })
  @IsOptional()
  @IsEnum(['nhanh', 'shopify'])
  source?: 'nhanh' | 'shopify';

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by availability (has stock > 0)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;
}

/**
 * DTO for sorting inventory
 */
export class SortProductInventoryDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof ProductInventory;

  @ApiPropertyOptional()
  @IsString()
  order: string;
}

/**
 * DTO for querying inventory
 */
export class QueryProductInventoryDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page',
    default: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    type: FilterProductInventoryDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"search":"iPhone","inStock":true}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterProductInventoryDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterProductInventoryDto)
  filters?: FilterProductInventoryDto | null;

  @ApiPropertyOptional({
    type: [SortProductInventoryDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"totalAvailable","order":"desc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(SortProductInventoryDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortProductInventoryDto)
  sort?: SortProductInventoryDto[] | null;
}
