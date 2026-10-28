import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { AffiliateTrackingService } from './affiliate-tracking.service';
import { TrackEventDto } from './dto/track-event.dto';

@ApiTags('Affiliate Tracking')
@Controller({ path: 'affiliate-tracking', version: '1' })
export class AffiliateTrackingController {
  private readonly logger = new Logger(AffiliateTrackingController.name);

  constructor(
    private readonly affiliateTrackingService: AffiliateTrackingService,
  ) {}

  /**
   * Track affiliate event (click, view, etc.)
   * Public endpoint — no authentication required
   */
  @Post('track')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Track affiliate event',
    description:
      'Records an affiliate tracking event (click, view, etc.). ' +
      'Public endpoint — no authentication required. ' +
      'Deduplicates same (affiliateCode, sessionId, productId, type) within 30 minutes.',
  })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Browser session ID for deduplication',
    required: true,
  })
  @ApiNoContentResponse({ description: 'Event tracked (or deduplicated)' })
  trackEvent(
    @Body() dto: TrackEventDto,
    @Headers('x-session-id') sessionId: string,
    @Headers('x-forwarded-for') forwardedFor?: string,
    @Headers('user-agent') userAgent?: string,
  ): void {
    if (!sessionId) {
      return; // Silently skip if no session ID
    }

    const ip = forwardedFor?.split(',')[0]?.trim();

    // Fire-and-forget: don't await, don't throw
    void this.affiliateTrackingService
      .trackEvent(dto, sessionId, ip, userAgent)
      .catch((err) => {
        this.logger.error(
          `Failed to track event for ${dto.affiliateCode}: ${err.message}`,
          err.stack,
        );
      });
  }
}
