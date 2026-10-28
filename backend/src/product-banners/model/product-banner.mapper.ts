import mongoose from 'mongoose';
import { ProductBanner, ProductBannerProduct } from '../domain/product-banner';
import { ProductBannerPosition } from '../domain/product-banner-position.enum';

/**
 * Mapper to convert between domain ProductBanner and Mongoose ProductBannerSchemaClass
 */
export class ProductBannerMapper {
  /**
   * Convert from Mongoose document to domain entity
   */
  static toDomain(raw: any): ProductBanner {
    const productBanner = new ProductBanner();
    productBanner.id = raw._id ? raw._id.toString() : '';
    productBanner.name = raw.name;
    productBanner.image = raw.image;
    productBanner.position = raw.position ?? ProductBannerPosition.BOTTOM;
    productBanner.ratio = raw.ratio ?? null;
    productBanner.isActive = raw.isActive ?? true;
    productBanner.products = (raw.products || []).map(
      (p: any): ProductBannerProduct => ({
        id: p.id ? p.id.toString() : '',
        name: p.name,
        code: p.code,
        images: p.images
          ? {
              avatar: p.images.avatar ?? null,
            }
          : undefined,
      }),
    );
    productBanner.createdAt = raw.createdAt;
    productBanner.updatedAt = raw.updatedAt;
    productBanner.deletedAt = raw.deletedAt || null;
    return productBanner;
  }

  /**
   * Convert from domain entity to Mongoose document
   */
  static toDocument(productBanner: ProductBanner): Record<string, any> {
    const document: Record<string, any> = {
      name: productBanner.name,
      image: productBanner.image,
      position: productBanner.position,
      isActive: productBanner.isActive,
      products: (productBanner.products || []).map((p) => ({
        id: new mongoose.Types.ObjectId(p.id),
        name: p.name,
        code: p.code,
        images: p.images,
      })),
      createdAt: productBanner.createdAt,
      updatedAt: productBanner.updatedAt,
    };

    if (productBanner.id) {
      document._id = new mongoose.Types.ObjectId(productBanner.id);
    }

    if (productBanner.ratio !== undefined && productBanner.ratio !== null) {
      document.ratio = productBanner.ratio;
    }

    if (productBanner.deletedAt !== undefined) {
      document.deletedAt = productBanner.deletedAt;
    }

    return document;
  }
}
