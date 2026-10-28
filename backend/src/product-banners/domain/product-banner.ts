import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductBannerPosition } from './product-banner-position.enum';

const idType = String;

/**
 * Product info embedded in ProductBanner
 * Contains essential product data for CMS display
 */
export class ProductBannerProduct {
  @ApiProperty({
    type: String,
    description: 'Product ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Product name',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Product code/SKU',
  })
  code: string;

  @ApiPropertyOptional({
    description: 'Product images',
  })
  images?: {
    avatar?: string | null;
  };
}

/**
 * ProductBanner domain entity
 * Represents a banner overlay that can be applied to product images
 */
export class ProductBanner {
  @ApiProperty({
    type: idType,
    description: 'Internal product banner ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Banner name (for CMS identification)',
    example: 'Summer Sale Banner',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Banner image URL',
    example: 'https://cdn.example.com/banner.jpg',
  })
  image: string;

  @ApiProperty({
    enum: ProductBannerPosition,
    enumName: 'ProductBannerPosition',
    description: 'Banner position on product image (1 = TOP, 2 = BOTTOM)',
    example: ProductBannerPosition.BOTTOM,
    default: ProductBannerPosition.BOTTOM,
  })
  position: ProductBannerPosition;

  @ApiPropertyOptional({
    type: Number,
    description: 'Optional aspect ratio for the banner',
    example: 16 / 9,
  })
  ratio?: number | null;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the banner is active',
    example: true,
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    type: [ProductBannerProduct],
    description: 'Products this banner applies to',
    example: [
      {
        id: '507f1f77bcf86cd799439011',
        name: 'Product Name',
        code: 'PROD-001',
        images: { avatar: 'https://example.com/img.jpg' },
      },
    ],
  })
  products: ProductBannerProduct[];

  @ApiProperty({
    type: Date,
    description: 'Banner creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Banner last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Banner deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;
}

/**
 * Embedded product banner data for Product entity
 * Contains denormalized banner info for efficient product listing queries
 */
export class EmbeddedProductBanner {
  @ApiProperty({
    type: String,
    description: 'Product banner ID reference',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Banner name',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Banner image URL',
  })
  image: string;

  @ApiProperty({
    enum: ProductBannerPosition,
    enumName: 'ProductBannerPosition',
    description: 'Banner position on product image',
  })
  position: ProductBannerPosition;

  @ApiPropertyOptional({
    type: Number,
    description: 'Optional aspect ratio',
  })
  ratio?: number | null;
}
