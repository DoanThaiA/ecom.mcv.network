import { Injectable, HttpStatus, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import axios from 'axios';
import { AllConfigType } from '../../config/config.type';
import { throwException } from '../../utils/errors/throw-exception';
import { NhanhAuthService } from './nhanh-auth.service';
import { NhanhApiResponseDto } from '../dto/nhanh-api-response.dto';
import { NhanhAccessToken } from '../interfaces/nhanh.interface';
import {
  NhanhLocationFiltersDto,
  NhanhLocationDto,
} from '../dto/nhanh-location.dto';
import { getCacheKey } from '../../utils/env';

/**
 * Service for fetching location data (cities, districts, wards) from Nhanh.vn
 * All location data is cached for 24 hours as per Nhanh recommendations
 */
@Injectable()
export class NhanhLocationService {
  private readonly logger = new Logger(NhanhLocationService.name);

  /** Cache TTL: 24 hours in milliseconds */
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;

  /** Cache key prefixes */
  private readonly CACHE_PREFIX = getCacheKey('nhanh:locations');

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
    private nhanhAuthService: NhanhAuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Get all cities (cached 24h)
   * @returns Array of city locations
   */
  async getCities(): Promise<NhanhLocationDto[]> {
    const cacheKey = `${this.CACHE_PREFIX}:cities`;

    // Try cache first
    const cached = await this.cacheManager.get<NhanhLocationDto[]>(cacheKey);
    if (cached) {
      this.logger.debug('Cities retrieved from cache');
      return cached;
    }

    // Fetch from API
    this.logger.debug('Fetching cities from Nhanh API');
    const cities = await this.fetchLocations({
      locationVersion: 'v1',
      type: 'CITY',
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, cities, this.CACHE_TTL);
    this.logger.debug(`Cached ${cities.length} cities`);

    return cities;
  }

  /**
   * Get districts for a city (cached 24h)
   * @param cityId - City ID to get districts for
   * @returns Array of district locations
   */
  async getDistricts(cityId: number): Promise<NhanhLocationDto[]> {
    const cacheKey = `${this.CACHE_PREFIX}:districts:${cityId}`;

    // Try cache first
    const cached = await this.cacheManager.get<NhanhLocationDto[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Districts for city ${cityId} retrieved from cache`);
      return cached;
    }

    // Fetch from API
    this.logger.debug(`Fetching districts for city ${cityId} from Nhanh API`);
    const districts = await this.fetchLocations({
      locationVersion: 'v1',
      type: 'DISTRICT',
      parentId: cityId,
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, districts, this.CACHE_TTL);
    this.logger.debug(
      `Cached ${districts.length} districts for city ${cityId}`,
    );

    return districts;
  }

  /**
   * Get wards for a district (cached 24h)
   * @param districtId - District ID to get wards for
   * @returns Array of ward locations
   */
  async getWards(districtId: number): Promise<NhanhLocationDto[]> {
    const cacheKey = `${this.CACHE_PREFIX}:wards:${districtId}`;

    // Try cache first
    const cached = await this.cacheManager.get<NhanhLocationDto[]>(cacheKey);
    if (cached) {
      this.logger.debug(
        `Wards for district ${districtId} retrieved from cache`,
      );
      return cached;
    }

    // Fetch from API
    this.logger.debug(
      `Fetching wards for district ${districtId} from Nhanh API`,
    );
    const wards = await this.fetchLocations({
      locationVersion: 'v1',
      type: 'WARD',
      parentId: districtId,
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, wards, this.CACHE_TTL);
    this.logger.debug(
      `Cached ${wards.length} wards for district ${districtId}`,
    );

    return wards;
  }

  /**
   * Fetch locations from Nhanh API
   * @param filters - Location filters
   * @returns Array of locations
   * @private
   */
  private async fetchLocations(
    filters: NhanhLocationFiltersDto,
  ): Promise<NhanhLocationDto[]> {
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }

    const response = await this.callNhanhApi<NhanhLocationDto[]>(
      '/v3.0/shipping/location',
      { filters },
      tokenData,
    );

    if (!response.data) {
      return [];
    }

    return response.data;
  }

  /**
   * Generic method to call Nhanh API with proper authentication and error handling
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param tokenData - Token data to use for authentication
   * @returns API response
   * @private
   */
  private async callNhanhApi<T>(
    endpoint: string,
    body: any,
    tokenData: NhanhAccessToken,
  ): Promise<NhanhApiResponseDto<T>> {
    const appId = this.configService.get('nhanh.appId', { infer: true });
    const apiUrl = this.configService.get('nhanh.apiUrl', { infer: true });

    if (!appId || !apiUrl) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.credentialsNotConfigured'),
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
            : data.errorCode || this.i18n.t('nhanh.apiError');

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
            message: this.i18n.t('nhanh.apiTimeout'),
          });
        }

        throwException({
          status: error.response?.status || HttpStatus.BAD_GATEWAY,
          message: `${this.i18n.t('nhanh.apiError')}: ${JSON.stringify(error.response?.data)}`,
        });
      }

      // Re-throw if it's already a handled exception
      throw error;
    }
  }
}
