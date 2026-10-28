import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ArticleStatus } from '../domain/article-status.enum';

/**
 * DTO for querying/filtering articles
 */
export class QueryArticlesDto {
  @ApiPropertyOptional({
    enum: ArticleStatus,
    enumName: 'ArticleStatus',
    description: 'Filter by article status',
    example: ArticleStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Search by title (case-insensitive)',
    example: 'collection',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
