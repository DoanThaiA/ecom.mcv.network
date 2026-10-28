import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { AffiliateType } from '../domain/affiliate-type.enum';
import { AffiliateStatus } from '../domain/affiliate-status.enum';

export class UpdateAffiliateDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A', type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: AffiliateType, enumName: 'AffiliateType' })
  @IsOptional()
  @IsEnum(AffiliateType, {
    message: i18nValidationMessage('validation.isEnum'),
  })
  type?: AffiliateType;

  @ApiPropertyOptional({ example: 'affiliate@example.com', type: String })
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email?: string;

  @ApiPropertyOptional({ example: '0901234567', type: String })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  bankAccountHolder?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  citizenId?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: AffiliateStatus, enumName: 'AffiliateStatus' })
  @IsOptional()
  @IsEnum(AffiliateStatus, {
    message: i18nValidationMessage('validation.isEnum'),
  })
  status?: AffiliateStatus;

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
