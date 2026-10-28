import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { TopicStatus } from '../domain/topic-status.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { TOPIC_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for filtering topics
 */
export class FilterTopicDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by topic name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: TopicStatus,
    description: 'Filter by topic status',
  })
  @IsOptional()
  @TransformProtoEnum(TopicStatus, TOPIC_STATUS_PROTO_MAP)
  status?: TopicStatus;
}

/**
 * DTO for sorting topics
 */
export class SortTopicDto {
  @ApiPropertyOptional({
    enum: ['createdAt', 'name', 'order'],
    description: 'Field to sort by',
  })
  @IsIn(['createdAt', 'name', 'order'])
  orderBy: 'createdAt' | 'name' | 'order';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc';
}

/**
 * DTO for querying topics
 */
export class QueryTopicDto {
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
    type: FilterTopicDto,
    description:
      'Filter criteria (passed as JSON string in query). Example: {"status":"active"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterTopicDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterTopicDto)
  filters?: FilterTopicDto | null;

  @ApiPropertyOptional({
    type: [SortTopicDto],
    description:
      'Sort criteria (passed as JSON string in query). Example: [{"orderBy":"order","order":"asc"}]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortTopicDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortTopicDto)
  sort?: SortTopicDto[] | null;
}
