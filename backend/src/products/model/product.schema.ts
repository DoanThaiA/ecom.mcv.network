import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { now, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ProductStatus } from '../domain/product-status.enum';
import { ProductType } from '../domain/product-type.enum';
import { ProductBadge } from '../domain/product-badge.enum';
import { EntityDocumentHelper } from '../../utils/document-entity-helper';
import { NhanhProductSnapshot } from '../../nhanh/types/nhanh-snapshots';
import { ProductBannerPosition } from '../../product-banners/domain/product-banner-position.enum';
import type { ProductDescriptionMedia } from '../domain/product-description-media';

export type ProductDocument = HydratedDocument<ProductSchemaClass>;

/**
 * Mongoose schema for Product entity
 *
 * Data architecture:
 * - `snapshot`: Raw data from source (Nhanh/Shopify) stored without processing
 * - Other fields: Domain data derived from snapshot, controlled by our system
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
  collection: 'products',
})
export class ProductSchemaClass extends EntityDocumentHelper {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({
    type: String,
    required: true,
    enum: ['nhanh', 'shopify'],
    index: true,
  })
  source: 'nhanh' | 'shopify';

  /**
   * Raw snapshot from the source system
   * Contains unprocessed data exactly as received from the API
   */
  @Prop({
    type: Object,
    _id: false,
  })
  snapshot?: NhanhProductSnapshot | Record<string, any>;

  @Prop({ type: String, required: true, index: true })
  code: string;

  @Prop({ type: String, sparse: true, index: true })
  barcode?: string;

  @Prop({ type: String, required: true, index: true })
  name: string;

  @Prop({ type: Object })
  nameLocalization?: { vi?: string; en?: string };

  @Prop({ type: String, index: true })
  slug?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Object })
  descriptionLocalization?: { vi?: string; en?: string };

  @Prop({ type: String })
  content?: string;

  /**
   * Hide product from shopping client
   * CMS-only field, not synced from Nhanh
   */
  @Prop({ type: Boolean, default: false })
  hide: boolean;

  @Prop({
    type: {
      retail: { type: Number, required: true },
      wholesale: { type: Number },
      import: { type: Number },
      old: { type: Number },
      avgCost: { type: Number },
      _id: false,
    },
    required: true,
  })
  prices: {
    retail: number;
    wholesale?: number;
    import?: number;
    old?: number;
    avgCost?: number;
  };

  @Prop({ type: Number })
  vat?: number;

  @Prop({
    type: {
      avatar: { type: String },
      others: [{ type: String }],
      _id: false,
    },
    default: {},
  })
  images: {
    avatar?: string;
    others?: string[];
  };

  @Prop({
    type: {
      remain: { type: Number, required: true },
      shipping: { type: Number },
      damaged: { type: Number },
      holding: { type: Number },
      warranty: { type: Number },
      warrantyHolding: { type: Number },
      holdingNew: { type: Number },
      shippingExport: { type: Number },
      available: { type: Number, required: true },
      // Don't sync inventory.depots from snapshot
      _id: false,
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
    // Don't sync inventory.depots from snapshot
  };

  @Prop({
    type: Number,
    required: true,
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
    index: true,
  })
  status: ProductStatus;

  @Prop({
    type: String,
    enum: ProductType,
    default: ProductType.REGULAR,
    index: true,
  })
  type: ProductType;

  @Prop({
    type: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategorySchemaClass',
      },
      name: { type: String },
      _id: false,
    },
  })
  category?: {
    id: mongoose.Types.ObjectId;
    name: string;
  };

  @Prop({ type: Date, default: now })
  createdAt: Date;

  @Prop({ type: Date, default: now })
  updatedAt: Date;

  @Prop({ type: Date, index: true })
  deletedAt?: Date;

  /**
   * Product attributes (e.g., Color, Size) - mirrored from snapshot.attributes
   * Used for variant products to identify their specific attribute values
   */
  @Prop({
    type: [
      {
        id: { type: mongoose.Schema.Types.Mixed },
        name: { type: String, required: true },
        value: { type: String, required: true },
        _id: false,
      },
    ],
    default: undefined,
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
  @Prop({
    type: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductSchemaClass',
        required: true,
      },
      name: { type: String, required: true },
      code: { type: String, required: true },
      images: {
        type: {
          avatar: { type: String },
          others: [{ type: String }],
          _id: false,
        },
        default: {},
      },
      prices: {
        type: {
          retail: { type: Number, required: true },
          wholesale: { type: Number },
          import: { type: Number },
          old: { type: Number },
          avgCost: { type: Number },
          _id: false,
        },
        required: true,
      },
      category: {
        type: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductCategorySchemaClass',
          },
          name: { type: String },
          _id: false,
        },
      },
      _id: false,
    },
  })
  parent?: {
    id: mongoose.Types.ObjectId;
    name: string;
    code: string;
    images: {
      avatar?: string;
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
      id: mongoose.Types.ObjectId;
      name: string;
    };
  };

  /**
   * Embedded child variants for parent products (parentId === -2)
   * Populated during sync to avoid N+1 queries at read time
   * Note: Variants are stored without snapshot to reduce document size
   */
  @Prop({ type: [Object], default: undefined })
  variants?: ProductSchemaClass[];

  /**
   * Pre-computed variant options aggregated from child variants
   * Populated during sync alongside variants to avoid runtime computation
   * Only present on parent products (parentId === -2)
   */
  @Prop({
    type: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        values: [{ type: String }],
        _id: false,
      },
    ],
    default: undefined,
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
  @Prop({ type: Number, index: true })
  stock?: number;

  /**
   * Flash sale pricing data - synced by cron job from active flash sales
   * Contains both flash sale info and computed pricing fields for sorting
   * When no flash sale is active, contains default values based on retail price
   */
  @Prop({
    type: {
      flashSaleId: { type: String },
      flashSaleName: { type: String },
      originalPrice: { type: Number },
      flashSalePrice: { type: Number },
      discountType: { type: String, enum: ['fixed', 'percentage'] },
      discountValue: { type: Number },
      discountAmount: { type: Number },
      discountPercent: { type: Number },
      promotionalQuantity: { type: Number },
      soldCount: { type: Number },
      remainingStock: { type: Number },
      endTime: { type: Date },
      effectivePrice: { type: Number },
      _id: false,
    },
  })
  flashSale?: {
    flashSaleId: string | null;
    flashSaleName: string | null;
    originalPrice: number;
    flashSalePrice: number | null;
    discountType: 'fixed' | 'percentage' | null;
    discountValue: number;
    discountAmount: number;
    discountPercent: number;
    promotionalQuantity: number;
    soldCount: number;
    remainingStock: number;
    endTime: Date | null;
    effectivePrice: number;
  };

  /**
   * Product discount pricing data - synced by cron job from active CTKM promotions
   * Only for AUTO_APPLY type with minimumOrderValue = 0 (applied like flash sale)
   */
  @Prop({
    type: {
      promotionId: { type: String },
      promotionName: { type: String },
      originalPrice: { type: Number },
      discountedPrice: { type: Number },
      discountType: { type: String, enum: ['fixed', 'percentage'] },
      discountValue: { type: Number },
      discountAmount: { type: Number },
      discountPercent: { type: Number },
      soldCount: { type: Number },
      endTime: { type: Date },
      effectivePrice: { type: Number },
      _id: false,
    },
  })
  productDiscount?: {
    promotionId: string | null;
    promotionName: string | null;
    originalPrice: number;
    discountedPrice: number | null;
    discountType: 'fixed' | 'percentage' | null;
    discountValue: number;
    discountAmount: number;
    discountPercent: number;
    soldCount: number;
    endTime: Date | null;
    effectivePrice: number;
  };

  /**
   * Review stats - cached for fast queries on product pages
   * Updated when reviews are created or visibility is toggled
   */
  @Prop({
    type: {
      averageRating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      _id: false,
    },
    default: { averageRating: 0, reviewCount: 0 },
  })
  reviewStats: {
    averageRating: number;
    reviewCount: number;
  };

  /**
   * Product details - CMS-only data not synced from Nhanh
   * Contains additional product information like material, style, etc.
   */
  @Prop({
    type: {
      material: { type: String },
      style: { type: String },
      highlights: { type: String },
      suitableFor: { type: String },
      careInstructions: { type: String },
      _id: false,
    },
    default: undefined,
  })
  details?: {
    material?: string;
    style?: string;
    highlights?: string;
    suitableFor?: string;
    careInstructions?: string;
  };

  @Prop({ type: Object })
  detailsLocalization?: {
    material?: { vi?: string; en?: string };
    style?: { vi?: string; en?: string };
    highlights?: { vi?: string; en?: string };
    suitableFor?: { vi?: string; en?: string };
    careInstructions?: { vi?: string; en?: string };
  };

  /**
   * Product badge - CMS-only data for displaying promotional badges
   */
  @Prop({
    type: String,
    enum: ProductBadge,
    default: undefined,
  })
  badge?: ProductBadge;

  /**
   * Product banner overlay - CMS-only data for displaying banner on product images
   * Embedded from ProductBanner for efficient listing queries
   */
  @Prop({
    type: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductBannerSchemaClass',
      },
      name: { type: String, required: true },
      image: { type: String, required: true },
      position: {
        type: Number,
        enum: [ProductBannerPosition.TOP, ProductBannerPosition.BOTTOM],
        default: ProductBannerPosition.BOTTOM,
      },
      ratio: { type: Number },
      _id: false,
    },
    default: undefined,
  })
  productBanner?: {
    id: mongoose.Types.ObjectId;
    name: string;
    image: string;
    position: ProductBannerPosition;
    ratio?: number;
  };

  /**
   * Size guide image - CMS-only data for displaying size guide on product pages
   */
  @Prop({ type: String })
  sizeGuide?: string;

  @Prop({
    type: {
      topImages: [{ type: String }],
      sliderImages: [{ type: String }],
      bottomImages: [{ type: String }],
      _id: false,
    },
    default: undefined,
  })
  descriptionMedia?: ProductDescriptionMedia;
}

