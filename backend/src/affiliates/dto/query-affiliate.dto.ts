import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { Affiliate } from '../domain/affiliate';
import { AffiliateType } from '../domain/affiliate-type.enum';
import { AffiliateStatus } from '../domain/affiliate-status.enum';

export class FilterAffiliateDto {
  @IsOptional()
  @IsEnum(AffiliateStatus, { each: true })
  statuses?: AffiliateStatus[] | null;

  @IsOptional()
  @IsEnum(AffiliateType, { each: true })
  types?: AffiliateType[] | null;

  @IsOptional()
  @IsString()
  search?: string | null;
}

export class SortAffiliateDto {
  @Type(() => String)
  @IsString()
  orderBy: keyof Affiliate;

  @IsString()
  order: string;
}

export class QueryAffiliateDto {
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
      'Filter criteria (JSON string). Example: {"statuses":[1],"types":[1,2],"search":"keyword"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterAffiliateDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterAffiliateDto)
  filters?: FilterAffiliateDto | null;

  @ApiPropertyOptional({
    type: String,
    description:
      'Sort criteria (JSON string). Example: [{"orderBy":"name","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortAffiliateDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortAffiliateDto)
  sort?: SortAffiliateDto[] | null;
}
