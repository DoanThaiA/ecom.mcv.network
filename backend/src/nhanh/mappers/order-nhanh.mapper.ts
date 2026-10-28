import { Order } from '../../shop/order/domain/order';
import { CheckoutSessionShipping } from '../../shop/checkout/domain/checkout-session';
import {
  NhanhOrderAddRequestDto,
  NhanhOrderProduct,
  NhanhOrderCarrier,
  NhanhOrderPayment,
  NhanhSendCarrierType,
  NhanhOrderType,
  CARRIER_TYPE_SELF_SHIP,
} from '../dto/nhanh-order.dto';
import { NhanhOrderStatus } from '../enums/nhanh-order-status.enum';
import {
  PaymentStatus,
  getPaymentMethodLabel,
} from '../../shop/order/domain/order.enums';

/**
 * Mapper for converting Order domain entity to Nhanh.vn API request format
 */
export class OrderNhanhMapper {
  /**
   * Convert Order to Nhanh order add request payload
   * @param order - Order domain entity
   * @param productNhanhIds - Map of productId -> Nhanh product ID
   * @param shipping - Optional shipping info from checkout session
   * @returns Nhanh order add request DTO
   */
  static toNhanhRequest(
    order: Order,
    productNhanhIds: Map<string, number>,
    shipping?: CheckoutSessionShipping | null,
  ): NhanhOrderAddRequestDto {
    return {
      info: this.buildInfo(order),
      channel: this.buildChannel(order),
      shippingAddress: this.buildShippingAddress(order),
      carrier: this.buildCarrier(order, shipping),
      products: this.buildProducts(order, productNhanhIds),
      payment: this.buildPayment(order),
    };
  }

  /**
   * Build info section
   */
  private static buildInfo(order: Order) {
    return {
      type: NhanhOrderType.HOME_DELIVERY,
      status: NhanhOrderStatus.WAITING_CUSTOMER_CONFIRMATION,
      depotId: order.depotId ?? undefined,
      description: order.note ?? undefined,
      privateDescription: this.buildPaymentNote(order),
    };
  }

  /**
   * Build channel section
   */
  private static buildChannel(order: Order) {
    return {
      appOrderId: order.orderNumber,
      sourceName: 'CCHAT Website',
    };
  }

  /**
   * Build shipping address section
   * Use locationVersion v1 for 3-level address (city/district/ward)
   */
  private static buildShippingAddress(order: Order) {
    return {
      name: order.customer.name,
      mobile: order.customer.phone,
      email: order.customer.email ?? undefined,
      address: order.shippingAddress.address,
      cityId: order.shippingAddress.cityId ?? undefined,
      districtId: order.shippingAddress.districtId ?? undefined,
      wardId: order.shippingAddress.wardId ?? undefined,
      locationVersion: 'v1' as const,
    };
  }

  /**
   * Build carrier section.
   *
   * Carrier info is resolved with this priority:
   *   1. `shipping` param (from the live checkout session — initial sync via queue)
   *   2. `order.shippingCarrier` snapshot (persisted on the order — used when the
   *      session is no longer available, e.g. retry from CMS or late webhook)
   *
   * Without a source, the payload omits `id`/`serviceId` and Nhanh falls back
   * to its own default carrier, which is what previously caused orders to ship
   * via the wrong carrier on retry. The order snapshot closes that gap.
   *
   * Handles all carrier types:
   * - Type 3 (SELF_SHIP / TVC): Uses carrier id 12 + serviceId, no sendCarrierType
   * - Type 2 (SHOP_ACCOUNT): Uses serviceCode + accountId
   * - Type 1 (NHANH_CONNECTION): Uses serviceId
   */
  private static buildCarrier(
    order: Order,
    shipping?: CheckoutSessionShipping | null,
  ): NhanhOrderCarrier | undefined {
    const orderShippingFee = order.shippingFee - (order.shippingDiscount ?? 0);
    const carrierInfo = this.resolveCarrierInfo(order, shipping);

    if (!carrierInfo?.carrierId) {
      return {
        customerShipFee: orderShippingFee,
      };
    }

    if (carrierInfo.carrierType === CARRIER_TYPE_SELF_SHIP) {
      // Tự Vận Chuyển (self-delivery): the shop ships and collects COD itself.
      // No sendCarrierType is sent, so Nhanh creates no carrier shipment and
      // no NVN/NVS tracking code is generated.
      return {
        id: carrierInfo.carrierId,
        serviceId: carrierInfo.serviceId ?? undefined,
        customerShipFee: orderShippingFee,
      };
    }

    if (carrierInfo.carrierType === 2) {
      return {
        sendCarrierType: NhanhSendCarrierType.SHOP_ACCOUNT,
        id: carrierInfo.carrierId,
        serviceCode: carrierInfo.serviceCode ?? undefined,
        accountId: carrierInfo.accountId ?? undefined,
        shopId: carrierInfo.shopId ? Number(carrierInfo.shopId) : undefined,
        customerShipFee: orderShippingFee,
      };
    }

    return {
      sendCarrierType: NhanhSendCarrierType.NHANH_CONNECTION,
      id: carrierInfo.carrierId,
      serviceId: carrierInfo.serviceId ?? undefined,
      customerShipFee: orderShippingFee,
    };
  }

