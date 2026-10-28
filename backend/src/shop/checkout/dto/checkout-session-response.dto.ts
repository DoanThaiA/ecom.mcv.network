import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../order/domain/order.enums';
import { DiscountType } from '../../../combos/domain/discount-type.enum';
import { CheckoutSessionStatus } from '../domain/checkout-session-status.enum';
import {
  CheckoutSession,
  CheckoutSessionItem,
  CheckoutSessionItemDiscountDetail,
  CheckoutSessionDiscountDetailType,
  CheckoutSessionCustomer,
  CheckoutSessionAddress,
  CheckoutSessionShipping,
  CheckoutSessionComboInstance,
  CheckoutSessionDiscountDetail,
  CheckoutSessionShippingPromotion,
} from '../domain/checkout-session';

/**
 * Response DTO for checkout session item discount detail
 */
export class CheckoutSessionItemDiscountDetailResponseDto
  implements CheckoutSessionItemDiscountDetail
{
  @ApiProperty({ enum: CheckoutSessionDiscountDetailType })
  type: CheckoutSessionDiscountDetailType;

  @ApiProperty({ type: String }) referenceId: string;
  @ApiProperty({ type: String }) referenceName: string;

  @ApiProperty({ enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty({ type: Number }) discountValue: number;
  @ApiProperty({ type: Number }) discountAmountPerUnit: number;
  @ApiProperty({ type: Number }) discountAmount: number;
}

/**
 * Response DTO for checkout session item
 */
export class CheckoutSessionItemResponseDto implements CheckoutSessionItem {
  @ApiProperty({ type: String }) productId: string;
  @ApiPropertyOptional({ type: String }) variantId?: string | null;
  @ApiProperty({ type: String }) code: string;
  @ApiProperty({ type: String }) name: string;
  @ApiPropertyOptional({ type: String }) image?: string | null;
  @ApiProperty({ type: Number }) originalPrice: number;
  @ApiProperty({ type: Number }) effectivePrice: number;
  @ApiProperty({ type: Number }) quantity: number;
  @ApiProperty({ type: Number }) subtotal: number;
  @ApiProperty({
    type: Number,
    description: 'Total discount for this item',
    default: 0,
  })
  discount: number;
  @ApiPropertyOptional({ type: String }) comboInstanceId?: string | null;
  @ApiPropertyOptional({ type: String }) comboId?: string | null;
  @ApiPropertyOptional({ type: String }) comboName?: string | null;
  @ApiPropertyOptional({ type: String }) flashSaleId?: string | null;
  @ApiPropertyOptional({ type: String }) flashSaleName?: string | null;
  @ApiProperty({ type: Boolean }) isAvailable: boolean;
  @ApiPropertyOptional({ type: String }) unavailableReason?: string | null;
  @ApiPropertyOptional({
    type: [CheckoutSessionItemDiscountDetailResponseDto],
    description: 'Item-level discount details',
  })
  discountDetails?: CheckoutSessionItemDiscountDetailResponseDto[] | null;

  @ApiProperty({
    type: Boolean,
    description: 'Whether this item is a gift from promotion',
    default: false,
  })
  isGift?: boolean;
}

/**
 * Response DTO for checkout session combo instance
 */
export class CheckoutSessionComboInstanceResponseDto {
  @ApiProperty({ type: String }) comboInstanceId: string;
  @ApiProperty({ type: String }) comboId: string;
  @ApiProperty({ type: String }) comboName: string;
  @ApiProperty({ type: String }) discountType: string;
  @ApiProperty({ type: Number }) discountValue: number;
  @ApiProperty({ type: Number }) originalPrice: number;
  @ApiProperty({ type: Number }) discountAmount: number;
}

/**
 * Response DTO for checkout session discount detail
 */
export class CheckoutSessionDiscountDetailResponseDto {
  @ApiProperty({ type: String }) type: string;
  @ApiProperty({ type: String }) referenceId: string;
  @ApiProperty({ type: String }) referenceName: string;
  @ApiPropertyOptional({ type: String }) instanceId?: string | null;
  @ApiProperty({ type: String }) discountType: string;
  @ApiProperty({ type: Number }) discountValue: number;
  @ApiProperty({ type: Number }) discountAmount: number;
}

/**
 * Response DTO for checkout session voucher
 */
export class CheckoutSessionVoucherResponseDto {
  @ApiProperty({ type: String }) code: string;
  @ApiProperty({ type: String }) name: string;
  @ApiProperty({ enum: ['CMS', 'CDP'] }) source: 'CMS' | 'CDP';
  @ApiPropertyOptional({ type: String }) id?: string;
  @ApiProperty({ type: Number }) discountAmount: number;
  @ApiPropertyOptional({ type: Boolean })
  notApplicableWithOtherPromotions?: boolean;
}

/**
 * Response DTO for checkout session
 */
export class CheckoutSessionResponseDto {
  @ApiProperty({ type: String, description: 'Session ID' })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Session number (unique identifier)',
  })
  sessionNumber: string;

  @ApiPropertyOptional({
    type: String,
    description: 'User ID (if authenticated)',
  })
  userId?: string | null;

  @ApiProperty({ type: String, description: 'Browser session ID' })
  sessionId: string;

  @ApiPropertyOptional({ type: Object, description: 'Customer information' })
  customer?: CheckoutSessionCustomer | null;

  @ApiPropertyOptional({ type: Object, description: 'Shipping address' })
  shippingAddress?: CheckoutSessionAddress | null;

  @ApiProperty({
    type: [CheckoutSessionItemResponseDto],
    description: 'Session items',
  })
  items: CheckoutSessionItemResponseDto[];

  @ApiPropertyOptional({
    type: [CheckoutSessionComboInstanceResponseDto],
    description: 'Combo instances',
  })
  comboInstances?: CheckoutSessionComboInstanceResponseDto[] | null;

  @ApiPropertyOptional({
    type: [CheckoutSessionVoucherResponseDto],
    description: 'Applied vouchers',
  })
  appliedVouchers?: CheckoutSessionVoucherResponseDto[] | null;

  @ApiProperty({
    type: Number,
    description: 'Subtotal (sum of item subtotals)',
  })
  subtotal: number;

  @ApiProperty({ type: Number, description: 'Shipping fee' })
  shippingFee: number;

  @ApiProperty({
    type: Number,
    description: 'Order-level discount amount (combo discounts, order coupons)',
  })
  discount: number;

  @ApiPropertyOptional({
    type: [CheckoutSessionDiscountDetailResponseDto],
    description:
      'Order-level discount details (combo discounts, order coupons)',
  })
  discountDetails?: CheckoutSessionDiscountDetailResponseDto[] | null;

  @ApiProperty({
    type: Number,
    description: 'Total discount from all sources (item-level + order-level)',
  })
  totalDiscount: number;

  @ApiProperty({
    type: Number,
    description: 'Shipping discount amount',
    default: 0,
  })
  shippingDiscount: number;

  @ApiPropertyOptional({
    type: Object,
    description: 'Applied shipping promotion',
  })
  shippingPromotion?: CheckoutSessionShippingPromotion | null;

  @ApiPropertyOptional({ type: Object, description: 'Shipping information' })
  shipping?: CheckoutSessionShipping | null;

  @ApiProperty({ type: Number, description: 'Total amount' })
  total: number;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Payment method' })
  paymentMethod?: PaymentMethod | null;

  @ApiPropertyOptional({ type: String, description: 'Order notes' })
  note?: string | null;

  @ApiProperty({ enum: CheckoutSessionStatus, description: 'Session status' })
  status: CheckoutSessionStatus;

  @ApiProperty({ type: Date, description: 'Session creation timestamp' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Session last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ type: Date, description: 'Session expiration timestamp' })
  expiresAt: Date;

  @ApiPropertyOptional({ type: String, description: 'Order ID (if completed)' })
  orderId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Order number (if completed)',
  })
  orderNumber?: string | null;

  // Validation summary fields
  @ApiProperty({
    type: Boolean,
    description: 'Whether any items are unavailable',
  })
  hasUnavailableItems: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Whether all required fields are present to place order',
  })
  canPlaceOrder: boolean;

  @ApiProperty({
    type: [String],
    description: 'List of missing required fields',
    example: ['customer.name', 'shippingAddress.cityId'],
  })
  missingFields: string[];
}

