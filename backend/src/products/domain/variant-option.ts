import { ApiProperty } from '@nestjs/swagger';

/**
 * Represents a variant option definition aggregated from child variants
 * Example: { id: '3', name: 'Màu sắc', values: ['Đen', 'Trắng'] }
 */
export class VariantOption {
  @ApiProperty({
    type: String,
    description: 'Attribute ID from Nhanh',
    example: '3',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Attribute name',
    example: 'Màu sắc',
  })
  name: string;

  @ApiProperty({
    type: [String],
    description: 'All unique values for this attribute across variants',
    example: ['Đen', 'Trắng'],
  })
  values: string[];
}
