import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ColorVariantDisplayType } from './color-variant-display-type.enum';

const idType = String;

/**
 * Color variant display configuration
 * Contains the visual representation data for the color
 */
export class ColorVariantDisplay {
  @ApiPropertyOptional({
    type: String,
    description:
      'Symbol-separated hex color codes. Symbol depends on displayType: / for gradient, | for vertical stripe, - for horizontal stripe, . for dot, , for caro',
    example: '#FF0000/#00FF00/#0000FF',
  })
  colorValue?: string | null;

  @ApiPropertyOptional({
    type: String,
    description:
      'CDN URL for pattern image. Takes priority over colorValue when present',
    example: 'https://cdn.example.com/patterns/stripe-red-white.png',
  })
  patternImage?: string | null;
}

/**
 * ColorVariant domain entity
 * Represents a color visual representation that maps to Nhanh.vn product colors by name
 */
export class ColorVariant {
  @ApiProperty({
    type: idType,
    description: 'Internal color variant ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Color display name (Vietnamese)',
    example: 'Đen',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Normalized color name (lowercase, trimmed) for matching',
    example: 'đen',
  })
  nameNormalized: string;

  @ApiProperty({
    enum: ColorVariantDisplayType,
    enumName: 'ColorVariantDisplayType',
    description:
      'Display type (1=SOLID, 2=GRADIENT, 3=STRIPE_VERTICAL, 4=STRIPE_HORIZONTAL, 5=DOT, 6=CARO)',
    example: ColorVariantDisplayType.SOLID,
  })
  displayType: ColorVariantDisplayType;

  @ApiProperty({
    type: ColorVariantDisplay,
    description: 'Visual display configuration',
  })
  display: ColorVariantDisplay;

  @ApiProperty({
    type: Number,
    description: 'Display order (lower value = displayed first)',
    example: 0,
  })
  order: number;

  @ApiProperty({
    type: Date,
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
