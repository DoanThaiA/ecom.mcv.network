import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';

/**
 * DTO for filtering shop products (public)
 */
export class ShopFilterProductDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by product name or code',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by category IDs (supports multiple)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by topic ID',
  })
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Minimum price filter',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum price filter',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}

/**
 * DTO for sorting shop products
 */
export class ShopSortProductDto {
  @ApiPropertyOptional({
    enum: [
      'name',
      'price',
      'createdAt',
      'discount',
      'discountPercent',
      'order',
    ],
    description:
      'Field to sort by. "price" uses effective price (flash sale price if available), ' +
      '"discount" sorts by discount amount, "discountPercent" sorts by discount percentage, ' +
      '"order" sorts by admin-defined display order (flash sale only)',
  })
  @IsOptional()
  @IsEnum([
    'name',
    'price',
    'createdAt',
    'discount',
    'discountPercent',
    'order',
  ])
  orderBy?:
    | 'name'
    | 'price'
    | 'createdAt'
    | 'discount'
    | 'discountPercent'
    | 'order';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort direction',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

/**
 * DTO for querying shop products with infinite scroll support
 */
export class ShopQueryProductDto {
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
    description: 'Items per page (max 50)',
    default: 20,
  })
  @Transform(({ value }) => (value ? Number(value) : 20))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Cursor for infinite scroll (product ID to start after)',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    type: ShopFilterProductDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"search":"iPhone","categoryIds":["123","456"]}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(ShopFilterProductDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => ShopFilterProductDto)
  filters?: ShopFilterProductDto | null;

  @ApiPropertyOptional({
    type: ShopSortProductDto,
    description:
      'Sort criteria (passed as JSON string in query). Example: {"orderBy":"price","order":"asc"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(ShopSortProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => ShopSortProductDto)
  sort?: ShopSortProductDto | null;
}

/**
 * DTO for querying flash sale products with pagination, filtering, and sorting
 */
export class ShopFlashSaleQueryDto {
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
    description: 'Items per page (max 50)',
    default: 20,
  })
  @Transform(({ value }) => (value ? Number(value) : 20))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    type: ShopFilterProductDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"search":"iPhone","categoryIds":["123","456"],"minPrice":50000,"maxPrice":160000}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(ShopFilterProductDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => ShopFilterProductDto)
  filters?: ShopFilterProductDto | null;

  @ApiPropertyOptional({
    type: ShopSortProductDto,
    description:
      'Sort criteria (passed as JSON string in query). Example: {"orderBy":"price","order":"asc"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(ShopSortProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => ShopSortProductDto)
  sort?: ShopSortProductDto | null;
}

/**
 * DTO for querying flash sale detail by ID with pagination
 */
export class ShopFlashSaleByIdQueryDto {
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
    description: 'Items per page (max 50)',
    default: 20,
  })
  @Transform(({ value }) => (value ? Number(value) : 20))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
