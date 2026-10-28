import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  FilterQuery,
  Model,
  PaginateModel,
  PaginateResult,
} from 'mongoose';
import {
  OrderRepository,
  OrderFilterOptions,
  OrderSortOptions,
} from '../domain/order.repository';
import { Order, PaymentEvent, PaymentEventStatus } from '../domain/order';
import { CdpSyncStatus } from '../domain/cdp-sync-status.enum';
import { NhanhSyncStatus } from '../domain/nhanh-sync-status.enum';
import { OrderSchemaClass } from './order.schema';
import {
  OrderCounterSchemaClass,
  OrderCounterDocument,
} from './order-counter.schema';
import { OrderMapper } from './order.mapper';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { CustomerTransaction } from '../../../cdp/types/customerTransaction.types';
import { escapeRegex } from '../../../utils/search';
import { normalizePhoneNumber } from '../../../utils/transformers/phone-number.transformer';
import { formatVietnamDateISO } from '../../../utils/helpers/format-date';

/**
 * Mongoose implementation of OrderRepository
 */
@Injectable()
export class OrderDocumentRepository implements OrderRepository {
  constructor(
    @InjectModel(OrderSchemaClass.name)
    private readonly orderModel: PaginateModel<OrderSchemaClass>,
    @InjectModel(OrderCounterSchemaClass.name)
    private readonly orderCounterModel: Model<OrderCounterDocument>,
  ) {}

