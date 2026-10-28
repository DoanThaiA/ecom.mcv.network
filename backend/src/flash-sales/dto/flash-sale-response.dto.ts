import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { FlashSaleStatus } from '../domain/flash-sale-status.enum';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../../utils/dto/infinity-pagination-response.dto';

/**
 * DTO for flash sale product in response (with product details)
 */
export class FlashSaleProductResponseDto {
  @ApiProperty({ type: String })
  productId: string;

  @ApiPropertyOptional({ type: String })
  productName?: string;

  @ApiPropertyOptional({ type: String })
  productCode?: string;

  @ApiPropertyOptional({ type: String })
  productImage?: string;

  @ApiPropertyOptional({ type: Number, description: 'Original retail price' })
  originalPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Price after discount applied',
  })
  discountPrice?: number;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Price after product discount (base for flash sale calculation)',
  })
  productDiscountPrice?: number;

  @ApiProperty({ enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty({ type: Number, description: 'Discount value entered by admin' })
  discountValue: number;

  @ApiProperty({
    type: Number,
    description: 'Maximum units at flash sale price',
  })
  promotionalQuantity: number;

  @ApiProperty({ type: Number, description: 'Units sold at flash sale price' })
  soldCount: number;

  @ApiProperty({ type: Boolean })
  isEnabled: boolean;

  @ApiPropertyOptional({ type: Number, description: 'Display order (0-based)' })
  order?: number;
}

/**
 * DTO for flash sale response
 */
export class FlashSaleResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Date })
  startTime: Date;

  @ApiProperty({ type: Date })
  endTime: Date;

  @ApiProperty({ type: Boolean })
  isEnabled: boolean;

  @ApiProperty({
    enum: FlashSaleStatus,
    description: 'Computed status based on time and enabled flag',
  })
  status: FlashSaleStatus;

  @ApiProperty({
    type: Number,
    description: 'Total number of products in the flash sale',
  })
  productCount: number;

  @ApiProperty({
    type: InfinityPaginationResponse(FlashSaleProductResponseDto),
  })
  products: InfinityPaginationResponseDto<FlashSaleProductResponseDto>;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

/**
 * DTO for flash sale list item response (without full product details)
 */
export class FlashSaleListItemResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: Date })
  startTime: Date;

  @ApiProperty({ type: Date })
  endTime: Date;

  @ApiProperty({ type: Boolean })
  isEnabled: boolean;

  @ApiProperty({
    enum: FlashSaleStatus,
    description: 'Computed status based on time and enabled flag',
  })
  status: FlashSaleStatus;

  @ApiProperty({
    type: Number,
    description: 'Total number of products in the flash sale',
  })
  productCount: number;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
