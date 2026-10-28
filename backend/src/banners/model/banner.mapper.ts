import mongoose from 'mongoose';
import { Banner } from '../domain/banner';
import { BannerMediaType } from './banner-media-type.enum';

/**
 * Mapper to convert between domain Banner and Mongoose BannerSchemaClass
 */
export class BannerMapper {
  /**
   * Convert from Mongoose document to domain entity
   */
  static toDomain(raw: any): Banner {
    const banner = new Banner();
    banner.id = raw._id ? raw._id.toString() : '';
    banner.position = raw.position;
    banner.mediaType = raw.mediaType ?? BannerMediaType.IMAGE;
    // Support legacy 'images' field for backward compatibility
    banner.media = raw.media ??
      raw.images ?? {
        mobile: '',
        tablet: '',
        desktop: '',
      };
    banner.link = raw.link || null;
    banner.order = raw.order;
    banner.isActive = raw.isActive;
    banner.createdAt = raw.createdAt;
    banner.updatedAt = raw.updatedAt;
    banner.deletedAt = raw.deletedAt || null;
    return banner;
  }

  /**
   * Convert from domain entity to Mongoose document
   */
  static toDocument(banner: Banner): Record<string, any> {
    const document: Record<string, any> = {
      position: banner.position,
      mediaType: banner.mediaType,
      media: {
        mobile: banner.media.mobile,
        tablet: banner.media.tablet,
        desktop: banner.media.desktop,
      },
      order: banner.order,
      isActive: banner.isActive,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };

    if (banner.id) {
      document._id = new mongoose.Types.ObjectId(banner.id);
    }

    if (banner.link !== undefined) {
      document.link = banner.link;
    }

    if (banner.deletedAt !== undefined) {
      document.deletedAt = banner.deletedAt;
    }

    return document;
  }
}
