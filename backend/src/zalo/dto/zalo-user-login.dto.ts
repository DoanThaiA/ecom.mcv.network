import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ZaloUserLoginDto {
  @ApiProperty({
    example: 'abc123',
    description: 'OAuth code received from Zalo authorization',
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  code: string;

  @ApiProperty({
    example: '1a2b3c4d5e6f',
    description: 'State parameter to match with code verifier',
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  state: string;
}
