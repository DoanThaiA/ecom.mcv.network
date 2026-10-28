import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleStatus } from '../domain/article-status.enum';
import { LocalizationDto } from '../../common/dto/localization.dto';

/**
 * DTO for updating an article
 */
export class UpdateArticleDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Article title',
    example: 'Updated Collection Launch',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized article titles',
    example: { vi: 'Ra mắt bộ sưu tập mới', en: 'New Collection Launch' },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizationDto)
  titleLocalization?: LocalizationDto;

  @ApiPropertyOptional({
    type: String,
    description: 'Article content in HTML format',
    maxLength: 100000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100000)
  content?: string;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized article content in HTML format',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizationDto)
  contentLocalization?: LocalizationDto;

  @ApiPropertyOptional({
    type: String,
    description: 'Thumbnail image URL',
    example: 'https://cdn.example.com/article-thumb.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({
    enum: ArticleStatus,
    enumName: 'ArticleStatus',
    description: 'Article status (1 = ACTIVE, 2 = INACTIVE)',
    example: ArticleStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Publication date (ISO 8601)',
    example: '2025-12-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
