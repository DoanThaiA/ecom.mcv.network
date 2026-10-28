import mongoose from 'mongoose';
import {
  Order,
  OrderCustomer,
  OrderAddress,
  OrderItem,
  OrderItemDiscountDetail,
  OrderDiscountDetail,
  OrderCdpSyncInfo,
  OrderNhanhSyncInfo,
  OrderInfocmsInfo,
  OrderShippingCarrier,
  PaymentEvent,
} from '../domain/order';
import { CdpSyncStatus } from '../domain/cdp-sync-status.enum';
import { NhanhSyncStatus } from '../domain/nhanh-sync-status.enum';
import {
  OrderSchemaClass,
  OrderCustomerSchemaClass,
  OrderAddressSchemaClass,
  OrderItemSchemaClass,
  OrderItemDiscountDetailSchemaClass,
  OrderDiscountDetailSchemaClass,
  CdpSyncInfoSchemaClass,
  NhanhSyncInfoSchemaClass,
  InfocmsInfoSchemaClass,
  OrderShippingCarrierSchemaClass,
  PaymentEventSchemaClass,
} from './order.schema';

/**
 * Mapper for converting between Order domain entity and Mongoose document
 */
export class OrderMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: OrderSchemaClass): Order {
    const order = new Order();

    order.id = raw._id.toString();
    order.orderNumber = raw.orderNumber;
    order.userId = raw.userId?.toString() ?? null;
    order.sessionId = raw.sessionId;
    order.customer = this.customerToDomain(raw.customer);
    order.shippingAddress = this.addressToDomain(raw.shippingAddress);
    order.items = raw.items?.map((item) => this.itemToDomain(item)) ?? [];
    order.subtotal = raw.subtotal;
    order.shippingFee = raw.shippingFee;
    order.depotId = raw.depotId ?? null;
    order.shippingCarrier = raw.shippingCarrier
      ? this.shippingCarrierToDomain(raw.shippingCarrier)
      : null;
    order.discount = raw.discount ?? 0;
    order.discountDetails =
      raw.discountDetails?.map((d) => this.discountDetailToDomain(d)) ?? null;
    order.totalDiscount = raw.totalDiscount ?? 0;
    order.shippingDiscount = raw.shippingDiscount ?? 0;
    order.shippingPromotionId = raw.shippingPromotionId ?? null;
    order.shippingPromotionName = raw.shippingPromotionName ?? null;
    order.total = raw.total;
    order.status = raw.status;
    order.paymentStatus = raw.paymentStatus;
    order.paymentMethod = raw.paymentMethod;
    order.note = raw.note ?? null;
    order.affiliateId = raw.affiliateId?.toString() ?? null;
    order.affiliateCode = raw.affiliateCode ?? null;
    order.createdAt = raw.createdAt;
    order.updatedAt = raw.updatedAt;
    order.cancelledAt = raw.cancelledAt ?? null;
    order.cancellationReason = raw.cancellationReason ?? null;

    // CDP sync info (nested object)
    order.cdp = raw.cdp ? this.cdpSyncInfoToDomain(raw.cdp) : null;

    // Nhanh.vn sync info (nested object)
    order.nhanh = raw.nhanh ? this.nhanhSyncInfoToDomain(raw.nhanh) : null;

    // InfoCMS payment info (nested object)
    order.infocms = raw.infocms ? this.infocmsInfoToDomain(raw.infocms) : null;

    // Payment history for audit trail
    order.paymentHistory =
      raw.paymentHistory?.map((e) => this.paymentEventToDomain(e)) ?? null;

