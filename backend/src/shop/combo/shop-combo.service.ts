import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ComboRepository } from '../../combos/domain/combo.repository';
import { ProductRepository } from '../../products/domain/product.repository';
import { Combo } from '../../combos/domain/combo';
import { ComboStatus } from '../../combos/domain/combo-status.enum';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { getProductImage } from '../../products/domain/product.utils';
import { filterActiveVariants } from '../helpers/filter-active-variants';
import { throwException } from '../../utils/errors/throw-exception';
import {
  ShopComboResponseDto,
  ShopComboItemResponseDto,
  ShopComboListResponseDto,
  ShopComboVariantDto,
} from './dto/shop-combo.dto';

/**
 * Shop combo service - public endpoints for combo browsing
 */
@Injectable()
export class ShopComboService {
  constructor(
    private readonly comboRepository: ComboRepository,
    private readonly productRepository: ProductRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Get active combos for a product
   * Returns combos that include the specified product and are currently active
   */
  async getCombosForProduct(
    productId: string,
  ): Promise<ShopComboListResponseDto> {
    // Get active combos for the product
    const combos = await this.comboRepository.findActiveByProductId(productId);

    // Filter out expired/not yet valid combos
    const now = new Date();
    const validCombos = combos.filter((combo) => {
      if (combo.validFrom && combo.validFrom > now) return false;
      if (combo.validTo && combo.validTo < now) return false;
      return true;
    });

    // Convert to response DTOs with product details
    const comboDtos = await Promise.all(
      validCombos.map((combo) => this.toComboResponse(combo)),
    );

    return {
      combos: comboDtos,
      total: comboDtos.length,
    };
  }

  /**
   * Get a single combo by ID
   */
  async getComboById(comboId: string): Promise<ShopComboResponseDto> {
    const combo = await this.comboRepository.findById(comboId);

    if (!combo) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.notFound'),
      });
    }

    // Check if combo is active
    if (combo.status !== ComboStatus.ACTIVE) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.comboNotActive'),
      });
    }

    // Check date validity
    const now = new Date();
    if (combo.validFrom && combo.validFrom > now) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.comboNotYetValid'),
      });
    }
    if (combo.validTo && combo.validTo < now) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('combo.comboExpired'),
      });
    }

    return this.toComboResponse(combo);
  }

  /**
   * Convert combo to shop response DTO with product details
   */
  private async toComboResponse(combo: Combo): Promise<ShopComboResponseDto> {
    // Fetch product details for each combo item
    const itemsWithDetails: ShopComboItemResponseDto[] = await Promise.all(
      combo.items.map(async (item) => {
        const rawProduct = await this.productRepository.findById(
          item.productId,
        );

        // Read before filtering: a parent whose SKUs are all inactive must
        // still be reported as a parent so the client marks it unavailable
        // instead of adding the parent SKU, which Nhanh does not sell.
        const isParent = (rawProduct?.variants?.length ?? 0) > 0;

        // Hide unsellable variants, as the product detail and topic endpoints do.
        const product = rawProduct ? filterActiveVariants(rawProduct) : null;

        // `attributes` name the color/size options, `code` maps an option pair
        // back to a variant, `available` drives the sold-out styling.
        const variants: ShopComboVariantDto[] =
          product?.variants?.map((v) => ({
            id: v.id,
            name: v.name,
            price: v.prices.retail,
            code: v.code ?? null,
            attributes: v.attributes?.map((attr) => ({
              name: attr.name,
              value: attr.value,
            })),
            available: v.inventory?.available ?? 0,
            image: getProductImage(v),
          })) ?? [];

        return {
          productId: item.productId,
          quantity: item.quantity,
          productName: product?.name ?? null,
          productImage: getProductImage(product),
          productPrice: product?.prices?.retail ?? null,
          productCode: product?.code ?? null,
          isParentProduct: isParent,
          available: product?.inventory?.available ?? 0,
          variants: variants.length > 0 ? variants : undefined,
        };
      }),
    );

    const discountAmount = this.calculateDiscountAmount(
      combo.originalPrice,
      combo.discountType,
      combo.discountValue,
    );

    return {
      id: combo.id,
      name: combo.name,
      nameLocalization: combo.nameLocalization
        ? { vi: combo.nameLocalization.vi, en: combo.nameLocalization.en }
        : null,
      description: combo.description,
      image: combo.image,
      items: itemsWithDetails,
      discountType: combo.discountType,
      discountValue: combo.discountValue,
      originalPrice: combo.originalPrice,
      finalPrice: combo.originalPrice - discountAmount,
      discountAmount,
      validFrom: combo.validFrom,
      validTo: combo.validTo,
    };
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscountAmount(
    originalPrice: number,
    discountType: DiscountType,
    discountValue: number,
  ): number {
    if (discountType === DiscountType.FIXED) {
      return Math.min(discountValue, originalPrice);
    }
    return Math.round(originalPrice * (discountValue / 100));
  }
}
