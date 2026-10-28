import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TopicCategoryDto } from './topic-product.dto';

/**
 * DTO for reordering categories within a topic
 */
export class ReorderTopicCategoriesDto {
  @ApiProperty({
    type: [TopicCategoryDto],
    description: 'Array of category IDs with their new order values',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicCategoryDto)
  categories: TopicCategoryDto[];
}
