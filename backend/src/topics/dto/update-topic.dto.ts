import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Matches,
  IsObject,
  ValidateNested,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TopicStatus } from '../domain/topic-status.enum';
import { TopicType } from '../domain/topic-type.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { TOPIC_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';
import { LocalizationDto } from '../../common/dto/localization.dto';

/**
 * DTO for updating an existing topic (metadata only, not products)
 */
export class UpdateTopicDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Topic name',
    example: 'Featured Products',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized topic names',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizationDto)
  localization?: LocalizationDto;

  @ApiPropertyOptional({
    type: String,
    description: 'URL-friendly slug (lowercase, hyphens only)',
    example: 'featured-products',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase and contain only letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({
    enum: TopicType,
    description:
      'Type of topic (product or category). Accepts proto numbers (1=product, 2=category)',
  })
  @IsOptional()
  @IsNumber()
  @IsIn([TopicType.PRODUCT, TopicType.CATEGORY])
  type?: TopicType;

  @ApiPropertyOptional({
    type: String,
    description: 'Topic description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Topic banner/header image URL',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    enum: TopicStatus,
    description: 'Topic status',
  })
  @IsOptional()
  @TransformProtoEnum(TopicStatus, TOPIC_STATUS_PROTO_MAP)
  status?: TopicStatus;
}
