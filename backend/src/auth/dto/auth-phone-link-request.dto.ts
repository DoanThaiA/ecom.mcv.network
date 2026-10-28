import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { phoneNumberTransformer } from '../../utils/transformers/phone-number.transformer';
import { OtpDeliveryMethod } from './auth-phone-register.dto';

export class AuthPhoneLinkRequestDto {
  @ApiProperty({ example: '+84123456789', type: String })
  @Transform(phoneNumberTransformer)
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  phone: string;

  @ApiPropertyOptional({
    example: OtpDeliveryMethod.ZNS,
    enum: OtpDeliveryMethod,
    default: OtpDeliveryMethod.ZNS,
    description: 'Method to deliver OTP (SMS or ZNS). Defaults to ZNS.',
  })
  @IsOptional()
  @IsEnum(OtpDeliveryMethod, {
    message: i18nValidationMessage('validation.isEnum'),
  })
  otpMethod?: OtpDeliveryMethod;
}
