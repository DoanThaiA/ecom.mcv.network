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
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
import { ModulePermissionsGuard } from '../cms-users/permissions/module-permissions.guard';
import { RequireModulePermission } from '../cms-users/permissions/module-permissions.decorator';
import { ModulePermission } from '../cms-users/permissions/module-permission.enum';

/**
 * Controller for menu endpoints (CMS only)
 */
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.homepage_management)
@ApiTags('Menus')
@Controller({ path: 'menus', version: '1' })
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  /**
   * Create a new menu
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new menu',
    description:
      'Creates a new navigation menu item. Type determines what the menu links to (category, topic, or custom URL).',
  })
  @ApiCreatedResponse({
    description: 'Menu created successfully',
    type: MenuResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or referenced entity not found',
  })
  async create(@Body() dto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.menusService.create(dto);
  }

  /**
   * Get list of menus with filtering and sorting
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of menus',
    description:
      'Returns all menus with filtering and sorting options. Default sort is by order ascending.',
  })
  @ApiOkResponse({
    description: 'List of menus returned successfully',
    type: [MenuResponseDto],
  })
  async findAll(@Query() query: QueryMenuDto): Promise<MenuResponseDto[]> {
    const menus = this.menusService.findAll(query);
    return menus;
  }

  /**
   * Bulk reorder menus
   */
  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Bulk reorder menus',
    description: 'Update display order for multiple menus at once.',
  })
  @ApiNoContentResponse({ description: 'Menus reordered successfully' })
  async reorderMenus(@Body() dto: ReorderMenusDto): Promise<void> {
    return this.menusService.reorderMenus(dto);
  }

  /**
   * Get menu by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Menu ID' })
  @ApiOkResponse({
    description: 'Menu found',
    type: MenuResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Menu not found' })
  async findOne(@Param('id') id: string): Promise<MenuResponseDto> {
    return this.menusService.findOne(id);
  }

  /**
   * Update an existing menu
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a menu',
    description: 'Update menu properties (name, type, parent, URL, etc.)',
  })
  @ApiParam({ name: 'id', type: String, description: 'Menu ID' })
  @ApiOkResponse({
    description: 'Menu updated successfully',
    type: MenuResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Menu not found' })
  @ApiBadRequestResponse({
    description:
      'Invalid input, circular reference, or referenced entity not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    return this.menusService.update(id, dto);
  }

  /**
   * Delete a menu (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu' })
  @ApiParam({ name: 'id', type: String, description: 'Menu ID' })
  @ApiNoContentResponse({ description: 'Menu deleted successfully' })
  @ApiNotFoundResponse({ description: 'Menu not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.menusService.remove(id);
  }
}
