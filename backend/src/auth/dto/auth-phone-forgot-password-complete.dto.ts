import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  MinLength,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { phoneNumberTransformer } from '../../utils/transformers/phone-number.transformer';
import { IsEqualTo } from '../../utils/decorators/is-equal-to.validator';

export class AuthPhoneForgotPasswordCompleteDto {
  @ApiProperty({ example: '+84123456789', type: String })
  @Transform(phoneNumberTransformer)
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  phone: string;

  @ApiProperty({ example: 'reset_token_abc123' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  resetToken: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @MinLength(6, { message: i18nValidationMessage('validation.minLength') })
  password: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @Validate(IsEqualTo, ['password'], {
    message: i18nValidationMessage('validation.passwordsMustMatch'),
  })
  retypePassword: string;
}
