import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReturnRequestType } from './return-request-type.enum';
import { ReturnRequestStatus } from './return-request-status.enum';
import { ReturnReason, ExchangeReason } from './return-reason.enum';

/**
 * Customer info snapshot (embedded, not referenced)
 */
export class ReturnCustomer {
  @ApiProperty({ description: 'Customer name' })
  name: string;

  @ApiProperty({ description: 'Customer phone' })
  phone: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  email?: string;

  @ApiPropertyOptional({ description: 'Customer address' })
  address?: string;
}

/**
 * Order item snapshot
 */
export class ReturnOrderItem {
  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID' })
  variantId?: string;

  @ApiProperty({ description: 'Product code/SKU' })
  code: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiPropertyOptional({ description: 'Product image URL' })
  image?: string;

  @ApiProperty({ description: 'Unit price' })
  price: number;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;
}

/**
 * Nhanh.vn sync info snapshot
 */
export class ReturnNhanhInfo {
  @ApiPropertyOptional({ type: Number, description: 'Nhanh.vn order ID' })
  orderId?: number | null;

  @ApiPropertyOptional({ type: String, description: 'Nhanh sync status' })
  syncStatus?: string | null;
}

/**
 * Order snapshot (embedded, not referenced)
 */
export class ReturnOrderSnapshot {
  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'Order number' })
  orderNumber: string;

  @ApiPropertyOptional({
    type: () => ReturnNhanhInfo,
    description: 'Nhanh.vn sync info',
  })
  nhanh?: ReturnNhanhInfo | null;

  @ApiProperty({ description: 'Order total amount' })
  orderAmount: number;

  @ApiProperty({ type: [ReturnOrderItem], description: 'Order items' })
  items: ReturnOrderItem[];
}

/**
 * Bank info for refund
 */
export class BankInfo {
  @ApiProperty({ description: 'Bank name' })
  bankName: string;

  @ApiProperty({ description: 'Account number' })
  accountNumber: string;

  @ApiProperty({ description: 'Account holder name' })
  accountHolder: string;
}

/**
 * Return Request domain entity
 */
export class ReturnRequest {
  @ApiProperty({ description: 'Return request ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ type: ReturnCustomer, description: 'Customer info snapshot' })
  customer: ReturnCustomer;

  @ApiProperty({ type: ReturnOrderSnapshot, description: 'Order snapshot' })
  orderSnapshot: ReturnOrderSnapshot;

  @ApiProperty({ enum: ReturnRequestType, description: 'Request type' })
  requestType: ReturnRequestType;

  @ApiPropertyOptional({ enum: ReturnReason, isArray: true })
  returnReasons?: ReturnReason[];

  @ApiPropertyOptional({ enum: ExchangeReason, isArray: true })
  exchangeReasons?: ExchangeReason[];

  @ApiPropertyOptional({ description: 'Other reason text' })
  otherReason?: string;

  @ApiProperty({ type: [String], description: 'Image URLs (S3)' })
  images: string[];

  @ApiPropertyOptional({ type: BankInfo, description: 'Bank info for refund' })
  bankInfo?: BankInfo;

  @ApiProperty({ enum: ReturnRequestStatus, description: 'Status' })
  status: ReturnRequestStatus;

  @ApiPropertyOptional({ description: 'Admin note' })
  adminNote?: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
