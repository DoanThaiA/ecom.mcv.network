import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AffiliateTrackingRepository } from '../domain/affiliate-tracking.repository';
import { AffiliateTrackingEvent } from '../domain/affiliate-tracking-event';
import { TrackingEventType } from '../domain/tracking-event-type.enum';
import { AffiliateTrackingEventSchemaClass } from './affiliate-tracking-event.schema';
import { AffiliateTrackingEventMapper } from './affiliate-tracking-event.mapper';

const DEDUP_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

@Injectable()
export class AffiliateTrackingDocumentRepository
  implements AffiliateTrackingRepository
{
  constructor(
    @InjectModel(AffiliateTrackingEventSchemaClass.name)
    private readonly model: Model<AffiliateTrackingEventSchemaClass>,
  ) {}

  async create(
    data: Omit<AffiliateTrackingEvent, 'id'>,
  ): Promise<AffiliateTrackingEvent> {
    const doc = new this.model({
      type: data.type,
      affiliateId: new mongoose.Types.ObjectId(data.affiliateId),
      affiliateCode: data.affiliateCode,
      productId: data.productId
        ? new mongoose.Types.ObjectId(data.productId)
        : undefined,
      sessionId: data.sessionId,
      ip: data.ip ?? undefined,
      userAgent: data.userAgent ?? undefined,
      metadata: data.metadata ?? undefined,
      createdAt: data.createdAt,
    });
    const saved = await doc.save();
    return AffiliateTrackingEventMapper.toDomain(saved.toObject());
  }

  async findRecentDuplicate(
    affiliateCode: string,
    sessionId: string,
    productId: string | null,
    type: TrackingEventType,
  ): Promise<AffiliateTrackingEvent | null> {
    const cutoff = new Date(Date.now() - DEDUP_WINDOW_MS);
    const filter: mongoose.FilterQuery<AffiliateTrackingEventSchemaClass> = {
      affiliateCode,
      sessionId,
      type,
      createdAt: { $gte: cutoff },
    };

    if (productId) {
      filter.productId = new mongoose.Types.ObjectId(productId);
    } else {
      filter.productId = { $exists: false };
    }

    const doc = await this.model.findOne(filter).lean();
    return doc ? AffiliateTrackingEventMapper.toDomain(doc) : null;
  }

  async countByAffiliate(
    affiliateId: string,
    type: TrackingEventType,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<number> {
    const filter: mongoose.FilterQuery<AffiliateTrackingEventSchemaClass> = {
      affiliateId: new mongoose.Types.ObjectId(affiliateId),
      type,
    };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = dateFrom;
      if (dateTo) filter.createdAt.$lte = dateTo;
    }

    return this.model.countDocuments(filter);
  }

  async countByProducts(
    affiliateId: string,
    productIds: string[],
    type: TrackingEventType,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<Map<string, number>> {
    const matchStage: Record<string, unknown> = {
      affiliateId: new mongoose.Types.ObjectId(affiliateId),
      type,
      productId: {
        $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    };

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.$gte = dateFrom;
      if (dateTo) createdAt.$lte = dateTo;
      matchStage.createdAt = createdAt;
    }

    const results = await this.model.aggregate([
      { $match: matchStage },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]);

    const map = new Map<string, number>();
    for (const r of results) {
      map.set(r._id.toString(), r.count);
    }
    return map;
  }
}
