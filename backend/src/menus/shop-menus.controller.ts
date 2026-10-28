import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { ShopMenuListResponseDto } from './dto/shop-menu.dto';

/**
 * Public controller for shop menu endpoints
 * No authentication required
 */
@ApiTags('Shop - Menus')
@Controller({ path: 'shop/menus', version: '1' })
export class ShopMenusController {
  constructor(private readonly menusService: MenusService) {}

  /**
   * Get all active menus for navigation
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active menus',
    description:
      'Returns all active menus as a flat list with resolved URLs. ' +
      'Use parentId to build the menu tree on the frontend. ' +
      'Menus are sorted by display order.',
  })
  @ApiOkResponse({
    description: 'Menus returned successfully',
    type: ShopMenuListResponseDto,
  })
  async getActiveMenus(): Promise<ShopMenuListResponseDto> {
    return this.menusService.getActiveMenus();
  }
}
