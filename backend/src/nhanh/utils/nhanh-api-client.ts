import { HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import axios from 'axios';
import { AllConfigType } from '../../config/config.type';
import { throwException } from '../../utils/errors/throw-exception';
import { NhanhApiResponseDto } from '../dto/nhanh-api-response.dto';
import { NhanhAccessToken } from '../interfaces/nhanh.interface';
import { NhanhRateLimitException } from '../exceptions/nhanh-rate-limit.exception';

/**
 * Shared utility for calling Nhanh.vn API
 * Used by both server (NhanhService) and worker (NhanhSyncService)
 */
export class NhanhApiClient {
  private static readonly logger = new Logger(NhanhApiClient.name);

  /**
   * Call Nhanh API with proper authentication and error handling
   *
   * @param endpoint - API endpoint path (e.g., '/v3.0/product/list')
   * @param body - Request body
   * @param tokenData - Token data for authentication
   * @param configService - NestJS config service
   * @param i18n - i18n service for error messages
   * @returns API response
   */
  static async call<T>(
    endpoint: string,
    body: any,
    tokenData: NhanhAccessToken,
    configService: ConfigService<AllConfigType>,
    i18n: I18nService,
  ): Promise<NhanhApiResponseDto<T>> {
    const appId = configService.get('nhanh.appId', { infer: true });
    const apiUrl = configService.get('nhanh.apiUrl', { infer: true });

    if (!appId || !apiUrl) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: i18n.t('nhanh.credentialsNotConfigured'),
      });
    }

    const url = `${apiUrl}${endpoint}?appId=${appId}&businessId=${tokenData.businessId}`;

    try {
      const response = await axios.post<NhanhApiResponseDto<T>>(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenData.accessToken,
        },
        timeout: 30000, // 30 second timeout
      });

      const data: NhanhApiResponseDto<T> = response.data;

      // Check if API returned an error
      if (data.code !== 1) {
        const errorMessage =
          data.messages && Object.keys(data.messages).length > 0
            ? JSON.stringify(data.messages)
            : data.errorCode || i18n.t('nhanh.apiError');

        // Handle rate limit error with lockout data
        if (data.errorCode === 'ERR_429') {
          const rateLimitData = data.data as unknown as {
            lockedSeconds?: number;
            unlockedAt?: number;
          };
          throw new NhanhRateLimitException(i18n.t('nhanh.rateLimitExceeded'), {
            lockedSeconds: rateLimitData?.lockedSeconds ?? 10,
            unlockedAt:
              rateLimitData?.unlockedAt ?? Math.floor(Date.now() / 1000) + 10,
          });
        }

        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: errorMessage,
        });
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throwException({
            status: HttpStatus.REQUEST_TIMEOUT,
            message: i18n.t('nhanh.apiTimeout'),
          });
        }

        throwException({
          status: error.response?.status || HttpStatus.BAD_GATEWAY,
          message: `${i18n.t('nhanh.apiError')}: ${JSON.stringify(error.response?.data)}`,
        });
      }

      // Re-throw if it's already a handled exception
      throw error;
    }
  }
}
