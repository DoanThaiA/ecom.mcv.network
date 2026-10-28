import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
  Min,
  IsNotEmpty,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ColorVariantDisplayType } from '../domain/color-variant-display-type.enum';
import { ColorVariantDisplayDto } from './create-color-variant.dto';

/**
 * DTO for updating a color variant
 */
export class UpdateColorVariantDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Color display name (e.g., "Đen", "Trắng", "Xanh Dương")',
    example: 'Đen',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    enum: ColorVariantDisplayType,
    enumName: 'ColorVariantDisplayType',
    description:
      'Display type (1=SOLID, 2=GRADIENT, 3=STRIPE_VERTICAL, 4=STRIPE_HORIZONTAL, 5=DOT, 6=CARO)',
    example: ColorVariantDisplayType.SOLID,
  })
  @IsOptional()
  @IsEnum(ColorVariantDisplayType)
  displayType?: ColorVariantDisplayType;

  @ApiPropertyOptional({
    type: ColorVariantDisplayDto,
    description: 'Visual display configuration',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ColorVariantDisplayDto)
  display?: ColorVariantDisplayDto;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order (lower value = displayed first)',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
