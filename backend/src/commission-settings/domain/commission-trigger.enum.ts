/**
 * Controls when affiliate order commissions are created
 */
export enum CommissionTrigger {
  /** Create commission after checkout session is completed (COD: on checkout, Online: after payment success) */
  ORDER_CREATION = 'order_creation',
  /** Create commission only when order status becomes DELIVERED (via Nhanh webhook) */
  ORDER_COMPLETION = 'order_completion',
}
