import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ShippingPromotionType } from '../domain/shipping-promotion-type.enum';
import { ShippingPromotionStatus } from '../domain/shipping-promotion-status.enum';

/**
 * DTO for filtering shipping promotions
 */
export class FilterShippingPromotionDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by promotion name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ShippingPromotionType,
    description: 'Filter by promotion type',
  })
  @IsOptional()
  @IsEnum(ShippingPromotionType)
  type?: ShippingPromotionType;

  @ApiPropertyOptional({
    enum: ShippingPromotionStatus,
    description:
      'Filter by computed status (active, upcoming, ended, disabled)',
  })
  @IsOptional()
  @IsEnum(ShippingPromotionStatus)
  status?: ShippingPromotionStatus;
}

/**
 * DTO for sorting shipping promotions
 */
export class SortShippingPromotionDto {
  @ApiPropertyOptional({
    enum: ['createdAt', 'name', 'startTime', 'endTime'],
    description: 'Field to sort by',
  })
  @IsIn(['createdAt', 'name', 'startTime', 'endTime'])
  orderBy: 'createdAt' | 'name' | 'startTime' | 'endTime';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc';
}

/**
 * DTO for querying shipping promotions
 */
export class QueryShippingPromotionDto {
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
    type: FilterShippingPromotionDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"status":"active"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterShippingPromotionDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterShippingPromotionDto)
  filters?: FilterShippingPromotionDto | null;

  @ApiPropertyOptional({
    type: [SortShippingPromotionDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"startTime","order":"desc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(SortShippingPromotionDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortShippingPromotionDto)
  sort?: SortShippingPromotionDto[] | null;
}
