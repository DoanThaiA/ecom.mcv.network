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
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { QueryTopicDto } from './dto/query-topic.dto';
import { TopicResponseDto } from './dto/topic-response.dto';
import {
  AddProductsDto,
  RemoveProductsDto,
  AddCategoriesDto,
  RemoveCategoriesDto,
} from './dto/topic-product.dto';
import { ReorderTopicProductsDto } from './dto/reorder-topic-products.dto';
import { ReorderTopicCategoriesDto } from './dto/reorder-topic-categories.dto';
import { ReorderTopicsDto } from './dto/reorder-topics.dto';
import {
  AddBannersDto,
  RemoveBannersDto,
  UpdateTopicBannerDto,
} from './dto/topic-banner.dto';
import { ReorderTopicBannersDto } from './dto/reorder-topic-banners.dto';
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for topic endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.homepage_management)
@ApiTags('Topics')
@Controller({ path: 'topics', version: '1' })
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  /**
   * Create a new topic
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new topic',
    description:
      'Creates a new marketing collection/topic. Slug is auto-generated from name if not provided.',
  })
  @ApiCreatedResponse({
    description: 'Topic created successfully',
    type: TopicResponseDto,
  })
  @ApiConflictResponse({ description: 'Topic with this slug already exists' })
  async create(@Body() dto: CreateTopicDto): Promise<TopicResponseDto> {
    return this.topicsService.create(dto);
  }

  /**
   * Get list of topics with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of topics',
    description:
      'Returns paginated topics with filtering and sorting options. Default sort is by order ascending.',
  })
  @ApiOkResponse({
    description: 'List of topics returned successfully',
    type: InfinityPaginationResponse(TopicResponseDto),
  })
  async findAll(
    @Query() query: QueryTopicDto,
  ): Promise<InfinityPaginationResponseDto<TopicResponseDto>> {
    const result = await this.topicsService.findAll(query);
    return infinityPaginationFromPaginate(result);
  }

  /**
   * Bulk reorder topics
   */
  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Bulk reorder topics',
    description: 'Update display order for multiple topics at once.',
  })
  @ApiNoContentResponse({ description: 'Topics reordered successfully' })
  async reorderTopics(@Body() dto: ReorderTopicsDto): Promise<void> {
    return this.topicsService.reorderTopics(dto);
  }

  /**
   * Get topic by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Topic found',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async findOne(@Param('id') id: string): Promise<TopicResponseDto> {
    return this.topicsService.findOne(id);
  }

  /**
   * Update an existing topic
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a topic',
    description: 'Update topic metadata (name, slug, description, etc.)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Topic updated successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  @ApiConflictResponse({ description: 'Topic with this slug already exists' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTopicDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.update(id, dto);
  }

  /**
   * Delete a topic (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiNoContentResponse({ description: 'Topic deleted successfully' })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.topicsService.remove(id);
  }

  /**
   * Add products to a topic
   */
  @Post(':id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add products to topic',
    description:
      'Add one or more products to the topic. Products are added to the end of the list by default.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Products added successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async addProducts(
    @Param('id') id: string,
    @Body() dto: AddProductsDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.addProducts(id, dto);
  }

  /**
   * Remove products from a topic
   */
  @Delete(':id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove products from topic',
    description: 'Remove one or more products from the topic.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Products removed successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async removeProducts(
    @Param('id') id: string,
    @Body() dto: RemoveProductsDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.removeProducts(id, dto);
  }

  /**
   * Reorder products within a topic
   */
  @Patch(':id/products/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reorder products within topic',
    description:
      'Update display order for products within the topic. Only provided products will have their order updated.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Products reordered successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async reorderProducts(
    @Param('id') id: string,
    @Body() dto: ReorderTopicProductsDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.reorderProducts(id, dto);
  }

  /**
   * Add categories to a topic
   */
  @Post(':id/categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add categories to topic',
    description:
      'Add one or more categories to the topic. Categories are added to the end of the list by default.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Categories added successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async addCategories(
    @Param('id') id: string,
    @Body() dto: AddCategoriesDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.addCategories(id, dto);
  }

  /**
   * Remove categories from a topic
   */
  @Delete(':id/categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove categories from topic',
    description: 'Remove one or more categories from the topic.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Categories removed successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async removeCategories(
    @Param('id') id: string,
    @Body() dto: RemoveCategoriesDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.removeCategories(id, dto);
  }

  /**
   * Reorder categories within a topic
   */
  @Patch(':id/categories/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reorder categories within topic',
    description:
      'Update display order for categories within the topic. Only provided categories will have their order updated.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Categories reordered successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async reorderCategories(
    @Param('id') id: string,
    @Body() dto: ReorderTopicCategoriesDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.reorderCategories(id, dto);
  }

  /**
   * Add banners to a topic
   */
  @Post(':id/banners')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add banners to topic',
    description:
      'Add one or more banner items to the topic. Banners are added to the end of the list by default.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Banners added successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async addBanners(
    @Param('id') id: string,
    @Body() dto: AddBannersDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.addBanners(id, dto);
  }

  /**
   * Remove banners from a topic
   */
  @Delete(':id/banners')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove banners from topic',
    description: 'Remove one or more banner items from the topic.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Banners removed successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async removeBanners(
    @Param('id') id: string,
    @Body() dto: RemoveBannersDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.removeBanners(id, dto);
  }

  /**
   * Reorder banners within a topic
   */
  @Patch(':id/banners/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reorder banners within topic',
    description: 'Update display order for banners within the topic.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiOkResponse({
    description: 'Banners reordered successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async reorderBanners(
    @Param('id') id: string,
    @Body() dto: ReorderTopicBannersDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.reorderBanners(id, dto);
  }

  /**
   * Update a single banner in a topic
   */
  @Patch(':id/banners/:bannerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a banner in topic',
    description: 'Update media, link, or order of a single banner item.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Topic ID' })
  @ApiParam({ name: 'bannerId', type: String, description: 'Banner item ID' })
  @ApiOkResponse({
    description: 'Banner updated successfully',
    type: TopicResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Topic or banner not found' })
  async updateBanner(
    @Param('id') id: string,
    @Param('bannerId') bannerId: string,
    @Body() dto: UpdateTopicBannerDto,
  ): Promise<TopicResponseDto> {
    return this.topicsService.updateBanner(id, bannerId, dto);
  }
}
