import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Logger,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NhanhWebhookService } from '@app/nhanh/services/nhanh-webhook.service';
import {
  NhanhWebhookPayloadDto,
  NhanhWebhookEvent,
} from '@app/nhanh/dto/webhook/nhanh-webhook-payload.dto';
import { NhanhWebhookResponseDto } from '@app/nhanh/dto/webhook/nhanh-webhook-response.dto';
import { WebhookHealthRepository } from '@app/webhook-health/webhook-health.repository';

@Controller({
  path: 'webhooks/nhanh',
  version: '1',
})
export class NhanhWebhookController {
  private readonly logger = new Logger(NhanhWebhookController.name);

  constructor(
    private readonly nhanhWebhookService: NhanhWebhookService,
    private readonly webhookHealthRepository: WebhookHealthRepository,
  ) {}

  /**
   * Record that a payload arrived, for `/admin/webhook-health`.
   *
   * Deliberately not awaited and cannot reject: observability must never be
   * able to delay or fail the webhook response. Nhanh.vn disables an app's
   * webhooks after repeated non-200 answers, so a broken counter must not cost
   * us the integration.
   */
  private noteReceipt(
    rawPayload: Record<string, unknown>,
    invalidReason?: string,
  ): void {
    void this.webhookHealthRepository.record(
      `nhanh:${String(rawPayload?.event ?? 'unknown')}`,
      {
        businessId:
          rawPayload?.businessId != null
            ? String(rawPayload.businessId)
            : undefined,
        invalid: Boolean(invalidReason),
        invalidReason,
      },
    );
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() rawPayload: Record<string, unknown>,
  ): Promise<NhanhWebhookResponseDto> {
    // Skip full validation for webhooksEnabled event (first-time setup ping from Nhanh.vn)
    if (rawPayload.event === NhanhWebhookEvent.WEBHOOKS_ENABLED) {
      this.logger.log(
        'Received webhooksEnabled event - webhook setup confirmed',
      );
      this.noteReceipt(rawPayload);
      return { success: true };
    }

    // Validate payload for all other events
    const payload = plainToInstance(NhanhWebhookPayloadDto, rawPayload);
    const errors = await validate(payload);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((e) => Object.values(e.constraints || {}).join(', '))
        .join('; ');
      // Log loudly but still answer 200. Nhanh.vn retries a non-200 response 3
      // times and then disables the app's webhooks entirely — a disabled webhook
      // is silent and only recoverable from the app owner's open.nhanh.vn
      // account. A payload we cannot parse (e.g. an event type we do not model
      // yet) must never be able to take the whole integration down.
      // See https://apidocs.nhanh.vn/v3/webhooks/webhooks#common-webhooks-errors
      this.logger.warn(
        `Webhook validation failed, acknowledging anyway: ${errorMessages} | event=${String(rawPayload.event)}`,
      );
      this.noteReceipt(rawPayload, errorMessages);
      return {
        success: false,
        message: `Invalid webhook payload: ${errorMessages}`,
      };
    }

    this.logger.log(
      `Webhook event: ${payload.event} for business ${payload.businessId}`,
    );
    this.noteReceipt(rawPayload);
    return this.nhanhWebhookService.handleWebhook(payload);
  }
}
