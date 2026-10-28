import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, PaymentMethod } from './order.enums';
import { CdpSyncStatus } from './cdp-sync-status.enum';
import { NhanhSyncStatus } from './nhanh-sync-status.enum';
import { DiscountType } from '../../../combos/domain/discount-type.enum';
import { CustomerTransaction } from '../../../cdp/types/customerTransaction.types';

const idType = String;

/**
 * Nhanh.vn sync info for order
 */
export class OrderNhanhSyncInfo {
  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh order ID',
  })
  orderId?: number | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Order tracking URL from Nhanh',
  })
  trackingUrl?: string | null;

  @ApiPropertyOptional({
    type: String,
    enum: NhanhSyncStatus,
    description: 'Nhanh synchronization status',
  })
  syncStatus?: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'Timestamp when synced to Nhanh',
  })
  syncedAt?: Date | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Nhanh sync error message if failed',
  })
  syncError?: string | null;
}

/**
 * Payment event status for audit trail
 */
export enum PaymentEventStatus {
  INITIATED = 'initiated',
  SUCCESS = 'success',
  FAILED = 'failed',
}

/**
 * Payment event for audit trail - universal format for any payment provider
 */
export class PaymentEvent {
  @ApiProperty({
    enum: PaymentEventStatus,
    description: 'Payment event status',
  })
  status: PaymentEventStatus;

  @ApiProperty({
    type: Date,
    description: 'Timestamp of the event',
  })
  timestamp: Date;

  @ApiPropertyOptional({
    type: Number,
    description: 'Amount in VND',
  })
  amount?: number | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Transaction reference ID',
  })
  ref?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Response code from provider',
  })
  code?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Response message',
  })
  message?: string | null;
}

/**
 * InfoCMS payment info for order
 */
export class OrderInfocmsInfo {
  @ApiPropertyOptional({
    type: String,
    description: 'InfoCMS transaction UUID (POS transaction ID)',
  })
  transactionUuid?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'InfoCMS e-collection code (virtual account)',
  })
  ecollectionCd?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'InfoCMS transaction ID (from callback)',
  })
  transId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'InfoCMS bank transaction ID (from callback)',
  })
  bankTransId?: string | null;
}

/**
 * Shipping carrier snapshot taken at order creation time.
 * Persisted so retry/recovery flows can rebuild the Nhanh.vn carrier payload
 * even after the originating checkout session has expired.
 */
export class OrderShippingCarrier {
  @ApiPropertyOptional({
    type: Number,
    description:
      'Nhanh.vn carrier ID (e.g. 29 = SPX Express, 2 = Viettel Post)',
  })
  carrierId?: number | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Carrier display name',
  })
  carrierName?: string | null;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Carrier connection type: 1 = NHANH_CONNECTION (NVN), 2 = SHOP_ACCOUNT (NVS), 3 = SELF_SHIP (TVC)',
  })
  carrierType?: 1 | 2 | 3 | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh service ID (used when carrierType = 1)',
  })
  serviceId?: number | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Service code (used when carrierType = 2)',
  })
  serviceCode?: string | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Carrier account ID (used when carrierType = 2)',
  })
  accountId?: number | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Shop ID at carrier (used when carrierType = 2)',
  })
  shopId?: string | null;
}

/**
 * CDP sync info for order
 */
export class OrderCdpSyncInfo {
  @ApiPropertyOptional({
    type: String,
    description: 'CDP Customer ID associated with this order',
  })
  customerId?: string | null;

  @ApiPropertyOptional({
    type: String,
    enum: CdpSyncStatus,
    description: 'CDP synchronization status',
  })
  syncStatus?: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'Timestamp when synced to CDP',
  })
  syncedAt?: Date | null;

  @ApiPropertyOptional({
    type: String,
    description: 'CDP sync error message if failed',
  })
  syncError?: string | null;

  @ApiPropertyOptional({
    type: Object,
    description: 'CDP customer transaction object for webhook updates',
  })
  customerTransaction?: CustomerTransaction | null;
}

/**
 * Discount detail type - extensible for future discount types
 */
export enum DiscountDetailType {
  COMBO = 'combo',
  FLASH_SALE = 'flash_sale',
  COUPON = 'coupon',
  PRODUCT_DISCOUNT = 'product_discount',
  ORDER_DISCOUNT = 'order_discount',
}

/**
 * Discount detail for order items - tracks individual discount sources per item
 * Used for flash sales, coupons, promotions applied to specific items
 */
