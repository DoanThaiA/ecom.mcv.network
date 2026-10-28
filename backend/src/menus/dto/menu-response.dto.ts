import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuStatus } from '../domain/menu-status.enum';
import { MenuType } from '../domain/menu-type.enum';

/**
 * DTO for menu response (CMS)
 */
export class MenuResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Localized menu names',
    example: { vi: 'Sản phẩm', en: 'Products' },
  })
  localization?: { vi?: string; en?: string } | null;

  @ApiPropertyOptional({ type: String })
  parentId?: string | null;

  @ApiProperty({ enum: MenuType })
  type: MenuType;

  @ApiPropertyOptional({ type: String })
  categoryId?: string | null;

  @ApiPropertyOptional({ type: String })
  topicId?: string | null;

  @ApiPropertyOptional({ type: String })
  url?: string | null;

  @ApiProperty({ type: Number })
  order: number;

  @ApiProperty({ enum: MenuStatus })
  status: MenuStatus;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
