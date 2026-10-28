import mongoose from 'mongoose';
import {
  AffiliateOrderCommission,
  AffiliateOrderCommissionCustomer,
  AffiliateOrderCommissionItem,
} from '../domain/affiliate-order-commission';
import {
  AffiliateOrderCommissionSchemaClass,
  AffiliateOrderCommissionCustomerSchemaClass,
  AffiliateOrderCommissionItemSchemaClass,
} from './affiliate-order-commission.schema';

export class AffiliateOrderCommissionMapper {
  static toDomain(
    raw: AffiliateOrderCommissionSchemaClass,
  ): AffiliateOrderCommission {
    const entity = new AffiliateOrderCommission();
    entity.id = raw._id.toString();
    entity.orderId = raw.orderId.toString();
    entity.orderNumber = raw.orderNumber;
    entity.orderStatus = raw.orderStatus;
    entity.affiliateId = raw.affiliateId.toString();
    entity.affiliateCode = raw.affiliateCode;
    entity.customer = this.customerToDomain(raw.customer);
    entity.items = raw.items?.map((item) => this.itemToDomain(item)) ?? [];
    entity.orderTotal = raw.orderTotal;
    entity.totalDiscount = raw.totalDiscount;
    entity.paymentAmount = raw.paymentAmount;
    entity.totalCommission = raw.totalCommission;
    entity.auditedAt = raw.auditedAt ?? null;
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;
    return entity;
  }

  private static customerToDomain(
    raw: AffiliateOrderCommissionCustomerSchemaClass,
  ): AffiliateOrderCommissionCustomer {
    const customer = new AffiliateOrderCommissionCustomer();
    customer.name = raw.name;
    customer.phone = raw.phone;
    return customer;
  }

  private static itemToDomain(
    raw: AffiliateOrderCommissionItemSchemaClass,
  ): AffiliateOrderCommissionItem {
    const item = new AffiliateOrderCommissionItem();
    item.productId = raw.productId.toString();
    item.productName = raw.productName;
    item.productCode = raw.productCode;
    item.quantity = raw.quantity;
    item.price = raw.price;
    item.subtotal = raw.subtotal;
    item.commissionRate = raw.commissionRate;
    item.commissionAmount = raw.commissionAmount;
    return item;
  }

  static toDocument(
    domain: AffiliateOrderCommission,
  ): AffiliateOrderCommissionSchemaClass {
    const doc = new AffiliateOrderCommissionSchemaClass();

    if (domain.id) {
      doc._id = domain.id;
    }

    doc.orderId = new mongoose.Types.ObjectId(domain.orderId);
    doc.orderNumber = domain.orderNumber;
    doc.orderStatus = domain.orderStatus;
    doc.affiliateId = new mongoose.Types.ObjectId(domain.affiliateId);
    doc.affiliateCode = domain.affiliateCode;
    doc.customer = this.customerToDocument(domain.customer);
    doc.items = domain.items?.map((item) => this.itemToDocument(item)) ?? [];
    doc.orderTotal = domain.orderTotal;
    doc.totalDiscount = domain.totalDiscount;
    doc.paymentAmount = domain.paymentAmount;
    doc.totalCommission = domain.totalCommission;
    doc.auditedAt = domain.auditedAt ?? null;
    doc.createdAt = domain.createdAt;
    doc.updatedAt = domain.updatedAt;

    return doc;
  }

  private static customerToDocument(
    customer: AffiliateOrderCommissionCustomer,
  ): AffiliateOrderCommissionCustomerSchemaClass {
    const doc = new AffiliateOrderCommissionCustomerSchemaClass();
    doc.name = customer.name;
    doc.phone = customer.phone;
    return doc;
  }

  private static itemToDocument(
    item: AffiliateOrderCommissionItem,
  ): AffiliateOrderCommissionItemSchemaClass {
    const doc = new AffiliateOrderCommissionItemSchemaClass();
    doc.productId = new mongoose.Types.ObjectId(item.productId);
    doc.productName = item.productName;
    doc.productCode = item.productCode;
    doc.quantity = item.quantity;
    doc.price = item.price;
    doc.subtotal = item.subtotal;
    doc.commissionRate = item.commissionRate;
    doc.commissionAmount = item.commissionAmount;
    return doc;
  }
}