export const ProductSchema = SchemaFactory.createForClass(ProductSchemaClass);

// Compound indexes for efficient queries
// Index by snapshot.id for looking up by source ID
ProductSchema.index(
  { businessId: 1, source: 1, 'snapshot.id': 1 },
  { sparse: true },
);
ProductSchema.index({ businessId: 1, code: 1 });
ProductSchema.index({ businessId: 1, barcode: 1 });
ProductSchema.index({ businessId: 1, status: 1, createdAt: -1 });
ProductSchema.index({ businessId: 1, 'prices.retail': 1 });
ProductSchema.index({ businessId: 1, 'category.id': 1 }, { sparse: true });
ProductSchema.index({ name: 'text', code: 'text' });
// Index for finding child variants by parent's snapshot ID
ProductSchema.index(
  { businessId: 1, source: 1, 'snapshot.parentId': 1 },
  { sparse: true },
);
// Index for looking up variants by parent product ID
ProductSchema.index({ 'parent.id': 1 }, { sparse: true });

// Indexes for flash sale pricing - enables efficient sorting by effective price and discount
ProductSchema.index({ businessId: 1, 'flashSale.effectivePrice': 1 });
ProductSchema.index({ businessId: 1, 'flashSale.discountAmount': -1 });
ProductSchema.index({ businessId: 1, 'flashSale.discountPercent': -1 });

// Index for inventory availability - enables sorting in-stock products first
ProductSchema.index({ businessId: 1, 'inventory.available': -1 });

// Index for total available inventory (aggregated from variants) - enables sorting in-stock products first
ProductSchema.index({ businessId: 1, stock: -1 });

// Compound indexes for shop listing queries - covers filter + sort combinations
ProductSchema.index({ businessId: 1, status: 1, deletedAt: 1, stock: -1 });
ProductSchema.index({ businessId: 1, status: 1, deletedAt: 1, createdAt: -1 });
ProductSchema.index({
  businessId: 1,
  status: 1,
  deletedAt: 1,
  'flashSale.effectivePrice': 1,
});

// Index for SEO-friendly slug lookup (unique per business, only for non-deleted)
ProductSchema.index(
  { businessId: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null, slug: { $exists: true } },
  },
);

// Index for filtering products by product banner
ProductSchema.index({ 'productBanner.id': 1 }, { sparse: true });

ProductSchema.plugin(mongoosePaginate);
