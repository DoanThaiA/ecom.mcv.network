import mongoose from 'mongoose';
import {
  CheckoutSession,
  CheckoutSessionCustomer,
  CheckoutSessionAddress,
  CheckoutSessionItem,
  CheckoutSessionItemDiscountDetail,
  CheckoutSessionComboInstance,
  CheckoutSessionDiscountDetail,
  CheckoutSessionShipping,
  CheckoutSessionVoucher,
  CheckoutSessionShippingPromotion,
} from '../domain/checkout-session';
import {
  CheckoutSessionSchemaClass,
  CheckoutSessionCustomerSchemaClass,
  CheckoutSessionAddressSchemaClass,
  CheckoutSessionItemSchemaClass,
  CheckoutSessionItemDiscountDetailSchemaClass,
  CheckoutSessionComboInstanceSchemaClass,
  CheckoutSessionDiscountDetailSchemaClass,
  CheckoutSessionShippingSchemaClass,
  CheckoutSessionVoucherSchemaClass,
  CheckoutSessionShippingPromotionSchemaClass,
} from './checkout-session.schema';

/**
 * Mapper for converting between CheckoutSession domain entity and Mongoose document
 */
export class CheckoutSessionMapper {
  /**
   * Convert Mongoose document to domain entity
   */
  static toDomain(raw: CheckoutSessionSchemaClass): CheckoutSession {
    const session = new CheckoutSession();

    session.id = raw._id.toString();
    session.sessionNumber = raw.sessionNumber;
    session.userId = raw.userId?.toString() ?? null;
    session.sessionId = raw.sessionId;
    session.customer = raw.customer
      ? this.customerToDomain(raw.customer)
      : null;
    session.shippingAddress = raw.shippingAddress
      ? this.addressToDomain(raw.shippingAddress)
      : null;
    session.items = raw.items?.map((item) => this.itemToDomain(item)) ?? [];
    session.comboInstances =
      raw.comboInstances?.map((ci) => this.comboInstanceToDomain(ci)) ?? null;
    session.subtotal = raw.subtotal;
    session.shippingFee = raw.shippingFee;
    session.discount = raw.discount ?? 0;
    session.discountDetails =
      raw.discountDetails?.map((d) => this.discountDetailToDomain(d)) ?? null;
    session.appliedVouchers =
      raw.appliedVouchers?.map((v) => this.voucherToDomain(v)) ?? null;
    session.totalDiscount = raw.totalDiscount ?? 0;
    session.shippingDiscount = raw.shippingDiscount ?? 0;
    session.shippingPromotion = raw.shippingPromotion
      ? this.shippingPromotionToDomain(raw.shippingPromotion)
      : null;
    session.shipping = raw.shipping
      ? this.shippingToDomain(raw.shipping)
      : null;
    session.total = raw.total;
    session.paymentMethod = raw.paymentMethod ?? null;
    session.note = raw.note ?? null;
    session.affiliateCode = raw.affiliateCode ?? null;
    session.status = raw.status;
    session.createdAt = raw.createdAt;
    session.updatedAt = raw.updatedAt;
    session.expiresAt = raw.expiresAt;
    session.orderId = raw.orderId?.toString() ?? null;
    session.orderNumber = raw.orderNumber ?? null;

    return session;
  }

  static customerToDomain(
    raw: CheckoutSessionCustomerSchemaClass,
  ): CheckoutSessionCustomer {
    const customer = new CheckoutSessionCustomer();
    customer.name = raw.name;
    customer.phone = raw.phone;
    customer.email = raw.email ?? null;
    return customer;
  }

