import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { phoneNumberTransformer } from '../../utils/transformers/phone-number.transformer';

export class AuthPhoneForgotPasswordVerifyDto {
  @ApiProperty({ example: '+84123456789', type: String })
  @Transform(phoneNumberTransformer)
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @MinLength(4, { message: i18nValidationMessage('validation.minLength') })
  @MaxLength(6, { message: i18nValidationMessage('validation.maxLength') })
  otp: string;
}
