import mongoose from 'mongoose';
import { Product } from '../domain/product';
import { ProductSchemaClass } from './product.schema';
import { ProductType } from '../domain/product-type.enum';

/**
 * Mapper for converting between Product domain entity and Mongoose document
 */
export class ProductMapper {
  /**
   * Convert Mongoose document to domain entity
   * @param raw - Mongoose document
   * @returns Product domain entity
   */
  static toDomain(raw: ProductSchemaClass): Product {
    const domainEntity = new Product();

    domainEntity.id = raw._id.toString();
    domainEntity.businessId = raw.businessId;
    domainEntity.source = raw.source;
    domainEntity.snapshot = raw.snapshot ?? null;
    domainEntity.slug = raw.slug ?? null;
    domainEntity.code = raw.code;
    domainEntity.barcode = raw.barcode ?? null;
    domainEntity.name = raw.name;
    domainEntity.nameLocalization = raw.nameLocalization ?? null;
    domainEntity.description = raw.description ?? null;
    domainEntity.descriptionLocalization = raw.descriptionLocalization ?? null;
    domainEntity.content = raw.content ?? null;
    domainEntity.prices = raw.prices;
    domainEntity.vat = raw.vat ?? null;
    domainEntity.images = raw.images || {};
    domainEntity.inventory = raw.inventory ?? null;
    domainEntity.status = raw.status;
    domainEntity.type = raw.type ?? ProductType.REGULAR;
    domainEntity.category = raw.category
      ? {
          id: raw.category.id.toString(),
          name: raw.category.name,
        }
      : null;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt ?? null;
    domainEntity.hide = raw.hide ?? false;

    // Map attributes if present
    if (raw.attributes && raw.attributes.length > 0) {
      domainEntity.attributes = raw.attributes;
    }

    // Map parent metadata if present (for variant products)
    if (raw.parent) {
      domainEntity.parent = {
        id: raw.parent.id.toString(),
        name: raw.parent.name,
        code: raw.parent.code,
        images: {
          avatar: raw.parent.images?.avatar ?? null,
          others: raw.parent.images?.others,
        },
        prices: raw.parent.prices,
        category: raw.parent.category
          ? {
              id: raw.parent.category.id.toString(),
              name: raw.parent.category.name,
            }
          : null,
      };
    }

    // Map embedded variants if present
    if (raw.variants && raw.variants.length > 0) {
      domainEntity.variants = raw.variants.map((variant) =>
        ProductMapper.toDomain(variant as ProductSchemaClass),
      );
    }

    // Map pre-computed variant options if present
    if (raw.variantOptions && raw.variantOptions.length > 0) {
      domainEntity.variantOptions = raw.variantOptions;
    }

    // Map flash sale data if present
    if (raw.flashSale) {
      domainEntity.flashSale = {
        flashSaleId: raw.flashSale.flashSaleId,
        flashSaleName: raw.flashSale.flashSaleName,
        originalPrice: raw.flashSale.originalPrice,
        flashSalePrice: raw.flashSale.flashSalePrice,
        discountType: raw.flashSale
          .discountType as Product['flashSale'] extends {
          discountType: infer T;
        }
          ? T
          : never,
        discountValue: raw.flashSale.discountValue,
        discountAmount: raw.flashSale.discountAmount,
        discountPercent: raw.flashSale.discountPercent,
        promotionalQuantity: raw.flashSale.promotionalQuantity,
        soldCount: raw.flashSale.soldCount,
        remainingStock: raw.flashSale.remainingStock,
        endTime: raw.flashSale.endTime,
        effectivePrice:
          raw.flashSale.remainingStock > 0
            ? raw.flashSale.effectivePrice
            : raw.flashSale.originalPrice,
      };
    }

    // Map review stats if present
    if (raw.reviewStats) {
      domainEntity.reviewStats = {
        averageRating: raw.reviewStats.averageRating,
        reviewCount: raw.reviewStats.reviewCount,
      };
    }

    // Map product discount data if present
    if (raw.productDiscount) {
      domainEntity.productDiscount = {
        promotionId: raw.productDiscount.promotionId,
        promotionName: raw.productDiscount.promotionName,
        originalPrice: raw.productDiscount.originalPrice,
        discountedPrice: raw.productDiscount.discountedPrice,
        discountType: raw.productDiscount
          .discountType as Product['productDiscount'] extends {
          discountType: infer T;
        }
          ? T
          : never,
        discountValue: raw.productDiscount.discountValue,
        discountAmount: raw.productDiscount.discountAmount,
        discountPercent: raw.productDiscount.discountPercent,
        soldCount: raw.productDiscount.soldCount,
        endTime: raw.productDiscount.endTime,
        effectivePrice: raw.productDiscount.effectivePrice,
      };
    }

    // Map product details if present
    if (raw.details) {
      domainEntity.details = {
        material: raw.details.material,
        style: raw.details.style,
        highlights: raw.details.highlights,
        suitableFor: raw.details.suitableFor,
        careInstructions: raw.details.careInstructions,
      };
    }

    // Map product details localization if present
    if (raw.detailsLocalization) {
      domainEntity.detailsLocalization = raw.detailsLocalization;
    }

    // Map stock if present
    if (raw.stock !== undefined) {
      domainEntity.stock = raw.stock;
    }

    // Map badge if present
    if (raw.badge !== undefined) {
      domainEntity.badge = raw.badge;
    }

    // Map product banner if present
    if (raw.productBanner) {
      domainEntity.productBanner = {
        id: raw.productBanner.id.toString(),
        name: raw.productBanner.name,
        image: raw.productBanner.image,
        position: raw.productBanner.position,
        ratio: raw.productBanner.ratio ?? null,
      };
    }

    // Map size guide image URL
    if (raw.sizeGuide !== undefined) {
      domainEntity.sizeGuide = raw.sizeGuide ?? null;
    }

    if (raw.descriptionMedia) {
      domainEntity.descriptionMedia = {
        topImages: raw.descriptionMedia.topImages ?? [],
        sliderImages: raw.descriptionMedia.sliderImages ?? [],
        bottomImages: raw.descriptionMedia.bottomImages ?? [],
      };
    }

    return domainEntity;
  }

