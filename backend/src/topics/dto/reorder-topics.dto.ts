import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single topic order item
 */
export class TopicOrderItemDto {
  @ApiProperty({ type: String, description: 'Topic ID' })
  @IsString()
  id: string;

  @ApiProperty({ type: Number, description: 'New display order' })
  @IsNumber()
  @Min(0)
  order: number;
}

/**
 * DTO for bulk reordering topics
 */
export class ReorderTopicsDto {
  @ApiProperty({
    type: [TopicOrderItemDto],
    description: 'Array of topic IDs with their new order values',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicOrderItemDto)
  topics: TopicOrderItemDto[];
}
