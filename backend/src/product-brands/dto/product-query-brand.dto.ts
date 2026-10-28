import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ProductBrand } from '../domain/product-brand';
import { ProductBrandStatus } from '../domain/product-brand-status.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { PRODUCT_BRAND_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for filtering brands
 */
export class FilterProductBrandDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by brand name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ProductBrandStatus,
    description: 'Filter by brand status',
  })
  @IsOptional()
  @TransformProtoEnum(ProductBrandStatus, PRODUCT_BRAND_STATUS_PROTO_MAP)
  status?: ProductBrandStatus;

  @ApiPropertyOptional({
    enum: ['nhanh', 'shopify'],
    description: 'Filter by data source',
  })
  @IsOptional()
  @IsEnum(['nhanh', 'shopify'])
  source?: 'nhanh' | 'shopify';
}

/**
 * DTO for sorting brands
 */
export class SortProductBrandDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof ProductBrand;

  @ApiPropertyOptional()
  @IsString()
  order: string;
}

/**
 * DTO for querying brands
 */
export class QueryProductBrandDto {
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
    type: FilterProductBrandDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"search":"Apple","status":1}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterProductBrandDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterProductBrandDto)
  filters?: FilterProductBrandDto | null;

  @ApiPropertyOptional({
    type: [SortProductBrandDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"name","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortProductBrandDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortProductBrandDto)
  sort?: SortProductBrandDto[] | null;
}
