import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../order/domain/order.enums';
import { DiscountType } from '../../../combos/domain/discount-type.enum';
import { CheckoutSessionStatus } from './checkout-session-status.enum';

const idType = String;

/**
 * Discount detail type - matches Order for consistency
 */
export enum CheckoutSessionDiscountDetailType {
  COMBO = 'combo',
  FLASH_SALE = 'flash_sale',
  COUPON = 'coupon',
  PRODUCT_DISCOUNT = 'product_discount',
  ORDER_DISCOUNT = 'order_discount',
}

/**
 * Item-level discount detail - tracks discounts applied to a specific item
 */
export class CheckoutSessionItemDiscountDetail {
  @ApiProperty({
    enum: CheckoutSessionDiscountDetailType,
    description: 'Type of discount',
  })
  type: CheckoutSessionDiscountDetailType;

  @ApiProperty({
    type: String,
    description: 'Reference ID (flash sale ID, coupon ID, etc.)',
  })
  referenceId: string;

  @ApiProperty({ type: String, description: 'Reference name for display' })
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
 * CheckoutSession item - snapshot of product at session creation/update time
 */
export class CheckoutSessionItem {
  @ApiProperty({ type: idType, description: 'Product ID' })
  productId: string;

  @ApiPropertyOptional({
    type: idType,
    description: 'Variant ID (if applicable)',
  })
  variantId?: string | null;

  @ApiProperty({
    type: String,
    description: 'Product code/SKU at session time',
  })
  code: string;

  @ApiProperty({ type: String, description: 'Product name at session time' })
  name: string;

  @ApiPropertyOptional({ type: String, description: 'Product image URL' })
  image?: string | null;

  @ApiProperty({
    type: Number,
    description: 'Original unit price (before any discounts)',
  })
  originalPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Effective unit price (after flash sale if applicable)',
  })
  effectivePrice: number;

  @ApiProperty({ type: Number, description: 'Quantity', minimum: 1 })
  quantity: number;

  @ApiProperty({
    type: Number,
    description: 'Line item subtotal (effectivePrice * quantity)',
  })
  subtotal: number;

  @ApiProperty({
    type: Number,
    description:
      'Total discount for this item (sum of all item-level discounts)',
    default: 0,
  })
  discount: number;

  // Combo tracking
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

  // Flash sale tracking
  @ApiPropertyOptional({
    type: String,
    description: 'Flash sale ID if applicable',
  })
  flashSaleId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Flash sale name if applicable',
  })
  flashSaleName?: string | null;

  // Product discount tracking (CTKM auto-apply, no min order)
  @ApiPropertyOptional({
    type: String,
    description: 'Product discount promotion ID if applicable',
  })
  productDiscountId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Product discount promotion name if applicable',
  })
  productDiscountName?: string | null;

  // Availability status (validated on each session update)
  @ApiProperty({
    type: Boolean,
    description: 'Whether the item is currently available',
    default: true,
  })
  isAvailable: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Reason for unavailability',
  })
  unavailableReason?: string | null;

  // Item-level discount details
  @ApiPropertyOptional({
    type: [CheckoutSessionItemDiscountDetail],
    description: 'Discount details applied to this item',
  })
  discountDetails?: CheckoutSessionItemDiscountDetail[] | null;

  // Gift item flag
  @ApiProperty({
    type: Boolean,
    description: 'Whether this item is a gift from promotion (free)',
    default: false,
  })
  isGift?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Bundle deal promotion ID this gift belongs to',
  })
  giftPromotionId?: string | null;
}

/**
 * CheckoutSession combo instance - tracks combo discounts
 */
export class CheckoutSessionComboInstance {
  @ApiProperty({ type: String, description: 'Unique instance ID (UUID)' })
  comboInstanceId: string;

  @ApiProperty({ type: String, description: 'Combo ID reference' })
  comboId: string;

  @ApiProperty({ type: String, description: 'Combo name snapshot' })
  comboName: string;

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  discountType: DiscountType;

  @ApiProperty({ type: Number, description: 'Discount value' })
  discountValue: number;

  @ApiProperty({ type: Number, description: 'Original price of combo items' })
  originalPrice: number;

  @ApiProperty({ type: Number, description: 'Calculated discount amount' })
  discountAmount: number;
}