  static addressToDomain(
    raw: CheckoutSessionAddressSchemaClass,
  ): CheckoutSessionAddress {
    const address = new CheckoutSessionAddress();
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

  static itemToDomain(
    raw: CheckoutSessionItemSchemaClass,
  ): CheckoutSessionItem {
    const item = new CheckoutSessionItem();
    item.productId = raw.productId.toString();
    item.variantId = raw.variantId?.toString() ?? null;
    item.code = raw.code;
    item.name = raw.name;
    item.image = raw.image ?? null;
    item.originalPrice = raw.originalPrice;
    item.effectivePrice = raw.effectivePrice;
    item.quantity = raw.quantity;
    item.subtotal = raw.subtotal;
    item.discount = raw.discount ?? 0;
    item.comboInstanceId = raw.comboInstanceId ?? null;
    item.comboId = raw.comboId?.toString() ?? null;
    item.comboName = raw.comboName ?? null;
    item.flashSaleId = raw.flashSaleId?.toString() ?? null;
    item.flashSaleName = raw.flashSaleName ?? null;
    item.productDiscountId = raw.productDiscountId?.toString() ?? null;
    item.productDiscountName = raw.productDiscountName ?? null;
    item.isAvailable = raw.isAvailable ?? true;
    item.unavailableReason = raw.unavailableReason ?? null;
    item.discountDetails =
      raw.discountDetails?.map((d) => this.itemDiscountDetailToDomain(d)) ??
      null;
    item.isGift = raw.isGift ?? false;
    item.giftPromotionId = raw.giftPromotionId ?? null;
    return item;
  }

  static itemDiscountDetailToDomain(
    raw: CheckoutSessionItemDiscountDetailSchemaClass,
  ): CheckoutSessionItemDiscountDetail {
    const detail = new CheckoutSessionItemDiscountDetail();
    detail.type = raw.type;
    detail.referenceId = raw.referenceId;
    detail.referenceName = raw.referenceName;
    detail.discountType = raw.discountType;
    detail.discountValue = raw.discountValue;
    detail.discountAmountPerUnit = raw.discountAmountPerUnit;
    detail.discountAmount = raw.discountAmount;
    return detail;
  }

  static comboInstanceToDomain(
    raw: CheckoutSessionComboInstanceSchemaClass,
  ): CheckoutSessionComboInstance {
    const ci = new CheckoutSessionComboInstance();
    ci.comboInstanceId = raw.comboInstanceId;
    ci.comboId = raw.comboId.toString();
    ci.comboName = raw.comboName;
    ci.discountType = raw.discountType;
    ci.discountValue = raw.discountValue;
    ci.originalPrice = raw.originalPrice;
    ci.discountAmount = raw.discountAmount;
    return ci;
  }

  static discountDetailToDomain(
    raw: CheckoutSessionDiscountDetailSchemaClass,
  ): CheckoutSessionDiscountDetail {
    const detail = new CheckoutSessionDiscountDetail();
    detail.type = raw.type;
    detail.referenceId = raw.referenceId;
    detail.referenceName = raw.referenceName;
    detail.instanceId = raw.instanceId ?? null;
    detail.discountType = raw.discountType;
    detail.discountValue = raw.discountValue;
    detail.discountAmount = raw.discountAmount;
    return detail;
  }

  static shippingToDomain(
    raw: CheckoutSessionShippingSchemaClass,
  ): CheckoutSessionShipping {
    const shipping = new CheckoutSessionShipping();
    shipping.fee = raw.fee;
    shipping.depotId = raw.depotId ?? null;
    shipping.depotName = raw.depotName ?? null;
    shipping.carrierId = raw.carrierId ?? null;
    shipping.carrierName = raw.carrierName ?? null;
    shipping.serviceId = raw.serviceId ?? null;
    shipping.carrierType = (raw.carrierType as 1 | 2 | 3) ?? null;
    shipping.accountId = raw.accountId ?? null;
    shipping.serviceCode = raw.serviceCode ?? null;
    shipping.shopId = raw.shopId ?? null;
    return shipping;
  }

  static shippingPromotionToDomain(
    raw: CheckoutSessionShippingPromotionSchemaClass,
  ): CheckoutSessionShippingPromotion {
    const sp = new CheckoutSessionShippingPromotion();
    sp.id = raw.id.toString();
    sp.name = raw.name;
    sp.type = raw.type;
    sp.discountAmount = raw.discountAmount;
    return sp;
  }

  /**
   * Convert domain entity to Mongoose document
   */
  static toDocument(domain: CheckoutSession): CheckoutSessionSchemaClass {
    const doc = new CheckoutSessionSchemaClass();

    if (domain.id) {
      doc._id = domain.id;
    }

    doc.sessionNumber = domain.sessionNumber;

    if (domain.userId) {
      doc.userId = new mongoose.Types.ObjectId(domain.userId);
    }

    doc.sessionId = domain.sessionId;

    if (domain.customer) {
      doc.customer = this.customerToDocument(domain.customer);
    }

    if (domain.shippingAddress) {
      doc.shippingAddress = this.addressToDocument(domain.shippingAddress);
    }

    doc.items = domain.items?.map((item) => this.itemToDocument(item)) ?? [];
    doc.comboInstances =
      domain.comboInstances?.map((ci) => this.comboInstanceToDocument(ci)) ??
      [];
    doc.subtotal = domain.subtotal;
    doc.shippingFee = domain.shippingFee;
    doc.discount = domain.discount ?? 0;
    doc.discountDetails =
      domain.discountDetails?.map((d) => this.discountDetailToDocument(d)) ??
      [];
    doc.appliedVouchers =
      domain.appliedVouchers?.map((v) => this.voucherToDocument(v)) ?? [];
    doc.totalDiscount = domain.totalDiscount ?? 0;
    doc.shippingDiscount = domain.shippingDiscount ?? 0;

    if (domain.shippingPromotion) {
      doc.shippingPromotion = this.shippingPromotionToDocument(
        domain.shippingPromotion,
      );
    }

    if (domain.shipping) {
      doc.shipping = this.shippingToDocument(domain.shipping);
    }

    doc.total = domain.total;
    doc.paymentMethod = domain.paymentMethod ?? undefined;
    doc.note = domain.note ?? undefined;
    doc.affiliateCode = domain.affiliateCode ?? undefined;
    doc.status = domain.status;
    doc.createdAt = domain.createdAt;
    doc.updatedAt = domain.updatedAt;
    doc.expiresAt = domain.expiresAt;

    if (domain.orderId) {
      doc.orderId = new mongoose.Types.ObjectId(domain.orderId);
    }
    doc.orderNumber = domain.orderNumber ?? undefined;

    return doc;
  }

  static customerToDocument(
    customer: CheckoutSessionCustomer,
  ): CheckoutSessionCustomerSchemaClass {
    const doc = new CheckoutSessionCustomerSchemaClass();
    doc.name = customer.name;
    doc.phone = customer.phone;
    doc.email = customer.email ?? undefined;
    return doc;
  }

  static addressToDocument(
    address: CheckoutSessionAddress,
  ): CheckoutSessionAddressSchemaClass {
    const doc = new CheckoutSessionAddressSchemaClass();
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

  static itemToDocument(
    item: CheckoutSessionItem,
  ): CheckoutSessionItemSchemaClass {
    const doc = new CheckoutSessionItemSchemaClass();
    doc.productId = new mongoose.Types.ObjectId(item.productId);
    if (item.variantId) {
      doc.variantId = new mongoose.Types.ObjectId(item.variantId);
    }
    doc.code = item.code;
    doc.name = item.name;
    doc.image = item.image ?? undefined;
    doc.originalPrice = item.originalPrice;
    doc.effectivePrice = item.effectivePrice;
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
    if (item.productDiscountId) {
      doc.productDiscountId = new mongoose.Types.ObjectId(
        item.productDiscountId,
      );
    }
    doc.productDiscountName = item.productDiscountName ?? undefined;
    doc.isAvailable = item.isAvailable ?? true;
    doc.unavailableReason = item.unavailableReason ?? undefined;
    doc.discountDetails =
      item.discountDetails?.map((d) => this.itemDiscountDetailToDocument(d)) ??
      undefined;
    doc.isGift = item.isGift ?? undefined;
    doc.giftPromotionId = item.giftPromotionId ?? undefined;
    return doc;
  }

  static itemDiscountDetailToDocument(
    detail: CheckoutSessionItemDiscountDetail,
  ): CheckoutSessionItemDiscountDetailSchemaClass {
    const doc = new CheckoutSessionItemDiscountDetailSchemaClass();
    doc.type = detail.type;
    doc.referenceId = detail.referenceId;
    doc.referenceName = detail.referenceName;
    doc.discountType = detail.discountType;
    doc.discountValue = detail.discountValue;
    doc.discountAmountPerUnit = detail.discountAmountPerUnit;
    doc.discountAmount = detail.discountAmount;
    return doc;
  }

  static comboInstanceToDocument(
    ci: CheckoutSessionComboInstance,
  ): CheckoutSessionComboInstanceSchemaClass {
    const doc = new CheckoutSessionComboInstanceSchemaClass();
    doc.comboInstanceId = ci.comboInstanceId;
    doc.comboId = new mongoose.Types.ObjectId(ci.comboId);
    doc.comboName = ci.comboName;
    doc.discountType = ci.discountType;
    doc.discountValue = ci.discountValue;
    doc.originalPrice = ci.originalPrice;
    doc.discountAmount = ci.discountAmount;
    return doc;
  }

  static discountDetailToDocument(
    detail: CheckoutSessionDiscountDetail,
  ): CheckoutSessionDiscountDetailSchemaClass {
    const doc = new CheckoutSessionDiscountDetailSchemaClass();
    doc.type = detail.type;
    doc.referenceId = detail.referenceId;
    doc.referenceName = detail.referenceName;
    doc.instanceId = detail.instanceId ?? undefined;
    doc.discountType = detail.discountType;
    doc.discountValue = detail.discountValue;
    doc.discountAmount = detail.discountAmount;
    return doc;
  }

  static shippingToDocument(
    shipping: CheckoutSessionShipping,
  ): CheckoutSessionShippingSchemaClass {
    const doc = new CheckoutSessionShippingSchemaClass();
    doc.fee = shipping.fee;
    doc.depotId = shipping.depotId ?? undefined;
    doc.depotName = shipping.depotName ?? undefined;
    doc.carrierId = shipping.carrierId ?? undefined;
    doc.carrierName = shipping.carrierName ?? undefined;
    doc.serviceId = shipping.serviceId ?? undefined;
    doc.carrierType = shipping.carrierType ?? undefined;
    doc.accountId = shipping.accountId ?? undefined;
    doc.serviceCode = shipping.serviceCode ?? undefined;
    doc.shopId = shipping.shopId ?? undefined;
    return doc;
  }

  static shippingPromotionToDocument(
    sp: CheckoutSessionShippingPromotion,
  ): CheckoutSessionShippingPromotionSchemaClass {
    const doc = new CheckoutSessionShippingPromotionSchemaClass();
    doc.id = new mongoose.Types.ObjectId(sp.id);
    doc.name = sp.name;
    doc.type = sp.type;
    doc.discountAmount = sp.discountAmount;
    return doc;
  }

  static voucherToDomain(
    raw: CheckoutSessionVoucherSchemaClass,
  ): CheckoutSessionVoucher {
    const voucher = new CheckoutSessionVoucher();
    voucher.code = raw.code;
    voucher.name = raw.name;
    voucher.source = raw.source;
    voucher.id = raw.id ?? undefined;
    voucher.discountAmount = raw.discountAmount;
    voucher.discountType = raw.discountType ?? undefined;
    voucher.discountValue = raw.discountValue ?? undefined;
    voucher.minimumOrderValue = raw.minimumOrderValue ?? undefined;
    voucher.maxDiscountValue = raw.maxDiscountValue ?? undefined;
    voucher.notApplicableWithOtherPromotions =
      raw.notApplicableWithOtherPromotions ?? undefined;
    voucher.eligibleProductIds = raw.eligibleProductIds ?? undefined;
    return voucher;
  }

  static voucherToDocument(
    voucher: CheckoutSessionVoucher,
  ): CheckoutSessionVoucherSchemaClass {
    const doc = new CheckoutSessionVoucherSchemaClass();
    doc.code = voucher.code;
    doc.name = voucher.name;
    doc.source = voucher.source;
    doc.id = voucher.id ?? undefined;
    doc.discountAmount = voucher.discountAmount;
    doc.discountType = voucher.discountType ?? undefined;
    doc.discountValue = voucher.discountValue ?? undefined;
    doc.minimumOrderValue = voucher.minimumOrderValue ?? undefined;
    doc.maxDiscountValue = voucher.maxDiscountValue ?? undefined;
    doc.notApplicableWithOtherPromotions =
      voucher.notApplicableWithOtherPromotions ?? undefined;
    doc.eligibleProductIds = voucher.eligibleProductIds ?? undefined;
    return doc;
  }
}
