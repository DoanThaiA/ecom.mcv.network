import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsMongoId,
  ValidateIf,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MenuStatus } from '../domain/menu-status.enum';
import { MenuType } from '../domain/menu-type.enum';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import {
  MENU_STATUS_PROTO_MAP,
  MENU_TYPE_PROTO_MAP,
} from '../../utils/transformers/proto-enum.transformer';
import { LocalizationDto } from '../../common/dto/localization.dto';

/**
 * DTO for creating a new menu
 */
export class CreateMenuDto {
  @ApiProperty({
    type: String,
    description:
      'Menu display name (fallback if localization.vi/localization.en not provided)',
    example: 'San pham',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized menu names',
    example: { vi: 'Sản phẩm', en: 'Products' },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizationDto)
  localization?: LocalizationDto;

  @ApiPropertyOptional({
    type: String,
    description: 'Parent menu ID (null for root menus)',
  })
  @IsOptional()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  parentId?: string;

  @ApiProperty({
    enum: MenuType,
    description:
      'Menu type. Accepts string values (category, topic, url) or proto numbers (1, 2, 3)',
  })
  @TransformProtoEnum(MenuType, MENU_TYPE_PROTO_MAP)
  type: MenuType;

  @ApiPropertyOptional({
    type: String,
    description: 'Category ID (required when type = CATEGORY)',
  })
  @ValidateIf((o) => o.type === MenuType.CATEGORY)
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  categoryId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Topic ID (required when type = TOPIC)',
  })
  @ValidateIf((o) => o.type === MenuType.TOPIC)
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  topicId?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Custom URL (required when type = URL, auto-generated from linked entity slug otherwise)',
  })
  @ValidateIf((o) => o.type === MenuType.URL)
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order (defaults to 0)',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    enum: MenuStatus,
    description:
      'Menu status. Accepts string values (active, inactive) or proto numbers (1, 2)',
    default: MenuStatus.ACTIVE,
  })
  @IsOptional()
  @TransformProtoEnum(MenuStatus, MENU_STATUS_PROTO_MAP)
  status?: MenuStatus;
}
