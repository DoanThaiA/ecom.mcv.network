import type { File as FileType } from '@/types/gen/shared/shared/files/file';

/**
 * Return Request Types
 */
export type ReturnRequestType = 'exchange' | 'return';

export type ExchangeReason = 'size' | 'color' | 'model' | 'other';

export type ReturnReason =
  | 'wrongItem'
  | 'notAsDescribed'
  | 'notSatisfied'
  | 'other';

/**
 * Bank Info for refund
 */
export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

/**
 * Return Request Payload
 */
export interface ReturnRequestPayload {
  requestType: ReturnRequestType;
  exchangeReasons?: ExchangeReason[];
  returnReasons?: ReturnReason[];
  otherReason?: string;
  productToExchange?: string;
  productWanted?: string;
  orderId: string;
  images: FileType[];
  bankInfo?: BankInfo;
}

/**
 * Return Request Response (mock)
 */
export interface ReturnRequestResponse {
  success: boolean;
  message: string;
  requestId?: string;
}
