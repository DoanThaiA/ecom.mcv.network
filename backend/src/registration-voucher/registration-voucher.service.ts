import { Injectable, Logger } from '@nestjs/common';
import { AdminConfigService } from '../admin-config/admin-config.service';
import { CdpService } from '../cdp/cdp.service';
import { VoucherReleaseEvent } from '../cdp/types/voucher.types';
import { ZaloZnsService } from '../zalo/zns/zalo-zns.service';
import { User } from '../users/domain/user';

interface CachedEventDates {
  startDate: string;
  endDate: string;
  eventId: string;
  fetchedAt: number;
}

@Injectable()
export class RegistrationVoucherService {
  private readonly logger = new Logger(RegistrationVoucherService.name);
  private cachedEventDates: CachedEventDates | null = null;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  constructor(
    private readonly adminConfigService: AdminConfigService,
    private readonly cdpService: CdpService,
    private readonly zaloZnsService: ZaloZnsService,
  ) {}

  /**
   * Send registration voucher to a new user via ZNS
   * @param user - The newly registered user
   * @param cdpCustomerCode - The user's CDP customer code (for ZNS display)
   * @param cdpCustomerId - The user's CDP customer ID (for saving voucher)
   */
  async sendRegistrationVoucher(
    user: User,
    cdpCustomerCode?: string,
    cdpCustomerId?: string,
  ): Promise<void> {
    try {
      const eventDates = await this.getEventDates();
      if (!eventDates) {
        this.logger.debug(
          'No voucher event data available, skipping registration voucher',
        );
        return;
      }

      // Get a single available voucher code from CDP
      const codesResponse = await this.cdpService.getAvailableVoucherCodes({
        voucher_id: eventDates.eventId,
        limit: 1,
      });

      if (
        codesResponse.code !== 0 ||
        !codesResponse.voucher_codes ||
        codesResponse.voucher_codes.length === 0
      ) {
        this.logger.warn(
          `No available voucher codes for event ${eventDates.eventId}: ${codesResponse.message}`,
        );
        return;
      }

      const voucherCode = codesResponse.voucher_codes[0];

      const customerName =
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng';
      const phone = user.phone!;

      await this.zaloZnsService.sendRegistrationVoucher(phone, {
        voucher_code: voucherCode,
        customer_name: customerName,
        customer_id: cdpCustomerCode || customerName,
        start_date: this.formatDate(eventDates.startDate),
        expire: this.formatDate(eventDates.endDate),
      });

      this.logger.log(
        `Registration voucher sent to user ${user.id} (${phone}), code: ${voucherCode}`,
      );

      // Assign voucher to customer in CDP
      if (cdpCustomerId) {
        const saveResult = await this.cdpService.saveCustomerVoucher({
          voucher_id: eventDates.eventId,
          code: voucherCode,
          customer_id: cdpCustomerId,
        });

        this.logger.log(
          `Saved voucher ${voucherCode} to customer ${cdpCustomerId}: code=${saveResult.code}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send registration voucher for user ${user.id}:`,
        error,
      );
    }
  }

  /**
   * Get cached event dates (start_date, end_date)
   * Fetches from CDP and caches for 1 hour
   */
  private async getEventDates(): Promise<CachedEventDates | null> {
    const eventId = await this.adminConfigService.get(
      'registration_voucher_release_event_id',
    );
    if (!eventId) return null;

    // Return cached data if still valid
    if (
      this.cachedEventDates &&
      this.cachedEventDates.eventId === eventId &&
      Date.now() - this.cachedEventDates.fetchedAt < this.CACHE_TTL
    ) {
      return this.cachedEventDates;
    }

    // Fetch release event info for start/end dates by paginating through all events
    const event = await this.findVoucherReleaseEvent(eventId);

    if (!event?.start_date || !event?.end_date) {
      this.logger.warn(
        `Voucher release event ${eventId} not found or missing dates, skipping registration voucher`,
      );
      return null;
    }

    this.cachedEventDates = {
      startDate: event.start_date,
      endDate: event.end_date,
      eventId,
      fetchedAt: Date.now(),
    };

    this.logger.log(
      `Cached event dates for event ${eventId} (${event.start_date} - ${event.end_date})`,
    );

    return this.cachedEventDates;
  }

  /**
   * Find a voucher release event by ID, paginating through all results
   * @param eventId - The voucher release event ID to find
   * @returns The matching event or null
   */
  private async findVoucherReleaseEvent(
    eventId: string,
  ): Promise<VoucherReleaseEvent | null> {
    const PAGE_SIZE = 100;
    let page = 1;
    const brandId = await this.adminConfigService.get('cdp_brand_id');

    try {
      while (true) {
        const releaseResponse = await this.cdpService.getVoucherRelease({
          page,
          limit: PAGE_SIZE,
          ...(brandId && { brand_id: brandId }),
        });

        const events = releaseResponse.voucher_release_events;

        this.logger.debug(
          `Voucher release events page ${page} (looking for ${eventId}): ${JSON.stringify(
            events?.map((e) => ({
              voucher_id: e.voucher_id,
              start_date: e.start_date,
              end_date: e.end_date,
            })),
          )}`,
        );

        if (!events || events.length === 0) break;

        const event = events.find((e) => e.voucher_id === eventId);
        if (event) return event;

        if (events.length < PAGE_SIZE) break;
        page++;
      }
    } catch (error) {
      this.logger.warn('Failed to get voucher release event info:', error);
    }

    return null;
  }

  /**
   * Format date from YYYY-MM-DD to DD/MM/YYYY for ZNS template
   * @param dateStr - Date string in YYYY-MM-DD format
   * @returns Date string in DD/MM/YYYY format
   */
  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
}
