import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for adding a product to topic
 */
export class TopicProductDto {
  @ApiProperty({
    type: String,
    description: 'Product ID',
  })
  @IsString()
  productId: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order (defaults to end of list)',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

/**
 * DTO for adding a category to topic
 */
export class TopicCategoryDto {
  @ApiProperty({
    type: String,
    description: 'Category ID',
  })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order (defaults to end of list)',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

/**
 * DTO for adding products to topic
 */
export class AddProductsDto {
  @ApiProperty({
    type: [TopicProductDto],
    description: 'Products to add to the topic',
  })
  @IsArray()
  @Type(() => TopicProductDto)
  products: TopicProductDto[];
}

/**
 * DTO for adding categories to topic
 */
export class AddCategoriesDto {
  @ApiProperty({
    type: [TopicCategoryDto],
    description: 'Categories to add to the topic',
  })
  @IsArray()
  @Type(() => TopicCategoryDto)
  categories: TopicCategoryDto[];
}

/**
 * DTO for removing products from topic
 */
export class RemoveProductsDto {
  @ApiProperty({
    type: [String],
    description: 'Product IDs to remove from the topic',
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}

/**
 * DTO for removing categories from topic
 */
export class RemoveCategoriesDto {
  @ApiProperty({
    type: [String],
    description: 'Category IDs to remove from the topic',
  })
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];
}
