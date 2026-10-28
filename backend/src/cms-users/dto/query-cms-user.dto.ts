import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { CmsUser } from '../domain/cms-user';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AccountTypeEnum } from '../permissions/account-type.enum';

export class FilterCmsUserDto {
  /** @deprecated No longer used. */
  @IsOptional()
  permissionGroups?: number[] | null;

  @IsOptional()
  @IsString()
  search?: string | null;

  @IsOptional()
  @IsEnum(StatusEnum, { each: true })
  statuses?: StatusEnum[] | null;

  @IsOptional()
  @IsEnum(AccountTypeEnum, { each: true })
  accountTypes?: AccountTypeEnum[] | null;
}

export class SortCmsUserDto {
  @Type(() => String)
  @IsString()
  orderBy: keyof CmsUser;

  @IsString()
  order: string;
}

export class QueryCmsUserDto {
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
    type: String,
    description:
      'Filter criteria (JSON string). Example: {"permissionGroups":[1,2]}',
    example: '{"permissionGroups":[1,2]}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterCmsUserDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterCmsUserDto)
  filters?: FilterCmsUserDto | null;

  @ApiPropertyOptional({
    type: String,
    description:
      'Sort criteria (JSON string). Example: [{"orderBy":"email","order":"asc"}]',
    example: '[{"orderBy":"email","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortCmsUserDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortCmsUserDto)
  sort?: SortCmsUserDto[] | null;
}
