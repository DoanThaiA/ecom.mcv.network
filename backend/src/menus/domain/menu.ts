import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuStatus } from './menu-status.enum';
import { MenuType } from './menu-type.enum';

const idType = String;

/**
 * Menu domain entity
 * Represents a navigation menu item with hierarchical structure
 */
export class Menu {
  @ApiProperty({
    type: idType,
    description: 'Internal menu ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Menu display name (for fallback)',
    example: 'San pham',
  })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized menu names',
    example: { vi: 'Sản phẩm', en: 'Products' },
  })
  localization?: { vi?: string; en?: string } | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Parent menu ID (null for root menus)',
  })
  parentId?: string | null;

  @ApiProperty({
    enum: MenuType,
    enumName: 'MenuType',
    description: 'Menu type (category, topic, or url)',
    example: MenuType.CATEGORY,
  })
  type: MenuType;

  @ApiPropertyOptional({
    type: String,
    description: 'Category ID when type = CATEGORY',
  })
  categoryId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Topic ID when type = TOPIC',
  })
  topicId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Custom URL or auto-generated from linked entity slug',
  })
  url?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Display order for menu positioning',
    example: 0,
  })
  order: number;

  @ApiProperty({
    enum: MenuStatus,
    enumName: 'MenuStatus',
    description: 'Menu status',
    example: MenuStatus.ACTIVE,
  })
  status: MenuStatus;

  @ApiProperty({
    type: Date,
    description: 'Menu creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Menu last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Menu deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;
}
