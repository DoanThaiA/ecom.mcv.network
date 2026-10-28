import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Matches,
  IsObject,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TopicStatus } from '../domain/topic-status.enum';
import { TopicType } from '../domain/topic-type.enum';
import { TopicProductDto, TopicCategoryDto } from './topic-product.dto';
import { TopicBannerDto } from './topic-banner.dto';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { TOPIC_STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';
import { LocalizationDto } from '../../common/dto/localization.dto';

/**
 * DTO for creating a new topic
 */
export class CreateTopicDto {
  @ApiProperty({
    type: String,
    description: 'Topic name',
    example: 'Featured Products',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized topic names',
    example: { vi: 'Sản phẩm nổi bật', en: 'Featured Products' },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizationDto)
  localization?: LocalizationDto;

  @ApiPropertyOptional({
    type: String,
    description:
      'URL-friendly slug (lowercase, hyphens only). Auto-generated from name if not provided.',
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
    default: TopicType.PRODUCT,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([TopicType.PRODUCT, TopicType.CATEGORY, TopicType.BANNER])
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
    description: 'Display order (defaults to 0)',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    enum: TopicStatus,
    description:
      'Topic status. Accepts string values (active, inactive) or proto numbers (1, 2)',
    default: TopicStatus.ACTIVE,
  })
  @IsOptional()
  @TransformProtoEnum(TopicStatus, TOPIC_STATUS_PROTO_MAP)
  status?: TopicStatus;

  @ApiPropertyOptional({
    type: [TopicProductDto],
    description: 'Initial products to add to topic (only when type=product)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicProductDto)
  products?: TopicProductDto[];

  @ApiPropertyOptional({
    type: [TopicCategoryDto],
    description: 'Initial categories to add to topic (only when type=category)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicCategoryDto)
  categories?: TopicCategoryDto[];

  @ApiPropertyOptional({
    type: [TopicBannerDto],
    description: 'Initial banners to add to topic (only when type=banner)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicBannerDto)
  banners?: TopicBannerDto[];
}
