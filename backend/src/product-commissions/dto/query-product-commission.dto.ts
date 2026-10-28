import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ProductCommission } from '../domain/product-commission';

export class FilterProductCommissionDto {
  @IsOptional()
  @IsString()
  search?: string | null;

  @IsOptional()
  @IsString()
  categoryName?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryNames?: string[] | null;
}

export class SortProductCommissionDto {
  @Type(() => String)
  @IsString()
  orderBy: keyof ProductCommission;

  @IsString()
  order: string;
}

export class QueryProductCommissionDto {
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
    default: 20,
  })
  @Transform(({ value }) => (value ? Number(value) : 20))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter criteria (JSON string). Example: {"search":"keyword"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterProductCommissionDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterProductCommissionDto)
  filters?: FilterProductCommissionDto | null;

  @ApiPropertyOptional({
    type: String,
    description:
      'Sort criteria (JSON string). Example: [{"orderBy":"name","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(SortProductCommissionDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortProductCommissionDto)
  sort?: SortProductCommissionDto[] | null;
}
