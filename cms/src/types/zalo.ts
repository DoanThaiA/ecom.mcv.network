/**
 * Zalo OA Types Index
 * Repository-specific Request/Response types for Zalo OA Integration
 */

// Repository-specific Request/Response types
export interface ZaloRedirectResponse {
  url: string;
}

export interface ZaloCallbackRequest {
  code: string;
}

// Zalo OA Information from connection check response
export interface ZaloOAInfo {
  oa_id: string;
  name: string;
  description?: string;
  oa_alias?: string;
  is_verified: boolean;
  oa_type?: number;
  cate_name: string;
  num_follower: number;
  avatar: string;
  cover?: string;
  package_name?: string;
  package_valid_through_date?: string;
  package_auto_renew_date?: string;
  linked_zca?: string;
}

export interface ZaloCallbackResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ZaloCheckConnectionResponse {
  isConnected: boolean;
  oaId?: string;
  oaName?: string;
  message?: string;
  expiresAt?: number;
  refreshTokenExpiresAt?: number;
  oaInfo?: ZaloOAInfo;
}
