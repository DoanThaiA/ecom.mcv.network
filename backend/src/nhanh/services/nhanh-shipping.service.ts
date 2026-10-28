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
import { Depot } from '../../depots/domain/depot';
import {
  NhanhShippingFeeFiltersDto,
  NhanhShippingFeeOptionDto,
  NhanhCarrierDto,
} from '../dto/nhanh-shipping.dto';
import { getCacheKey } from '../../utils/env';
import {
  CARRIER_TYPE_SELF_SHIP,
  DEFAULT_SHIPPING_CARRIER_ID,
  NHANH_SELF_SHIP_CARRIER_ID,
  NHANH_SELF_SHIP_SERVICE_ID,
} from '../dto/nhanh-order.dto';

/**
 * Carrier option formatted for shop API response
 */
export interface ShippingCarrierOption {
  carrierId: number;
  carrierName: string;
  carrierLogo: string;
  serviceId: number;
  serviceName: string;
  serviceCode: string;
  shipFee: number;
  codFee: number;
  customerShipFee: number;
  /** Carrier type: 1=NHANH_CONNECTION (NVN), 2=SHOP_ACCOUNT (NVS), 3=SELF_SHIP (TVC) */
  carrierType: 1 | 2 | 3;
  /** Carrier account ID (for SHOP_ACCOUNT type) */
  accountId?: number;
  /** Shop ID at carrier (for SHOP_ACCOUNT type) */
  shopId?: string;
}

/**
 * Item info for shipping calculation
 */
export interface ShippingItem {
  productId: string;
  productName: string;
  quantity: number;
  weight: number; // in grams
  price: number; // Unit price for order value calculation
}

/**
 * Shipping destination address
 */
export interface ShippingDestination {
  cityId: number;
  districtId: number;
  wardId?: number;
  address?: string;
}

/**
 * Service for calculating shipping fees via Nhanh.vn API
 */
@Injectable()
export class NhanhShippingService {
  private readonly logger = new Logger(NhanhShippingService.name);

  /** Cache TTL: 24 hours in milliseconds */
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;

