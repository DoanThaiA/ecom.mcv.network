import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PromotionType } from '../domain/promotion-type.enum';
import { PromotionStatus } from '../domain/promotion-status.enum';

export class QueryPromotionDto {
  @ApiPropertyOptional({ description: 'Page number (1-indexed)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: PromotionType, description: 'Filter by type' })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(PromotionType)
  type?: PromotionType;

  @ApiPropertyOptional({
    enum: PromotionStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
