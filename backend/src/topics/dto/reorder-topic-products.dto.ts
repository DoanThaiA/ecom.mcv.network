import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TopicProductDto } from './topic-product.dto';

/**
 * DTO for reordering products within a topic
 * Note: order field is required for reordering
 */
export class ReorderTopicProductsDto {
  @ApiProperty({
    type: [TopicProductDto],
    description:
      'Array of products with their new order values. Order field is required.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicProductDto)
  products: TopicProductDto[];
}
