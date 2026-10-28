import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingSettings } from '../domain/shipping-settings';
import { ShippingSettingsRepository } from '../domain/shipping-settings.repository';
import { ShippingSettingsMapper } from './shipping-settings.mapper';
import { ShippingSettingsSchemaClass } from './shipping-settings.schema';
import { ShippingCalculationMethod } from '../domain/shipping-calculation-method.enum';

@Injectable()
export class ShippingSettingsDocumentRepository
  implements ShippingSettingsRepository
{
  constructor(
    @InjectModel(ShippingSettingsSchemaClass.name)
    private readonly model: Model<ShippingSettingsSchemaClass>,
  ) {}

  async getOrCreate(): Promise<ShippingSettings> {
    const doc = await this.model.findOneAndUpdate(
      {},
      {
        $setOnInsert: {
          calculationMethod: ShippingCalculationMethod.FIXED,
          fixedShippingFee: 30000,
        },
      },
      { upsert: true, new: true },
    );
    return ShippingSettingsMapper.toDomain(doc);
  }

  async upsert(
    data: Partial<
      Pick<ShippingSettings, 'calculationMethod' | 'fixedShippingFee'>
    >,
  ): Promise<ShippingSettings> {
    const updateFields: Record<string, unknown> = {};
    if (data.calculationMethod !== undefined) {
      updateFields.calculationMethod = data.calculationMethod;
    }
    if (data.fixedShippingFee !== undefined) {
      updateFields.fixedShippingFee = data.fixedShippingFee;
    }

    const doc = await this.model.findOneAndUpdate(
      {},
      { $set: updateFields },
      { upsert: true, new: true },
    );
    return ShippingSettingsMapper.toDomain(doc);
  }
}
