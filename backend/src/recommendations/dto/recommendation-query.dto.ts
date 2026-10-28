import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Query DTO for personalized recommendations
 */
export class PersonalizedRecommendationQueryDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum number of recommendations',
    default: 8,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 8;
}

/**
 * Query DTO for cross-sell recommendations
 */
export class CrossSellRecommendationQueryDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Comma-separated product IDs',
    example: '507f1f77bcf86cd799439011,507f1f77bcf86cd799439012',
  })
  @IsString()
  productIds: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum number of recommendations',
    default: 8,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 8;
}
