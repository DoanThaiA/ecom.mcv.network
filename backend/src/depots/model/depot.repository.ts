import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DepotRepository } from '../domain/depot.repository';
import { DepotSchemaClass } from './depot.schema';
import { Depot } from '../domain/depot';
import { DepotMapper } from './depot.mapper';
import { NullableType } from '../../utils/types/nullable.type';

/**
 * MongoDB implementation of DepotRepository
 */
@Injectable()
export class DepotDocumentRepository implements DepotRepository {
  constructor(
    @InjectModel(DepotSchemaClass.name)
    private readonly depotModel: Model<DepotSchemaClass>,
  ) {}

  /**
   * Create a new depot
   */
  async create(
    data: Omit<Depot, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Depot> {
    const now = new Date();
    const persistenceModel = DepotMapper.toDocument({
      ...data,
      id: undefined,
      createdAt: now,
      updatedAt: now,
    } as unknown as Depot);

    const createdDepot = new this.depotModel(persistenceModel);
    const depotDocument = await createdDepot.save();
    return DepotMapper.toDomain(depotDocument);
  }

  /**
   * Find depot by ID
   */
  async findById(id: Depot['id']): Promise<NullableType<Depot>> {
    const depotDocument = await this.depotModel.findById(id).lean();
    return depotDocument ? DepotMapper.toDomain(depotDocument) : null;
  }

  /**
   * Find depot by snapshot ID (source ID), business ID and source
   */
  async findBySnapshotId(
    snapshotId: number,
    businessId: string,
    source: Depot['source'],
  ): Promise<NullableType<Depot>> {
    const depotDocument = await this.depotModel
      .findOne({ 'snapshot.id': snapshotId, businessId, source })
      .lean();
    return depotDocument ? DepotMapper.toDomain(depotDocument) : null;
  }

  /**
   * Find depots by multiple snapshot IDs
   */
  async findBySnapshotIds(
    snapshotIds: number[],
    businessId: string,
    source: Depot['source'],
  ): Promise<Depot[]> {
    const depotDocuments = await this.depotModel
      .find({ 'snapshot.id': { $in: snapshotIds }, businessId, source })
      .lean();
    return depotDocuments.map((doc) => DepotMapper.toDomain(doc));
  }

  /**
   * Find all depots for a business
   */
  async findAllByBusiness(businessId: string): Promise<Depot[]> {
    const depotDocuments = await this.depotModel
      .find({ businessId })
      .sort({ name: 1 })
      .lean();
    return depotDocuments.map((doc) => DepotMapper.toDomain(doc));
  }

  /**
   * Update depot
   */
  async update(
    id: Depot['id'],
    payload: Partial<Depot>,
  ): Promise<NullableType<Depot>> {
    const updatedDocument = await this.depotModel
      .findByIdAndUpdate(
        id,
        { ...payload, updatedAt: new Date() },
        { new: true },
      )
      .lean();

    return updatedDocument ? DepotMapper.toDomain(updatedDocument) : null;
  }

  /**
   * Delete depot
   */
  async remove(id: Depot['id']): Promise<void> {
    await this.depotModel.findByIdAndDelete(id).exec();
  }

  /**
   * Bulk upsert depots (create or update by snapshot.id)
   * Uses MongoDB bulkWrite for maximum performance
   */
  async bulkUpsert(
    depots: Array<Omit<Depot, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<number> {
    if (!depots || depots.length === 0) {
      return 0;
    }

    const now = new Date();
    const bulkOps = depots.map((depot) => {
      const persistenceModel = DepotMapper.toDocument({
        ...depot,
        createdAt: now,
        updatedAt: now,
      } as unknown as Depot);

      // Extract snapshot.id for filter
      const snapshotId = (depot.snapshot as any)?.id;

      return {
        updateOne: {
          filter: {
            businessId: depot.businessId,
            source: depot.source,
            'snapshot.id': snapshotId,
          },
          update: {
            $set: {
              ...persistenceModel,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      };
    });

    const result = await this.depotModel.bulkWrite(bulkOps, { ordered: false });
    return result.upsertedCount + result.modifiedCount;
  }
}
