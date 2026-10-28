import { NullableType } from '../../../utils/types/nullable.type';
import { CheckoutSession } from './checkout-session';

/**
 * CheckoutSession repository interface
 * Abstract class for dependency injection
 */
export abstract class CheckoutSessionRepository {
  /**
   * Find session by ID
   */
  abstract findById(
    id: CheckoutSession['id'],
  ): Promise<NullableType<CheckoutSession>>;

  /**
   * Create a new session
   */
  abstract create(
    data: Omit<CheckoutSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CheckoutSession>;

  /**
   * Update session
   */
  abstract update(
    id: CheckoutSession['id'],
    payload: Partial<
      Omit<CheckoutSession, 'id' | 'createdAt' | 'sessionNumber'>
    >,
  ): Promise<NullableType<CheckoutSession>>;

  /**
   * Mark session as completed with order reference
   */
  abstract markCompleted(
    id: CheckoutSession['id'],
    orderId: string,
    orderNumber: string,
  ): Promise<NullableType<CheckoutSession>>;

  /**
   * Mark session as pending payment with order reference
   */
  abstract markPendingPayment(
    id: CheckoutSession['id'],
    orderId: string,
    orderNumber: string,
  ): Promise<NullableType<CheckoutSession>>;

  /**
   * Find session by order ID
   */
  abstract findByOrderId(
    orderId: string,
  ): Promise<NullableType<CheckoutSession>>;

  /**
   * Find active session by sessionId (cart session) or userId
   */
  abstract findActiveBySessionIdOrUserId(
    sessionId: string,
    userId?: string,
  ): Promise<NullableType<CheckoutSession>>;

  /**
   * Delete session by ID
   */
  abstract delete(id: CheckoutSession['id']): Promise<void>;

  /**
   * Generate unique session number
   */
  abstract generateSessionNumber(): Promise<string>;
}
