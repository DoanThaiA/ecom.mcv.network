import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { AuthProvidersEnum } from '../auth-providers.enum';

export class UnlinkSocialAccountDto {
  @ApiProperty({
    enum: [
      AuthProvidersEnum.google,
      AuthProvidersEnum.facebook,
      AuthProvidersEnum.zalo,
    ],
    example: AuthProvidersEnum.google,
    description: 'Social provider to unlink',
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsEnum(AuthProvidersEnum, {
    message: i18nValidationMessage('validation.isEnum'),
  })
  provider: AuthProvidersEnum;
}
