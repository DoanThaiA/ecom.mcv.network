export enum OrderTaskType {
  SYNC_ORDER_CDP = 'sync_order_cdp',
  SYNC_ORDER_CANCELLATION_CDP = 'sync_order_cancellation_cdp',
  SYNC_ORDER_NHANH = 'sync_order_nhanh',
  CREATE_ORDER_CONFIRMATION = 'create_order_confirmation',
  CREATE_AFFILIATE_COMMISSION = 'create_affiliate_commission',
  UPDATE_AFFILIATE_COMMISSION_STATUS = 'update_affiliate_commission_status',
  INCREMENT_PROMOTION_USAGE = 'increment_promotion_usage',
}
