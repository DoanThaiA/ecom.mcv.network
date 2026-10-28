import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComboStatus } from '../domain/combo-status.enum';
import { DiscountType } from '../domain/discount-type.enum';

/**
 * DTO for combo item in response (with product details)
 */
export class ComboItemResponseDto {
  @ApiProperty({ type: String })
  productId: string;

  @ApiProperty({ type: Number })
  quantity: number;

  @ApiPropertyOptional({ type: String })
  productName?: string;

  @ApiPropertyOptional({ type: String })
  productImage?: string;

  @ApiPropertyOptional({ type: Number })
  productPrice?: number;
}

/**
 * DTO for combo response
 */
export class ComboResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String })
  description?: string | null;

  @ApiPropertyOptional({ type: String })
  image?: string | null;

  @ApiProperty({ type: [ComboItemResponseDto] })
  items: ComboItemResponseDto[];

  @ApiProperty({ enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty({ type: Number })
  discountValue: number;

  @ApiProperty({ type: Number })
  originalPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Calculated final price after discount',
  })
  finalPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Calculated discount amount',
  })
  discountAmount: number;

  @ApiProperty({ enum: ComboStatus })
  status: ComboStatus;

  @ApiPropertyOptional({ type: Date })
  validFrom?: Date | null;

  @ApiPropertyOptional({ type: Date })
  validTo?: Date | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Object,
    description: 'Combo name localization (Vietnamese and English)',
  })
  nameLocalization?: { vi?: string; en?: string } | null;
}
