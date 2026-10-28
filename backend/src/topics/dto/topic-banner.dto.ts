import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  ValidateNested,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BannerMediaType } from '../../banners/model/banner-media-type.enum';

/**
 * Custom validator to ensure at least one media URL is provided
 */
@ValidatorConstraint({ name: 'atLeastOneTopicBannerMedia', async: false })
export class AtLeastOneTopicBannerMediaConstraint
  implements ValidatorConstraintInterface
{
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as TopicBannerMediaDto;
    return !!(obj.mobile || obj.tablet || obj.desktop);
  }

  defaultMessage(): string {
    return 'At least one media URL (mobile, tablet, or desktop) is required';
  }
}

/**
 * DTO for topic banner responsive media URLs
 */
export class TopicBannerMediaDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for mobile devices',
  })
  @IsOptional()
  @IsString()
  @Validate(AtLeastOneTopicBannerMediaConstraint)
  mobile?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for tablet devices',
  })
  @IsOptional()
  @IsString()
  tablet?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Media URL for desktop devices',
  })
  @IsOptional()
  @IsString()
  desktop?: string;
}

/**
 * DTO for creating/adding a banner item to topic
 */
export class TopicBannerDto {
  @ApiProperty({
    enum: BannerMediaType,
    description: 'Media type (1=IMAGE, 2=VIDEO)',
    example: BannerMediaType.IMAGE,
  })
  @IsNumber()
  @IsIn([BannerMediaType.IMAGE, BannerMediaType.VIDEO])
  mediaType: BannerMediaType;

  @ApiProperty({
    type: TopicBannerMediaDto,
    description: 'Responsive media URLs',
  })
  @ValidateNested()
  @Type(() => TopicBannerMediaDto)
  media: TopicBannerMediaDto;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional click URL',
  })
  @IsOptional()
  @IsString()
  link?: string;

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
 * DTO for updating a single banner in topic
 */
export class UpdateTopicBannerDto {
  @ApiPropertyOptional({
    enum: BannerMediaType,
    description: 'Media type (1=IMAGE, 2=VIDEO)',
  })
  @IsOptional()
  @IsNumber()
  @IsIn([BannerMediaType.IMAGE, BannerMediaType.VIDEO])
  mediaType?: BannerMediaType;

  @ApiPropertyOptional({
    type: TopicBannerMediaDto,
    description: 'Responsive media URLs',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TopicBannerMediaDto)
  media?: TopicBannerMediaDto;

  @ApiPropertyOptional({ type: String, description: 'Optional click URL' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ type: Number, description: 'Display order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

/**
 * DTO for adding banners to topic
 */
export class AddBannersDto {
  @ApiProperty({
    type: [TopicBannerDto],
    description: 'Banners to add to the topic',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicBannerDto)
  banners: TopicBannerDto[];
}

/**
 * DTO for removing banners from topic
 */
export class RemoveBannersDto {
  @ApiProperty({
    type: [String],
    description: 'Banner IDs to remove from the topic',
  })
  @IsArray()
  @IsString({ each: true })
  bannerIds: string[];
}
