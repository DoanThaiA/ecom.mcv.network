// Generated types from customerTransaction.proto

export enum TransactionType {
  ORDER = 0,
  DEBT = 1,
  DEBT_PAYMENT = 2,
  POINT_INCREMENT = 3,
  POINT_DEDUCTION = 4,
  PAYMENT_AMOUNT_DEDUCTION = 5,
  ORDER_CANCELLATION = 6,
  DEBT_CANCELLATION = 7,
}

export enum PointTransactionSubtype {
  POINT_EARN = 0,
  POINT_EXCHANGE = 1,
  POINT_RECHARGE = 2,
  VOUCHER_EXCHANGE = 3,
  ORDER_PAYMENT = 4,
  ORDER_CANCEL = 5,
  POINT_RESET = 6,
}

export enum OrderTransactionSource {
  MMENU_POS = 0,
  KIOSK = 1,
  MMENU_FOOD = 2,
  TABLET = 3,
  QR_ORDER = 4,
  ZALO_MINI_APP = 5,
  CCHAT_WEBSITE = 6,
}

export enum AdditionalFeeType {
  fee_type_unknown = 0,
  absoluteAmount = 1,
  percentage = 2,
}

export enum ThirdPartyName {
  MMENU_POS = 0,
}

export enum CdpPaymentMethod {
  CASH = 0,
  BANK_TRANSFER = 1,
  CARD_SWIPE = 2,
  OTHER = 3,
  DEBT = 4,
}

export enum CdpPayStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  DEBT = 'debt',
  CANCELLED = 'cancelled',
}

export interface ThirdPartyTransactionInfo {
  name?: ThirdPartyName;
  transaction_id?: string;
  merchant_id?: string;
  merchant_name?: string;
}

export interface OrderTransactionItem {
  name?: string;
  quantity?: number;
  price?: number;
  total_price?: number;
  topping_display_text?: string;
  attached_dish_display_text?: string;
  total_tax_included_price?: number;
  item_code?: string;
}

export interface AppliedPromotion {
  promotion_name?: string;
  discount_amount?: number;
  discount_reason?: string;
  apply_time?: number;
}

export interface TaxPaymentAmountDetail {
  tax_rate?: number;
  tax_payment_amount?: number;
}

export interface AdditionalFeeDetail {
  additional_fee_amount?: number;
  additional_fee_reason?: string;
  additional_fee_value?: number;
  additional_fee_type?: AdditionalFeeType;
}

export interface AdditionalFeeV2Item {
  name?: string;
  additional_fee_type?: AdditionalFeeType;
  additional_fee_value?: number;
  pretax_amount?: number;
  aftertax_amount?: number;
}

export interface CustomerDebtPaymentTransactionDetail {
  created_at_epoch?: number;
  payment_amount?: number;
  payment_method?: CdpPaymentMethod;
}

export interface CustomerOrderTransactionDetail {
  approved_by_employee_name?: string;
  number_of_customers?: number;
  order_transaction_items?: OrderTransactionItem[];
  note?: string;
  merchant_address_text?: string;
  pretax_payment_amount?: number;
  payment_amount?: number;
  customer_paid_amount?: number;
  return_amount?: number;
  payment_method?: CdpPaymentMethod;
  customer_debt_payment_transactions?: CustomerDebtPaymentTransactionDetail[];
  applied_promotions?: AppliedPromotion[];
  tax_payment_amount_details?: TaxPaymentAmountDetail[];
  additional_fee_detail?: AdditionalFeeDetail;
  point_used?: number;
  point_earned?: number;
  rounding_amount?: number;
  additional_fee_v2_items?: AdditionalFeeV2Item[];
}

export interface OrderItems {
  sku_code?: string;
  item_name?: string;
  item_quantity?: number;
  item_code?: string;
  item_price?: number;
}

export interface PaymentDetail {
  paymentMethod?: string;
  paymentAmount?: number;
}

export interface CdpPromotion {
  promotion_code?: string;
  discount_amount?: number;
}

export interface CustomerOrderTransaction {
  bill_no?: string;
  discount_amount?: number;
  voucher_discount_amount?: number;
  payment_amount?: number;
  order_source?: OrderTransactionSource;
  pay_status?: string;
  customer_order_transaction_detail?: CustomerOrderTransactionDetail;
  points_earned?: number;
  voucher_codes?: string[];
  payment_method?: string;
  primary_payment_amount?: number;
  secondary_payment_method?: string;
  secondary_payment_amount?: number;
  order_item_quantity?: number;
  order_items?: OrderItems[];
  pretax_payment_amount?: number;
  gift_card_codes?: string[];
  cdp_promotion_discount_amount?: number;
  cdp_promotions?: CdpPromotion[];
  payment_detail_by_method?: PaymentDetail[];
}

export interface CustomerOrderCancellationTransaction {
  bill_no?: string;
  payment_amount?: number;
  original_order_transaction_id?: string;
  cancellation_reason?: string;
  is_cancel_paid_status?: boolean;
}

export interface CustomerTransaction {
  id?: string;
  company_code?: string;
  brand_code?: string;
  merchant_code?: string;
  customer_id?: string;
  created_at_text?: string;
  transaction_type?: TransactionType;
  third_party_transaction_info?: ThirdPartyTransactionInfo;
  customer_order_transaction?: CustomerOrderTransaction;
  customer_order_cancellation_transaction?: CustomerOrderCancellationTransaction;
  customer_rank_id?: string;
}

export interface CreateOrUpdateCustomerTransactionRequest {
  customer_transaction?: CustomerTransaction;
}

export interface CreateOrUpdateCustomerTransactionResponse {
  code: number;
  message: string;
  customer_transaction?: CustomerTransaction;
}
