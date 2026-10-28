import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { MenuStatus } from '../domain/menu-status.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { MENU_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for filtering menus
 */
export class FilterMenuDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by menu name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: MenuStatus,
    description: 'Filter by menu status',
  })
  @IsOptional()
  @TransformProtoEnum(MenuStatus, MENU_STATUS_PROTO_MAP)
  status?: MenuStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by parent ID (null for root menus)',
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}

/**
 * DTO for sorting menus
 */
export class SortMenuDto {
  @ApiPropertyOptional({
    enum: ['createdAt', 'name', 'order'],
    description: 'Field to sort by',
  })
  @IsIn(['createdAt', 'name', 'order'])
  orderBy: 'createdAt' | 'name' | 'order';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc';
}

/**
 * DTO for querying menus
 */
export class QueryMenuDto {
  @ApiPropertyOptional({
    type: FilterMenuDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"status":"active"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterMenuDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterMenuDto)
  filters?: FilterMenuDto | null;

  @ApiPropertyOptional({
    type: [SortMenuDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"order","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortMenuDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortMenuDto)
  sort?: SortMenuDto[] | null;
}