  /** Cache key prefix */
  private readonly CACHE_PREFIX = getCacheKey('nhanh:shipping');

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
    private nhanhAuthService: NhanhAuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Calculate shipping fee for a single route (depot to destination)
   * Tries SHOP_ACCOUNT (type 2 / NVS) with the default carrier (SPX). If it
   * returns no rate, the shop delivers the order itself via SELF_SHIP
   * (Tự Vận Chuyển / TVC) instead of NVN. Viettel Post is no longer used.
   * @param depot - Source depot
   * @param destination - Destination address
   * @param weight - Total weight in grams
   * @param orderValue - Order value for insurance calculation
   * @param codAmount - COD amount (if COD payment)
   */
  async calculateShippingFee(params: {
    depot: Depot;
    destination: ShippingDestination;
    weight: number;
    orderValue?: number;
    codAmount?: number;
  }): Promise<ShippingCarrierOption[]> {
    const { depot, destination, weight, orderValue, codAmount } = params;

    // Validate depot has location info
    if (!depot.cityId || !depot.districtId) {
      this.logger.warn(
        `Depot ${depot.name} (ID: ${depot.id}) missing location info`,
      );
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('nhanh.depotNotFound'),
      });
    }

    const baseFilters = {
      shippingWeight: weight,
      price: orderValue,
      totalCod: codAmount,
      shippingFrom: {
        cityId: depot.cityId,
        districtId: depot.districtId,
        wardId: depot.wardId ?? undefined,
        address: depot.address ?? undefined,
        locationVersion: 'v1' as const,
      },
      shippingTo: {
        cityId: destination.cityId,
        districtId: destination.districtId,
        wardId: destination.wardId,
        address: destination.address,
        locationVersion: 'v1' as const,
      },
    };

    // Try SHOP_ACCOUNT (type 2 / NVS) with the default carrier (SPX). If it
    // returns no rate (or errors), fall straight to SELF_SHIP (TVC). Viettel
    // Post is no longer used per business decision.
    try {
      const shopAccountFilters: NhanhShippingFeeFiltersDto = {
        ...baseFilters,
        type: 2,
        carrier: { id: DEFAULT_SHIPPING_CARRIER_ID },
      };

      const options = await this.tryFetchShippingFee(shopAccountFilters);
      if (options && options.length > 0) {
        this.logger.debug(
          `Using SHOP_ACCOUNT (type 2) carrier ${DEFAULT_SHIPPING_CARRIER_ID} with ${options.length} options: ${JSON.stringify(options)}`,
        );
        return this.mapOptions(options, 2);
      }
      this.logger.warn(
        `SHOP_ACCOUNT (NVS) carrier ${DEFAULT_SHIPPING_CARRIER_ID} returned no rates, using SELF_SHIP (TVC)`,
      );
    } catch (error) {
      this.logger.warn(
        `SHOP_ACCOUNT (NVS) lookup failed, using SELF_SHIP (TVC): ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // When SPX (type 2 / NVS) returns no rate, the shop delivers the order
    // itself via "Tự Vận Chuyển" (TVC) instead of falling back to Nhanh's
    // carrier connection (type 1 / NVN). TVC has no carrier rate, so the
    // displayed fee comes from shipping settings (fixed fee) resolved at the
    // ShippingService layer.
    return [this.buildSelfShipOption()];
  }

  /**
   * Build the SELF_SHIP (Tự Vận Chuyển / TVC) carrier option, used when the
   * shop's own carrier account (type 2 / NVS) is unavailable.
   *
   * TVC has no carrier rate (shipFee 0) and Nhanh creates no shipment, so no
   * NVN/NVS tracking code is generated — the shop delivers and collects COD
   * itself. `customerShipFee` is 0 here and is overridden by the shop's fixed
   * shipping fee in `ShippingService.calculateFixedShipping`.
   */
  private buildSelfShipOption(): ShippingCarrierOption {
    return {
      carrierId: NHANH_SELF_SHIP_CARRIER_ID,
      carrierName: 'Tự Vận Chuyển',
      carrierLogo: '',
      serviceId: NHANH_SELF_SHIP_SERVICE_ID,
      serviceName: 'Chuyển Thường',
      serviceCode: '',
      shipFee: 0,
      codFee: 0,
      customerShipFee: 0,
      carrierType: CARRIER_TYPE_SELF_SHIP,
    };
  }

  /**
   * Map Nhanh shipping options to simplified carrier options
   * @param options - Raw options from Nhanh API
   * @param carrierType - The carrier type used (1 or 2)
   */
  private mapOptions(
    options: NhanhShippingFeeOptionDto[],
    carrierType: 1 | 2,
  ): ShippingCarrierOption[] {
    return options.map((opt) => ({
      carrierId: opt.carrier.id,
      carrierName: opt.carrier.accountName || `Carrier ${opt.carrier.id}`,
      carrierLogo: opt.logo,
      serviceId: opt.service.id,
      serviceName: opt.service.name,
      serviceCode: opt.service.code,
      shipFee: opt.shipFee,
      codFee: opt.codFee,
      customerShipFee: opt.customerShipFee,
      carrierType,
      accountId: opt.carrier.accountId,
      shopId: opt.carrier.shopId,
    }));
  }

  /**
   * Try to fetch shipping fee without throwing on empty results
   * Used for fallback logic - returns null if no carriers available
   * @private
   */
  private async tryFetchShippingFee(
    filters: NhanhShippingFeeFiltersDto,
  ): Promise<NhanhShippingFeeOptionDto[] | null> {
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      return null;
    }

    this.logger.debug(
      `Trying shipping fee (type ${filters.type}) from city ${filters.shippingFrom.cityId} to ${filters.shippingTo.cityId}`,
    );

    const response = await this.callNhanhApi<NhanhShippingFeeOptionDto[]>(
      '/v3.0/shipping/fee',
      { filters },
      tokenData,
    );

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return response.data;
  }

  /**
   * Get available carriers (cached 24h)
   */
  async getCarriers(): Promise<NhanhCarrierDto[]> {
    const cacheKey = `${this.CACHE_PREFIX}:carriers`;

    // Try cache first
    const cached = await this.cacheManager.get<NhanhCarrierDto[]>(cacheKey);
    if (cached) {
      this.logger.debug('Carriers retrieved from cache');
      return cached;
    }

    // Fetch from API
    this.logger.debug('Fetching carriers from Nhanh API');
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }

    const response = await this.callNhanhApi<NhanhCarrierDto[]>(
      '/v3.0/shipping/carrier',
      { filters: { type: 1 } }, // Type 1 = Nhanh's connection
      tokenData,
    );

    const carriers = response.data || [];

    // Cache the result
    await this.cacheManager.set(cacheKey, carriers, this.CACHE_TTL);
    this.logger.debug(`Cached ${carriers.length} carriers`);

    return carriers;
  }

  /**
   * Generic method to call Nhanh API with proper authentication and error handling
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
            : data.errorCode || this.i18n.t('nhanh.shippingCalculationFailed');

        this.logger.error(`Nhanh shipping API error: ${errorMessage}`);
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
          message: `${this.i18n.t('nhanh.shippingCalculationFailed')}: ${JSON.stringify(error.response?.data)}`,
        });
      }

      // Re-throw if it's already a handled exception
      throw error;
    }
  }
}
