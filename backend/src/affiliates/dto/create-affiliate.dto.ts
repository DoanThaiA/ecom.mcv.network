import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { AffiliateType } from '../domain/affiliate-type.enum';

export class CreateAffiliateDto {
  @ApiProperty({ example: 'Nguyen Van A', type: String })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsString()
  name: string;

  @ApiProperty({ enum: AffiliateType, enumName: 'AffiliateType' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsEnum(AffiliateType, {
    message: i18nValidationMessage('validation.isEnum'),
  })
  type: AffiliateType;

  @ApiProperty({ example: 'affiliate@example.com', type: String })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email: string;

  @ApiProperty({ example: '0901234567', type: String })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A', type: String })
  @IsOptional()
  @IsString()
  bankAccountHolder?: string;

  @ApiPropertyOptional({ example: 'Vietcombank', type: String })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '0123456789', type: String })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: '001234567890', type: String })
  @IsOptional()
  @IsString()
  citizenId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 10, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultCommissionRate?: number | null;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  autoUpdateProducts?: boolean;
}
