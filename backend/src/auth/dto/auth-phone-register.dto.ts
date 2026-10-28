import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { phoneNumberTransformer } from '../../utils/transformers/phone-number.transformer';

export enum OtpDeliveryMethod {
  SMS = 'sms',
  ZNS = 'zns',
}

export class AuthPhoneRegisterDto {
  @ApiProperty({ example: '+84123456789', type: String })
  @Transform(phoneNumberTransformer)
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  phone: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @MinLength(6, { message: i18nValidationMessage('validation.minLength') })
  password: string;

  @ApiProperty({
    example: OtpDeliveryMethod.ZNS,
    enum: OtpDeliveryMethod,
    default: OtpDeliveryMethod.ZNS,
    required: false,
    description: 'Method to deliver OTP (SMS or ZNS). Defaults to ZNS.',
  })
  @IsOptional()
  @IsEnum(OtpDeliveryMethod, {
    message: i18nValidationMessage('validation.isEnum'),
  })
  otpMethod?: OtpDeliveryMethod;
}
