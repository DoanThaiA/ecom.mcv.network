import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCmsUserDto } from './create-cms-user.dto';

import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';
import {
  IsEmail,
  IsOptional,
  IsArray,
  IsEnum,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { FileDto } from '../../files/dto/file.dto';
import { StatusEnum } from '../../statuses/statuses.enum';
import { ModulePermission } from '../permissions/module-permission.enum';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import {
  STATUS_PROTO_MAP,
  MODULE_PERMISSION_PROTO_MAP,
  createProtoEnumTransformer,
} from '../../utils/transformers/proto-enum.transformer';

export class UpdateCmsUserDto extends PartialType(CreateCmsUserDto) {
  @ApiPropertyOptional({ example: 'admin@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6, { message: i18nValidationMessage('validation.minLength') })
  password?: string;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  /** @deprecated No longer used – kept for backward compatibility. */
  @ApiPropertyOptional()
  @IsOptional()
  permissionGroup?: number;

  @ApiPropertyOptional({
    enum: ModulePermission,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return value;
    const transformer = createProtoEnumTransformer(MODULE_PERMISSION_PROTO_MAP);
    return value.map((item: unknown) =>
      transformer({ value: item } as TransformFnParams),
    );
  })
  @IsEnum(ModulePermission, { each: true })
  permissions?: ModulePermission[];

  @ApiPropertyOptional({ enum: StatusEnum, enumName: 'StatusEnum' })
  @IsOptional()
  @TransformProtoEnum(StatusEnum, STATUS_PROTO_MAP)
  status?: StatusEnum | null;
}
