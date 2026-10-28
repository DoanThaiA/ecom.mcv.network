import { Injectable, Logger } from '@nestjs/common';
import { AffiliateTrackingRepository } from './domain/affiliate-tracking.repository';
import { AffiliateRepository } from '../affiliates/domain/affiliate.repository';
import { AffiliateStatus } from '../affiliates/domain/affiliate-status.enum';
import { TrackingEventType } from './domain/tracking-event-type.enum';
import { TrackEventDto } from './dto/track-event.dto';

@Injectable()
export class AffiliateTrackingService {
  private readonly logger = new Logger(AffiliateTrackingService.name);

  constructor(
    private readonly trackingRepository: AffiliateTrackingRepository,
    private readonly affiliateRepository: AffiliateRepository,
  ) {}

  /**
   * Track an affiliate event (fire-and-forget from controller)
   * Validates affiliate code, deduplicates, and creates event
   */
  async trackEvent(
    dto: TrackEventDto,
    sessionId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    const type = dto.type ?? TrackingEventType.CLICK;

    // Validate affiliate code exists and is active
    const affiliate = await this.affiliateRepository.findByAffiliateCode(
      dto.affiliateCode,
    );

    if (!affiliate || affiliate.status !== AffiliateStatus.ACTIVE) {
      this.logger.debug(
        `Tracking skipped: affiliate ${dto.affiliateCode} not found or inactive`,
      );
      return;
    }

    // Deduplication: skip if same event within 30 minutes
    const duplicate = await this.trackingRepository.findRecentDuplicate(
      dto.affiliateCode,
      sessionId,
      dto.productId ?? null,
      type,
    );

    if (duplicate) {
      this.logger.debug(
        `Tracking skipped: duplicate event for ${dto.affiliateCode} session ${sessionId}`,
      );
      return;
    }

    // Create tracking event
    await this.trackingRepository.create({
      type,
      affiliateId: affiliate.id,
      affiliateCode: affiliate.affiliateCode,
      productId: dto.productId ?? null,
      sessionId,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
      metadata: null,
      createdAt: new Date(),
    });

    this.logger.debug(
      `Tracked ${type} for affiliate ${dto.affiliateCode}, product=${dto.productId ?? 'none'}`,
    );
  }
}
