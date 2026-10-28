import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ProductStatus } from './product-status.enum';
import { ProductType } from './product-type.enum';
import { ProductBadge } from './product-badge.enum';
import { NhanhProductSnapshot } from '../../nhanh/types/nhanh-snapshots';
import { DiscountType } from '../../combos/domain/discount-type.enum';
import { ProductBannerPosition } from '../../product-banners/domain/product-banner-position.enum';
import type { ProductDescriptionMedia } from './product-description-media';

const idType = String;

/**
 * Product domain entity
 * Platform-agnostic business model for products across all sources
 *
 * Data architecture:
 * - `snapshot`: Raw data from source (excluded from API responses)
 * - Other fields: Domain data derived from snapshot, controlled by our system
 */
export class Product {
  @ApiProperty({
    type: idType,
    description: 'Internal product ID',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Business ID from the source system',
    example: '110668',
  })
  businessId: string;

  @ApiProperty({
    type: String,
    enum: ['nhanh', 'shopify'],
    description: 'Data source origin',
    example: 'nhanh',
  })
  source: 'nhanh' | 'shopify';

  /**
   * Raw snapshot from the source system
   * Excluded from serialization - not sent to clients
   */
  @Exclude()
  snapshot?: NhanhProductSnapshot | Record<string, any> | null;

