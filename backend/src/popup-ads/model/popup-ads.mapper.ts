import mongoose from 'mongoose';
import { PopupAds } from '../domain/popup-ads';

/**
 * Mapper to convert between domain PopupAds and Mongoose PopupAdsSchemaClass
 */
export class PopupAdsMapper {
  /**
   * Convert from Mongoose document to domain entity
   */
  static toDomain(raw: any): PopupAds {
    const popupAds = new PopupAds();
    popupAds.id = raw._id ? raw._id.toString() : '';
    popupAds.image = raw.image;
    popupAds.startAt = raw.startAt;
    popupAds.endAt = raw.endAt;
    popupAds.name = raw.name;
    popupAds.link = raw.link || null;
    popupAds.order = raw.order;
    popupAds.isActive = raw.isActive;
    popupAds.createdAt = raw.createdAt;
    popupAds.updatedAt = raw.updatedAt;
    popupAds.deletedAt = raw.deletedAt || null;
    return popupAds;
  }

  /**
   * Convert from domain entity to Mongoose document
   */
  static toDocument(popupAds: PopupAds): Record<string, any> {
    const document: Record<string, any> = {
      image: popupAds.image,
      startAt: popupAds.startAt,
      endAt: popupAds.endAt,
      name: popupAds.name,
      order: popupAds.order,
      isActive: popupAds.isActive,
      createdAt: popupAds.createdAt,
      updatedAt: popupAds.updatedAt,
    };

    if (popupAds.id) {
      document._id = new mongoose.Types.ObjectId(popupAds.id);
    }

    if (popupAds.link !== undefined) {
      document.link = popupAds.link;
    }

    if (popupAds.deletedAt !== undefined) {
      document.deletedAt = popupAds.deletedAt;
    }

    return document;
  }
}
