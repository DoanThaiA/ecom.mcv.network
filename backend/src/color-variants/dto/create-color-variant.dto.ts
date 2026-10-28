import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

/**
 * DTO for color variant display configuration
 */
export class ColorVariantDisplayDto {
  @ApiPropertyOptional({
    type: String,
    description:
      'Symbol-separated hex color codes. Symbol depends on displayType: / for gradient, | for vertical stripe, - for horizontal stripe, . for dot, , for caro. Example: "#FF0000/#00FF00" for gradient',
    example: '#FF0000/#00FF00/#0000FF',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.colorValue !== null && o.colorValue !== undefined)
  @Matches(/^(#[0-9A-Fa-f]{6})([\\/\-|.,](#[0-9A-Fa-f]{6}))*$/, {
    message:
      'colorValue must be valid hex colors separated by /, -, |, . or , (e.g., "#FF0000/#00FF00")',
  })
  colorValue?: string | null;

  @ApiPropertyOptional({
    type: String,
    description:
      'CDN URL for pattern image. Takes priority over colorValue when present',
    example: 'https://cdn.example.com/patterns/stripe-red-white.png',
  })
  @IsOptional()
  @IsString()
  patternImage?: string | null;
}

/**
 * DTO for creating a new color variant
 */
export class CreateColorVariantDto {
  @ApiProperty({
    type: String,
    description: 'Color display name (e.g., "Đen", "Trắng", "Xanh Dương")',
    example: 'Đen',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: ColorVariantDisplayType,
    enumName: 'ColorVariantDisplayType',
    description:
      'Display type (1=SOLID, 2=GRADIENT, 3=STRIPE_VERTICAL, 4=STRIPE_HORIZONTAL, 5=DOT, 6=CARO)',
    example: ColorVariantDisplayType.SOLID,
  })
  @IsEnum(ColorVariantDisplayType)
  displayType: ColorVariantDisplayType;

  @ApiProperty({
    type: ColorVariantDisplayDto,
    description: 'Visual display configuration',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ColorVariantDisplayDto)
  display: ColorVariantDisplayDto;

  @ApiPropertyOptional({
    type: Number,
    description: 'Display order (lower value = displayed first)',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