/**
 * CheckoutSession discount detail - tracks individual discount sources
 */
export class CheckoutSessionDiscountDetail {
  @ApiProperty({
    enum: CheckoutSessionDiscountDetailType,
    description: 'Type of discount',
  })
  type: CheckoutSessionDiscountDetailType;

  @ApiProperty({
    type: String,
    description: 'Reference ID (combo ID, flash sale ID, etc.)',
  })
  referenceId: string;

  @ApiProperty({ type: String, description: 'Reference name for display' })
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

  @ApiProperty({ type: Number, description: 'Calculated discount amount' })
  discountAmount: number;
}

/**
 * Customer information for the checkout session
 */
export class CheckoutSessionCustomer {
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

  @ApiPropertyOptional({ type: String, description: 'Customer email' })
  email?: string | null;
}

/**
 * Shipping address for the checkout session
 */
export class CheckoutSessionAddress {
  @ApiProperty({ type: String, description: 'Full address' })
  address: string;

  @ApiPropertyOptional({ type: String, description: 'Ward/Commune' })
  ward?: string | null;

  @ApiPropertyOptional({ type: String, description: 'District' })
  district?: string | null;

  @ApiProperty({ type: String, description: 'City/Province' })
  city: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Country',
    default: 'Vietnam',
  })
  country?: string;

  @ApiPropertyOptional({ type: Number, description: 'Nhanh city ID' })
  cityId?: number | null;

  @ApiPropertyOptional({ type: Number, description: 'Nhanh district ID' })
  districtId?: number | null;

  @ApiPropertyOptional({ type: Number, description: 'Nhanh ward ID' })
  wardId?: number | null;
}

/**
 * Shipping info snapshot
 */
export class CheckoutSessionShipping {
  @ApiProperty({ type: Number, description: 'Calculated shipping fee' })
  fee: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Depot ID used for shipping',
  })
  depotId?: number | null;

  @ApiPropertyOptional({ type: String, description: 'Depot name' })
  depotName?: string | null;

  @ApiPropertyOptional({ type: Number, description: 'Selected carrier ID' })
  carrierId?: number | null;

  @ApiPropertyOptional({ type: String, description: 'Carrier name' })
  carrierName?: string | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Nhanh service ID for the carrier',
  })
  serviceId?: number | null;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Carrier type: 1=NHANH_CONNECTION (NVN), 2=SHOP_ACCOUNT (NVS), 3=SELF_SHIP (TVC)',
  })
  carrierType?: 1 | 2 | 3 | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Carrier account ID (for SHOP_ACCOUNT type)',
  })
  accountId?: number | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Service code (for SHOP_ACCOUNT type)',
  })
  serviceCode?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Shop ID at carrier (for SHOP_ACCOUNT type)',
  })
  shopId?: string | null;
}

/**
 * Applied voucher in checkout session
 */
export class CheckoutSessionVoucher {
  @ApiProperty({ type: String, description: 'Voucher code' })
  code: string;

  @ApiProperty({ type: String, description: 'Voucher name' })
  name: string;

  @ApiProperty({ description: 'Source of voucher (CMS or CDP)' })
  source: 'CMS' | 'CDP';

  @ApiPropertyOptional({ type: String, description: 'Voucher ID' })
  id?: string;

  @ApiProperty({ description: 'Discount amount applied' })
  discountAmount: number;

  @ApiPropertyOptional({ description: 'Discount type (0: Fixed, 1: Percent)' })
  discountType?: number;

  @ApiPropertyOptional({ description: 'Discount value' })
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Minimum order value to apply voucher' })
  minimumOrderValue?: number;

  @ApiPropertyOptional({
    description: 'Maximum discount value (for percentage discounts)',
  })
  maxDiscountValue?: number;

  @ApiPropertyOptional({
    description: 'Not applicable with other promotions',
    default: false,
  })
  notApplicableWithOtherPromotions?: boolean;

  @ApiPropertyOptional({
    description:
      'Eligible product IDs for CMS Product Discount VOUCHER (per-item discount)',
    type: [String],
  })
  eligibleProductIds?: string[];
}

/**
 * Applied shipping promotion in checkout session
 */
