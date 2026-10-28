import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ArticlesService } from '../articles.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { QueryArticlesDto } from '../dto/query-articles.dto';
import { Article } from '../domain/article';
import { infinityPaginationFromPaginate } from '../../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../../cms-users/permissions/module-permission.enum';

/**
 * Controller for article endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.news_management)
@ApiTags('Articles')
@Controller({ path: 'cms/articles', version: '1' })
export class CmsArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Create a new article
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new article' })
  @ApiCreatedResponse({
    description: 'Article created successfully',
    type: Article,
  })
  async create(@Body() dto: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(dto);
  }

  /**
   * Get list of articles with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of articles',
    description:
      'Returns paginated articles with filtering by status and search',
  })
  @ApiOkResponse({
    description: 'List of articles returned successfully',
    type: InfinityPaginationResponse(Article),
  })
  async findAll(
    @Query('filters') filtersString?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<InfinityPaginationResponseDto<Article>> {
    let filters: QueryArticlesDto = {};

    if (filtersString) {
      filters = JSON.parse(filtersString);
    }

    const result = await this.articlesService.findAll(
      filters,
      page || 1,
      limit || 10,
    );
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Get article by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiOkResponse({
    description: 'Article found',
    type: Article,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  async findOne(@Param('id') id: string): Promise<Article> {
    return this.articlesService.findOne(id);
  }

  /**
   * Update an existing article
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an article' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiOkResponse({
    description: 'Article updated successfully',
    type: Article,
  })
  @ApiNotFoundResponse({ description: 'Article not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articlesService.update(id, dto);
  }

  /**
   * Delete an article (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiParam({ name: 'id', type: String, description: 'Article ID' })
  @ApiNoContentResponse({ description: 'Article deleted successfully' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.articlesService.remove(id);
  }
}
