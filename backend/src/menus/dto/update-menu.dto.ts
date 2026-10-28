import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsMongoId,
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
 * DTO for updating an existing menu
 */
export class UpdateMenuDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Menu display name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Localized menu names',
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
  parentId?: string | null;

  @ApiPropertyOptional({
    enum: MenuType,
    description: 'Menu type',
  })
  @IsOptional()
  @TransformProtoEnum(MenuType, MENU_TYPE_PROTO_MAP)
  type?: MenuType;

  @ApiPropertyOptional({
    type: String,
    description: 'Category ID',
  })
  @IsOptional()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  categoryId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Topic ID',
  })
  @IsOptional()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  topicId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Custom URL',
  })
  @IsOptional()
  @IsString()
  url?: string | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    enum: MenuStatus,
    description: 'Menu status',
  })
  @IsOptional()
  @TransformProtoEnum(MenuStatus, MENU_STATUS_PROTO_MAP)
  status?: MenuStatus;
}