  /**
   * Convert domain entity to Mongoose document
   * @param domainEntity - Product domain entity
   * @returns Mongoose document
   */
  static toDocument(domainEntity: Product): ProductSchemaClass {
    const persistenceSchema = new ProductSchemaClass();

    if (domainEntity.id && typeof domainEntity.id === 'string') {
      persistenceSchema._id = domainEntity.id;
    }

    persistenceSchema.businessId = domainEntity.businessId;
    persistenceSchema.source = domainEntity.source;
    persistenceSchema.snapshot = domainEntity.snapshot ?? undefined;
    persistenceSchema.slug = domainEntity.slug ?? undefined;
    persistenceSchema.code = domainEntity.code;
    persistenceSchema.barcode = domainEntity.barcode ?? undefined;
    persistenceSchema.name = domainEntity.name;
    persistenceSchema.nameLocalization =
      domainEntity.nameLocalization ?? undefined;
    persistenceSchema.description = domainEntity.description ?? undefined;
    persistenceSchema.descriptionLocalization =
      domainEntity.descriptionLocalization ?? undefined;
    persistenceSchema.content = domainEntity.content ?? undefined;
    persistenceSchema.prices = domainEntity.prices;
    persistenceSchema.vat = domainEntity.vat ?? undefined;
    persistenceSchema.images = {
      avatar: domainEntity.images?.avatar ?? undefined,
      others: domainEntity.images?.others,
    };
    persistenceSchema.inventory = domainEntity.inventory ?? undefined;
    persistenceSchema.status = domainEntity.status;
    if (domainEntity.type !== undefined) {
      persistenceSchema.type = domainEntity.type;
    }
    if (domainEntity.category) {
      persistenceSchema.category = {
        id: new mongoose.Types.ObjectId(domainEntity.category.id),
        name: domainEntity.category.name,
      };
    }
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deletedAt = domainEntity.deletedAt ?? undefined;
    persistenceSchema.hide = domainEntity.hide ?? false;

    // Map attributes if present
    if (domainEntity.attributes && domainEntity.attributes.length > 0) {
      persistenceSchema.attributes = domainEntity.attributes;
    }

    // Map parent metadata if present (for variant products)
    if (domainEntity.parent) {
      persistenceSchema.parent = {
        id: new mongoose.Types.ObjectId(domainEntity.parent.id),
        name: domainEntity.parent.name,
        code: domainEntity.parent.code,
        images: {
          avatar: domainEntity.parent.images?.avatar ?? undefined,
          others: domainEntity.parent.images?.others,
        },
        prices: domainEntity.parent.prices,
        category: domainEntity.parent.category
          ? {
              id: new mongoose.Types.ObjectId(domainEntity.parent.category.id),
              name: domainEntity.parent.category.name,
            }
          : undefined,
      };
    }

    // Map embedded variants if present
    if (domainEntity.variants && domainEntity.variants.length > 0) {
      persistenceSchema.variants = domainEntity.variants.map(
        (variant) => ProductMapper.toDocument(variant) as ProductSchemaClass,
      );
    }

    // Map pre-computed variant options if present
    if (domainEntity.variantOptions && domainEntity.variantOptions.length > 0) {
      persistenceSchema.variantOptions = domainEntity.variantOptions;
    }

    // Map product details if present
    if (domainEntity.details) {
      persistenceSchema.details = {
        material: domainEntity.details.material,
        style: domainEntity.details.style,
        highlights: domainEntity.details.highlights,
        suitableFor: domainEntity.details.suitableFor,
        careInstructions: domainEntity.details.careInstructions,
      };
    }

    // Map product details localization if present
    if (domainEntity.detailsLocalization) {
      persistenceSchema.detailsLocalization = domainEntity.detailsLocalization;
    }

    if (domainEntity.stock) {
      persistenceSchema.stock = domainEntity.stock;
    }

    // Map badge if present
    if (domainEntity.badge !== undefined) {
      persistenceSchema.badge = domainEntity.badge ?? undefined;
    }

    // Map product banner if present
    if (domainEntity.productBanner) {
      persistenceSchema.productBanner = {
        id: new mongoose.Types.ObjectId(domainEntity.productBanner.id),
        name: domainEntity.productBanner.name,
        image: domainEntity.productBanner.image,
        position: domainEntity.productBanner.position,
        ratio: domainEntity.productBanner.ratio ?? undefined,
      };
    }

    // Map size guide image URL
    if (domainEntity.sizeGuide !== undefined) {
      persistenceSchema.sizeGuide = domainEntity.sizeGuide ?? undefined;
    }

    if (domainEntity.descriptionMedia) {
      persistenceSchema.descriptionMedia = {
        topImages: domainEntity.descriptionMedia.topImages ?? [],
        sliderImages: domainEntity.descriptionMedia.sliderImages ?? [],
        bottomImages: domainEntity.descriptionMedia.bottomImages ?? [],
      };
    }

    return persistenceSchema;
  }
}
