import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { PaymentMethod } from '../../order/domain/order.enums';
import { TransformProtoEnum } from '../../../utils/decorators/transform-proto-enum.decorator';
import { PAYMENT_METHOD_PROTO_MAP } from '../../../utils/transformers/proto-enum.transformer';

/**
 * DTO for placing order from a checkout session
 */
export class PlaceOrderDto {
  @ApiPropertyOptional({
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    description: 'Payment method (overrides session if provided)',
    example: PaymentMethod.COD,
  })
  @IsOptional()
  @TransformProtoEnum(PaymentMethod, PAYMENT_METHOD_PROTO_MAP)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    type: String,
    description: 'Order notes (overrides session if provided)',
    example: 'Please call before delivery',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}

/**
 * Item validation error in place order response
 */
export class ItemValidationErrorDto {
  @ApiProperty({ type: String, description: 'Product ID' })
  productId: string;

  @ApiPropertyOptional({ type: String, description: 'Variant ID' })
  variantId?: string | null;

  @ApiProperty({ type: String, description: 'Product name' })
  productName: string;

  @ApiProperty({
    type: String,
    enum: [
      'unavailable',
      'insufficient_stock',
      'flash_sale_ended',
      'combo_invalid',
      'out_of_stock',
    ],
    description: 'Error type',
  })
  error:
    | 'unavailable'
    | 'insufficient_stock'
    | 'flash_sale_ended'
    | 'combo_invalid'
    | 'out_of_stock';

  @ApiProperty({ type: String, description: 'Error message' })
  message: string;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Available quantity (for insufficient_stock or out_of_stock error)',
  })
  availableQuantity?: number;
}

/**
 * Flash sale price adjustment info returned when flash sale auto-reverts to regular price
 */
export class FlashSaleAdjustmentDto {
  @ApiProperty({ type: String, description: 'Product ID' })
  productId: string;

  @ApiProperty({ type: String, description: 'Product name' })
  productName: string;

  @ApiProperty({
    type: Number,
    description: 'Flash sale price the customer expected to pay',
  })
  flashSalePrice: number;

  @ApiProperty({
    type: Number,
    description: 'Regular price actually applied to the order',
  })
  regularPrice: number;
}

/**
 * Response DTO for place order operation
 */
export class PlaceOrderResponseDto {
  @ApiProperty({
    type: Boolean,
    description: 'Whether order was created successfully',
  })
  success: boolean;

  @ApiPropertyOptional({
    type: Object,
    description: 'Created order (if success)',
  })
  order?: any;

  @ApiPropertyOptional({
    type: String,
    description: 'Payment URL for redirect (OnePay methods only)',
  })
  paymentUrl?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'QR code URL for VietQR payment (InfoCMS methods only)',
  })
  qrUrl?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'QR code data string for VietQR payment (InfoCMS methods only)',
  })
  qrData?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'General message (e.g., QR creation failure)',
  })
  message?: string;

  @ApiPropertyOptional({
    type: [ItemValidationErrorDto],
    description: 'Validation errors for items (if failed)',
  })
  validationErrors?: ItemValidationErrorDto[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Missing required fields (if failed)',
    example: ['customer.name', 'shippingAddress.cityId'],
  })
  missingFields?: string[];

  @ApiPropertyOptional({
    type: [FlashSaleAdjustmentDto],
    description:
      'Items whose flash sale price was auto-reverted to regular price',
  })
  flashSaleAdjustments?: FlashSaleAdjustmentDto[];

  @ApiPropertyOptional({
    type: Boolean,
    description:
      'True when flash sale prices were adjusted. Order was NOT created yet — client should refresh session and let user confirm again.',
  })
  pricesAdjusted?: boolean;
}
