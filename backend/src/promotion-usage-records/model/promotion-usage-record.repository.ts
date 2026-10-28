import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PromotionUsageRecordRepository } from '../domain/promotion-usage-record.repository';
import { PromotionUsageRecord } from '../domain/promotion-usage-record';
import {
  PromotionUsageRecordSchemaClass,
  PromotionUsageRecordDocument,
} from './promotion-usage-record.schema';
import { PromotionUsageRecordMapper } from './promotion-usage-record.mapper';

@Injectable()
export class PromotionUsageRecordDocumentRepository extends PromotionUsageRecordRepository {
  constructor(
    @InjectModel(PromotionUsageRecordSchemaClass.name)
    private readonly model: Model<PromotionUsageRecordDocument>,
  ) {
    super();
  }

  async create(
    data: Omit<PromotionUsageRecord, 'id' | 'createdAt'>,
  ): Promise<PromotionUsageRecord> {
    const doc = await this.model.create({
      promotionId: new Types.ObjectId(data.promotionId),
      userId: new Types.ObjectId(data.userId),
      usedAt: data.usedAt,
    });
    return PromotionUsageRecordMapper.toDomain(doc);
  }

  async countByPromotionIdAndUserId(
    promotionId: string,
    userId: string,
  ): Promise<number> {
    if (!Types.ObjectId.isValid(promotionId) || !Types.ObjectId.isValid(userId))
      return 0;
    return this.model
      .countDocuments({
        promotionId: new Types.ObjectId(promotionId),
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }

  async existsByPromotionIdAndUserId(
    promotionId: string,
    userId: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(promotionId) || !Types.ObjectId.isValid(userId))
      return false;
    const doc = await this.model
      .findOne({
        promotionId: new Types.ObjectId(promotionId),
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
    return doc !== null;
  }

  async deleteByPromotionId(promotionId: string): Promise<void> {
    if (!Types.ObjectId.isValid(promotionId)) return;
    await this.model
      .deleteMany({
        promotionId: new Types.ObjectId(promotionId),
      })
      .exec();
  }
}
