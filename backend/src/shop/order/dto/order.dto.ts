import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../domain/order.enums';
import { TransformProtoEnum } from '../../../utils/decorators/transform-proto-enum.decorator';
import {
  ORDER_STATUS_PROTO_MAP,
  PAYMENT_STATUS_PROTO_MAP,
} from '../../../utils/transformers/proto-enum.transformer';

/**
 * Filter DTO for orders query
 */
export class OrderFilterDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    enumName: 'OrderStatus',
    description: 'Filter by order status',
  })
  @IsOptional()
  @TransformProtoEnum(OrderStatus, ORDER_STATUS_PROTO_MAP)
  status?: OrderStatus;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    description: 'Filter by payment status',
  })
  @IsOptional()
  @TransformProtoEnum(PaymentStatus, PAYMENT_STATUS_PROTO_MAP)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Search by order number',
  })
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Search by phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description:
      'Filter by Nhanh.vn sync state. true = synced (nhanh.orderId exists), false = not synced (nhanh.orderId missing)',
  })
  @IsBoolean()
  @IsOptional()
  nhanhSynced?: boolean;
}

/**
 * Sort DTO for orders query
 */
export class OrderSortDto {
  @ApiPropertyOptional({
    type: String,
    enum: ['createdAt', 'total', 'orderNumber'],
    description: 'Field to sort by',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  orderBy?: 'createdAt' | 'total' | 'orderNumber';

  @ApiPropertyOptional({
    type: String,
    enum: ['asc', 'desc'],
    description: 'Sort order',
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc';
}

/**
 * Query DTO for orders
 */
export class QueryOrderDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number',
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page',
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    type: String,
    description: 'Filters as JSON string',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  filters?: OrderFilterDto;

  @ApiPropertyOptional({
    type: String,
    description: 'Sort options as JSON string',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  sort?: OrderSortDto;
}

/**
 * DTO for guest order lookup
 */
export class LookupOrderDto {
  @ApiProperty({
    type: String,
    description: 'Order number',
    example: 'ORD-20241204-0001',
  })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({
    type: String,
    description: 'Phone number used for the order',
    example: '0901234567',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

/**
 * DTO for cancelling an order
 */
export class CancelOrderDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Reason for cancellation',
    example: 'Changed my mind',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

/**
 * Query DTO for shop orders pagination
 */
export class ShopOrdersQueryDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page (max 50)',
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