/**
 * Convert CheckoutSession domain to response DTO
 */
export function toCheckoutSessionResponse(
  session: CheckoutSession,
): CheckoutSessionResponseDto {
  // Check for unavailable items
  const hasUnavailableItems = session.items.some((item) => !item.isAvailable);

  // Calculate missing fields
  const missingFields: string[] = [];

  if (!session.customer?.name) missingFields.push('customer.name');
  if (!session.customer?.phone) missingFields.push('customer.phone');
  if (!session.shippingAddress?.address)
    missingFields.push('shippingAddress.address');
  if (!session.shippingAddress?.city)
    missingFields.push('shippingAddress.city');
  if (!session.shippingAddress?.cityId)
    missingFields.push('shippingAddress.cityId');
  if (!session.shippingAddress?.districtId)
    missingFields.push('shippingAddress.districtId');
  if (!session.paymentMethod) missingFields.push('paymentMethod');

  const hasItems = session.items && session.items.length > 0;
  const canPlaceOrder =
    hasItems && missingFields.length === 0 && !hasUnavailableItems;

  // Merge discount details: existing discounts + vouchers
  const discountDetails: CheckoutSessionDiscountDetailResponseDto[] = [
    ...(session.discountDetails?.map((d) => ({
      type: d.type,
      referenceId: d.referenceId,
      referenceName: d.referenceName,
      instanceId: d.instanceId,
      discountType: d.discountType,
      discountValue: d.discountValue,
      discountAmount: d.discountAmount,
    })) ?? []),
    // Include applied vouchers in discount details
    ...(session.appliedVouchers?.map((v) => ({
      type: CheckoutSessionDiscountDetailType.COUPON,
      referenceId: v.code,
      referenceName: v.name,
      instanceId: null,
      discountType:
        v.discountType === 1 ? DiscountType.PERCENTAGE : DiscountType.FIXED,
      discountValue: v.discountValue ?? 0,
      discountAmount: v.discountAmount,
    })) ?? []),
  ];

  return {
    id: session.id,
    sessionNumber: session.sessionNumber,
    userId: session.userId,
    sessionId: session.sessionId,
    customer: session.customer,
    shippingAddress: session.shippingAddress,
    items: session.items,
    comboInstances: session.comboInstances,
    appliedVouchers: session.appliedVouchers,
    subtotal: session.subtotal,
    shippingFee: session.shippingFee,
    discount: session.discount,
    discountDetails: discountDetails.length > 0 ? discountDetails : null,
    totalDiscount: session.totalDiscount,
    shippingDiscount: session.shippingDiscount ?? 0,
    shippingPromotion: session.shippingPromotion ?? null,
    shipping: session.shipping,
    total: session.total,
    paymentMethod: session.paymentMethod,
    note: session.note,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
    orderId: session.orderId,
    orderNumber: session.orderNumber,
    hasUnavailableItems,
    canPlaceOrder,
    missingFields,
  };
}
