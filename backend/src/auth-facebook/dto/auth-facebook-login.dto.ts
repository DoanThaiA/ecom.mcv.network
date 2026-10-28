import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AuthFacebookLoginDto {
  @ApiProperty({ example: 'AQBqGbrH0mKZF1aWP1ukpC33...' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  code: string;
}
