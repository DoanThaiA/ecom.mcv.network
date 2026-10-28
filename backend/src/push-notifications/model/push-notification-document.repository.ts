import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateResult } from 'mongoose';
import {
  PushNotificationRepository,
  FilterPushNotificationDto,
} from '../domain/push-notification.repository';
import { PushNotification } from '../domain/push-notification';
import { PushNotificationSchemaClass } from './push-notification.schema';
import { PushNotificationMapper } from './push-notification.mapper';
import { NullableType } from '../../utils/types/nullable.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial } from '../../utils/types/deep-partial.type';
import { escapeRegex } from '../../utils/search';

/**
 * Mongoose implementation of PushNotificationRepository
 */
@Injectable()
export class PushNotificationDocumentRepository
  implements PushNotificationRepository
{
  constructor(
    @InjectModel(PushNotificationSchemaClass.name)
    private readonly model: PaginateModel<PushNotificationSchemaClass>,
  ) {}

  async create(
    data: Omit<PushNotification, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PushNotification> {
    const now = new Date();
    const persistenceModel = PushNotificationMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as PushNotification);

    const created = new this.model(persistenceModel);
    const doc = await created.save();
    return PushNotificationMapper.toDomain(doc.toObject());
  }

  async findManyWithPagination(params: {
    filterOptions?: FilterPushNotificationDto | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<PushNotification>> {
    const filter: FilterQuery<PushNotificationSchemaClass> = {
      deletedAt: null,
    };

    if (params.filterOptions) {
      if (params.filterOptions.status !== undefined) {
        filter.status = params.filterOptions.status;
      }
      if (params.filterOptions.category !== undefined) {
        filter.category = params.filterOptions.category;
      }
      if (params.filterOptions.search) {
        filter.title = {
          $regex: escapeRegex(params.filterOptions.search),
          $options: 'i',
        };
      }
    }

    const result = await this.model.paginate(filter, {
      page: params.paginationOptions.page,
      limit: params.paginationOptions.limit,
      sort: { createdAt: -1 },
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => PushNotificationMapper.toDomain(doc)),
    };
  }

  async findById(
    id: PushNotification['id'],
  ): Promise<NullableType<PushNotification>> {
    const doc = await this.model.findOne({ _id: id, deletedAt: null }).lean();
    return doc ? PushNotificationMapper.toDomain(doc) : null;
  }

  async update(
    id: PushNotification['id'],
    payload: DeepPartial<PushNotification>,
  ): Promise<NullableType<PushNotification>> {
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.subtitle !== undefined) updateData.subtitle = payload.subtitle;
    if (payload.url !== undefined) updateData.url = payload.url;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.scheduledAt !== undefined)
      updateData.scheduledAt = payload.scheduledAt;
    if (payload.sentAt !== undefined) updateData.sentAt = payload.sentAt;
    if (payload.readersCount !== undefined)
      updateData.readersCount = payload.readersCount;
    if (payload.queueJobId !== undefined)
      updateData.queueJobId = payload.queueJobId;

    const updated = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();

    return updated ? PushNotificationMapper.toDomain(updated) : null;
  }

  async remove(id: PushNotification['id']): Promise<void> {
    await this.model.findByIdAndUpdate(id, { deletedAt: new Date() }).exec();
  }

  async incrementReadersCount(id: PushNotification['id']): Promise<void> {
    await this.model.findByIdAndUpdate(id, { $inc: { readersCount: 1 } });
  }

  async incrementReadersCountMany(
    ids: PushNotification['id'][],
  ): Promise<void> {
    if (ids.length === 0) return;
    await this.model.updateMany(
      { _id: { $in: ids } },
      { $inc: { readersCount: 1 } },
    );
  }
}
