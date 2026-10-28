import { OrderNhanhMapper } from '../../../src/nhanh/mappers/order-nhanh.mapper';
import {
  NhanhSendCarrierType,
  NhanhOrderType,
  CARRIER_TYPE_SELF_SHIP,
} from '../../../src/nhanh/dto/nhanh-order.dto';
import { NhanhOrderStatus } from '../../../src/nhanh/enums/nhanh-order-status.enum';
import { OrderShippingCarrier } from '../../../src/shop/order/domain/order';
import { CheckoutSessionShipping } from '../../../src/shop/checkout/domain/checkout-session';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../../src/shop/order/domain/order.enums';
import { Order } from '../../../src/shop/order/domain/order';
import {
  createOrder,
  resetFactoryCounters,
} from '../../helpers/domain-factories';

/** Map every item in the order to a Nhanh product id so none get skipped. */
function nhanhIdsFor(order: Order, nhanhId = 999): Map<string, number> {
  return new Map(
    order.items.map((item) => [item.variantId ?? item.productId, nhanhId]),
  );
}

function makeSessionShipping(
  overrides: Partial<CheckoutSessionShipping> = {},
): CheckoutSessionShipping {
  const shipping = new CheckoutSessionShipping();
  shipping.fee = 30000;
  shipping.depotId = 100;
  shipping.depotName = 'Test Depot';
  shipping.carrierId = 2;
  shipping.carrierName = 'Viettel Post';
  shipping.carrierType = 1;
  shipping.serviceId = 190;
  shipping.serviceCode = 'ECOD';
  shipping.accountId = 0;
  shipping.shopId = null;
  return Object.assign(shipping, overrides);
}

function makeOrderShippingCarrier(
  overrides: Partial<OrderShippingCarrier> = {},
): OrderShippingCarrier {
  const carrier = new OrderShippingCarrier();
  carrier.carrierId = 2;
  carrier.carrierName = 'Viettel Post';
  carrier.carrierType = 1;
  carrier.serviceId = 190;
  carrier.serviceCode = 'ECOD';
  carrier.accountId = 0;
  carrier.shopId = null;
  return Object.assign(carrier, overrides);
}

