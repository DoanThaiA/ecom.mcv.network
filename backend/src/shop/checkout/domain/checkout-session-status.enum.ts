/**
 * CheckoutSession status enum
 * Represents the lifecycle states of a checkout session
 */
export enum CheckoutSessionStatus {
  /** Session is active and can be modified or converted to order */
  ACTIVE = 'active',

  /** Waiting for online payment confirmation (future) */
  PENDING_PAYMENT = 'pending_payment',

  /** Session was successfully converted to an order (terminal) */
  COMPLETED = 'completed',

  /** Payment failed (future) */
  FAILED = 'failed',

  /** Session expired without completing checkout (terminal) */
  EXPIRED = 'expired',
}
