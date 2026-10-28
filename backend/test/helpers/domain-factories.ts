import {
  Order,
  OrderItem,
  OrderCustomer,
  OrderAddress,
} from '../../src/shop/order/domain/order';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../src/shop/order/domain/order.enums';

/**
 * Lightweight domain-object factories for unit tests.
 *
 * They build just enough of each entity for mapping / sync logic — counters
 * keep ids stable and unique within a test run. Call `resetFactoryCounters()`
 * in `beforeEach` for deterministic ids.
 */

let orderCounter = 0;
let itemCounter = 0;

export function resetFactoryCounters(): void {
  orderCounter = 0;
  itemCounter = 0;
}

export function createOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  itemCounter += 1;
  const item = new OrderItem();
  item.productId = `product-${itemCounter}`;
  item.variantId = null;
  item.code = `SKU-${itemCounter}`;
  item.name = `Test Product ${itemCounter}`;
  item.image = null;
  item.price = 199000;
  item.quantity = 1;
  item.subtotal = 199000;
  item.discount = 0;
  item.originalPrice = 199000;
  item.discountDetails = null;
  item.isGift = false;
  return Object.assign(item, overrides);
}

export function createOrderCustomer(
  overrides: Partial<OrderCustomer> = {},
): OrderCustomer {
  const customer = new OrderCustomer();
  customer.name = 'Nguyen Van A';
  customer.phone = '0901234567';
  customer.email = null;
  return Object.assign(customer, overrides);
}

export function createOrderAddress(
  overrides: Partial<OrderAddress> = {},
): OrderAddress {
  const address = new OrderAddress();
  address.address = '123 Nguyen Hue';
  address.ward = 'Ben Nghe';
  address.district = 'District 1';
  address.city = 'Ho Chi Minh City';
  address.country = 'Vietnam';
  address.cityId = 79;
  address.districtId = 760;
  address.wardId = 26734;
  return Object.assign(address, overrides);
}

export function createOrder(overrides: Partial<Order> = {}): Order {
  orderCounter += 1;
  const order = new Order();
  order.id = `order-${orderCounter}`;
  order.orderNumber = `ORD-TEST-${orderCounter}`;
  order.userId = null;
  order.sessionId = `session-${orderCounter}`;
  order.customer = createOrderCustomer();
  order.shippingAddress = createOrderAddress();
  order.items = [createOrderItem()];
  order.subtotal = 199000;
  order.shippingFee = 30000;
  order.depotId = null;
  order.shippingCarrier = null;
  order.discount = 0;
  order.discountDetails = null;
  order.totalDiscount = 0;
  order.shippingDiscount = 0;
  order.shippingPromotionId = null;
  order.shippingPromotionName = null;
  order.total = 229000;
  order.paymentMethod = PaymentMethod.COD;
  order.paymentStatus = PaymentStatus.PENDING;
  order.note = null;
  order.affiliateId = null;
  order.affiliateCode = null;
  order.cdp = null;
  order.nhanh = null;
  order.infocms = null;
  order.paymentHistory = null;
  return Object.assign(order, overrides);
}