describe('OrderNhanhMapper', () => {
  beforeEach(() => {
    resetFactoryCounters();
  });

  describe('toNhanhRequest — info / channel / address sections', () => {
    it('should build base sections from order data', () => {
      const order = createOrder({ depotId: 100, note: 'Please call ahead' });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.info).toEqual({
        type: NhanhOrderType.HOME_DELIVERY,
        status: NhanhOrderStatus.WAITING_CUSTOMER_CONFIRMATION,
        depotId: 100,
        description: 'Please call ahead',
        privateDescription: '[CHƯA THANH TOÁN] COD - Thu hộ 229.000đ',
      });
      expect(payload.channel.appOrderId).toBe(order.orderNumber);
      expect(payload.channel.sourceName).toBe('CCHAT Website');
      expect(payload.shippingAddress.locationVersion).toBe('v1');
    });
  });

  describe('toNhanhRequest — carrier section, type 1 (NHANH_CONNECTION)', () => {
    it('should use session shipping when provided', () => {
      const order = createOrder({ shippingFee: 30000, shippingDiscount: 0 });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);
      const shipping = makeSessionShipping();

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        shipping,
      );

      expect(payload.carrier).toEqual({
        sendCarrierType: NhanhSendCarrierType.NHANH_CONNECTION,
        id: 2,
        serviceId: 190,
        customerShipFee: 30000,
      });
    });

    it('should fall back to order.shippingCarrier when shipping is missing (retry case)', () => {
      const order = createOrder({
        shippingFee: 30000,
        shippingDiscount: 0,
        shippingCarrier: makeOrderShippingCarrier(),
      });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.carrier).toEqual({
        sendCarrierType: NhanhSendCarrierType.NHANH_CONNECTION,
        id: 2,
        serviceId: 190,
        customerShipFee: 30000,
      });
    });

    it('should subtract shippingDiscount from customerShipFee', () => {
      const order = createOrder({
        shippingFee: 30000,
        shippingDiscount: 10000,
        shippingCarrier: makeOrderShippingCarrier(),
      });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.carrier?.customerShipFee).toBe(20000);
    });
  });

  describe('toNhanhRequest — carrier section, type 2 (SHOP_ACCOUNT)', () => {
    it('should use serviceCode + accountId from session shipping', () => {
      const order = createOrder({ shippingFee: 25000, shippingDiscount: 0 });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);
      const shipping = makeSessionShipping({
        carrierType: 2,
        serviceCode: 'EXPRESS',
        accountId: 42,
        shopId: '123',
        serviceId: null,
      });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        shipping,
      );

      expect(payload.carrier).toEqual({
        sendCarrierType: NhanhSendCarrierType.SHOP_ACCOUNT,
        id: 2,
        serviceCode: 'EXPRESS',
        accountId: 42,
        shopId: 123,
        customerShipFee: 25000,
      });
    });

    it('should fall back to order.shippingCarrier snapshot for type 2', () => {
      const order = createOrder({
        shippingFee: 25000,
        shippingDiscount: 0,
        shippingCarrier: makeOrderShippingCarrier({
          carrierType: 2,
          serviceCode: 'EXPRESS',
          accountId: 42,
          shopId: '123',
          serviceId: null,
        }),
      });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.carrier).toEqual({
        sendCarrierType: NhanhSendCarrierType.SHOP_ACCOUNT,
        id: 2,
        serviceCode: 'EXPRESS',
        accountId: 42,
        shopId: 123,
        customerShipFee: 25000,
      });
    });
  });

  describe('toNhanhRequest — carrier section, type 3 (SELF_SHIP / TVC)', () => {
    it('should build self-ship carrier (id 12 + serviceId, no sendCarrierType) from session shipping', () => {
      const order = createOrder({ shippingFee: 20000, shippingDiscount: 0 });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);
      const shipping = makeSessionShipping({
        carrierType: CARRIER_TYPE_SELF_SHIP,
        carrierId: 12,
        carrierName: 'Tự Vận Chuyển',
        serviceId: 25,
        serviceCode: null,
        accountId: 0,
        shopId: null,
      });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        shipping,
      );

      expect(payload.carrier).toEqual({
        id: 12,
        serviceId: 25,
        customerShipFee: 20000,
      });
      // Self-ship must NOT send sendCarrierType — Nhanh creates no carrier shipment
      expect(payload.carrier).not.toHaveProperty('sendCarrierType');
    });

    it('should build self-ship from order.shippingCarrier snapshot (retry case)', () => {
      const order = createOrder({
        shippingFee: 20000,
        shippingDiscount: 0,
        shippingCarrier: makeOrderShippingCarrier({
          carrierType: CARRIER_TYPE_SELF_SHIP,
          carrierId: 12,
          carrierName: 'Tự Vận Chuyển',
          serviceId: 25,
          serviceCode: null,
          accountId: 0,
          shopId: null,
        }),
      });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.carrier).toEqual({
        id: 12,
        serviceId: 25,
        customerShipFee: 20000,
      });
      expect(payload.carrier).not.toHaveProperty('sendCarrierType');
    });

    it('should subtract shippingDiscount from self-ship customerShipFee', () => {
      const order = createOrder({
        shippingFee: 20000,
        shippingDiscount: 5000,
        shippingCarrier: makeOrderShippingCarrier({
          carrierType: CARRIER_TYPE_SELF_SHIP,
          carrierId: 12,
          serviceId: 25,
          serviceCode: null,
        }),
      });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.carrier?.customerShipFee).toBe(15000);
    });
  });

  describe('toNhanhRequest — carrier section, no source', () => {
    it('should omit carrier id when neither session shipping nor order snapshot has carrierId', () => {
      const order = createOrder({
        shippingFee: 30000,
        shippingDiscount: 0,
        shippingCarrier: null,
      });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.carrier).toEqual({ customerShipFee: 30000 });
    });

    it('should omit carrier id when shipping has no carrierId and order has no snapshot', () => {
      const order = createOrder({
        shippingFee: 30000,
        shippingDiscount: 0,
        shippingCarrier: null,
      });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);
      const shipping = makeSessionShipping({ carrierId: null });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        shipping,
      );

      expect(payload.carrier).toEqual({ customerShipFee: 30000 });
    });
  });

  describe('toNhanhRequest — carrier priority', () => {
    it('should prefer session shipping over order.shippingCarrier when both are present', () => {
      const order = createOrder({
        shippingFee: 30000,
        shippingDiscount: 0,
        shippingCarrier: makeOrderShippingCarrier({
          carrierId: 999,
          serviceId: 888,
        }),
      });
      const productNhanhIds = new Map<string, number>([
        [order.items[0].productId, 999],
      ]);
      const shipping = makeSessionShipping({ carrierId: 2, serviceId: 190 });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        shipping,
      );

      expect(payload.carrier?.id).toBe(2);
      expect(
        (payload.carrier as { serviceId?: number } | undefined)?.serviceId,
      ).toBe(190);
    });
  });

  describe('toNhanhRequest — products mapping', () => {
    it('should map order items via their Nhanh product IDs', () => {
      const order = createOrder();
      const item = order.items[0];
      const productNhanhIds = new Map<string, number>([[item.productId, 555]]);

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.products).toEqual([
        { id: 555, price: item.price, quantity: item.quantity },
      ]);
    });

    it('should skip items missing from the Nhanh product ID map', () => {
      const order = createOrder();
      const productNhanhIds = new Map<string, number>();

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        productNhanhIds,
        null,
      );

      expect(payload.products).toEqual([]);
    });
  });

  describe('toNhanhRequest — payment section, prepaid orders', () => {
    it.each([
      [PaymentMethod.ONEPAY_DOMESTIC, 'ATM nội địa'],
      [PaymentMethod.ONEPAY_INTERCARD, 'Thẻ quốc tế'],
      [PaymentMethod.INFOCMS_VIETQR, 'VietQR'],
      [PaymentMethod.BANK_TRANSFER, 'Chuyển khoản'],
    ])(
      'should declare the paid total as transferAmount for %s once payment is confirmed',
      (paymentMethod, label) => {
        const order = createOrder({
          total: 229000,
          paymentMethod,
          paymentStatus: PaymentStatus.PAID,
        });

        const payload = OrderNhanhMapper.toNhanhRequest(
          order,
          nhanhIdsFor(order),
          null,
        );

        // Nhanh derives COD as (total - transferAmount), so this drives COD to 0
        expect(payload.payment).toEqual({ transferAmount: 229000 });
        expect(payload.info?.privateDescription).toBe(
          `[ĐÃ THANH TOÁN ONLINE] ${label} - 229.000đ - KHÔNG thu thêm tiền của khách`,
        );
      },
    );

    it('should send both transferAmount and the order-level discount when the paid order had a discount', () => {
      const order = createOrder({
        total: 179000,
        discount: 50000,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.ONEPAY_DOMESTIC,
      });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        nhanhIdsFor(order),
        null,
      );

      expect(payload.payment).toEqual({
        transferAmount: 179000,
        discountAmount: 50000,
        discountType: 'cash',
      });
    });

    it('should declare the total net of shipping discount, matching what Nhanh computes', () => {
      // Nhanh money = sum(price * qty) + customerShipFee - discountAmount.
      // customerShipFee is already net of shippingDiscount, so declaring
      // order.total must leave exactly zero to collect.
      const order = createOrder({
        subtotal: 199000,
        shippingFee: 30000,
        shippingDiscount: 10000,
        discount: 0,
        total: 219000,
        paymentStatus: PaymentStatus.PAID,
        shippingCarrier: makeOrderShippingCarrier(),
      });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        nhanhIdsFor(order, 555),
        null,
      );

      const item = order.items[0];
      const nhanhComputedTotal =
        item.price * item.quantity + payload.carrier!.customerShipFee!;

      expect(payload.carrier?.customerShipFee).toBe(20000);
      expect(payload.payment?.transferAmount).toBe(nhanhComputedTotal);
    });
  });

  describe('toNhanhRequest — payment section, unpaid orders', () => {
    it('should omit the payment section entirely for a plain COD order', () => {
      const order = createOrder({
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.PENDING,
        discount: 0,
      });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        nhanhIdsFor(order),
        null,
      );

      expect(payload.payment).toBeUndefined();
      expect(payload.info?.privateDescription).toBe(
        '[CHƯA THANH TOÁN] COD - Thu hộ 229.000đ',
      );
    });

    it('should keep the discount-only payment section unchanged for an unpaid order', () => {
      const order = createOrder({
        discount: 50000,
        paymentStatus: PaymentStatus.PENDING,
      });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        nhanhIdsFor(order),
        null,
      );

      expect(payload.payment).toEqual({
        discountAmount: 50000,
        discountType: 'cash',
      });
      expect(payload.payment).not.toHaveProperty('transferAmount');
    });

    it.each([
      [PaymentStatus.PENDING, 'awaiting confirmation'],
      [PaymentStatus.FAILED, 'gateway declined'],
      [PaymentStatus.REFUNDED, 'money returned to customer'],
    ])(
      'should still collect on delivery for an online order whose payment is %s (%s)',
      (paymentStatus) => {
        const order = createOrder({
          paymentMethod: PaymentMethod.ONEPAY_DOMESTIC,
          paymentStatus,
          discount: 0,
        });

        const payload = OrderNhanhMapper.toNhanhRequest(
          order,
          nhanhIdsFor(order),
          null,
        );

        expect(payload.payment).toBeUndefined();
        expect(payload.info?.privateDescription).toBe(
          '[CHƯA THANH TOÁN] ATM nội địa - Thu hộ 229.000đ',
        );
      },
    );

    it('should treat an unconfirmed manual bank transfer as collect-on-delivery', () => {
      const order = createOrder({
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentStatus: PaymentStatus.PENDING,
        discount: 0,
      });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        nhanhIdsFor(order),
        null,
      );

      expect(payload.payment).toBeUndefined();
      expect(payload.info?.privateDescription).toBe(
        '[CHƯA THANH TOÁN] Chuyển khoản - Thu hộ 229.000đ',
      );
    });
  });

  describe('toNhanhRequest — payment note', () => {
    it('should keep the customer note and the payment note in separate fields', () => {
      const order = createOrder({
        note: 'Giao giờ hành chính',
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.INFOCMS_VIETQR,
      });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        nhanhIdsFor(order),
        null,
      );

      // description is the customer's own note and must stay untouched — it is
      // the field that can reach the shipping label.
      expect(payload.info?.description).toBe('Giao giờ hành chính');
      expect(payload.info?.privateDescription).toContain(
        '[ĐÃ THANH TOÁN ONLINE]',
      );
    });

    it('should still label the payment state when the order has no customer note', () => {
      const order = createOrder({ note: null });

      const payload = OrderNhanhMapper.toNhanhRequest(
        order,
        nhanhIdsFor(order),
        null,
      );

      expect(payload.info?.description).toBeUndefined();
      expect(payload.info?.privateDescription).toBe(
        '[CHƯA THANH TOÁN] COD - Thu hộ 229.000đ',
      );
    });
  });
});
