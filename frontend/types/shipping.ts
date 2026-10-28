/**
 * Shipping types
 */

export interface ShippingCalculateItem {
  productId: string;
  quantity: number;
}

export interface ShippingAddressPayload {
  cityId: number;
  districtId: number;
  wardId: number;
  address: string;
}

export interface ShippingCalculateRequest {
  shippingAddress: ShippingAddressPayload;
  items: ShippingCalculateItem[];
}

export interface ShippingFeeByDepot {
  depotId: string;
  depotName?: string;
  shippingFee: number;
  items: ShippingCalculateItem[];
}

export interface ShippingCalculateResponse {
  depots: ShippingFeeByDepot[];
  totalShippingFee: number;
  orderCount: number;
}
