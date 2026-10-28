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
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FitLevel } from '../domain/fit-level.enum';

/**
 * DTO cho CMS tạo review từng sản phẩm (không cần order thực)
 */
export class CreateCmsProductReviewDto {
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

  @ApiProperty({ description: 'Height in cm (50-250)' })
  @IsInt()
  @Min(50)
  @Max(250)
  heightCm: number;

  @ApiProperty({ description: 'Weight in kg (20-300)' })
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
 * DTO cho CMS tạo review seeding (không cần order thực)
 */
export class CreateCmsReviewDto {
  @ApiProperty({ description: 'Tên người dùng (seeding)' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    type: [CreateCmsProductReviewDto],
    description: 'Product reviews (tối thiểu 1 sản phẩm)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCmsProductReviewDto)
  @ArrayMinSize(1)
  productReviews: CreateCmsProductReviewDto[];
}
