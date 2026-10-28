import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuType } from '../domain/menu-type.enum';

/**
 * DTO for shop menu item (public API - flat list)
 */
export class ShopMenuItemDto {
  @ApiProperty({ type: String, description: 'Menu ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Menu display name' })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized menu names',
    example: { vi: 'Sản phẩm', en: 'Products' },
  })
  localization: { vi?: string; en?: string } | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Parent menu ID (null for root menus)',
  })
  parentId: string | null;

  @ApiProperty({
    enum: MenuType,
    description: 'Menu type (category, topic, or url)',
  })
  type: MenuType;

  @ApiPropertyOptional({
    type: String,
    description: 'Category ID when type = CATEGORY',
  })
  categoryId: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Topic ID when type = TOPIC',
  })
  topicId: string | null;

  @ApiProperty({
    type: String,
    description: 'Resolved URL (from linked entity slug or custom URL)',
  })
  url: string;

  @ApiProperty({ type: Number, description: 'Display order' })
  order: number;
}

/**
 * DTO for shop menu list response
 */
export class ShopMenuListResponseDto {
  @ApiProperty({ type: [ShopMenuItemDto] })
  menus: ShopMenuItemDto[];
}