export class OrderItemDiscountDetail {
  @ApiProperty({
    enum: DiscountDetailType,
    description: 'Type of discount',
  })
  type: DiscountDetailType;

  @ApiProperty({
    type: String,
    description: 'Reference ID (flash sale ID, coupon ID, etc.)',
  })
  referenceId: string;

  @ApiProperty({
    type: String,
    description: 'Reference name for display',
  })
  referenceName: string;

  @ApiProperty({
    enum: DiscountType,
    description: 'Discount type (FIXED or PERCENTAGE)',
  })
  discountType: DiscountType;

  @ApiProperty({
    type: Number,
    description: 'Discount value (amount or percentage)',
  })
  discountValue: number;

  @ApiProperty({
    type: Number,
    description: 'Discount amount per unit',
  })
  discountAmountPerUnit: number;

  @ApiProperty({
    type: Number,
    description: 'Total discount amount (per unit * quantity)',
  })
  discountAmount: number;
}

/**
 * Discount detail - tracks order-level discount sources
 * Used for combo discounts, order-level coupons, promotions
 */
export class OrderDiscountDetail {
  @ApiProperty({
    enum: DiscountDetailType,
    description: 'Type of discount',
  })
  type: DiscountDetailType;

  @ApiProperty({
    type: String,
    description: 'Reference ID (combo ID, coupon ID, etc.)',
  })
  referenceId: string;

  @ApiProperty({
    type: String,
    description: 'Reference name for display',
  })
  referenceName: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Instance ID for combo instances',
  })
  instanceId?: string | null;

  @ApiProperty({
    enum: DiscountType,
    description: 'Discount type (FIXED or PERCENTAGE)',
  })
  discountType: DiscountType;

  @ApiProperty({
    type: Number,
    description: 'Discount value (amount or percentage)',
  })
  discountValue: number;

  @ApiProperty({
    type: Number,
    description: 'Calculated discount amount',
  })
  discountAmount: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Source of discount (CMS, CDP)',
  })
  source?: string | null;
}

/**
 * Customer information for the order
 * Not tied to user account - supports guest checkout
 */
export class OrderCustomer {
  @ApiProperty({
    type: String,
    description: 'Customer full name',
    example: 'Nguyen Van A',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Customer phone number',
    example: '0901234567',
  })
  phone: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Customer email',
    example: 'customer@example.com',
  })
  email?: string | null;
}

/**
 * Shipping address for the order
 */
export class OrderAddress {
  @ApiProperty({
    type: String,
    description: 'Full address',
    example: '123 Nguyen Hue',
  })
  address: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Ward/Commune',
    example: 'Ben Nghe',
  })
  ward?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'District',
    example: 'District 1',
  })
  district?: string | null;

  @ApiProperty({
    type: String,
    description: 'City/Province',
    example: 'Ho Chi Minh City',
  })
  city: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Country',
    default: 'Vietnam',
  })
  country?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh city ID for shipping calculation',
    example: 79,
  })
  cityId?: number | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh district ID for shipping calculation',
    example: 769,
  })
  districtId?: number | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh ward ID for shipping calculation',
    example: 26740,
  })
  wardId?: number | null;
}

/**
 * Order line item - snapshot of product at time of order
 */
export class OrderItem {
  @ApiProperty({
    type: idType,
    description: 'Product ID',
  })
  productId: string;

  @ApiPropertyOptional({
    type: idType,
    description: 'Variant ID (if applicable)',
  })
  variantId?: string | null;

  @ApiProperty({
    type: String,
    description: 'Product code/SKU at time of order',
  })
  code: string;

  @ApiProperty({
    type: String,
    description: 'Product name at time of order',
  })
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Product image URL',
  })
  image?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Unit price at time of order',
  })
  price: number;

  @ApiProperty({
    type: Number,
    description: 'Quantity ordered',
    minimum: 1,
  })
  quantity: number;

  @ApiProperty({
    type: Number,
    description: 'Line item subtotal (price * quantity)',
  })
  subtotal: number;

  @ApiProperty({
    type: Number,
    description:
      'Total discount for this item (sum of all item-level discounts)',
    default: 0,
  })
  discount: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo instance ID if part of a combo',
  })
  comboInstanceId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo ID if part of a combo',
  })
  comboId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Combo name if part of a combo',
  })
  comboName?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Flash sale ID if purchased at flash sale price',
  })
  flashSaleId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Flash sale name if purchased at flash sale price',
  })
  flashSaleName?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Original price before any discount',
  })
  originalPrice: number;

  @ApiPropertyOptional({
    type: [OrderItemDiscountDetail],
    description: 'Discount details applied to this item',
  })
  discountDetails?: OrderItemDiscountDetail[] | null;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Whether this item is a gift from a bundle deal promotion',
    default: false,
  })
  isGift?: boolean | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Bundle deal promotion ID this gift belongs to',
  })
  giftPromotionId?: string | null;
}