  @ApiProperty({
    type: String,
    description: 'Product code/SKU',
    example: 'PROD-001',
  })
  code: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Product barcode',
    example: '1234567890123',
  })
  barcode?: string | null;

  @ApiProperty({
    type: String,
    description: 'Product name',
    example: 'iPhone 15 Pro Max',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Multilingual product name',
    example: { vi: 'iPhone 15 Pro Max', en: 'iPhone 15 Pro Max' },
  })
  nameLocalization?: { vi?: string; en?: string } | null;

  @ApiPropertyOptional({
    type: String,
    description: 'SEO-friendly URL slug',
    example: 'iphone-15-pro-max',
  })
  slug?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Product description (short)',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Multilingual product description',
    example: { vi: 'Mô tả sản phẩm', en: 'Product description' },
  })
  descriptionLocalization?: { vi?: string; en?: string } | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Product content (detailed HTML content)',
  })
  content?: string | null;

  @ApiProperty({
    type: Boolean,
    description: 'Hide product from shopping client (CMS-only)',
    default: false,
  })
  hide: boolean;

  @ApiProperty({
    description: 'Product pricing information',
    example: {
      retail: 29990000,
      wholesale: 28000000,
      import: 25000000,
      old: 31990000,
    },
  })
  prices: {
    /** Retail price */
    retail: number;
    /** Wholesale price (optional) */
    wholesale?: number;
    /** Import/cost price (optional) */
    import?: number;
    /** Old/original price (optional) */
    old?: number;
    /** Average cost (optional) */
    avgCost?: number;
  };

  @ApiPropertyOptional({
    type: Number,
    description: 'VAT percentage',
    example: 10,
  })
  vat?: number | null;

  @ApiProperty({
    description: 'Product images',
    example: {
      avatar: 'https://example.com/product.jpg',
      others: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
    },
  })
  images: {
    /** Main product image */
    avatar?: string | null;
    /** Additional product images */
    others?: string[];
  };

  @ApiPropertyOptional({
    description: 'Product inventory information',
    example: {
      remain: 100,
      available: 95,
      shipping: 5,
    },
  })
  inventory?: {
    remain: number;
    shipping?: number;
    damaged?: number;
    holding?: number;
    warranty?: number;
    warrantyHolding?: number;
    holdingNew?: number;
    shippingExport?: number;
    available: number;
  } | null;

  @ApiProperty({
    enum: ProductStatus,
    enumName: 'ProductStatus',
    description: 'Product status',
    example: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @ApiProperty({
    enum: ProductType,
    enumName: 'ProductType',
    description: 'Product type',
    example: ProductType.REGULAR,
    default: ProductType.REGULAR,
  })
  type: ProductType;

  @ApiPropertyOptional({
    description: 'Product category',
    example: {
      id: '507f1f77bcf86cd799439011',
      name: 'Electronics',
    },
  })
  category?: {
    id: string;
    name: string;
  } | null;

  @ApiProperty({
    type: Date,
    description: 'Product creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Product last update timestamp',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Product deletion timestamp (soft delete)',
  })
  deletedAt?: Date | null;

  /**
   * Product attributes (e.g., Color, Size) - mirrored from snapshot.attributes
   * Used for variant products to identify their specific attribute values
   */
  @ApiPropertyOptional({
    description: 'Product attributes (for variants)',
    example: [
      { id: '1', name: 'Color', value: 'Red' },
      { id: '2', name: 'Size', value: 'M' },
    ],
  })
  attributes?: Array<{
    id?: number | string;
    name: string;
    value: string;
  }>;

  /**
   * Parent product metadata (for variant products only)
   * Contains denormalized parent data to avoid extra lookups
   * Populated during sync based on snapshot.parentId
   */
  @ApiPropertyOptional({
    description: 'Parent product metadata (for variants only)',
    example: {
      id: '507f1f77bcf86cd799439011',
      name: 'Parent Product Name',
      code: 'PARENT-001',
      images: { avatar: 'https://example.com/parent.jpg' },
      prices: { retail: 299000 },
      category: { id: '507f1f77bcf86cd799439012', name: 'Electronics' },
    },
  })
  parent?: {
    id: string;
    name: string;
    code: string;
    images: {
      avatar?: string | null;
      others?: string[];
    };
    prices: {
      retail: number;
      wholesale?: number;
      import?: number;
      old?: number;
      avgCost?: number;
    };
    category?: {
      id: string;
      name: string;
    } | null;
  } | null;

  /**
   * Embedded child variants for parent products (parentId === -2)
   * Populated during sync to avoid N+1 queries at read time
   * Note: Variants are stored without snapshot to reduce document size
   */
  @ApiPropertyOptional({
    type: () => [Product],
    description: 'Child variant products (only for parent products)',
  })
  variants?: Product[];

  /**
   * Pre-computed variant options aggregated from child variants
   * Populated during sync alongside variants to avoid runtime computation
   * Only present on parent products (parentId === -2)
   */
  @ApiPropertyOptional({
    description: 'Aggregated variant options (only for parent products)',
    example: [
      { id: '1', name: 'Color', values: ['Red', 'Blue'] },
      { id: '2', name: 'Size', values: ['M', 'L'] },
    ],
  })
  variantOptions?: Array<{
    id: string;
    name: string;
    values: string[];
  }>;

  /**
   * Total available inventory for sorting in-stock products first
   * - For parent products: sum of all variant inventory.available
   * - For standalone products: equals inventory.available
   * Pre-computed during sync to enable efficient MongoDB sorting
   */
  @ApiPropertyOptional({
    description:
      'Total stock for sorting (sum of variant stock for parent products)',
    example: 100,
  })
  stock?: number;

  /**
   * Flash sale information - synced by cron job from active flash sales
   * Contains both flash sale info and computed pricing fields for sorting
   * When no flash sale is active, contains default values based on retail price
   */
  @ApiPropertyOptional({
    description: 'Flash sale info and pricing data for sorting',
  })
  flashSale?: {
    /** Flash sale ID (null if not in flash sale) */
    flashSaleId: string | null;
    /** Flash sale name (null if not in flash sale) */
    flashSaleName: string | null;
    /** Original retail price */
    originalPrice: number;
    /** Flash sale price (null if not in flash sale) */
    flashSalePrice: number | null;
    /** Discount type: 'fixed' or 'percentage' (null if not in flash sale) */
    discountType: DiscountType | null;
    /** Discount value (0 if not in flash sale) */
    discountValue: number;
    /** Calculated discount amount in currency (0 if not in flash sale) */
    discountAmount: number;
    /** Discount percentage (0 if not in flash sale) */
    discountPercent: number;
    /** Promotional quantity available (0 if not in flash sale) */
    promotionalQuantity: number;
    /** Number of units sold in flash sale (0 if not in flash sale) */
    soldCount: number;
    /** Remaining stock for flash sale (0 if not in flash sale) */
    remainingStock: number;
    /** Flash sale end time (null if not in flash sale) */
    endTime: Date | null;
    /** Effective price for sorting (flashSalePrice or retail) */
    effectivePrice: number;
  } | null;

  /**
   * Product discount information - synced by cron job from active CTKM promotions
   * Only for AUTO_APPLY type with minimumOrderValue = 0 (applied like flash sale)
   * Contains discount info and computed pricing for display
   */
  @ApiPropertyOptional({
    description: 'Product discount info (CTKM auto-apply, no min order)',
  })
  productDiscount?: {
    /** Promotion ID */
    promotionId: string | null;
    /** Promotion name */
    promotionName: string | null;
    /** Original retail price */
    originalPrice: number;
    /** Discounted price */
    discountedPrice: number | null;
    /** Discount type: 'FIXED' or 'PERCENTAGE' */
    discountType: DiscountType | null;
    /** Discount value (amount or percentage) */
    discountValue: number;
    /** Calculated discount amount in currency */
    discountAmount: number;
    /** Discount percentage for display */
    discountPercent: number;
    /** Number of units sold in this promotion */
    soldCount: number;
    /** Promotion end time */
    endTime: Date | null;
    /** Effective price for sorting (discountedPrice or retail) */
    effectivePrice: number;
  } | null;

  /**
   * Review statistics - cached for fast queries on product pages
   * Updated when reviews are created or visibility is toggled
   */
  @ApiPropertyOptional({
    description: 'Review statistics',
    example: { averageRating: 4.5, reviewCount: 10 },
  })
  reviewStats?: {
    /** Average rating (1-5, 1 decimal) */
    averageRating: number;
    /** Total visible review count */
    reviewCount: number;
  } | null;

  /**
   * Product details - CMS-only data not synced from Nhanh
   * Contains additional product information managed through CMS
   */
  @ApiPropertyOptional({
    description: 'Product details (CMS-managed)',
    example: {
      material: 'Cotton 100%',
      style: 'Casual',
      highlights: 'Soft and breathable fabric',
      suitableFor: 'Everyday wear',
      careInstructions: 'Machine wash cold, tumble dry low',
    },
  })
  details?: {
    /** Material composition */
    material?: string;
    /** Product style */
    style?: string;
    /** Key highlights/features */
    highlights?: string;
    /** Suitable for occasions/usage */
    suitableFor?: string;
    /** Care and maintenance instructions */
    careInstructions?: string;
  } | null;

  @ApiPropertyOptional({
    description: 'Multilingual product details',
    example: {
      material: { vi: 'Cotton 100%', en: 'Cotton 100%' },
      style: { vi: 'Thời trang', en: 'Casual' },
      highlights: {
        vi: 'Vải mềm mại và thoáng khí',
        en: 'Soft and breathable fabric',
      },
      suitableFor: { vi: 'Mặc hàng ngày', en: 'Everyday wear' },
      careInstructions: { vi: 'Giặt máy nước lạnh', en: 'Machine wash cold' },
    },
  })
  detailsLocalization?: {
    material?: { vi?: string; en?: string };
    style?: { vi?: string; en?: string };
    highlights?: { vi?: string; en?: string };
    suitableFor?: { vi?: string; en?: string };
    careInstructions?: { vi?: string; en?: string };
  } | null;

  /**
   * Product badge - CMS-only data for displaying promotional badges
   */
  @ApiPropertyOptional({
    enum: ProductBadge,
    enumName: 'ProductBadge',
    description: 'Product badge for promotional display',
    example: ProductBadge.NEW,
  })
  badge?: ProductBadge | null;

  /**
   * Product banner overlay - CMS-only data for displaying banner on product images
   * Embedded from ProductBanner for efficient listing queries
   */
  @ApiPropertyOptional({
    description: 'Product banner overlay (CMS-managed)',
    example: {
      id: '507f1f77bcf86cd799439011',
      name: 'Summer Sale',
      image: 'https://cdn.example.com/banner.jpg',
      position: 1,
      ratio: 16 / 9,
    },
  })
  productBanner?: {
    id: string;
    name: string;
    image: string;
    position: ProductBannerPosition;
    ratio?: number | null;
  } | null;

  /**
   * Size guide image - CMS-only data for displaying size guide on product pages
   */
  @ApiPropertyOptional({
    type: String,
    description: 'Size guide image URL (CMS-managed)',
    example: 'https://cdn.example.com/size-guide.jpg',
  })
  sizeGuide?: string | null;

  @ApiPropertyOptional({
    description: 'CMS-managed product-description media shared by all locales',
  })
  descriptionMedia?: ProductDescriptionMedia | null;
}
