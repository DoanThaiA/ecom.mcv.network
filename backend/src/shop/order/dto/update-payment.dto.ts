import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../domain/order.enums';
import { TransformProtoEnum } from '../../../utils/decorators/transform-proto-enum.decorator';
import { PAYMENT_METHOD_PROTO_MAP } from '../../../utils/transformers/proto-enum.transformer';
import { Order } from '../domain/order';

/**
 * DTO for updating payment method on an order
 */
export class UpdatePaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    description: 'New payment method',
    example: PaymentMethod.ONEPAY_DOMESTIC,
  })
  @IsNotEmpty()
  @TransformProtoEnum(PaymentMethod, PAYMENT_METHOD_PROTO_MAP)
  paymentMethod: PaymentMethod;
}

/**
 * Response DTO for update payment operation
 */
export class UpdatePaymentResponseDto {
  @ApiProperty({
    type: Boolean,
    description: 'Whether payment method was updated successfully',
  })
  success: boolean;

  @ApiPropertyOptional({
    type: Object,
    description: 'Updated order',
  })
  order?: Order;

  @ApiPropertyOptional({
    type: String,
    description: 'Payment URL for redirect (OnePay methods only)',
  })
  paymentUrl?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'VietQR URL for display (InfoCMS methods only)',
  })
  qrUrl?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'VietQR data string (InfoCMS methods only)',
  })
  qrData?: string;
}
