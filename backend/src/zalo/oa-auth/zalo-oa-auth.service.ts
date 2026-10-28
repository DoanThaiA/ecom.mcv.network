import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import axios from 'axios';
import { AllConfigType } from '../../config/config.type';
import { throwException } from '../../utils/errors/throw-exception';
import { ZaloOaConnectionDto } from '../dto/zalo-oa-connection.dto';
import {
  ZaloOaAccessToken,
  ZaloTokenResponse,
  ZaloOaInfo,
} from '../interfaces/zalo.interface';
import { SecretRepository } from '../../secret/secret.repository';
import { getCacheKey } from '../../utils/env';

@Injectable()
export class ZaloOaAuthService {
  private readonly CACHE_KEY = getCacheKey('zalo-oa:token');
  private readonly DB_KEY = 'zalo-oa:token';

  // Zalo OA OAuth endpoints
  private readonly oauthUrl = 'https://oauth.zaloapp.com/v4/oa/permission';
  private readonly tokenUrl = 'https://oauth.zaloapp.com/v4/oa/access_token';
  private readonly apiUrl = 'https://openapi.zalo.me';

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private secretRepo: SecretRepository,
  ) {}

  /**
   * Generates the Zalo OA OAuth authorization URL.
   * @returns Object containing the authorization URL
   */
  getAuthorizationUrl(): { url: string } {
    const appId = this.configService.get('zalo.appId', { infer: true });

    if (!appId) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t(
          'social.integration.zaloOa.credentialsNotConfigured',
        ),
      });
    }

    // // Get the redirect URI (the callback endpoint)
    const cmsDomain = this.configService.getOrThrow('app.cmsDomain', {
      infer: true,
    });
    const redirectUri = `${cmsDomain}/auth/zalo`;

    // Build the authorization URL
    const authUrl = new URL(this.oauthUrl);
    authUrl.searchParams.set('app_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);

    return {
      url: authUrl.toString(),
    };
  }

  /**
   * Exchange authorization code for access token and refresh token
   * @param code - Authorization code received from Zalo OA OAuth callback
   * @returns Connection info with expiration timestamps and OA details (access token is stored server-side only)
   */
  async exchangeAccessToken(code: string): Promise<ZaloOaConnectionDto> {
    const appId = this.configService.get('zalo.appId', { infer: true });
    const appSecret = this.configService.get('zalo.appSecret', {
      infer: true,
    });

    if (!appId || !appSecret) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t(
          'social.integration.zaloOa.credentialsNotConfigured',
        ),
      });
    }

    try {
      // Prepare form data for token exchange
      const formData = new URLSearchParams();
      formData.append('code', code);
      formData.append('app_id', appId);
      formData.append('grant_type', 'authorization_code');

      const response = await axios.post<ZaloTokenResponse>(
        this.tokenUrl,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            secret_key: appSecret,
          },
          timeout: 10000,
        },
      );

      const data: ZaloTokenResponse = response.data;

      if (!data.access_token || !data.refresh_token) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('social.integration.zaloOa.invalidAuthCode'),
        });
      }

      // Calculate expiration timestamps
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expiresIn =
        typeof data.expires_in === 'string'
          ? parseInt(data.expires_in)
          : data.expires_in;
      const expiresAt = currentTimestamp + expiresIn; // Access token expires in 25 hours
      const refreshTokenExpiresAt = currentTimestamp + 90 * 24 * 60 * 60; // Refresh token expires in 90 days

      // Try to fetch OA info to get OA ID and details
      const oaInfo: ZaloOaInfo | undefined = await this.getOaInfo(
        data.access_token,
      );
      const oaId: string | undefined = oaInfo?.oa_id;

      // Cache the token with TTL based on access token expiration time
      await this.cacheToken(
        data.access_token,
        data.refresh_token,
        expiresAt,
        refreshTokenExpiresAt,
        oaId,
      );

      // Return expiration timestamps and OA details (matching connection response)
      return {
        expiresAt,
        refreshTokenExpiresAt,
        oaInfo: oaInfo!,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throwException({
            status: HttpStatus.REQUEST_TIMEOUT,
            message: this.i18n.t('social.integration.zaloOa.apiTimeout'),
          });
        }

        throwException({
          status: error.response?.status || HttpStatus.UNPROCESSABLE_ENTITY,
          message: `${this.i18n.t('social.integration.zaloOa.failedToGetAccessToken')}: ${JSON.stringify(error.response?.data)}`,
        });
      }

      // Re-throw if it's already a handled exception
      throw error;
    }
  }

  /**
   * Refresh the access token using refresh token
   *
   * This is called automatically by getAccessToken() when:
   * - Access token has expired (after 25 hours)
   * - Refresh token is still valid (within 90 days)
   *
   * @param refreshToken - The refresh token to use
   * @returns New access token, new refresh token, and expiration timestamps
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    refreshTokenExpiresAt: number;
  }> {
    const appId = this.configService.get('zalo.appId', { infer: true });
    const appSecret = this.configService.get('zalo.appSecret', {
      infer: true,
    });

    if (!appId || !appSecret) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t(
          'social.integration.zaloOa.credentialsNotConfigured',
        ),
      });
    }

    try {
      // Prepare form data for token refresh
      const formData = new URLSearchParams();
      formData.append('refresh_token', refreshToken);
      formData.append('app_id', appId);
      formData.append('grant_type', 'refresh_token');

      const response = await axios.post<ZaloTokenResponse>(
        this.tokenUrl,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            secret_key: appSecret,
          },
          timeout: 10000,
        },
      );

      const data: ZaloTokenResponse = response.data;

      if (!data.access_token || !data.refresh_token) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t(
            'social.integration.zaloOa.noAccessTokenInResponse',
          ),
        });
      }

      // Calculate new expiration timestamps
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expiresIn =
        typeof data.expires_in === 'string'
          ? parseInt(data.expires_in)
          : data.expires_in;
      const expiresAt = currentTimestamp + expiresIn;
      const refreshTokenExpiresAt = currentTimestamp + 90 * 24 * 60 * 60; // Refresh token expires in 90 days

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        refreshTokenExpiresAt,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throwException({
            status: HttpStatus.REQUEST_TIMEOUT,
            message: this.i18n.t('social.integration.zaloOa.apiTimeout'),
          });
        }

        throwException({
          status: error.response?.status || HttpStatus.UNPROCESSABLE_ENTITY,
          message: `${this.i18n.t('social.integration.zaloOa.failedToRefreshToken')}: ${JSON.stringify(error.response?.data)}`,
        });
      }

      throw error;
    }
  }

  /**
   * Get OA information using access token
   * @param accessToken - The access token
   * @returns OA information
   */
  private async getOaInfo(accessToken: string): Promise<ZaloOaInfo> {
    try {
      const response = await axios.get(`${this.apiUrl}/v2.0/oa/getoa`, {
        headers: {
          'Content-Type': 'application/json',
          access_token: accessToken,
        },
        timeout: 10000,
      });

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get OA info: ${error.response?.status || error.message}`,
        );
      }
      throw new Error('Failed to get OA info');
    }
  }

  /**
   * Validate if an access token is still valid
   * @param expiresAt - Unix timestamp when token expires
   * @returns True if token is valid
   */
  isTokenValid(expiresAt: number): boolean {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp < expiresAt;
  }

  /**
   * Cache the access token with TTL based on expiration time and save to database
   * @param accessToken - The access token to cache
   * @param refreshToken - The refresh token
   * @param expiresAt - Unix timestamp when the access token expires
   * @param refreshTokenExpiresAt - Unix timestamp when the refresh token expires
   * @param oaId - Optional OA ID
   */
  private async cacheToken(
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
    refreshTokenExpiresAt: number,
    oaId?: string,
  ): Promise<void> {
    // Calculate TTL in milliseconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const ttlInSeconds = expiresAt - currentTimestamp;

    const tokenData: ZaloOaAccessToken = {
      accessToken,
      refreshToken,
      expiresAt,
      refreshTokenExpiresAt,
      oaId,
    };

    // Only cache if the token hasn't already expired
    if (ttlInSeconds > 0) {
      const ttlInMs = ttlInSeconds * 1000;

      // Save to cache
      await this.cacheManager.set<ZaloOaAccessToken>(
        this.CACHE_KEY,
        tokenData,
        ttlInMs,
      );

      // Save to database key-value store
      await this.secretRepo.set<ZaloOaAccessToken>(this.DB_KEY, tokenData);
    }
  }

  /**
   * Get access token - first from cache, then from database, refreshing if needed
   *
   * Token lifecycle:
   * - Access token: expires in 25 hours (90000s)
   * - Refresh token: expires in 90 days
   * - Automatically refreshes access token when expired if refresh token is still valid
   *
   * @returns The token data or null if not found or both tokens expired
   */
  async getAccessToken(): Promise<ZaloOaAccessToken | null> {
    // Try to get from cache first
    const cachedData = await this.cacheManager.get<ZaloOaAccessToken>(
      this.CACHE_KEY,
    );

    if (cachedData) {
      // Check if the cached access token is still valid
      if (this.isTokenValid(cachedData.expiresAt)) {
        return cachedData;
      }

      // Access token expired, try to refresh if refresh token is still valid
      if (this.isTokenValid(cachedData.refreshTokenExpiresAt)) {
        try {
          const refreshed = await this.refreshAccessToken(
            cachedData.refreshToken,
          );

          // Update with new tokens
          const updatedData: ZaloOaAccessToken = {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            expiresAt: refreshed.expiresAt,
            refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
            oaId: cachedData.oaId,
          };

          await this.cacheToken(
            updatedData.accessToken,
            updatedData.refreshToken,
            updatedData.expiresAt,
            updatedData.refreshTokenExpiresAt,
            updatedData.oaId,
          );

          return updatedData;
        } catch (error) {
          // Refresh failed, remove from cache
          await this.cacheManager.del(this.CACHE_KEY);
        }
      } else {
        // Refresh token also expired, remove from cache
        await this.cacheManager.del(this.CACHE_KEY);
      }
    }

    // Cache miss or expired - try to get from database
    const dbToken = await this.secretRepo.get<ZaloOaAccessToken>(this.DB_KEY);

    if (!dbToken) {
      return null;
    }

    // Check if access token is valid
    if (this.isTokenValid(dbToken.expiresAt)) {
      // Cache the valid token from database
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const ttlInSeconds = dbToken.expiresAt - currentTimestamp;
      const ttlInMs = ttlInSeconds * 1000;

      await this.cacheManager.set<ZaloOaAccessToken>(
        this.CACHE_KEY,
        dbToken,
        ttlInMs,
      );

      return dbToken;
    }

    // Access token expired, try to refresh if refresh token is still valid
    if (this.isTokenValid(dbToken.refreshTokenExpiresAt)) {
      try {
        const refreshed = await this.refreshAccessToken(dbToken.refreshToken);

        // Update with new tokens
        const updatedData: ZaloOaAccessToken = {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
          refreshTokenExpiresAt: refreshed.refreshTokenExpiresAt,
          oaId: dbToken.oaId,
        };

        await this.cacheToken(
          updatedData.accessToken,
          updatedData.refreshToken,
          updatedData.expiresAt,
          updatedData.refreshTokenExpiresAt,
          updatedData.oaId,
        );

        return updatedData;
      } catch (error) {
        // Refresh failed
        return null;
      }
    }

    // Both tokens expired
    return null;
  }

  /**
   * Invalidate (remove) the cached token
   */
  async invalidateToken(): Promise<void> {
    await this.cacheManager.del(this.CACHE_KEY);
  }

  /**
   * Check connection by verifying access token with Zalo OA API
   * This clears the cached token and gets fresh data from database
   * @returns Connection info with expiration timestamps and OA details
   */
  async checkConnection(): Promise<ZaloOaConnectionDto> {
    // Clear cached token
    await this.invalidateToken();

    // Get token from database (will auto-refresh if needed)
    const tokenData = await this.getAccessToken();

    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('social.integration.zaloOa.noAccessToken'),
      });
    }

    try {
      // Verify token by getting OA info
      const oaInfo = await this.getOaInfo(tokenData.accessToken);

      return {
        expiresAt: tokenData.expiresAt,
        refreshTokenExpiresAt: tokenData.refreshTokenExpiresAt,
        oaInfo,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throwException({
          status: HttpStatus.REQUEST_TIMEOUT,
          message: this.i18n.t('social.integration.zaloOa.apiTimeout'),
        });
      }

      throw error;
    }
  }
}
