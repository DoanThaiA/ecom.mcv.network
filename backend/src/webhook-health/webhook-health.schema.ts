import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

/**
 * One document per inbound webhook event type.
 *
 * The collection is bounded by design: there is exactly one document per
 * distinct `event` string, so it can never grow with traffic. It exists only
 * to answer "are we still receiving webhooks, and which kinds" — the question
 * that took two days to answer during the Nhanh.vn outage of July 2026,
 * because nothing on our side recorded receipts.
 */
@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  collection: 'webhook_health',
})
export class WebhookHealthSchemaClass extends EntityDocumentHelper {
  /** Provider prefix + event name, e.g. `nhanh:productUpdate`. */
  @Prop({ type: String, required: true })
  event: string;

  /** When a payload for this event was last accepted. */
  @Prop({ type: Date })
  lastSeenAt?: Date;

  /** businessId carried by the most recent payload, for cross-checking. */
  @Prop({ type: String })
  lastBusinessId?: string;

  /** Total payloads received since this document was created. */
  @Prop({ type: Number, default: 0 })
  totalCount: number;

  /** Payloads that failed DTO validation (still answered with HTTP 200). */
  @Prop({ type: Number, default: 0 })
  invalidCount: number;

  @Prop({ type: Date })
  lastInvalidAt?: Date;

  /** Short reason for the most recent validation failure. */
  @Prop({ type: String })
  lastInvalidReason?: string;

  /**
   * Per-day counters keyed `YYYY-MM-DD` (UTC). Kept small by pruning entries
   * older than the retention window whenever the admin page is opened.
   */
  @Prop({ type: Object, default: {} })
  daily: Record<string, number>;

  @Prop({ default: now })
  createdAt: Date;

  @Prop({ default: now })
  updatedAt: Date;
}

export const WebhookHealthSchema = SchemaFactory.createForClass(
  WebhookHealthSchemaClass,
);

export type WebhookHealthSchemaDocument = WebhookHealthSchemaClass & Document;

WebhookHealthSchema.index({ event: 1 }, { unique: true });
