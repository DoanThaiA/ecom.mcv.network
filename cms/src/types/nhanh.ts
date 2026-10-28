/**
 * Nhanh Types
 * Custom repository types for Nhanh integration
 */

// Repository-specific Request/Response types
export interface NhanhRedirectResponse {
  url: string;
}

export interface NhanhCallbackRequest {
  accessCode: string;
}

export interface NhanhCallbackResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface NhanhSyncAllResponse {
  message: string;
}

export interface NhanhCheckConnectionResponse {
  isConnected: boolean;
  storeId?: string;
  storeName?: string;
  message?: string;
}

export interface NhanhSyncProductCategoriesResponse {
  message: string;
}

export interface NhanhSyncProductsResponse {
  message: string;
}