    return order;
  }

  static paymentEventToDomain(raw: PaymentEventSchemaClass): PaymentEvent {
    const event = new PaymentEvent();
    event.status = raw.status;
    event.timestamp = raw.timestamp;
    event.amount = raw.amount ?? null;
    event.ref = raw.ref ?? null;
    event.code = raw.code ?? null;
    event.message = raw.message ?? null;
    return event;
  }

  static infocmsInfoToDomain(raw: InfocmsInfoSchemaClass): OrderInfocmsInfo {
    const infocms = new OrderInfocmsInfo();
    infocms.transactionUuid = raw.transactionUuid ?? null;
    infocms.ecollectionCd = raw.ecollectionCd ?? null;
    infocms.transId = raw.transId ?? null;
    infocms.bankTransId = raw.bankTransId ?? null;
    return infocms;
  }

  static nhanhSyncInfoToDomain(
    raw: NhanhSyncInfoSchemaClass,
  ): OrderNhanhSyncInfo {
    const nhanh = new OrderNhanhSyncInfo();
    nhanh.orderId = raw.orderId ?? null;
    nhanh.trackingUrl = raw.trackingUrl ?? null;
    nhanh.syncStatus = raw.syncStatus ?? NhanhSyncStatus.PENDING;
    nhanh.syncedAt = raw.syncedAt ?? null;
    nhanh.syncError = raw.syncError ?? null;
    return nhanh;
  }

  static shippingCarrierToDomain(
    raw: OrderShippingCarrierSchemaClass,
  ): OrderShippingCarrier {
    const carrier = new OrderShippingCarrier();
    carrier.carrierId = raw.carrierId ?? null;
    carrier.carrierName = raw.carrierName ?? null;
    carrier.carrierType =
      raw.carrierType === 1 || raw.carrierType === 2 || raw.carrierType === 3
        ? raw.carrierType
        : null;
    carrier.serviceId = raw.serviceId ?? null;
    carrier.serviceCode = raw.serviceCode ?? null;
    carrier.accountId = raw.accountId ?? null;
    carrier.shopId = raw.shopId ?? null;
    return carrier;
  }

  static cdpSyncInfoToDomain(raw: CdpSyncInfoSchemaClass): OrderCdpSyncInfo {
    const cdp = new OrderCdpSyncInfo();
    cdp.customerId = raw.customerId ?? null;
    cdp.syncStatus = raw.syncStatus ?? CdpSyncStatus.PENDING;
    cdp.syncedAt = raw.syncedAt ?? null;
    cdp.syncError = raw.syncError ?? null;
    return cdp;
  }

  static customerToDomain(raw: OrderCustomerSchemaClass): OrderCustomer {
    const customer = new OrderCustomer();
    customer.name = raw.name;
    customer.phone = raw.phone;
    customer.email = raw.email ?? null;
    return customer;
  }

  static addressToDomain(raw: OrderAddressSchemaClass): OrderAddress {
    const address = new OrderAddress();
    address.address = raw.address;
    address.ward = raw.ward ?? null;
    address.district = raw.district ?? null;
    address.city = raw.city;
    address.country = raw.country ?? 'Vietnam';
    address.cityId = raw.cityId ?? null;
    address.districtId = raw.districtId ?? null;
    address.wardId = raw.wardId ?? null;
    return address;
  }

  static itemToDomain(raw: OrderItemSchemaClass): OrderItem {
    const item = new OrderItem();
    item.productId = raw.productId.toString();
    item.variantId = raw.variantId?.toString() ?? null;
    item.code = raw.code;
    item.name = raw.name;
    item.image = raw.image ?? null;
    item.price = raw.price;
    item.quantity = raw.quantity;
    item.subtotal = raw.subtotal;
    item.discount = raw.discount ?? 0;
    item.comboInstanceId = raw.comboInstanceId ?? null;
    item.comboId = raw.comboId?.toString() ?? null;
    item.comboName = raw.comboName ?? null;
    item.flashSaleId = raw.flashSaleId?.toString() ?? null;
    item.flashSaleName = raw.flashSaleName ?? null;
    item.originalPrice = raw.originalPrice ?? item.price;
    item.discountDetails =
      raw.discountDetails?.map((d) => this.itemDiscountDetailToDomain(d)) ??
      null;
    item.isGift = raw.isGift ?? null;
    item.giftPromotionId = raw.giftPromotionId ?? null;
    return item;
  }

  static itemDiscountDetailToDomain(
    raw: OrderItemDiscountDetailSchemaClass,
  ): OrderItemDiscountDetail {
    const detail = new OrderItemDiscountDetail();
    detail.type = raw.type;
    detail.referenceId = raw.referenceId;
    detail.referenceName = raw.referenceName;
    detail.discountType = raw.discountType;
    detail.discountValue = raw.discountValue;
    detail.discountAmountPerUnit = raw.discountAmountPerUnit;
    detail.discountAmount = raw.discountAmount;
    return detail;
  }

  static discountDetailToDomain(
    raw: OrderDiscountDetailSchemaClass,
  ): OrderDiscountDetail {
    const detail = new OrderDiscountDetail();
    detail.type = raw.type;
    detail.referenceId = raw.referenceId;
    detail.referenceName = raw.referenceName;
    detail.instanceId = raw.instanceId ?? null;
    detail.discountType = raw.discountType;
    detail.discountValue = raw.discountValue;
    detail.discountAmount = raw.discountAmount;
    return detail;
  }

  /**
   * Convert domain entity to Mongoose document
   */
  static toDocument(domain: Order): OrderSchemaClass {
    const doc = new OrderSchemaClass();

    if (domain.id) {
      doc._id = domain.id;
    }

    doc.orderNumber = domain.orderNumber;

    if (domain.userId) {
      doc.userId = new mongoose.Types.ObjectId(domain.userId);
    }

    doc.sessionId = domain.sessionId;
    doc.customer = this.customerToDocument(domain.customer);
    doc.shippingAddress = this.addressToDocument(domain.shippingAddress);
    doc.items = domain.items?.map((item) => this.itemToDocument(item)) ?? [];
    doc.subtotal = domain.subtotal;
    doc.shippingFee = domain.shippingFee;
    doc.depotId = domain.depotId ?? undefined;
    if (domain.shippingCarrier) {
      doc.shippingCarrier = this.shippingCarrierToDocument(
        domain.shippingCarrier,
      );
    }
    doc.discount = domain.discount ?? 0;
    doc.discountDetails =
      domain.discountDetails?.map((d) => this.discountDetailToDocument(d)) ??
      [];
    doc.totalDiscount = domain.totalDiscount ?? 0;
    doc.shippingDiscount = domain.shippingDiscount ?? 0;
    doc.shippingPromotionId = domain.shippingPromotionId ?? undefined;
    doc.shippingPromotionName = domain.shippingPromotionName ?? undefined;
    doc.total = domain.total;
    doc.status = domain.status;
    doc.paymentStatus = domain.paymentStatus;
    doc.paymentMethod = domain.paymentMethod;
    doc.note = domain.note ?? undefined;
    if (domain.affiliateId) {
      doc.affiliateId = new mongoose.Types.ObjectId(domain.affiliateId);
    }
    doc.affiliateCode = domain.affiliateCode ?? undefined;
    doc.createdAt = domain.createdAt;
    doc.updatedAt = domain.updatedAt;
    doc.cancelledAt = domain.cancelledAt ?? undefined;
    doc.cancellationReason = domain.cancellationReason ?? undefined;

    // CDP sync info (nested object)
    if (domain.cdp) {
      doc.cdp = this.cdpSyncInfoToDocument(domain.cdp);
    }

    // Nhanh.vn sync info (nested object)
    if (domain.nhanh) {
      doc.nhanh = this.nhanhSyncInfoToDocument(domain.nhanh);
    }

    // InfoCMS payment info (nested object)
    if (domain.infocms) {
      doc.infocms = this.infocmsInfoToDocument(domain.infocms);
    }

    // Payment history for audit trail
    if (domain.paymentHistory) {
      doc.paymentHistory = domain.paymentHistory.map((e) =>
        this.paymentEventToDocument(e),
      );
    }

    return doc;
  }

  static paymentEventToDocument(event: PaymentEvent): PaymentEventSchemaClass {
    const doc = new PaymentEventSchemaClass();
    doc.status = event.status;
    doc.timestamp = event.timestamp;
    doc.amount = event.amount ?? undefined;
    doc.ref = event.ref ?? undefined;
    doc.code = event.code ?? undefined;
    doc.message = event.message ?? undefined;
    return doc;
  }

  static infocmsInfoToDocument(
    infocms: OrderInfocmsInfo,
  ): InfocmsInfoSchemaClass {
    const doc = new InfocmsInfoSchemaClass();
    doc.transactionUuid = infocms.transactionUuid ?? undefined;
    doc.ecollectionCd = infocms.ecollectionCd ?? undefined;
    doc.transId = infocms.transId ?? undefined;
    doc.bankTransId = infocms.bankTransId ?? undefined;
    return doc;
  }

  static nhanhSyncInfoToDocument(
    nhanh: OrderNhanhSyncInfo,
  ): NhanhSyncInfoSchemaClass {
    const doc = new NhanhSyncInfoSchemaClass();
    doc.orderId = nhanh.orderId ?? undefined;
    doc.trackingUrl = nhanh.trackingUrl ?? undefined;
    doc.syncStatus = nhanh.syncStatus ?? NhanhSyncStatus.PENDING;
    doc.syncedAt = nhanh.syncedAt ?? undefined;
    doc.syncError = nhanh.syncError ?? undefined;
    return doc;
  }

  static shippingCarrierToDocument(
    carrier: OrderShippingCarrier,
  ): OrderShippingCarrierSchemaClass {
    const doc = new OrderShippingCarrierSchemaClass();
    doc.carrierId = carrier.carrierId ?? undefined;
    doc.carrierName = carrier.carrierName ?? undefined;
    doc.carrierType = carrier.carrierType ?? undefined;
    doc.serviceId = carrier.serviceId ?? undefined;
    doc.serviceCode = carrier.serviceCode ?? undefined;
    doc.accountId = carrier.accountId ?? undefined;
    doc.shopId = carrier.shopId ?? undefined;
    return doc;
  }

  static cdpSyncInfoToDocument(cdp: OrderCdpSyncInfo): CdpSyncInfoSchemaClass {
    const doc = new CdpSyncInfoSchemaClass();
    doc.customerId = cdp.customerId ?? undefined;
    doc.syncStatus = cdp.syncStatus ?? CdpSyncStatus.PENDING;
    doc.syncedAt = cdp.syncedAt ?? undefined;
    doc.syncError = cdp.syncError ?? undefined;
    return doc;
  }

  static customerToDocument(customer: OrderCustomer): OrderCustomerSchemaClass {
    const doc = new OrderCustomerSchemaClass();
    doc.name = customer.name;
    doc.phone = customer.phone;
    doc.email = customer.email ?? undefined;
    return doc;
  }

  static addressToDocument(address: OrderAddress): OrderAddressSchemaClass {
    const doc = new OrderAddressSchemaClass();
    doc.address = address.address;
    doc.ward = address.ward ?? undefined;
    doc.district = address.district ?? undefined;
    doc.city = address.city;
    doc.country = address.country ?? 'Vietnam';
    doc.cityId = address.cityId ?? undefined;
    doc.districtId = address.districtId ?? undefined;
    doc.wardId = address.wardId ?? undefined;
    return doc;
  }

  static itemToDocument(item: OrderItem): OrderItemSchemaClass {
    const doc = new OrderItemSchemaClass();
    doc.productId = new mongoose.Types.ObjectId(item.productId);
    if (item.variantId) {
      doc.variantId = new mongoose.Types.ObjectId(item.variantId);
    }
    doc.code = item.code;
    doc.name = item.name;
    doc.image = item.image ?? undefined;
    doc.price = item.price;
    doc.quantity = item.quantity;
    doc.subtotal = item.subtotal;
    doc.discount = item.discount ?? 0;
    doc.comboInstanceId = item.comboInstanceId ?? undefined;
    if (item.comboId) {
      doc.comboId = new mongoose.Types.ObjectId(item.comboId);
    }
    doc.comboName = item.comboName ?? undefined;
    if (item.flashSaleId) {
      doc.flashSaleId = new mongoose.Types.ObjectId(item.flashSaleId);
    }
    doc.flashSaleName = item.flashSaleName ?? undefined;
    doc.originalPrice = item.originalPrice;
    doc.discountDetails =
      item.discountDetails?.map((d) => this.itemDiscountDetailToDocument(d)) ??
      undefined;
    doc.isGift = item.isGift ?? undefined;
    doc.giftPromotionId = item.giftPromotionId ?? undefined;
    return doc;
  }

  static itemDiscountDetailToDocument(
    detail: OrderItemDiscountDetail,
  ): OrderItemDiscountDetailSchemaClass {
    const doc = new OrderItemDiscountDetailSchemaClass();
    doc.type = detail.type;
    doc.referenceId = detail.referenceId;
    doc.referenceName = detail.referenceName;
    doc.discountType = detail.discountType;
    doc.discountValue = detail.discountValue;
    doc.discountAmountPerUnit = detail.discountAmountPerUnit;
    doc.discountAmount = detail.discountAmount;
    return doc;
  }

  static discountDetailToDocument(
    detail: OrderDiscountDetail,
  ): OrderDiscountDetailSchemaClass {
    const doc = new OrderDiscountDetailSchemaClass();
    doc.type = detail.type;
    doc.referenceId = detail.referenceId;
    doc.referenceName = detail.referenceName;
    doc.instanceId = detail.instanceId ?? undefined;
    doc.discountType = detail.discountType;
    doc.discountValue = detail.discountValue;
    doc.discountAmount = detail.discountAmount;
    return doc;
  }
}
