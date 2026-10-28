import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommissionSettings } from '../domain/commission-settings';
import { CommissionSettingsRepository } from '../domain/commission-settings.repository';
import { CommissionSettingsMapper } from './commission-settings.mapper';
import { CommissionSettingsSchemaClass } from './commission-settings.schema';

@Injectable()
export class CommissionSettingsDocumentRepository
  implements CommissionSettingsRepository
{
  constructor(
    @InjectModel(CommissionSettingsSchemaClass.name)
    private readonly model: Model<CommissionSettingsSchemaClass>,
  ) {}

  async getOrCreate(): Promise<CommissionSettings> {
    const doc = await this.model.findOneAndUpdate(
      {},
      {
        $setOnInsert: {
          defaultCommissionRate: 0,
          autoUpdateProducts: true,
          commissionTrigger: 'order_creation',
        },
      },
      { upsert: true, new: true },
    );
    return CommissionSettingsMapper.toDomain(doc);
  }

  async upsert(
    data: Partial<
      Pick<
        CommissionSettings,
        'defaultCommissionRate' | 'autoUpdateProducts' | 'commissionTrigger'
      >
    >,
  ): Promise<CommissionSettings> {
    const updateFields: Record<string, unknown> = {};
    if (data.defaultCommissionRate !== undefined) {
      updateFields.defaultCommissionRate = data.defaultCommissionRate;
    }
    if (data.autoUpdateProducts !== undefined) {
      updateFields.autoUpdateProducts = data.autoUpdateProducts;
    }
    if (data.commissionTrigger !== undefined) {
      updateFields.commissionTrigger = data.commissionTrigger;
    }

    const doc = await this.model.findOneAndUpdate(
      {},
      { $set: updateFields },
      { upsert: true, new: true },
    );
    return CommissionSettingsMapper.toDomain(doc);
  }

  async updateSyncCursor(cursor: Date): Promise<void> {
    await this.model.updateOne({}, { $set: { lastProductSyncCursor: cursor } });
  }
}
