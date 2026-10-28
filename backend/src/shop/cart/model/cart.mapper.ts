import mongoose from 'mongoose';
import { Cart, CartItem, CartComboInstance } from '../domain/cart';
import {
  CartSchemaClass,
  CartItemSchemaClass,
  CartComboInstanceSchemaClass,
} from './cart.schema';

/**
 * Mapper for converting between Cart domain entity and Mongoose document
 */
export class CartMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: CartSchemaClass): Cart {
    const cart = new Cart();

    cart.id = raw._id.toString();
    cart.userId = raw.userId?.toString() ?? null;
    cart.sessionId = raw.sessionId;
    cart.items = raw.items?.map((item) => this.itemToDomain(item)) ?? [];
    cart.comboInstances =
      raw.comboInstances?.map((ci) => this.comboInstanceToDomain(ci)) ?? [];
    cart.createdAt = raw.createdAt;
    cart.updatedAt = raw.updatedAt;
    cart.expiresAt = raw.expiresAt ?? null;

    return cart;
  }

  /**
   * Convert cart item to domain
   */
  static itemToDomain(raw: CartItemSchemaClass): CartItem {
    const item = new CartItem();

    item.productId = raw.productId.toString();
    item.variantId = raw.variantId?.toString() ?? null;
    item.code = raw.code;
    item.name = raw.name;
    item.image = raw.image ?? null;
    item.price = raw.price;
    item.quantity = raw.quantity;
    item.comboInstanceId = raw.comboInstanceId ?? null;
    item.attributes = raw.attributes;
    // Gift item fields
    item.isGift = raw.isGift ?? false;
    item.promotionId = raw.promotionId?.toString() ?? null;
    item.promotionTierId = raw.promotionTierId ?? null;
    item.originalPrice = raw.originalPrice ?? null;

    return item;
  }

  /**
   * Convert combo instance to domain
   */
  static comboInstanceToDomain(
    raw: CartComboInstanceSchemaClass,
  ): CartComboInstance {
    const ci = new CartComboInstance();

    ci.comboInstanceId = raw.comboInstanceId;
    ci.comboId = raw.comboId.toString();
    ci.comboName = raw.comboName;
    ci.discountType = raw.discountType;
    ci.discountValue = raw.discountValue;
    ci.originalPrice = raw.originalPrice;
    ci.discountAmount = raw.discountAmount;

    return ci;
  }

  /**
   * Convert domain entity to Mongoose document
   */
  static toDocument(domain: Cart): CartSchemaClass {
    const doc = new CartSchemaClass();

    if (domain.id) {
      doc._id = domain.id;
    }

    if (domain.userId) {
      doc.userId = new mongoose.Types.ObjectId(domain.userId);
    }

    doc.sessionId = domain.sessionId;
    doc.items = domain.items?.map((item) => this.itemToDocument(item)) ?? [];
    doc.comboInstances =
      domain.comboInstances?.map((ci) => this.comboInstanceToDocument(ci)) ??
      [];
    doc.createdAt = domain.createdAt;
    doc.updatedAt = domain.updatedAt;
    doc.expiresAt = domain.expiresAt ?? undefined;

    return doc;
  }

  /**
   * Convert cart item to document
   */
  static itemToDocument(item: CartItem): CartItemSchemaClass {
    const doc = new CartItemSchemaClass();

    doc.productId = new mongoose.Types.ObjectId(item.productId);
    if (item.variantId) {
      doc.variantId = new mongoose.Types.ObjectId(item.variantId);
    }
    doc.code = item.code;
    doc.name = item.name;
    doc.image = item.image ?? undefined;
    doc.price = item.price;
    doc.quantity = item.quantity;
    doc.comboInstanceId = item.comboInstanceId ?? undefined;
    doc.attributes = item.attributes;
    // Gift item fields
    doc.isGift = item.isGift ?? false;
    if (item.promotionId) {
      doc.promotionId = new mongoose.Types.ObjectId(item.promotionId);
    }
    doc.promotionTierId = item.promotionTierId ?? undefined;
    doc.originalPrice = item.originalPrice ?? undefined;

    return doc;
  }

  /**
   * Convert combo instance to document
   */
  static comboInstanceToDocument(
    ci: CartComboInstance,
  ): CartComboInstanceSchemaClass {
    const doc = new CartComboInstanceSchemaClass();

    doc.comboInstanceId = ci.comboInstanceId;
    doc.comboId = new mongoose.Types.ObjectId(ci.comboId);
    doc.comboName = ci.comboName;
    doc.discountType = ci.discountType;
    doc.discountValue = ci.discountValue;
    doc.originalPrice = ci.originalPrice;
    doc.discountAmount = ci.discountAmount;

    return doc;
  }
}
