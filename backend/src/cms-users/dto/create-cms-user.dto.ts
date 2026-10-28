import { Transform } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { FileDto } from '../../files/dto/file.dto';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AccountTypeEnum } from '../permissions/account-type.enum';
import { ModulePermission } from '../permissions/module-permission.enum';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import {
  STATUS_PROTO_MAP,
  ACCOUNT_TYPE_PROTO_MAP,
  MODULE_PERMISSION_PROTO_MAP,
  createProtoEnumTransformer,
} from '../../utils/transformers/proto-enum.transformer';

export class CreateCmsUserDto {
  @ApiProperty({ example: 'admin@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.accountType === AccountTypeEnum.website_admin)
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @MinLength(6, { message: i18nValidationMessage('validation.minLength') })
  password?: string;

  @ApiProperty({ example: 'John', type: String })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  firstName: string | null;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string | null;

  @ApiPropertyOptional({ example: '0901234567', type: String })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  /** @deprecated No longer used – kept for backward compatibility. */
  @ApiPropertyOptional()
  @IsOptional()
  permissionGroup?: number;

  @ApiProperty({
    enum: AccountTypeEnum,
    enumName: 'AccountTypeEnum',
    example: AccountTypeEnum.website_admin,
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @TransformProtoEnum(AccountTypeEnum, ACCOUNT_TYPE_PROTO_MAP, {
    message: i18nValidationMessage('validation.isEnum'),
  })
  accountType: AccountTypeEnum;

  @ApiPropertyOptional({
    enum: ModulePermission,
    isArray: true,
    example: [ModulePermission.product_management],
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

  @ApiPropertyOptional({ type: String, example: '60d5ec49f1b2c72b9c8e4d3a' })
  @IsOptional()
  @IsString()
  affiliateId?: string | null;

  @ApiPropertyOptional({ enum: StatusEnum, enumName: 'StatusEnum' })
  @IsOptional()
  @TransformProtoEnum(StatusEnum, STATUS_PROTO_MAP, {
    message: i18nValidationMessage('validation.isEnum'),
  })
  status?: StatusEnum | null;
}
