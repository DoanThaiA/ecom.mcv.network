import mongoose from 'mongoose';
import { ColorVariant } from '../domain/color-variant';
import { ColorVariantDisplayType } from '../domain/color-variant-display-type.enum';

/**
 * Mapper to convert between domain ColorVariant and Mongoose ColorVariantSchemaClass
 */
export class ColorVariantMapper {
  /**
   * Convert from Mongoose document to domain entity
   */
  static toDomain(raw: any): ColorVariant {
    const colorVariant = new ColorVariant();
    colorVariant.id = raw._id ? raw._id.toString() : '';
    colorVariant.name = raw.name;
    colorVariant.nameNormalized = raw.nameNormalized;
    colorVariant.displayType = raw.displayType ?? ColorVariantDisplayType.SOLID;
    colorVariant.display = raw.display ?? {
      colorValue: null,
      patternImage: null,
    };
    colorVariant.order = raw.order ?? 0;
    colorVariant.createdAt = raw.createdAt;
    colorVariant.updatedAt = raw.updatedAt;
    return colorVariant;
  }

  /**
   * Convert from domain entity to Mongoose document
   */
  static toDocument(colorVariant: ColorVariant): Record<string, any> {
    const document: Record<string, any> = {
      name: colorVariant.name,
      nameNormalized: colorVariant.nameNormalized,
      displayType: colorVariant.displayType,
      display: {
        colorValue: colorVariant.display?.colorValue || null,
        patternImage: colorVariant.display?.patternImage || null,
      },
      order: colorVariant.order,
      createdAt: colorVariant.createdAt,
      updatedAt: colorVariant.updatedAt,
    };

    if (colorVariant.id) {
      document._id = new mongoose.Types.ObjectId(colorVariant.id);
    }

    return document;
  }
}
