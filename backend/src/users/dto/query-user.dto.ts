import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { User } from '../domain/user';

export class FilterUserDto {
  @IsOptional()
  @Type(() => Date)
  createdAtFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  createdAtTo?: Date;
}

export class SortUserDto {
  @Type(() => String)
  @IsString()
  orderBy: keyof User;

  @IsString()
  order: string;
}

export class QueryUserDto {
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
      'Filter criteria (JSON string). Example: {"createdAtFrom":"2025-11-01T00:00:00.000Z","createdAtTo":"2025-11-30T23:59:59.999Z"}',
    example:
      '{"createdAtFrom":"2025-11-01T00:00:00.000Z","createdAtTo":"2025-11-30T23:59:59.999Z"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterUserDto)
  filters?: FilterUserDto | null;

  @ApiPropertyOptional({
    type: String,
    description:
      'Sort criteria (JSON string). Example: [{"orderBy":"createdAt","order":"desc"}]',
    example: '[{"orderBy":"createdAt","order":"desc"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortUserDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortUserDto)
  sort?: SortUserDto[] | null;
}
