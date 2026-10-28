import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WebhookHealthSchemaClass,
  WebhookHealthSchemaDocument,
} from './webhook-health.schema';

/** Days of per-day counters to keep. Older keys are pruned on read. */
export const DAILY_RETENTION_DAYS = 14;

/** `YYYY-MM-DD` in UTC — the key used for per-day counters. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class WebhookHealthRepository {
  private readonly logger = new Logger(WebhookHealthRepository.name);

  constructor(
    @InjectModel(WebhookHealthSchemaClass.name)
    private readonly model: Model<WebhookHealthSchemaDocument>,
  ) {}

  /**
   * Record that a webhook payload arrived.
   *
   * NEVER THROWS. This runs on the inbound webhook path, and an observability
   * write must not be able to break the thing it observes: if this fails, the
   * webhook must still be answered with HTTP 200. Nhanh.vn disables an app's
   * webhooks after repeated non-200 responses, so a thrown error here would be
   * far more damaging than a missing counter.
   *
   * Writes are confined to the `webhook_health` collection and touch exactly
   * one document, matched by `event`.
   *
   * @param event   provider-prefixed event name, e.g. `nhanh:productUpdate`
   * @param opts.businessId  businessId from the payload, if present
   * @param opts.invalid     true when the payload failed DTO validation
   * @param opts.invalidReason short description of the validation failure
   */
  async record(
    event: string,
    opts: {
      businessId?: string;
      invalid?: boolean;
      invalidReason?: string;
    } = {},
  ): Promise<void> {
    try {
      const at = new Date();
      const inc: Record<string, number> = {
        totalCount: 1,
        [`daily.${dayKey(at)}`]: 1,
      };
      const set: Record<string, unknown> = { lastSeenAt: at };

      if (opts.businessId) set.lastBusinessId = String(opts.businessId);
      if (opts.invalid) {
        inc.invalidCount = 1;
        set.lastInvalidAt = at;
        set.lastInvalidReason = (opts.invalidReason ?? '').slice(0, 300);
      }

      await this.model
        .updateOne({ event }, { $inc: inc, $set: set }, { upsert: true })
        .exec();
    } catch (error) {
      // Swallow deliberately — see the contract above.
      this.logger.warn(
        `Could not record webhook health for "${event}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** All recorded event types, most recently seen first. */
  async findAll(): Promise<WebhookHealthSchemaDocument[]> {
    return this.model
      .find()
      .sort({ lastSeenAt: -1 })
      .lean<WebhookHealthSchemaDocument[]>();
  }

  /**
   * Drop per-day counters older than the retention window.
   *
   * Called when the admin page is opened rather than on every webhook, so the
   * inbound path stays a single write. Only `daily.*` keys are unset; no other
   * field and no other collection is touched.
   *
   * @returns number of counter keys removed
   */
  async prune(now: Date = new Date()): Promise<number> {
    const cutoff = new Date(
      now.getTime() - DAILY_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    const cutoffKey = dayKey(cutoff);

    const docs = await this.model.find({}, { event: 1, daily: 1 }).lean();
    let removed = 0;

    for (const doc of docs) {
      const stale = Object.keys(doc.daily ?? {}).filter((k) => k < cutoffKey);
      if (stale.length === 0) continue;

      const unset: Record<string, ''> = {};
      for (const k of stale) unset[`daily.${k}`] = '';

      await this.model
        .updateOne({ event: doc.event }, { $unset: unset })
        .exec();
      removed += stale.length;
    }

    return removed;
  }
}
