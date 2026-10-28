import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ComboStatus } from '../domain/combo-status.enum';
import { DiscountType } from '../domain/discount-type.enum';
import { ComboItemDto } from './create-combo.dto';
import { TransformProtoEnum } from '../../utils/decorators/transform-proto-enum.decorator';
import { ValidateDiscountValue } from '../../utils/decorators/validate-discount-value.decorator';
import {
  COMBO_STATUS_PROTO_MAP,
  DISCOUNT_TYPE_PROTO_MAP,
} from '../../utils/transformers/proto-enum.transformer';

/**
 * DTO for localization fields
 */
export class LocalizationDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  vi?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  en?: string;
}

/**
 * DTO for updating an existing combo
 */
export class UpdateComboDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Combo name',
    example: 'Summer Bundle',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo image URL',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    type: [ComboItemDto],
    description: 'Products in the combo (1-5 items)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Type(() => ComboItemDto)
  items?: ComboItemDto[];

  @ApiPropertyOptional({
    enum: DiscountType,
    description: 'Type of discount',
    example: DiscountType.FIXED,
  })
  @IsOptional()
  @TransformProtoEnum(DiscountType, DISCOUNT_TYPE_PROTO_MAP)
  discountType?: DiscountType;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Discount value (VND for fixed type, percentage 0-100 for percentage type)',
    example: 100000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ValidateDiscountValue()
  discountValue?: number;

  @ApiPropertyOptional({
    enum: ComboStatus,
    description: 'Combo status',
  })
  @IsOptional()
  @TransformProtoEnum(ComboStatus, COMBO_STATUS_PROTO_MAP)
  status?: ComboStatus;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Combo validity start date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Combo validity end date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional({
    type: LocalizationDto,
    description: 'Combo name localization (Vietnamese and English)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizationDto)
  nameLocalization?: LocalizationDto;
}
