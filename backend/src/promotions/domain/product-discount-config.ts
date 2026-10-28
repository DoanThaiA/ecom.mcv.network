import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Product discount configuration
 * Applies a discount directly to selected products
 * Note: Products are stored in a separate 'promotion_products' collection
 */
export class ProductDiscountConfig {
  /** @deprecated Promotion-level discount type. Use per-product discount instead. */
  @ApiPropertyOptional({
    enum: DiscountType,
    description:
      'Deprecated: promotion-level discount type. Per-product discount is used instead.',
  })
  discountType?: DiscountType;

  /** @deprecated Promotion-level discount value. Use per-product discount instead. */
  @ApiPropertyOptional({
    description:
      'Deprecated: promotion-level discount value. Per-product discount is used instead.',
  })
  discountValue?: number;

  /** @deprecated Promotion-level max discount cap. No longer used. */
  @ApiPropertyOptional({
    description: 'Deprecated: max discount cap. No longer used.',
  })
  maxDiscountValue?: number;
}
