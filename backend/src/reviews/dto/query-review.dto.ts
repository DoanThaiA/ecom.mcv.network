import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FitLevel } from '../domain/fit-level.enum';
import { ReviewStatus } from '../domain/review-status.enum';

/**
 * DTO for querying reviews
 */
export class QueryReviewDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ enum: ReviewStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiPropertyOptional({ description: 'Filter by exact rating (1-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ enum: FitLevel, description: 'Filter by fit level' })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(FitLevel)
  fitLevel?: FitLevel;

  @ApiPropertyOptional({ description: 'Filter by height (cm)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  heightCm?: number;

  @ApiPropertyOptional({ description: 'Filter by weight (kg)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Search keyword (order ID, product name, content)',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Sort by: newest, highest, lowest',
    default: 'newest',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'newest' | 'highest' | 'lowest';
}
