import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { FlashSaleStatus } from '../domain/flash-sale-status.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { FLASH_SALE_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for filtering flash sales
 */
export class FilterFlashSaleDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by flash sale name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: FlashSaleStatus,
    description:
      'Filter by computed status (active, upcoming, ended, disabled)',
  })
  @IsOptional()
  @TransformProtoEnum(FlashSaleStatus, FLASH_SALE_STATUS_PROTO_MAP)
  status?: FlashSaleStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by product ID (flash sales containing this product)',
  })
  @IsOptional()
  @IsString()
  productId?: string;
}

/**
 * DTO for sorting flash sales
 */
export class SortFlashSaleDto {
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
 * DTO for querying flash sales
 */
export class QueryFlashSaleDto {
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
    type: FilterFlashSaleDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"status":"active"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterFlashSaleDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterFlashSaleDto)
  filters?: FilterFlashSaleDto | null;

  @ApiPropertyOptional({
    type: [SortFlashSaleDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"startTime","order":"desc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortFlashSaleDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortFlashSaleDto)
  sort?: SortFlashSaleDto[] | null;
}
