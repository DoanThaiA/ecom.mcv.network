import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AuthConfirmEmailDto {
  @ApiProperty()
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  hash: string;
}
