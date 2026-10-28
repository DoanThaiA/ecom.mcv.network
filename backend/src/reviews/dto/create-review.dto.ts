import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FitLevel } from '../domain/fit-level.enum';

/**
 * DTO for creating a single product review
 */
export class CreateProductReviewDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ description: 'Rating (1-5 stars)', default: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Height in cm' })
  @IsInt()
  @Min(50)
  @Max(250)
  heightCm: number;

  @ApiProperty({ description: 'Weight in kg' })
  @IsNumber()
  @Min(20)
  @Max(300)
  weightKg: number;

  @ApiProperty({
    enum: FitLevel,
    description: 'Fit level',
    default: FitLevel.FIT,
  })
  @IsEnum(FitLevel)
  fitLevel: FitLevel;

  @ApiPropertyOptional({ description: 'Review content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Media file IDs (max 5)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  mediaIds?: string[];
}

/**
 * DTO for creating a review for an order
 */
export class CreateReviewDto {
  @ApiProperty({ description: 'Order number' })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({
    type: [CreateProductReviewDto],
    description: 'Product reviews',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductReviewDto)
  productReviews: CreateProductReviewDto[];
}