  /**
   * Resolve carrier info from session (preferred) or order snapshot (fallback).
   * Returns null if neither source has a usable carrierId.
   */
  private static resolveCarrierInfo(
    order: Order,
    shipping?: CheckoutSessionShipping | null,
  ): {
    carrierId: number;
    carrierType?: 1 | 2 | 3 | null;
    serviceId?: number | null;
    serviceCode?: string | null;
    accountId?: number | null;
    shopId?: string | null;
  } | null {
    if (shipping?.carrierId) {
      return {
        carrierId: shipping.carrierId,
        carrierType: shipping.carrierType ?? null,
        serviceId: shipping.serviceId ?? null,
        serviceCode: shipping.serviceCode ?? null,
        accountId: shipping.accountId ?? null,
        shopId: shipping.shopId ?? null,
      };
    }

    const snapshot = order.shippingCarrier;
    if (snapshot?.carrierId) {
      return {
        carrierId: snapshot.carrierId,
        carrierType: snapshot.carrierType ?? null,
        serviceId: snapshot.serviceId ?? null,
        serviceCode: snapshot.serviceCode ?? null,
        accountId: snapshot.accountId ?? null,
        shopId: snapshot.shopId ?? null,
      };
    }

    return null;
  }

  /**
   * Build products section
   */
  private static buildProducts(
    order: Order,
    productNhanhIds: Map<string, number>,
  ): NhanhOrderProduct[] {
    const products: NhanhOrderProduct[] = [];

    for (const item of order.items) {
      // Use variantId if present, otherwise use productId
      const lookupId = item.variantId ?? item.productId;
      const nhanhProductId = productNhanhIds.get(lookupId);

      if (!nhanhProductId) {
        // Skip items without Nhanh product ID
        // This will be logged by the sync service
        continue;
      }

      products.push({
        id: nhanhProductId,
        price: item.price,
        quantity: item.quantity,
      });
    }

    return products;
  }

  /**
   * Build payment section.
   *
   * For an order the customer has already paid for, the amount is reported to
   * Nhanh as `transferAmount`. Nhanh derives the cash-on-delivery amount as
   * (order total - depositAmount - transferAmount), so declaring the paid
   * amount drives COD to 0 and stops the carrier from collecting a second time.
   *
   * `order.total` is the right figure to declare because it is computed with
   * the same formula Nhanh applies to this payload:
   *   sum(item.price * quantity) + carrier.customerShipFee - discountAmount
   * (item-level discounts are already baked into `item.price`, and
   * `customerShipFee` is already net of `shippingDiscount`).
   */
  private static buildPayment(order: Order): NhanhOrderPayment | undefined {
    const payment: NhanhOrderPayment = {};

    if (this.isPrepaid(order)) {
      payment.transferAmount = order.total;
    }

    // Include discount if present
    if (order.discount && order.discount > 0) {
      payment.discountAmount = order.discount;
      payment.discountType = 'cash';
    }

    return Object.keys(payment).length > 0 ? payment : undefined;
  }

  /**
   * Build the internal payment note carried on the Nhanh order.
   *
   * Nhanh's order model has no payment-method field, so without this note a
   * prepaid web order looks identical to a COD one and staff cannot tell
   * whether the customer still owes money. The note goes to
   * `privateDescription` (internal customer-care note) rather than
   * `description`, so it never lands on the customer's shipping label and
   * never overwrites the note the customer wrote at checkout.
   *
   * @param order - Order being synced
   * @returns Human-readable Vietnamese payment note for shop staff
   */
  private static buildPaymentNote(order: Order): string {
    const method = getPaymentMethodLabel(order.paymentMethod);

    if (this.isPrepaid(order)) {
      return (
        `[ĐÃ THANH TOÁN ONLINE] ${method} - ${this.formatVnd(order.total)} - ` +
        `KHÔNG thu thêm tiền của khách`
      );
    }

    return `[CHƯA THANH TOÁN] ${method} - Thu hộ ${this.formatVnd(order.total)}`;
  }

  /**
   * Whether the customer has already paid for this order.
   *
   * Keyed on payment *status*, not payment method: an online method whose
   * gateway callback has not confirmed yet (or failed) is still unpaid, and a
   * manual bank transfer stays unpaid until someone confirms the money
   * arrived. Anything short of a confirmed payment is treated as collect-on-
   * delivery, which is the safe direction to be wrong in — the shop can refund
   * an over-collection, but cannot recover goods handed over for free.
   *
   * @param order - Order being synced
   * @returns True when payment is confirmed as received
   */
  private static isPrepaid(order: Order): boolean {
    return order.paymentStatus === PaymentStatus.PAID;
  }

  /**
   * Format an amount as Vietnamese currency, e.g. 229000 -> "229.000đ".
   */
  private static formatVnd(amount: number): string {
    return `${amount.toLocaleString('vi-VN')}đ`;
  }
}
