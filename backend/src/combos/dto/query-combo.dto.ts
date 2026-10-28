import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ComboStatus } from '../domain/combo-status.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { COMBO_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for filtering combos
 */
export class FilterComboDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by combo name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ComboStatus,
    description: 'Filter by combo status',
  })
  @IsOptional()
  @TransformProtoEnum(ComboStatus, COMBO_STATUS_PROTO_MAP)
  status?: ComboStatus;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Only show valid combos (within date range)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isValid?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by product ID (combos containing this product)',
  })
  @IsOptional()
  @IsString()
  productId?: string;
}

/**
 * DTO for sorting combos
 */
export class SortComboDto {
  @ApiPropertyOptional({
    enum: ['createdAt', 'name', 'originalPrice'],
    description: 'Field to sort by',
  })
  @IsIn(['createdAt', 'name', 'originalPrice'])
  orderBy: 'createdAt' | 'name' | 'originalPrice';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc';
}

/**
 * DTO for querying combos
 */
export class QueryComboDto {
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
    type: FilterComboDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"status":"active","isValid":true}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterComboDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterComboDto)
  filters?: FilterComboDto | null;

  @ApiPropertyOptional({
    type: [SortComboDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"name","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortComboDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortComboDto)
  sort?: SortComboDto[] | null;
}
