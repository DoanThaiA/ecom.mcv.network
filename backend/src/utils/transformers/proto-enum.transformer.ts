import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';

/**
 * Proto enum mapping type.
 * Maps proto number values to their corresponding string enum values.
 *
 * Example for TopicStatus:
 * {
 *   1: 'active',
 *   2: 'inactive'
 * }
 */
export type ProtoEnumMapping = Record<number, string | number>;

/**
 * Creates a transformer function that converts proto enum numbers to string values.
 *
 * When clients use proto to generate DTOs, enums are sent as numbers (e.g., 1, 2)
 * instead of strings (e.g., 'active', 'inactive'). This transformer handles both
 * cases, allowing the API to accept either format.
 *
 * @param mapping - A mapping of proto number values to string enum values
 * @returns A transformer function compatible with class-transformer's @Transform decorator
 *
 * @example
 * // Define mapping for TopicStatus
 * const TopicStatusProtoMapping: ProtoEnumMapping = {
 *   1: TopicStatus.ACTIVE,
 *   2: TopicStatus.INACTIVE,
 * };
 *
 * // Use in DTO
 * @Transform(createProtoEnumTransformer(TopicStatusProtoMapping))
 * @IsEnum(TopicStatus)
 * status?: TopicStatus;
 */
export function createProtoEnumTransformer(
  mapping: ProtoEnumMapping,
): (params: TransformFnParams) => MaybeType<string | number> {
  return (params: TransformFnParams): MaybeType<string | number> => {
    const { value } = params;

    // Handle undefined/null
    if (value === undefined || value === null) {
      return undefined;
    }

    // If value is a number or numeric string, try to map it
    const numValue =
      typeof value === 'number' ? value : parseInt(value as string, 10);

    if (!isNaN(numValue) && numValue in mapping) {
      return mapping[numValue];
    }

    // Return value as-is if it's already a string (let @IsEnum validate it)
    return value;
  };
}

/**
 * Pre-built proto enum mappings for common enums.
 * These correspond to the proto definitions in proto/common/enums.proto
 */

// TopicStatus: TOPIC_STATUS_ACTIVE = 1, TOPIC_STATUS_INACTIVE = 2
export const TOPIC_STATUS_PROTO_MAP = {
  1: 'active',
  2: 'inactive',
} as const;

// TopicType: TOPIC_TYPE_PRODUCT = 1, TOPIC_TYPE_CATEGORY = 2 (number-based enum)
export const TOPIC_TYPE_PROTO_MAP = {
  1: 1, // PRODUCT
  2: 2, // CATEGORY
} as const;

// ComboStatus: COMBO_STATUS_ACTIVE = 1, COMBO_STATUS_INACTIVE = 2
export const COMBO_STATUS_PROTO_MAP = {
  1: 'active',
  2: 'inactive',
} as const;

// DiscountType: DISCOUNT_TYPE_FIXED = 1, DISCOUNT_TYPE_PERCENTAGE = 2
export const DISCOUNT_TYPE_PROTO_MAP = {
  1: 'fixed',
  2: 'percentage',
} as const;

// ProductStatus: Maps to number-based enum
export const PRODUCT_STATUS_PROTO_MAP = {
  1: 1, // NEW
  2: 2, // ACTIVE
  3: 3, // DISCONTINUED
  4: 4, // OUT_OF_STOCK
  5: 5, // INACTIVE
} as const;

// ProductBrandStatus: PRODUCT_BRAND_STATUS_ACTIVE = 1, PRODUCT_BRAND_STATUS_INACTIVE = 2
export const PRODUCT_BRAND_STATUS_PROTO_MAP = {
  1: 'active',
  2: 'inactive',
} as const;

// ProductCategoryStatus: PRODUCT_CATEGORY_STATUS_ACTIVE = 1, PRODUCT_CATEGORY_STATUS_INACTIVE = 2
export const PRODUCT_CATEGORY_STATUS_PROTO_MAP = {
  1: 'active',
  2: 'inactive',
} as const;

