import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecretSchemaClass } from './secret.schema';

@Injectable()
export class SecretRepository {
  constructor(
    @InjectModel(SecretSchemaClass.name)
    private secretModel: Model<SecretSchemaClass>,
  ) {}

  async get<T = any>(key: string): Promise<T | null> {
    const secret = await this.secretModel.findOne({ key }).exec();
    return secret ? (secret.value as T) : null;
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    await this.secretModel.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true },
    );
  }

  async delete(key: string): Promise<void> {
    await this.secretModel.deleteOne({ key });
  }

  async has(key: string): Promise<boolean> {
    const count = await this.secretModel.countDocuments({ key });
    return count > 0;
  }
}