export class CheckoutSessionShippingPromotion {
  @ApiProperty({ type: idType, description: 'Shipping promotion ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Shipping promotion name' })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Shipping promotion type (freeship or shipping_discount)',
  })
  type: string;

  @ApiProperty({
    type: Number,
    description: 'Discount amount applied to shipping fee',
  })
  discountAmount: number;
}

/**
 * CheckoutSession domain entity
 * Represents checkout state with calculated pricing and validation status
 */
export class CheckoutSession {
  @ApiProperty({ type: idType, description: 'Session ID' })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Session number (unique identifier)',
  })
  sessionNumber: string;

  @ApiPropertyOptional({
    type: idType,
    description: 'User ID (null for guests)',
  })
  userId?: string | null;

  @ApiProperty({
    type: String,
    description: 'Browser session ID for identification',
  })
  sessionId: string;

  // Customer and shipping
  @ApiPropertyOptional({
    type: () => CheckoutSessionCustomer,
    description: 'Customer information',
  })
  customer?: CheckoutSessionCustomer | null;

  @ApiPropertyOptional({
    type: () => CheckoutSessionAddress,
    description: 'Shipping address',
  })
  shippingAddress?: CheckoutSessionAddress | null;

  // Items snapshot
  @ApiProperty({
    type: [CheckoutSessionItem],
    description: 'Session items (snapshot)',
  })
  items: CheckoutSessionItem[];

  @ApiPropertyOptional({
    type: [CheckoutSessionComboInstance],
    description: 'Combo instances',
  })
  comboInstances?: CheckoutSessionComboInstance[] | null;

  @ApiPropertyOptional({
    type: [CheckoutSessionVoucher],
    description: 'Applied vouchers',
  })
  appliedVouchers?: CheckoutSessionVoucher[] | null;

  // Pricing breakdown
  @ApiProperty({
    type: Number,
    description: 'Subtotal (sum of item subtotals)',
  })
  subtotal: number;

  @ApiProperty({ type: Number, description: 'Shipping fee', default: 0 })
  shippingFee: number;

  @ApiProperty({
    type: Number,
    description: 'Order-level discount amount (combo discounts, order coupons)',
    default: 0,
  })
  discount: number;

  @ApiPropertyOptional({
    type: [CheckoutSessionDiscountDetail],
    description:
      'Order-level discount details (combo discounts, order coupons)',
  })
  discountDetails?: CheckoutSessionDiscountDetail[] | null;

  @ApiProperty({
    type: Number,
    description: 'Total discount from all sources (item-level + order-level)',
    default: 0,
  })
  totalDiscount: number;

  @ApiProperty({
    type: Number,
    description: 'Shipping discount amount (applied to shipping fee)',
    default: 0,
  })
  shippingDiscount: number;

  @ApiPropertyOptional({
    type: () => CheckoutSessionShippingPromotion,
    description: 'Applied shipping promotion',
  })
  shippingPromotion?: CheckoutSessionShippingPromotion | null;

  @ApiPropertyOptional({
    type: () => CheckoutSessionShipping,
    description: 'Shipping information',
  })
  shipping?: CheckoutSessionShipping | null;

  @ApiProperty({
    type: Number,
    description:
      'Total amount (subtotal + shippingFee - shippingDiscount - discount)',
  })
  total: number;

  // Payment preference
  @ApiPropertyOptional({
    enum: PaymentMethod,
    description: 'Selected payment method',
  })
  paymentMethod?: PaymentMethod | null;

  @ApiPropertyOptional({ type: String, description: 'Customer notes' })
  note?: string | null;

  // Affiliate tracking
  @ApiPropertyOptional({
    type: String,
    description: 'Affiliate code from aff_code cookie',
  })
  affiliateCode?: string | null;

  // Status and lifecycle
  @ApiProperty({
    enum: CheckoutSessionStatus,
    description: 'Session status',
    default: CheckoutSessionStatus.ACTIVE,
  })
  status: CheckoutSessionStatus;

  // Timestamps
  @ApiProperty({ type: Date, description: 'Session creation timestamp' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Session last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ type: Date, description: 'Session expiration timestamp' })
  expiresAt: Date;

  // Order reference (when completed)
  @ApiPropertyOptional({ type: String, description: 'Order ID if completed' })
  orderId?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Order number if completed',
  })
  orderNumber?: string | null;
}
