import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartRepository } from '../domain/cart.repository';
import { Cart } from '../domain/cart';
import { CartSchemaClass } from './cart.schema';
import { CartMapper } from './cart.mapper';
import { NullableType } from '../../../utils/types/nullable.type';

/**
 * Mongoose implementation of CartRepository
 */
@Injectable()
export class CartDocumentRepository implements CartRepository {
  constructor(
    @InjectModel(CartSchemaClass.name)
    private readonly cartModel: Model<CartSchemaClass>,
  ) {}

  async findById(id: Cart['id']): Promise<NullableType<Cart>> {
    const doc = await this.cartModel.findById(id).lean();
    return doc ? CartMapper.toDomain(doc) : null;
  }

  async findBySessionId(sessionId: string): Promise<NullableType<Cart>> {
    const doc = await this.cartModel.findOne({ sessionId }).lean();
    return doc ? CartMapper.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<NullableType<Cart>> {
    const doc = await this.cartModel.findOne({ userId }).lean();
    return doc ? CartMapper.toDomain(doc) : null;
  }

  async create(
    data: Omit<Cart, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Cart> {
    const now = new Date();
    const doc = CartMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Cart);

    const created = new this.cartModel(doc);
    const saved = await created.save();
    return CartMapper.toDomain(saved.toObject());
  }

  async update(
    id: Cart['id'],
    payload: Partial<Omit<Cart, 'id' | 'createdAt'>>,
  ): Promise<NullableType<Cart>> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (payload.items !== undefined) {
      updateData.items = payload.items.map((item) =>
        CartMapper.itemToDocument(item),
      );
    }

    if (payload.userId !== undefined) {
      updateData.userId = payload.userId;
    }

    if (payload.expiresAt !== undefined) {
      updateData.expiresAt = payload.expiresAt;
    }

    if (payload.comboInstances !== undefined) {
      updateData.comboInstances = (payload.comboInstances ?? []).map((ci) =>
        CartMapper.comboInstanceToDocument(ci),
      );
    }

    const updated = await this.cartModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean();

    return updated ? CartMapper.toDomain(updated) : null;
  }

  async remove(id: Cart['id']): Promise<void> {
    await this.cartModel.findByIdAndDelete(id);
  }

  async removeExpired(): Promise<number> {
    const result = await this.cartModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }

  async mergeGuestCartToUser(
    guestSessionId: string,
    userId: string,
  ): Promise<NullableType<Cart>> {
    // Find guest cart
    const guestCart = await this.findBySessionId(guestSessionId);
    if (!guestCart || guestCart.items.length === 0) {
      // Return existing user cart or null
      return this.findByUserId(userId);
    }

    // Find or create user cart
    let userCart = await this.findByUserId(userId);

    if (userCart) {
      // Merge items - add guest items to user cart, update quantity if same product
      const mergedItems = [...userCart.items];

      for (const guestItem of guestCart.items) {
        const existingIndex = mergedItems.findIndex(
          (item) =>
            item.productId === guestItem.productId &&
            item.variantId === guestItem.variantId,
        );

        if (existingIndex >= 0) {
          // Update quantity
          mergedItems[existingIndex].quantity += guestItem.quantity;
        } else {
          // Add new item
          mergedItems.push(guestItem);
        }
      }

      userCart = await this.update(userCart.id, { items: mergedItems });
    } else {
      // Convert guest cart to user cart
      userCart = await this.update(guestCart.id, {
        userId,
        expiresAt: null, // Remove expiration for logged-in users
      });
    }

    // Delete guest cart if it's different from user cart
    if (guestCart.id !== userCart?.id) {
      await this.remove(guestCart.id);
    }

    return userCart;
  }
}
