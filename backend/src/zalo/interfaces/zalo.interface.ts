export interface ZaloTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  refresh_token_expires_in?: string;
}

export interface ZaloUserInfo {
  id: string;
  name: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

// Zalo OA (Official Account) Interfaces
export interface ZaloOaAccessToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp when access token expires
  refreshTokenExpiresAt: number; // Unix timestamp when refresh token expires
  oaId?: string; // Official Account ID
}

export interface ZaloOaInfo {
  oa_id: string;
  name: string;
  description: string;
  cate_name: string;
  num_follower: number;
  avatar: string;
  cover: string;
}
