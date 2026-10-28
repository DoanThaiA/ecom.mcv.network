export interface GetVoucherReleaseRequest {
  brand_id?: string;
  start_date?: string;
  end_date?: string;
  search_text?: string;
  page?: number;
  limit?: number;
  sort_order?: any;
  sort_field?: string;
}

export interface GetVoucherReleaseResponse {
  code: number;
  message: string;
  voucher_release_events: VoucherReleaseEvent[];
  pagination: any;
}

export interface VoucherReleaseEvent {
  voucher_id: string;
  brand_id: string;
  start_date: string;
  end_date: string;
  voucher_event_name: string;
  promotion_code: string;
  max_usage_per_voucher_code?: number;
  url?: string;
  voucher_type?: number;
  minimum_order_value?: number;
  minimum_product_quantity?: number;
  required_products?: RequiredProduct[];
  not_applicable_with_other_promotions?: boolean;
  discount_type?: number; // 0 = AMOUNT, 1 = PERCENT
  discount_value: number;
  max_discount_value?: number;
  discount_after_tax?: boolean;
  apply_merchants_id?: string[];
  status?: string;
  days_of_week_applied?: string[];
  hours_applied?: any[];
  exclude_dates?: string[];
  one_voucher_per_customer?: boolean;
}

export interface RequiredProduct {
  sku_code: string;
  name: string;
  required: boolean;
}

export interface GetCustomerVoucherRequest {
  page?: number;
  limit?: number;
  customer_id: string;
  types?: number[]; // VoucherStatusForCustomer enum values
  from?: string;
  to?: string;
  brand_id?: string;
  merchant_id?: string;
}

export interface GetCustomerVoucherResponse {
  code: number;
  message: string;
  vouchers: CustomerVoucher[];
  pagination: any;
}

export interface CustomerVoucher {
  voucher_detail: VoucherDetail;
  transaction_id: string;
  status: number;
  exchanged_at_text?: string;
  used_at_text?: string;
  merchant_name?: string;
  transaction_no?: string;
}

export interface VoucherDetail {
  brand_id: string;
  voucher_id: string;
  voucher_code: string;
  voucher_name: string;
  description?: string;
  exchange_cost?: number;
  enabled?: boolean;
  expiry_date_value?: string;
  apply_merchants_id?: string[];
  voucher_release_id?: string;
  voucher_image_url?: string;
}

export interface UpdateCustomerVoucherForTransactionRequest {
  brand_code?: string;
  cdp_vouchers: CdpVoucher[];
  transaction_start_at: string;
  transaction_end_at: string;
  subtotal_with_tax: number;
  is_cancel: boolean;
  transaction_no: string;
}

export interface CdpVoucher {
  voucher_code: string;
  discount_amount: number;
  productAppliedPromotions: any[];
}

export interface UpdateCustomerVoucherForTransactionResponse {
  code: number;
  message: string;
}

export enum VoucherStatusForCustomer {
  UNKNOWN = 0,
  AVAILABLE = 1,
  USED = 2,
  EXPIRED = 3,
}

export interface UseVoucherRequest {
  voucher_code: string;
  third_party_transaction_id?: string;
  merchant_code?: string;
  transaction_no?: string;
  customer_id?: string;
}

export interface UseVoucherResponse {
  code: number;
  message: string;
  promotion_code: string;
  voucher_detail: VoucherReleaseEvent;
}

export interface CheckVoucherRequest {
  voucher_code: string;
  merchant_code?: string;
  customer_id?: string;
}

export interface CheckVoucherResponse {
  code: number;
  message: string;
  is_valid: boolean;
  promotion_code: string;
  voucher_detail: VoucherReleaseEvent;
}

export interface RemoveVoucherFromOrderRequest {
  voucher_code: string;
}

export interface RemoveVoucherFromOrderResponse {
  code: number;
  message: string;
}

export interface GetVoucherReleaseCodesRequest {
  voucher_release_event_id: string;
}

export interface FileResponse {
  file_content: Buffer;
  file_name: string;
  file_type: string;
}

export interface GetVoucherReleaseCodesResponse {
  code: number;
  message: string;
  file_data: FileResponse;
}

export interface SaveCustomerVoucherRequest {
  voucher_id: string;
  code: string;
  customer_id: string;
}

export interface SaveCustomerVoucherResponse {
  code: number;
  message: string;
}

export interface GetAvailableVoucherCodesRequest {
  voucher_id: string;
  limit: number;
}

export interface GetAvailableVoucherCodesResponse {
  code: number;
  message: string;
  voucher_codes: string[];
}