/**
 * Order domain entity
 */
export class Order {
  @ApiProperty({
    type: idType,
    description: 'Order ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Order number (human-readable)',
    example: 'ORD-20241204-001',
  })
  orderNumber: string;

  @ApiPropertyOptional({
    type: idType,
    description: 'User ID (null for guest orders)',
  })
  userId?: string | null;

  @ApiProperty({
    type: String,
    description: 'Session ID for order tracking',
  })
  sessionId: string;

  @ApiProperty({
    type: () => OrderCustomer,
    description: 'Customer information',
  })
  customer: OrderCustomer;

  @ApiProperty({
    type: () => OrderAddress,
    description: 'Shipping address',
  })
  shippingAddress: OrderAddress;

  @ApiProperty({
    type: [OrderItem],
    description: 'Order items',
  })
  items: OrderItem[];

  @ApiProperty({
    type: Number,
    description: 'Subtotal (sum of item subtotals)',
  })
  subtotal: number;

  @ApiProperty({
    type: Number,
    description: 'Shipping fee',
    default: 0,
  })
  shippingFee: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh depot ID this order ships from',
  })
  depotId?: number | null;

  @ApiPropertyOptional({
    type: () => OrderShippingCarrier,
    description:
      'Snapshot of the shipping carrier selected at order creation. ' +
      'Used by the Nhanh.vn sync mapper as a fallback when the checkout ' +
      'session is no longer available (retry, late webhook).',
  })
  shippingCarrier?: OrderShippingCarrier | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Order-level discount amount (combo discounts, order coupons)',
    default: 0,
  })
  discount?: number;

  @ApiPropertyOptional({
    type: [OrderDiscountDetail],
    description:
      'Order-level discount details (combo discounts, order coupons)',
  })
  discountDetails?: OrderDiscountDetail[] | null;

  @ApiProperty({
    type: Number,
    description: 'Total discount from all sources (item-level + order-level)',
    default: 0,
  })
  totalDiscount: number;

  @ApiProperty({
    type: Number,
    description: 'Shipping discount amount',
    default: 0,
  })
  shippingDiscount: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Shipping promotion ID',
  })
  shippingPromotionId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Shipping promotion name (for display)',
  })
  shippingPromotionName?: string | null;

  @ApiProperty({
    type: Number,
    description:
      'Total amount (subtotal + shippingFee - shippingDiscount - discount)',
  })
  total: number;

  @ApiProperty({
    enum: OrderStatus,
    enumName: 'OrderStatus',
    description: 'Order status',
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    description: 'Payment status',
    example: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    description: 'Payment method',
    example: PaymentMethod.COD,
  })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    type: String,
    description: 'Order notes from customer',
  })
  note?: string | null;

  // Affiliate tracking
  @ApiPropertyOptional({
    type: idType,
    description: 'Affiliate ID (if order attributed to affiliate)',
  })
  affiliateId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Affiliate code (if order attributed to affiliate)',
  })
  affiliateCode?: string | null;

  @ApiProperty({
    type: Date,
    description: 'Order creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Order last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Order cancellation timestamp',
  })
  cancelledAt?: Date | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Cancellation reason',
  })
  cancellationReason?: string | null;

  // CDP sync info (nested object)
  @ApiPropertyOptional({
    type: () => OrderCdpSyncInfo,
    description: 'CDP synchronization information',
  })
  cdp?: OrderCdpSyncInfo | null;

  // Nhanh.vn sync info (nested object)
  @ApiPropertyOptional({
    type: () => OrderNhanhSyncInfo,
    description: 'Nhanh.vn synchronization information',
  })
  nhanh?: OrderNhanhSyncInfo | null;

  // InfoCMS payment info (nested object)
  @ApiPropertyOptional({
    type: () => OrderInfocmsInfo,
    description: 'InfoCMS payment information',
  })
  infocms?: OrderInfocmsInfo | null;

  // Payment history for audit trail
  @ApiPropertyOptional({
    type: () => [PaymentEvent],
    description: 'Payment event history for audit trail',
  })
  paymentHistory?: PaymentEvent[] | null;
}
