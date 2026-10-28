import { NhanhOrderStatus } from '../enums/nhanh-order-status.enum';

/**
 * Nhanh.vn Order Add API DTOs
 * Based on: https://apidocs.nhanh.vn/v3/order/add
 */

/**
 * Order type constants from Nhanh.vn
 * See: https://apidocs.nhanh.vn/v3/modelconstant#order-type
 */
export enum NhanhOrderType {
  /** Giao hàng tận nhà (Home delivery) - default */
  HOME_DELIVERY = 1,
  /** Khách đến lấy (Customer pickup) */
  CUSTOMER_PICKUP = 2,
  /** Giao hàng qua đối tác (Partner delivery) */
  PARTNER_DELIVERY = 3,
}

/**
 * Order info section
 */
export interface NhanhOrderInfo {
  /** Order type (default: 1 = home delivery) */
  type?: NhanhOrderType;
  /** Warehouse ID */
  depotId?: number;
  /** Sales employee ID */
  saleId?: number;
  /** Order creator ID */
  createdById?: number;
  /** Order notes */
  description?: string;
  /** Customer care notes (private) */
  privateDescription?: string;
  /** Order status code */
  status?: NhanhOrderStatus;
  /** Array of order tag IDs */
  tagIds?: number[];
}

/**
 * Order channel section (sales channel data)
 */
export interface NhanhOrderChannel {
  /** External order ID (required) */
  appOrderId: string;
  /** Order source name */
  sourceName?: string;
  /** Referral info */
  affiliate?: {
    code?: string;
    value?: number;
    bonus?: number;
  };
  /** UTM tracking parameters */
  marketing?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
}

/**
 * Shipping address section
 */
export interface NhanhOrderShippingAddress {
  /** Recipient name (required) */
  name: string;
  /** Phone number (required) */
  mobile: string;
  /** Email address */
  email?: string;
  /** Street address */
  address?: string;
  /** City ID */
  cityId?: number;
  /** District ID */
  districtId?: number;
  /** Ward ID */
  wardId?: number;
  /** Location version: "v1" or "v2" */
  locationVersion?: string;
}

/**
 * Carrier type constants from Nhanh.vn
 * See: https://apidocs.nhanh.vn/v3/order/add
 */
export enum NhanhSendCarrierType {
  /** Use Nhanh.vn's built-in carrier connection */
  NHANH_CONNECTION = 1,
  /** Use shop's own carrier account connection */
  SHOP_ACCOUNT = 2,
}

/**
 * Nhanh "Tự Vận Chuyển" (self-delivery) carrier id, from the Order Carrier
 * constant table (id 12). Used when the shop's own carrier account (type 2 /
 * NVS) is unavailable and the shop delivers the order itself instead of
 * falling back to Nhanh's carrier connection (type 1 / NVN).
 */
export const NHANH_SELF_SHIP_CARRIER_ID = 12;

/** Default self-ship service id (25 = "Chuyển Thường"; label only, no rate/SLA). */
export const NHANH_SELF_SHIP_SERVICE_ID = 25;

/**
 * Internal carrier-type discriminator stored on the order / checkout session:
 * 1 = NHANH_CONNECTION (NVN), 2 = SHOP_ACCOUNT (NVS), 3 = SELF_SHIP (TVC).
 */
export const CARRIER_TYPE_SELF_SHIP = 3;

/**
 * Default shipping carrier id used for the SHOP_ACCOUNT (NVS / type 2) fee
 * lookup and carrier selection. SPX Express (29) — switched from Viettel
 * Post (2).
 *
 * Nhanh carrier ids (from /v3.0/shipping/carrier): 2 = Viettel Post,
 * 29 = SPX Express.
 */
export const DEFAULT_SHIPPING_CARRIER_ID = 29;

/**
 * Carrier/shipping section
 */
export interface NhanhOrderCarrier {
  /** Carrier connection type */
  sendCarrierType?: NhanhSendCarrierType;
  /** Carrier ID */
  id?: number;
  /** Service ID */
  serviceId?: number;
  /** Service code */
  serviceCode?: string;
  /** Account ID */
  accountId?: number;
  /** Shop ID */
  shopId?: number;
  /** Shipping fee charged to customer */
  customerShipFee?: number;
  /** Delivery date (yyyy-mm-dd) */
  deliveryDate?: string;
  /** Declaration flag */
  isDeclaredValue?: boolean;
  /** Declared value amount */
  declaredValue?: number;
  /** Additional services */
  extraServices?: Record<string, unknown>;
}

