import { FlashSaleProduct } from '../domain/flash-sale-product';
import { FlashSaleProductSchemaClass } from './flash-sale-product.schema';

/**
 * Mapper for converting between FlashSaleProduct domain entity and Mongoose document
 */
export class FlashSaleProductMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: FlashSaleProductSchemaClass): FlashSaleProduct {
    const entity = new FlashSaleProduct();

    entity.id = raw._id.toString();
    entity.flashSaleId = raw.flashSaleId.toString();
    entity.flashSaleName = raw.flashSaleName;

    const productId =
      typeof raw.productId === 'object' && (raw.productId as any)?._id
        ? (raw.productId as any)._id
        : raw.productId;
    entity.productId = productId.toString();

    // Stored fields
    entity.name = raw.name;
    entity.code = raw.code;
    entity.category = raw.category ?? null;
    entity.status = raw.status;
    entity.stock = raw.stock ?? 0;
    entity.hide = raw.hide ?? false;
    entity.images = raw.images;

    // Flash sale pricing
    entity.discountType = raw.discountType;
    entity.discountValue = raw.discountValue;
    entity.originalPrice = raw.originalPrice;
    entity.productDiscountPrice = raw.productDiscountPrice;
    entity.flashSalePrice = raw.flashSalePrice;
    entity.discountAmount = raw.discountAmount;
    entity.discountPercent = raw.discountPercent;
    entity.promotionalQuantity = raw.promotionalQuantity;
    entity.soldCount = raw.soldCount;
    entity.remainingStock = Math.max(
      0,
      raw.promotionalQuantity - raw.soldCount,
    );
    entity.effectivePrice = raw.effectivePrice;
    entity.endTime = raw.endTime;
    entity.isEnabled = raw.isEnabled;
    entity.order = raw.order ?? 0;
    entity.deletedAt = raw.deletedAt ?? null;

    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;

    return entity;
  }
}
