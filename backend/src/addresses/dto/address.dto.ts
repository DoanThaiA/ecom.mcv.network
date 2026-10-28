import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsPhoneNumber,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { phoneNumberTransformer } from '../../utils/transformers/phone-number.transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: '0901234567' })
  @Transform(phoneNumberTransformer)
  @IsPhoneNumber('VN', {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'email@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Ghi chú giao hàng' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({ example: '123 Nguyen Hue' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  street: string;

  @ApiProperty({ example: 79 })
  @IsNotEmpty()
  cityId: number;

  @ApiProperty({ example: 'Ho Chi Minh' })
  @IsString()
  @IsNotEmpty()
  cityName: string;

  @ApiProperty({ example: 760 })
  @IsNotEmpty()
  districtId: number;

  @ApiProperty({ example: 'Quan 1' })
  @IsString()
  @IsNotEmpty()
  districtName: string;

  @ApiProperty({ example: 10773 })
  @IsNotEmpty()
  wardId: number;

  @ApiProperty({ example: 'Phuong Ben Nghe' })
  @IsString()
  @IsNotEmpty()
  wardName: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @Transform(phoneNumberTransformer)
  @IsPhoneNumber('VN', {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'email@example.com' })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Ghi chú giao hàng' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: '123 Nguyen Hue' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  street?: string;

  @ApiPropertyOptional({ example: 79 })
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional({ example: 'Ho Chi Minh' })
  @IsString()
  @IsOptional()
  cityName?: string;

  @ApiPropertyOptional({ example: 760 })
  @IsOptional()
  districtId?: number;

  @ApiPropertyOptional({ example: 'Quan 1' })
  @IsString()
  @IsOptional()
  districtName?: string;

  @ApiPropertyOptional({ example: 10773 })
  @IsOptional()
  wardId?: number;

  @ApiPropertyOptional({ example: 'Phuong Ben Nghe' })
  @IsString()
  @IsOptional()
  wardName?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
