import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { FileDto } from '../../files/dto/file.dto';
import { StatusEnum } from '../../statuses/statuses.enum';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';
import { phoneNumberTransformer } from '../../utils/transformers/phone-number.transformer';
import { SocialAccount } from '../domain/social-account';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { STATUS_PROTO_MAP } from '../../utils/transformers/proto-enum.transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email?: string | null;

  @ApiPropertyOptional({ example: '+84123456789', type: String })
  @Transform(phoneNumberTransformer)
  @IsOptional()
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  provider?: string;

  socialId?: string | null;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ enum: StatusEnum, enumName: 'StatusEnum' })
  @IsOptional()
  @TransformProtoEnum(StatusEnum, STATUS_PROTO_MAP)
  status?: StatusEnum | null;

  socialAccounts?: SocialAccount[];
}