/**
 * Product item in order
 */
export interface NhanhOrderProduct {
  /** Product ID (required) */
  id: number;
  /** Unit price (required) */
  price: number;
  /** Item quantity (required) */
  quantity: number;
  /** VAT percentage */
  vat?: number;
  /** Product discount */
  discount?: number;
  /** Array of gift items */
  gifts?: Array<{
    id: number;
    quantity: number;
  }>;
}

/**
 * Payment section
 */
export interface NhanhOrderPayment {
  /** Deposit amount */
  depositAmount?: number;
  /** Transfer amount */
  transferAmount?: number;
  /** Discount code */
  couponCode?: string;
  /** Discount value */
  discountAmount?: number;
  /** Discount type: "cash" or "percent" */
  discountType?: 'cash' | 'percent';
}

/**
 * Complete order add request payload
 */
export interface NhanhOrderAddRequestDto {
  /** Basic order information */
  info?: NhanhOrderInfo;
  /** Sales channel data */
  channel: NhanhOrderChannel;
  /** Delivery location */
  shippingAddress: NhanhOrderShippingAddress;
  /** Shipping service */
  carrier?: NhanhOrderCarrier;
  /** Order items */
  products: NhanhOrderProduct[];
  /** Payment information */
  payment?: NhanhOrderPayment;
}

/**
 * Order add response data
 */
export interface NhanhOrderAddResponseData {
  /** Nhanh order ID */
  id: number;
  /** Order tracking URL */
  trackingUrl: string;
}

/**
 * Order add API response
 */
export interface NhanhOrderAddResponseDto {
  /** Response code: 1 = success */
  code: number;
  /** Response data */
  data?: NhanhOrderAddResponseData;
  /** Error messages */
  messages?: Record<string, string>;
  /** Error code */
  errorCode?: string;
}

/**
 * Nhanh.vn Order List API DTOs
 * Based on: https://apidocs.nhanh.vn/v3/order/list
 *
 * Nhanh has no direct filter by appOrderId, so order-code lookups page
 * through the list within a date window and match on channel.appOrderId.
 */

/**
 * Request payload for the order list endpoint.
 * Only the fields used for order-code lookup are modeled.
 */
export interface NhanhOrderListRequestDto {
  /** Search filters (must be nested under `filters`, not top-level) */
  filters?: {
    /** Filter by order creation date — start, Unix timestamp in seconds */
    createdAtFrom?: number;
    /** Filter by order creation date — end, Unix timestamp in seconds */
    createdAtTo?: number;
    /** Filter by recipient — Nhanh stores/searches mobile in local (0xxx) form */
    shippingAddress?: {
      mobile?: string;
    };
  };
  /** Pagination controls */
  paginator?: {
    /** Items per page (max 100) */
    size?: number;
    /** Sort order, e.g. { id: 'desc' } */
    sort?: Record<string, 'asc' | 'desc'>;
    /** Opaque cursor echoed back from a previous response's paginator.next */
    next?: unknown;
  };
}

/**
 * A single order entry returned by the order list endpoint.
 * Only the fields needed to recover sync state are modeled.
 */
export interface NhanhOrderListItem {
  /** Basic order information */
  info?: {
    /** Nhanh order ID */
    id?: number;
    /** Order creation time (Unix seconds) — matches our order.createdAt to the second */
    createdAt?: number;
    /** Order tracking URL */
    trackingUrl?: string;
  };
  /** Payment summary — codAmount equals our order total for COD orders */
  payment?: {
    codAmount?: number;
  };
  /**
   * Sales channel data. NOTE: Nhanh's list API returns `appOrderId` as null for
   * some orders (even when filtering by exact id), so it is NOT reliable for
   * matching — match on mobile + createdAt instead.
   */
  channel?: {
    appOrderId?: string;
  };
}

/**
 * Minimal order data recovered from Nhanh when our local sync state is
 * missing the Nhanh order id (e.g. the webhook never fired, or the add
 * request failed with a duplicate "đã tồn tại" error).
 */
export interface NhanhFoundOrder {
  /** Nhanh order ID */
  id: number;
  /** Order tracking URL, if any */
  trackingUrl?: string;
}
