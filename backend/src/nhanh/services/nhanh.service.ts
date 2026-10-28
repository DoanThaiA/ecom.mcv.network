import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { AllConfigType } from '../../config/config.type';
import { throwException } from '../../utils/errors/throw-exception';
import { NhanhAuthService } from './nhanh-auth.service';
import {
  NhanhFoundOrder,
  NhanhOrderAddRequestDto,
  NhanhOrderAddResponseDto,
  NhanhOrderListItem,
  NhanhOrderListRequestDto,
} from '../dto/nhanh-order.dto';
import { NhanhApiClient } from '../utils/nhanh-api-client';
import { toLocalVnPhone } from '../../utils/transformers/phone-number.transformer';

/**
 * Service for interacting with Nhanh.vn API
 * Server-side only - handles order operations
 * Sync operations are handled by worker's NhanhSyncService
 */
@Injectable()
export class NhanhService {
  private readonly logger = new Logger(NhanhService.name);

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
    private nhanhAuthService: NhanhAuthService,
  ) {}

  /**
   * Add order to Nhanh.vn
   *
   * @param payload - Order add request payload
   * @returns Order add response with order ID and tracking URL
   */
  async addOrder(
    payload: NhanhOrderAddRequestDto,
  ): Promise<NhanhOrderAddResponseDto> {
    this.logger.log(`Adding order to Nhanh.vn: ${payload.channel.appOrderId}`);

    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }

    const response = await NhanhApiClient.call<{
      id: number;
      trackingUrl: string;
    }>('/v3.0/order/add', payload, tokenData, this.configService, this.i18n);

    this.logger.log(
      `Order ${payload.channel.appOrderId} added to Nhanh.vn with ID: ${response.data?.id}`,
    );

    return {
      code: response.code,
      data: response.data
        ? {
            id: response.data.id,
            trackingUrl: response.data.trackingUrl,
          }
        : undefined,
      messages: response.messages,
      errorCode: response.errorCode,
    };
  }

  /**
   * Look up an order on Nhanh.vn by the customer's phone number.
   *
   * Used to recover the Nhanh order id + tracking url when our initial sync
   * failed but the order actually exists on Nhanh (a duplicate "đã tồn tại"
   * error on retry, or a timeout after Nhanh had already created the order).
   *
   * We deliberately do NOT match on appOrderId: Nhanh's order/list API returns
   * `channel.appOrderId` as null for orders created through some flows (it is
   * null even when filtering by exact id), so it cannot be relied on. Instead we
   * filter by the customer's mobile — which returns the customer's handful of
   * orders in one fast page (no deep pagination, no timeouts) — then match the
   * exact order by creation time. Nhanh's createdAt equals ours to the second;
   * the order total (codAmount) disambiguates the rare same-customer collision.
   *
   * Read-only and conservative: it returns a result only when exactly one
   * candidate matches, so it can never link our order to the wrong Nhanh order.
   *
   * @param phone - Customer phone in any VN format; normalized to Nhanh's local form
   * @param createdAt - Our order's creation date
   * @param total - Our order total, used to disambiguate same-customer orders
   * @returns The matched order's id + tracking url, or null if no confident match
   */
  async findExistingOrder(
    phone: string,
    createdAt: Date,
    total: number,
  ): Promise<NhanhFoundOrder | null> {
    const mobile = toLocalVnPhone(phone);
    if (!mobile) {
      return null;
    }

    this.logger.log(`Looking up Nhanh.vn order by mobile ${mobile}`);

    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }

    // Filter by customer mobile + a ±1 day window around the order's creation
    // date. This returns the customer's handful of orders in a single fast page
    // (no deep pagination → no timeouts). Nhanh's createdAt filter is coarse
    // (rounds to whole days in Vietnam time), hence the ±1 day. Unix seconds.
    const ONE_DAY_SEC = 24 * 60 * 60;
    const createdAtSec = Math.floor(createdAt.getTime() / 1000);
    const body: NhanhOrderListRequestDto = {
      filters: {
        shippingAddress: { mobile },
        createdAtFrom: createdAtSec - ONE_DAY_SEC,
        createdAtTo: createdAtSec + ONE_DAY_SEC,
      },
      paginator: { size: 50 },
    };

    const response = await NhanhApiClient.call<NhanhOrderListItem[]>(
      '/v3.0/order/list',
      body,
      tokenData,
      this.configService,
      this.i18n,
    );

    // Nhanh's createdAt is the SYNC time, which can lag our order.createdAt by
    // the queue delay (usually seconds, occasionally ~minutes). So match
    // primarily on the order total (codAmount == total — exact for COD orders,
    // independent of time), and accept a close creation time as an alternative
    // (covers non-COD orders where codAmount differs from total).
    const TIME_TOLERANCE_SEC = 30 * 60;
    const matchesTotal = (o: NhanhOrderListItem): boolean =>
      o.payment?.codAmount === total;
    const matchesTime = (o: NhanhOrderListItem): boolean =>
      o.info?.createdAt != null &&
      Math.abs(o.info.createdAt - createdAtSec) <= TIME_TOLERANCE_SEC;

    const found = (response.data ?? []).filter((o) => o.info?.id != null);
    let candidates = found.filter((o) => matchesTotal(o) || matchesTime(o));

    // If more than one order matches, require BOTH signals to agree so we never
    // link our order to the wrong Nhanh order.
    if (candidates.length > 1) {
      candidates = candidates.filter((o) => matchesTotal(o) && matchesTime(o));
    }

    if (candidates.length !== 1) {
      this.logger.warn(
        `No unique Nhanh.vn order match for mobile ${mobile} ` +
          `(candidates: ${candidates.length})`,
      );
      return null;
    }

    const id = candidates[0].info?.id;
    if (id == null) {
      return null;
    }

    this.logger.log(`Found Nhanh.vn order ${id} for mobile ${mobile}`);
    return { id, trackingUrl: candidates[0].info?.trackingUrl };
  }
}
