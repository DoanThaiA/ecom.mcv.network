import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ArticlesService } from '../articles.service';
import { Article } from '../domain/article';
import { infinityPaginationFromPaginate } from '../../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../../utils/dto/infinity-pagination-response.dto';

/**
 * Public controller for shop article endpoints
 * No authentication required
 */
@ApiTags('Shop - Articles')
@Controller({ path: 'shop/articles', version: '1' })
export class ShopArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Get list of active articles (public)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active articles list',
    description:
      'Returns paginated active articles sorted by publish date descending',
  })
  @ApiOkResponse({
    description: 'Articles returned successfully',
    type: InfinityPaginationResponse(Article),
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<InfinityPaginationResponseDto<Article>> {
    const result = await this.articlesService.findActiveArticles(
      page || 1,
      limit || 10,
    );
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get a single active article by ID (public)
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiOkResponse({
    description: 'Article found',
    type: Article,
  })
  @ApiNotFoundResponse({ description: 'Article not found or inactive' })
  async findOne(@Param('id') id: string): Promise<Article> {
    return this.articlesService.findActiveById(id);
  }
}
