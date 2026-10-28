import { NullableType } from '../../../utils/types/nullable.type';
import { Cart } from './cart';

/**
 * Abstract repository interface for Cart entity
 */
export abstract class CartRepository {
  /**
   * Find cart by ID
   */
  abstract findById(id: Cart['id']): Promise<NullableType<Cart>>;

  /**
   * Find cart by session ID
   */
  abstract findBySessionId(sessionId: string): Promise<NullableType<Cart>>;

  /**
   * Find cart by user ID
   */
  abstract findByUserId(userId: string): Promise<NullableType<Cart>>;

  /**
   * Create a new cart
   */
  abstract create(
    data: Omit<Cart, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Cart>;

  /**
   * Update cart
   */
  abstract update(
    id: Cart['id'],
    payload: Partial<Omit<Cart, 'id' | 'createdAt'>>,
  ): Promise<NullableType<Cart>>;

  /**
   * Delete cart
   */
  abstract remove(id: Cart['id']): Promise<void>;

  /**
   * Delete expired carts
   */
  abstract removeExpired(): Promise<number>;

  /**
   * Merge guest cart into user cart (after login)
   */
  abstract mergeGuestCartToUser(
    guestSessionId: string,
    userId: string,
  ): Promise<NullableType<Cart>>;
}
