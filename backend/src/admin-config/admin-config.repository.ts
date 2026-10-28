import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminConfigSchemaClass } from './admin-config.schema';

@Injectable()
export class AdminConfigRepository {
  constructor(
    @InjectModel(AdminConfigSchemaClass.name)
    private adminConfigModel: Model<AdminConfigSchemaClass>,
  ) {}

  async get<T = any>(key: string): Promise<T | null> {
    const config = await this.adminConfigModel.findOne({ key }).exec();
    return config ? (config.value as T) : null;
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    await this.adminConfigModel.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true },
    );
  }

  async delete(key: string): Promise<void> {
    await this.adminConfigModel.deleteOne({ key });
  }

  async has(key: string): Promise<boolean> {
    const count = await this.adminConfigModel.countDocuments({ key });
    return count > 0;
  }
}
