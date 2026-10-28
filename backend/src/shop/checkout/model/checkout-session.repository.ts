import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CheckoutSessionRepository } from '../domain/checkout-session.repository';
import { CheckoutSession } from '../domain/checkout-session';
import { CheckoutSessionStatus } from '../domain/checkout-session-status.enum';
import { CheckoutSessionSchemaClass } from './checkout-session.schema';
import { CheckoutSessionMapper } from './checkout-session.mapper';
import { NullableType } from '../../../utils/types/nullable.type';

/**
 * Mongoose implementation of CheckoutSessionRepository
 */
@Injectable()
export class CheckoutSessionDocumentRepository
  implements CheckoutSessionRepository
{
  constructor(
    @InjectModel(CheckoutSessionSchemaClass.name)
    private readonly sessionModel: Model<CheckoutSessionSchemaClass>,
  ) {}

  async findById(
    id: CheckoutSession['id'],
  ): Promise<NullableType<CheckoutSession>> {
    const doc = await this.sessionModel.findById(id).lean();
    return doc ? CheckoutSessionMapper.toDomain(doc) : null;
  }

  async create(
    data: Omit<CheckoutSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CheckoutSession> {
    const now = new Date();

    const doc = CheckoutSessionMapper.toDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    } as CheckoutSession);

    const created = new this.sessionModel(doc);
    const saved = await created.save();
    return CheckoutSessionMapper.toDomain(saved.toObject());
  }

  async update(
    id: CheckoutSession['id'],
    payload: Partial<
      Omit<CheckoutSession, 'id' | 'createdAt' | 'sessionNumber'>
    >,
  ): Promise<NullableType<CheckoutSession>> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Build update object from payload
    if (payload.customer !== undefined) {
      updateData.customer = payload.customer
        ? CheckoutSessionMapper.customerToDocument(payload.customer)
        : undefined;
    }
    if (payload.shippingAddress !== undefined) {
      updateData.shippingAddress = payload.shippingAddress
        ? CheckoutSessionMapper.addressToDocument(payload.shippingAddress)
        : undefined;
    }
    if (payload.items !== undefined) {
      updateData.items = payload.items.map((item) =>
        CheckoutSessionMapper.itemToDocument(item),
      );
    }
    if (payload.comboInstances !== undefined) {
      updateData.comboInstances =
        payload.comboInstances?.map((ci) =>
          CheckoutSessionMapper.comboInstanceToDocument(ci),
        ) ?? [];
    }
    if (payload.subtotal !== undefined) updateData.subtotal = payload.subtotal;
    if (payload.shippingFee !== undefined)
      updateData.shippingFee = payload.shippingFee;
    if (payload.discount !== undefined) updateData.discount = payload.discount;
    if (payload.discountDetails !== undefined) {
      updateData.discountDetails =
        payload.discountDetails?.map((d) =>
          CheckoutSessionMapper.discountDetailToDocument(d),
        ) ?? [];
    }
    if (payload.appliedVouchers !== undefined) {
      updateData.appliedVouchers =
        payload.appliedVouchers?.map((v) =>
          CheckoutSessionMapper.voucherToDocument(v),
        ) ?? [];
    }
    if (payload.totalDiscount !== undefined)
      updateData.totalDiscount = payload.totalDiscount;
    if (payload.shippingDiscount !== undefined)
      updateData.shippingDiscount = payload.shippingDiscount;
    if (payload.shippingPromotion !== undefined) {
      updateData.shippingPromotion = payload.shippingPromotion
        ? CheckoutSessionMapper.shippingPromotionToDocument(
            payload.shippingPromotion,
          )
        : null;
    }
    if (payload.shipping !== undefined) {
      updateData.shipping = payload.shipping
        ? CheckoutSessionMapper.shippingToDocument(payload.shipping)
        : undefined;
    }
    if (payload.total !== undefined) updateData.total = payload.total;
    if (payload.paymentMethod !== undefined)
      updateData.paymentMethod = payload.paymentMethod;
    if (payload.note !== undefined) updateData.note = payload.note;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.expiresAt !== undefined)
      updateData.expiresAt = payload.expiresAt;
    if (payload.orderId !== undefined) {
      updateData.orderId = payload.orderId
        ? new mongoose.Types.ObjectId(payload.orderId)
        : undefined;
    }
    if (payload.orderNumber !== undefined)
      updateData.orderNumber = payload.orderNumber;

    const updated = await this.sessionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean();

    return updated ? CheckoutSessionMapper.toDomain(updated) : null;
  }

  async markCompleted(
    id: CheckoutSession['id'],
    orderId: string,
    orderNumber: string,
  ): Promise<NullableType<CheckoutSession>> {
    const updated = await this.sessionModel
      .findByIdAndUpdate(
        id,
        {
          status: CheckoutSessionStatus.COMPLETED,
          orderId: new mongoose.Types.ObjectId(orderId),
          orderNumber,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .lean();

    return updated ? CheckoutSessionMapper.toDomain(updated) : null;
  }

  async markPendingPayment(
    id: CheckoutSession['id'],
    orderId: string,
    orderNumber: string,
  ): Promise<NullableType<CheckoutSession>> {
    const updated = await this.sessionModel
      .findByIdAndUpdate(
        id,
        {
          status: CheckoutSessionStatus.PENDING_PAYMENT,
          orderId: new mongoose.Types.ObjectId(orderId),
          orderNumber,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .lean();

    return updated ? CheckoutSessionMapper.toDomain(updated) : null;
  }

  async findByOrderId(orderId: string): Promise<NullableType<CheckoutSession>> {
    const doc = await this.sessionModel
      .findOne({ orderId: new mongoose.Types.ObjectId(orderId) })
      .lean();
    return doc ? CheckoutSessionMapper.toDomain(doc) : null;
  }

  async findActiveBySessionIdOrUserId(
    sessionId: string,
    userId?: string,
  ): Promise<NullableType<CheckoutSession>> {
    // Build query: active status AND (userId OR sessionId)
    const query: Record<string, unknown> = {
      status: CheckoutSessionStatus.ACTIVE,
    };

    if (userId) {
      query.$or = [{ userId }, { sessionId }];
    } else {
      query.sessionId = sessionId;
    }

    const doc = await this.sessionModel.findOne(query).lean();
    return doc ? CheckoutSessionMapper.toDomain(doc) : null;
  }

  async delete(id: CheckoutSession['id']): Promise<void> {
    await this.sessionModel.findByIdAndDelete(id);
  }

  generateSessionNumber(): Promise<string> {
    return Promise.resolve(uuidv4());
  }
}