// StatusEnum (generic): STATUS_ACTIVE = 1, STATUS_INACTIVE = 2
// Note: StatusEnum is a numeric enum (active=1, inactive=2), so map to numbers
export const STATUS_PROTO_MAP = {
  1: 1, // active
  2: 2, // inactive
} as const;

// JobStatus: JOB_STATUS_PENDING = 1, etc.
export const JOB_STATUS_PROTO_MAP = {
  1: 'pending',
  2: 'running',
  3: 'completed',
  4: 'failed',
  5: 'cancelled',
} as const;

// AuditLogStatus: AUDIT_LOG_STATUS_SUCCESS = 1, AUDIT_LOG_STATUS_FAILURE = 2
export const AUDIT_LOG_STATUS_PROTO_MAP = {
  1: 'success',
  2: 'failure',
} as const;

// FlashSaleStatus: FLASH_SALE_STATUS_ACTIVE = 1, etc.
export const FLASH_SALE_STATUS_PROTO_MAP = {
  1: 'active',
  2: 'upcoming',
  3: 'ended',
  4: 'disabled',
} as const;

// DiscountDetailType: DISCOUNT_DETAIL_TYPE_COMBO = 1, DISCOUNT_DETAIL_TYPE_FLASH_SALE = 2
export const DISCOUNT_DETAIL_TYPE_PROTO_MAP = {
  1: 'combo',
  2: 'flash_sale',
} as const;

// JobType: Maps to string-based enum
export const JOB_TYPE_PROTO_MAP = {
  1: 'nhanh_product_sync',
  2: 'nhanh_category_sync',
  3: 'nhanh_inventory_sync',
  4: 'nhanh_brand_sync',
} as const;

// OrderStatus: ORDER_STATUS_PENDING = 1, etc.
export const ORDER_STATUS_PROTO_MAP = {
  1: 'pending',
  2: 'confirmed',
  3: 'processing',
  4: 'shipped',
  5: 'delivered',
  6: 'cancelled',
  7: 'refunded',
} as const;

// PaymentStatus: PAYMENT_STATUS_PENDING = 1, etc.
export const PAYMENT_STATUS_PROTO_MAP = {
  1: 'pending',
  2: 'paid',
  3: 'failed',
  4: 'refunded',
} as const;

// PaymentMethod: PAYMENT_METHOD_COD = 1, etc.
export const PAYMENT_METHOD_PROTO_MAP = {
  1: 'cod',
  2: 'bank_transfer',
  3: 'card',
  4: 'ewallet',
  5: 'onepay_intercard',
  6: 'onepay_domestic',
  7: 'infocms_vietqr',
} as const;

// ProductType: PRODUCT_TYPE_REGULAR = 1
export const PRODUCT_TYPE_PROTO_MAP = {
  1: 'regular',
} as const;

// MenuStatus: MENU_STATUS_ACTIVE = 1, MENU_STATUS_INACTIVE = 2
export const MENU_STATUS_PROTO_MAP = {
  1: 'active',
  2: 'inactive',
} as const;

// MenuType: MENU_TYPE_CATEGORY = 1, MENU_TYPE_TOPIC = 2, MENU_TYPE_URL = 3
export const MENU_TYPE_PROTO_MAP = {
  1: 'category',
  2: 'topic',
  3: 'url',
} as const;

// AccountTypeEnum: Maps to number-based enum
export const ACCOUNT_TYPE_PROTO_MAP = {
  1: 1, // website_admin
  2: 2, // affiliate
} as const;

// ModulePermission: Maps to number-based enum
export const MODULE_PERMISSION_PROTO_MAP = {
  1: 1, // product_management
  2: 2, // order_management
  3: 3, // return_management
  4: 4, // flash_sale_management
  5: 5, // promotion_management
  6: 6, // news_management
  7: 7, // homepage_management
  8: 8, // settings
  9: 9, // push_notification_management
  10: 10, // affiliate_management
  11: 11, // account_management
} as const;
