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
import { ProductStatus } from '../domain/product-status.enum';
import { ProductType } from '../domain/product-type.enum';
import { Product } from '../domain/product';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import {
  PRODUCT_STATUS_PROTO_MAP,
  PRODUCT_TYPE_PROTO_MAP,
} from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for filtering products
 */
export class FilterProductDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by product name or code',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ProductStatus,
    description: 'Filter by product status (single)',
  })
  @IsOptional()
  @TransformProtoEnum(ProductStatus, PRODUCT_STATUS_PROTO_MAP)
  status?: ProductStatus;

  @ApiPropertyOptional({
    type: [Number],
    enum: ProductStatus,
    isArray: true,
    description: 'Filter by multiple product statuses',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ProductStatus, { each: true })
  statuses?: ProductStatus[];

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by category ID (single)',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by multiple category IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by brand ID',
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    enum: ['nhanh', 'shopify'],
    description: 'Filter by data source',
  })
  @IsOptional()
  @IsEnum(['nhanh', 'shopify'])
  source?: 'nhanh' | 'shopify';

  @ApiPropertyOptional({
    enum: ProductType,
    description: 'Filter by product type',
  })
  @IsOptional()
  @TransformProtoEnum(ProductType, PRODUCT_TYPE_PROTO_MAP)
  type?: ProductType;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by business ID',
  })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by specific product IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({
    type: Number,
    description: 'Minimum price filter (filters on prices.retail)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum price filter (filters on prices.retail)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'If true, only return products with prices.retail > 0',
  })
  @IsOptional()
  hasRetailPrice?: boolean;
}

/**
 * DTO for sorting products
 */
export class SortProductDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof Product;

  @ApiPropertyOptional()
  @IsString()
  order: string;
}

/**
 * DTO for querying products
 */
export class QueryProductDto {
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
    type: FilterProductDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"search":"iPhone","status":1}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterProductDto)
  filters?: FilterProductDto | null;

  @ApiPropertyOptional({
    type: [SortProductDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"name","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortProductDto)
  sort?: SortProductDto[] | null;
}
