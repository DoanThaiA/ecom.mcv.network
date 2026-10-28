import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from './article-status.enum';

const idType = String;

/**
 * Article domain entity
 * Represents a news/blog article with rich HTML content
 */
export class Article {
  @ApiProperty({
    type: idType,
    description: 'Internal article ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Article title',
    example: 'New Collection Launch',
  })
  title: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized article titles',
    example: { vi: 'Ra mắt bộ sưu tập mới', en: 'New Collection Launch' },
  })
  titleLocalization?: { vi?: string; en?: string } | null;

  @ApiProperty({
    type: String,
    description: 'Article content in HTML format',
  })
  content: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized article content in HTML format',
  })
  contentLocalization?: { vi?: string; en?: string } | null;

  @ApiProperty({
    type: String,
    description: 'Thumbnail image URL',
    example: 'https://cdn.example.com/article-thumb.jpg',
  })
  thumbnail: string;

  @ApiProperty({
    enum: ArticleStatus,
    enumName: 'ArticleStatus',
    description: 'Article status (1 = ACTIVE, 2 = INACTIVE)',
    example: ArticleStatus.ACTIVE,
  })
  status: ArticleStatus;

  @ApiProperty({
    type: Date,
    description: 'Article publication date',
  })
  publishedAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Article creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Article last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Article deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;
}
