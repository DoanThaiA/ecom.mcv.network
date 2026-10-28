import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ImportSessionRepository } from '../domain/import-session.repository';
import { ImportSession } from '../domain/import-session';
import { ImportSessionStatus } from '../domain/import-session-status.enum';
import { ImportSessionSchemaClass } from './import-session.schema';
import { ImportSessionMapper } from './import-session.mapper';
import { NullableType } from '../../utils/types/nullable.type';

/**
 * Mongoose implementation of ImportSessionRepository
 */
@Injectable()
export class ImportSessionDocumentRepository
  implements ImportSessionRepository
{
  constructor(
    @InjectModel(ImportSessionSchemaClass.name)
    private readonly importSessionModel: Model<ImportSessionSchemaClass>,
  ) {}

  /**
   * Create a new import session
   */
  async create(
    data: Omit<ImportSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ImportSession> {
    const createData: Record<string, unknown> = { ...data };
    if (data.flashSaleId) {
      createData.flashSaleId = new mongoose.Types.ObjectId(data.flashSaleId);
    }
    if (data.promotionId) {
      createData.promotionId = new mongoose.Types.ObjectId(data.promotionId);
    }
    if (data.topicId) {
      createData.topicId = new mongoose.Types.ObjectId(data.topicId);
    }
    if (data.affiliateId) {
      createData.affiliateId = new mongoose.Types.ObjectId(data.affiliateId);
    }
    const doc = await this.importSessionModel.create(createData);
    const lean = doc.toObject();
    return ImportSessionMapper.toDomain(lean);
  }

  /**
   * Find an import session by ID
   */
  async findById(id: string): Promise<NullableType<ImportSession>> {
    const doc = await this.importSessionModel.findById(id).lean();
    return doc ? ImportSessionMapper.toDomain(doc) : null;
  }

  /**
   * Update session status and optional fields
   */
  async updateStatus(
    id: string,
    status: ImportSessionStatus,
    additionalFields?: Partial<
      Pick<ImportSession, 'jobId' | 'validCount' | 'invalidCount' | 'totalRows'>
    >,
  ): Promise<NullableType<ImportSession>> {
    const updateFields: Record<string, unknown> = { status };

    if (additionalFields) {
      if (additionalFields.jobId !== undefined)
        updateFields.jobId = additionalFields.jobId;
      if (additionalFields.validCount !== undefined)
        updateFields.validCount = additionalFields.validCount;
      if (additionalFields.invalidCount !== undefined)
        updateFields.invalidCount = additionalFields.invalidCount;
      if (additionalFields.totalRows !== undefined)
        updateFields.totalRows = additionalFields.totalRows;
    }

    const doc = await this.importSessionModel
      .findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .lean();

    return doc ? ImportSessionMapper.toDomain(doc) : null;
  }
}
