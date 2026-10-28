import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import axios from 'axios';
import { AllConfigType } from '../../config/config.type';
import { throwException } from '../../utils/errors/throw-exception';
import { NhanhTokenResponseDto } from '../dto/nhanh-token-response.dto';
import { NhanhConnectionDto } from '../dto/nhanh-connection.dto';
import { NhanhAccessToken } from '../interfaces/nhanh.interface';
import { SecretRepository } from '../../secret/secret.repository';
import { getCacheKey } from '../../utils/env';

@Injectable()
export class NhanhAuthService {
  private readonly CACHE_KEY = getCacheKey('nhanh:token');
  private readonly DB_KEY = 'nhanh:token';

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private secretRepo: SecretRepository,
  ) {}

  /**
   * Generates the Nhanh OAuth authorization URL.
   * @returns Object containing the authorization URL
   */
  getAuthorizationUrl(): { url: string } {
    const appId = this.configService.get('nhanh.appId', { infer: true });
    const oauthUrl = this.configService.get('nhanh.oauthUrl', { infer: true });
    const apiVersion = this.configService.get('nhanh.apiVersion', {
      infer: true,
    });

    if (!appId) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.credentialsNotConfigured'),
      });
    }

    // Default return link to backend domain if not provided
    const cmsDomain = this.configService.getOrThrow('app.cmsDomain', {
      infer: true,
    });
    const returnLink = `${cmsDomain}/auth/nhanh`;

    // Build the authorization URL
    const authUrl = new URL(oauthUrl!);
    authUrl.searchParams.set('version', apiVersion || '2.0');
    authUrl.searchParams.set('appId', appId);
    authUrl.searchParams.set('returnLink', returnLink);

    return {
      url: authUrl.toString(),
    };
  }

  /**
   * Exchange access code for access token
   * @param accessCode - Access code received from Nhanh OAuth callback
   * @returns Connection info with business info and expiration (access token is stored server-side only)
   */
  async exchangeAccessToken(accessCode: string): Promise<NhanhConnectionDto> {
    const appId = this.configService.get('nhanh.appId', { infer: true });
    const appSecret = this.configService.get('nhanh.appSecret', {
      infer: true,
    });
    const apiUrl = this.configService.get('nhanh.apiUrl', { infer: true });
    const apiVersion = this.configService.get('nhanh.apiVersion', {
      infer: true,
    });

    if (!appId || !appSecret) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.credentialsNotConfigured'),
      });
    }

    try {
      const tokenUrl = `${apiUrl}/v${apiVersion}/app/getaccesstoken?appId=${appId}`;

      const response = await axios.post<NhanhTokenResponseDto>(
        tokenUrl,
        {
          accessCode: accessCode,
          secretKey: appSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data: NhanhTokenResponseDto = response.data;

      // Check if the response indicates an error
      if (data.code !== 1) {
        const errorMessage =
          data.messages && Object.keys(data.messages).length > 0
            ? JSON.stringify(data.messages)
            : this.i18n.t('nhanh.failedToGetAccessToken');

        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: errorMessage,
        });
      }

      if (!data.data?.accessToken) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('nhanh.noAccessTokenInResponse'),
        });
      }

      // Cache the token with TTL based on expiration time
      await this.cacheToken(
        data.data.accessToken,
        data.data.expiredAt,
        data.data.businessId,
      );

      // Return response without accessToken (stored server-side only)
      const { accessToken, ...dataWithoutToken } = data.data;

      return dataWithoutToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throwException({
            status: HttpStatus.REQUEST_TIMEOUT,
            message: this.i18n.t('nhanh.apiTimeout'),
          });
        }

        throwException({
          status: error.response?.status || HttpStatus.UNPROCESSABLE_ENTITY,
          message: `${this.i18n.t('nhanh.failedToGetAccessToken')}: ${JSON.stringify(error.response?.data)}`,
        });
      }

      // Re-throw if it's already a handled exception
      throw error;
    }
  }

  /**
   * Validate if an access token is still valid
   * @param accessToken - The access token to validate
   * @returns True if token is valid
   */
  isTokenValid(accessToken: string, expiredAt: number): boolean {
    if (!accessToken) {
      return false;
    }

    // Check if token has expired (expiredAt is a Unix timestamp)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp < expiredAt;
  }

  /**
   * Cache the access token with TTL based on expiration time and save to database
   * @param accessToken - The access token to cache
   * @param expiredAt - Unix timestamp when the token expires
   * @param businessId - The business ID associated with the token
   */
  private async cacheToken(
    accessToken: string,
    expiredAt: number,
    businessId: number,
  ): Promise<void> {
    // Calculate TTL in milliseconds
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const ttlInSeconds = expiredAt - currentTimestamp;

    const tokenData: NhanhAccessToken = {
      accessToken,
      expiredAt,
      businessId,
    };

    // Only cache if the token hasn't already expired
    if (ttlInSeconds > 0) {
      const ttlInMs = ttlInSeconds * 1000;

      // Save to cache
      await this.cacheManager.set<NhanhAccessToken>(
        this.CACHE_KEY,
        tokenData,
        ttlInMs,
      );

      // Save to database key-value store
      await this.secretRepo.set<NhanhAccessToken>(this.DB_KEY, tokenData);
    }
  }

  /**
   * Get access token - first from cache, then from database
   * @returns The token data or null if not found or expired
   */
  async getAccessToken(): Promise<NhanhAccessToken | null> {
    // Try to get from cache first
    const cachedData = await this.cacheManager.get<NhanhAccessToken>(
      this.CACHE_KEY,
    );

    if (cachedData) {
      // Double-check if the cached token is still valid
      if (this.isTokenValid(cachedData.accessToken, cachedData.expiredAt)) {
        return cachedData;
      }
      // Cached token has expired, remove it from cache
      await this.cacheManager.del(this.CACHE_KEY);
    }

    // Cache miss or expired - try to get from database
    const dbToken = await this.secretRepo.get<NhanhAccessToken>(this.DB_KEY);

    if (!dbToken) {
      return null;
    }

    // Validate token from database
    if (!this.isTokenValid(dbToken.accessToken, dbToken.expiredAt)) {
      return null;
    }

    // Cache the token from database for future requests
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const ttlInSeconds = dbToken.expiredAt - currentTimestamp;
    const ttlInMs = ttlInSeconds * 1000;

    await this.cacheManager.set<NhanhAccessToken>(
      this.CACHE_KEY,
      dbToken,
      ttlInMs,
    );

    return dbToken;
  }

  /**
   * Invalidate (remove) the cached token
   */
  async invalidateToken(): Promise<void> {
    await this.cacheManager.del(this.CACHE_KEY);
  }

  /**
   * Check connection by verifying access token with Nhanh API
   * This clears the cached token and gets fresh data from database
   * @returns Connection info with business info and expiration (accessToken excluded)
   */
  async checkConnection(): Promise<NhanhConnectionDto> {
    const appId = this.configService.get('nhanh.appId', { infer: true });
    const appSecret = this.configService.get('nhanh.appSecret', {
      infer: true,
    });
    const apiUrl = this.configService.get('nhanh.apiUrl', { infer: true });
    const apiVersion = this.configService.get('nhanh.apiVersion', {
      infer: true,
    });

    if (!appId || !appSecret) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.credentialsNotConfigured'),
      });
    }

    // Clear cached token
    await this.invalidateToken();

    // Get token directly from database
    const dbToken = await this.secretRepo.get<NhanhAccessToken>(this.DB_KEY);

    if (!dbToken) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }

    try {
      const checkUrl = `${apiUrl}/v${apiVersion}/app/checkaccesstoken?appId=${appId}&businessId=${dbToken.businessId}`;

      const response = await axios.post<NhanhTokenResponseDto>(
        checkUrl,
        {
          secretKey: appSecret,
        },
        {
          headers: {
            Authorization: dbToken.accessToken,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const data: NhanhTokenResponseDto = response.data;

      // Check if the response indicates an error
      if (data.code !== 1) {
        const errorMessage =
          data.messages && Object.keys(data.messages).length > 0
            ? JSON.stringify(data.messages)
            : this.i18n.t('nhanh.failedToCheckAccessToken');

        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: errorMessage,
        });
      }

      // Return response without accessToken (matching callback response)
      const { accessToken, ...dataWithoutToken } = data.data || {};

      return dataWithoutToken as NhanhConnectionDto;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throwException({
            status: HttpStatus.REQUEST_TIMEOUT,
            message: this.i18n.t('nhanh.apiTimeout'),
          });
        }

        throwException({
          status: error.response?.status || HttpStatus.UNPROCESSABLE_ENTITY,
          message: `${this.i18n.t('nhanh.failedToCheckAccessToken')}: ${JSON.stringify(error.response?.data)}`,
        });
      }

      // Re-throw if it's already a handled exception
      throw error;
    }
  }
}