  async findById(id: Order['id']): Promise<NullableType<Order>> {
    const doc = await this.orderModel.findById(id).lean();
    return doc ? OrderMapper.toDomain(doc) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<NullableType<Order>> {
    const doc = await this.orderModel.findOne({ orderNumber }).lean();
    return doc ? OrderMapper.toDomain(doc) : null;
  }

  async findByNhanhOrderId(nhanhOrderId: number): Promise<NullableType<Order>> {
    const doc = await this.orderModel
      .findOne({ 'nhanh.orderId': nhanhOrderId })
      .lean();
    return doc ? OrderMapper.toDomain(doc) : null;
  }

  async countUnsyncedToNhanh(): Promise<number> {
    // Cancelled orders never need to sync to Nhanh, so exclude them from the count.
    return this.orderModel.countDocuments({
      'nhanh.orderId': { $exists: false },
      status: { $ne: 'cancelled' },
    });
  }

  async findManyWithPagination(options: {
    filterOptions?: OrderFilterOptions;
    sortOptions?: OrderSortOptions;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Order>> {
    const { filterOptions, sortOptions, paginationOptions } = options;

    const filter: FilterQuery<OrderSchemaClass> = {};

    if (filterOptions) {
      if (filterOptions.userId) {
        filter.userId = filterOptions.userId;
      }
      if (filterOptions.sessionId) {
        filter.sessionId = filterOptions.sessionId;
      }
      if (filterOptions.status) {
        filter.status = filterOptions.status;
      }
      if (filterOptions.paymentStatus) {
        filter.paymentStatus = filterOptions.paymentStatus;
      }
      if (filterOptions.orderNumber) {
        filter.orderNumber = {
          $regex: escapeRegex(filterOptions.orderNumber),
          $options: 'i',
        };
      }
      if (filterOptions.phone) {
        // Phones are stored as E.164 (+84...) so normalize the input here to
        // let users search with 0xxxxxxxxx / 84xxxxxxxxx / +84xxxxxxxxx alike.
        const normalizedPhone =
          normalizePhoneNumber(filterOptions.phone) ?? filterOptions.phone;
        filter['customer.phone'] = {
          $regex: escapeRegex(normalizedPhone),
          $options: 'i',
        };
      }
      if (filterOptions.fromDate || filterOptions.toDate) {
        filter.createdAt = {};
        if (filterOptions.fromDate) {
          filter.createdAt.$gte = filterOptions.fromDate;
        }
        if (filterOptions.toDate) {
          filter.createdAt.$lte = filterOptions.toDate;
        }
      }
      if (filterOptions.nhanhSynced !== undefined) {
        filter['nhanh.orderId'] = { $exists: filterOptions.nhanhSynced };
        // When listing unsynced orders, hide cancelled ones unless the caller
        // explicitly asked for a status — cancelled orders never need sync.
        if (filterOptions.nhanhSynced === false && !filterOptions.status) {
          filter.status = { $ne: 'cancelled' };
        }
      }
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortOptions) {
      sort[sortOptions.orderBy] = sortOptions.order === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    const result = await this.orderModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => OrderMapper.toDomain(doc)),
    };
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((doc) => OrderMapper.toDomain(doc));
  }

  async findBySessionId(sessionId: string): Promise<Order[]> {
    const docs = await this.orderModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((doc) => OrderMapper.toDomain(doc));
  }

  async findBySessionIdAndOrderNumber(
    sessionId: string,
    orderNumber: string,
  ): Promise<NullableType<Order>> {
    const doc = await this.orderModel
      .findOne({ sessionId, orderNumber })
      .lean();
    return doc ? OrderMapper.toDomain(doc) : null;
  }

  async create(
    data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Order> {
    const now = new Date();
    const doc = OrderMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Order);

    const created = new this.orderModel(doc);
    const saved = await created.save();
    return OrderMapper.toDomain(saved.toObject());
  }

  async update(
    id: Order['id'],
    payload: Partial<Omit<Order, 'id' | 'createdAt' | 'orderNumber'>>,
  ): Promise<NullableType<Order>> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Map domain fields to document fields
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.paymentStatus !== undefined)
      updateData.paymentStatus = payload.paymentStatus;
    if (payload.paymentMethod !== undefined)
      updateData.paymentMethod = payload.paymentMethod;
    if (payload.note !== undefined) updateData.note = payload.note;
    if (payload.cancelledAt !== undefined)
      updateData.cancelledAt = payload.cancelledAt;
    if (payload.cancellationReason !== undefined)
      updateData.cancellationReason = payload.cancellationReason;
    if (payload.shippingFee !== undefined)
      updateData.shippingFee = payload.shippingFee;
    if (payload.discount !== undefined) updateData.discount = payload.discount;
    if (payload.total !== undefined) updateData.total = payload.total;

    // Affiliate fields
    if (payload.affiliateId !== undefined)
      updateData.affiliateId = payload.affiliateId
        ? new mongoose.Types.ObjectId(payload.affiliateId)
        : null;
    if (payload.affiliateCode !== undefined)
      updateData.affiliateCode = payload.affiliateCode;

    // InfoCMS fields (nested object)
    if (payload.infocms !== undefined) {
      if (payload.infocms) {
        if (payload.infocms.transactionUuid !== undefined)
          updateData['infocms.transactionUuid'] =
            payload.infocms.transactionUuid;
        if (payload.infocms.ecollectionCd !== undefined)
          updateData['infocms.ecollectionCd'] = payload.infocms.ecollectionCd;
        if (payload.infocms.transId !== undefined)
          updateData['infocms.transId'] = payload.infocms.transId;
        if (payload.infocms.bankTransId !== undefined)
          updateData['infocms.bankTransId'] = payload.infocms.bankTransId;
      }
    }

    const updated = await this.orderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean();

    return updated ? OrderMapper.toDomain(updated) : null;
  }

  async generateOrderNumber(): Promise<string> {
    // Key the daily sequence by the Vietnam-local date, not UTC. Using
    // toISOString() (UTC) rolled the day over at 07:00 local time, so orders
    // placed between 00:00 and 06:59 were tagged with the previous day's code.
    const dateStr = formatVietnamDateISO(new Date()).replace(/-/g, '');
    const key = `ORD-${dateStr}`;

    const counter = await this.orderCounterModel.findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );

    const sequence = String(counter.seq).padStart(4, '0');
    return `${key}-${sequence}`;
  }

  async findGuestOrdersByPhone(phone: string): Promise<Order[]> {
    const docs = await this.orderModel
      .find({
        'customer.phone': phone,
        userId: null,
      })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((doc) => OrderMapper.toDomain(doc));
  }

  async assignOrdersToUser(
    orderIds: string[],
    userId: string,
    cdpCustomerId?: string,
  ): Promise<number> {
    const updateData: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
      updatedAt: new Date(),
    };
    if (cdpCustomerId) {
      updateData['cdp.customerId'] = cdpCustomerId;
    }

    const result = await this.orderModel.updateMany(
      {
        _id: {
          $in: orderIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
      { $set: updateData },
    );

    return result.modifiedCount;
  }

  async updateCdpSyncStatus(
    orderId: string,
    status: CdpSyncStatus,
    cdpCustomerId?: string,
    error?: string,
    customerTransaction?: CustomerTransaction,
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      'cdp.syncStatus': status,
      updatedAt: new Date(),
    };

    if (status === CdpSyncStatus.SYNCED) {
      updateData['cdp.syncedAt'] = new Date();
      if (cdpCustomerId) {
        updateData['cdp.customerId'] = cdpCustomerId;
      }
      if (customerTransaction) {
        updateData['cdp.customerTransaction'] = customerTransaction;
      }
    }

    if (error) {
      updateData['cdp.syncError'] = error;
    }

    await this.orderModel.updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: updateData },
    );
  }

  async updateNhanhSyncStatus(
    orderId: string,
    status: NhanhSyncStatus,
    nhanhOrderId?: number,
    trackingUrl?: string,
    error?: string,
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      'nhanh.syncStatus': status,
      updatedAt: new Date(),
    };
    const unsetData: Record<string, unknown> = {};

    if (status === NhanhSyncStatus.SYNCED) {
      updateData['nhanh.syncedAt'] = new Date();
      if (nhanhOrderId) {
        updateData['nhanh.orderId'] = nhanhOrderId;
      }
      if (trackingUrl) {
        updateData['nhanh.trackingUrl'] = trackingUrl;
      }
      // A successful sync clears any stale error from a previous failed attempt.
      unsetData['nhanh.syncError'] = '';
    }

    if (error) {
      updateData['nhanh.syncError'] = error;
    }

    const update: Record<string, unknown> = { $set: updateData };
    if (Object.keys(unsetData).length > 0) {
      update.$unset = unsetData;
    }

    await this.orderModel.updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      update,
    );
  }

  async addPaymentEvent(
    orderId: string,
    event: PaymentEvent,
  ): Promise<Order | null> {
    const eventDoc = OrderMapper.paymentEventToDocument(event);

    // Map event status to payment status
    let paymentStatus: string;
    if (event.status === PaymentEventStatus.SUCCESS) {
      paymentStatus = 'paid';
    } else if (event.status === PaymentEventStatus.FAILED) {
      paymentStatus = 'failed';
    } else {
      paymentStatus = 'pending';
    }

    const updated = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $push: { paymentHistory: eventDoc },
          $set: { paymentStatus, updatedAt: new Date() },
        },
        { new: true },
      )
      .lean();

    return updated ? OrderMapper.toDomain(updated) : null;
  }

  /**
   * Find product IDs frequently co-purchased with the given products
   */
  async findCoPurchasedProductIds(
    productIds: string[],
    excludeIds: string[],
    limit: number,
  ): Promise<Array<{ productId: string; count: number }>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const productObjectIds = productIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    const excludeObjectIds = excludeIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    const result = await this.orderModel.aggregate([
      {
        $match: {
          'items.productId': { $in: productObjectIds },
          status: { $ne: 'cancelled' },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.productId': { $nin: excludeObjectIds },
        },
      },
      { $group: { _id: '$items.productId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return result.map((r) => ({
      productId: r._id.toString(),
      count: r.count,
    }));
  }

  /**
   * Get distinct user IDs from orders in the last N months
   */
  async getDistinctUserIds(months: number): Promise<string[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const result = await this.orderModel.distinct('userId', {
      userId: { $ne: null },
      createdAt: { $gte: since },
    });

    return result.map((id) => id.toString());
  }

  /**
   * Get purchased product IDs and category IDs for a user
   */
  async getUserPurchaseHistory(
    userId: string,
    months: number,
  ): Promise<{ productIds: string[]; categoryIds: string[] }> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const docs = await this.orderModel
      .find({
        userId: new mongoose.Types.ObjectId(userId),
        status: { $ne: 'cancelled' },
        createdAt: { $gte: since },
      })
      .select('items.productId')
      .lean();

    const productIds = new Set<string>();
    for (const doc of docs) {
      for (const item of doc.items || []) {
        if (item.productId) {
          productIds.add(item.productId.toString());
        }
      }
    }

    // Category IDs will be resolved via the product repository
    return { productIds: Array.from(productIds), categoryIds: [] };
  }
}
