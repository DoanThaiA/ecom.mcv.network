import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ProductCategoryStatus } from '../domain/product-category-status.enum';
import { ProductCategory } from '../domain/product-category';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { PRODUCT_CATEGORY_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for filtering categories
 */
export class FilterProductCategoryDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by category name or code',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ProductCategoryStatus,
    description: 'Filter by category status',
  })
  @IsOptional()
  @TransformProtoEnum(ProductCategoryStatus, PRODUCT_CATEGORY_STATUS_PROTO_MAP)
  status?: ProductCategoryStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by parent category ID',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({
    enum: ['nhanh', 'shopify'],
    description: 'Filter by data source',
  })
  @IsOptional()
  @IsEnum(['nhanh', 'shopify'])
  source?: 'nhanh' | 'shopify';
}

/**
 * DTO for sorting categories
 */
export class SortProductCategoryDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof ProductCategory;

  @ApiPropertyOptional()
  @IsString()
  order: string;
}

/**
 * DTO for querying categories
 */
export class QueryProductCategoryDto {
  @ApiPropertyOptional({
    type: FilterProductCategoryDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"search":"Electronics","status":1}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterProductCategoryDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterProductCategoryDto)
  filters?: FilterProductCategoryDto | null;

  @ApiPropertyOptional({
    type: [SortProductCategoryDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"name","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(SortProductCategoryDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortProductCategoryDto)
  sort?: SortProductCategoryDto[] | null;
}
