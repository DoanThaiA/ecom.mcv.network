# Order Lifecycle

This document describes the actual order lifecycle in the backend codebase. It focuses on the events and external operations that change order status, and on the real integration points developers need to know.

## Core Order Statuses

These are the values defined in `src/shop/order/domain/order.enums.ts` and used in the order entity:

- `pending` — order record created, payment not yet finalized, waiting for confirmation.
- `confirmed` — order accepted by the external order system (`nhanh.vn`) and ready for processing.
- `processing` — packing / warehouse preparation stage as reported by `nhanh.vn`.
- `shipped` — order is out for delivery or return transit as reported by `nhanh.vn`.
- `delivered` — order delivery succeeded.
- `cancelled` — order was cancelled before or during fulfillment.
- `refunded` — order was returned/refunded by the external shipping provider.

> Note: This backend does not persist an internal `completed` order status. The final success state is `delivered`; refund/return state is `refunded`.

## Main state change sources

1. `CheckoutOrderService.placeOrder()` — create order record and set `pending`
2. `CheckoutPaymentHandlerService.handlePaymentSuccess()` / `handlePaymentFailed()` — payment gateway callback handling
3. `OnepayService.processIpnCallback()` / `InfocmsService` callback — online payment callback entry points
4. `OrderService.cancelOrder()` — customer-initiated cancellation
5. `OrderService.cleanupAbandonedOrder()` — abandoned payment or failed external setup
6. `NhanhWebhookService.handleOrderAddOrUpdate()` — external Nhanh.vn webhook updates order status
7. `NhanhWebhookService.handleOrderDelete()` — Nhanh deletes/cancels an order externally

## 1. Order creation (checkout flow)

### Trigger
- Customer submits checkout via `CheckoutOrderService.placeOrder()`.

### What happens in code
- Validate checkout session ownership and status.
- Validate cart items, inventory availability, product saleability, and flash sale eligibility.
- Generate a new `orderNumber` via `orderRepository.generateOrderNumber()`.
- Consume CDP vouchers with `checkoutVoucherService.consumeCdpVouchers()`.
- Create the order record with:
  - `status: OrderStatus.PENDING`
  - `paymentStatus: PaymentStatus.PENDING`
  - customer, shipping address, items, totals, discounts, affiliate data, and note
- For online payments, keep the order `pending` until payment callback.
- For offline payments, proceed to `completeOfflineOrder()`.

### External operations
- The order is persisted locally.
- No Nhanh status update has been applied yet.
- Checkout session may move to `PENDING_PAYMENT` or `COMPLETED` depending on payment method.

## 2. Offline payment path (COD / bank transfer)

### Trigger
- `CheckoutOrderService.placeOrder()` for offline payment methods.

### What happens in code
- `checkoutSessionRepository.markCompleted()` marks the checkout session complete.
- `clearSessionItemsFromCart()` removes the session items from the cart.
- `systemTasksService.queueIncrementFlashSaleSoldCount()` queues flash sale sold count updates.
- `orderTasksService.queueIncrementPromotionUsage()` queues promotion usage increments.
- `orderTasksService.queueSyncOrderCdp()` queues CDP order sync.
- `orderTasksService.queueSyncOrderNhanh()` queues Nhanh.vn order sync.
- `orderTasksService.queueCreateOrderConfirmation()` queues Zalo ZNS confirmation creation.
- If affiliate data exists and commission trigger is `ORDER_CREATION`, queue affiliate commission creation.

### External operations
- CDP and Nhanh sync jobs are queued.
- Zalo order confirmation is queued.
- Affiliate commission creation/status updates are queued.

### Important detail
- Local order status remains `pending` until Nhanh webhook updates it.
- Checkout session completion is separate from order fulfillment status.

## 3. Online payment path (OnePay / InfoCMS)

### Trigger
- Payment method is one of `ONEPAY_INTERCARD`, `ONEPAY_DOMESTIC`, or `INFOCMS_VIETQR`.

### What happens in code
- `checkoutSessionRepository.markPendingPayment()` marks the session `PENDING_PAYMENT` and saves `orderId`/`orderNumber`.
- For OnePay:
  - `onepayService.createPaymentUrl(order, clientIp)` returns a redirect URL.
- For InfoCMS:
  - `infocmsService.createPaymentQr(order)` returns QR payload.
  - The order is updated with `infocms.transactionUuid` and `infocms.ecollectionCd`.

### Failure handling
- If InfoCMS QR generation fails:
  - Checkout session is reset to `ACTIVE`.
  - `orderService.cleanupAbandonedOrder(order.id, 'QR code generation failed')` cancels the order.
  - Cancellation CDP sync and affiliate updates are queued.

### External operations
- Order is sent to OnePay or InfoCMS.
- Order status remains `pending` until payment callback or Nhanh status update.

## 4. Payment callback handling

### Trigger
- OnePay IPN callback received by `/api/v1/webhooks/onepay/ipn`.
- InfoCMS payment callback from the payment provider.

### What happens in code
- Payment service validates callback signature and extracts `orderNumber`.
- It loads the order and skips duplicate callbacks if `paymentStatus` is not `PENDING`.
- It records a payment event via `orderRepository.addPaymentEvent()`.
- On success, it calls `checkoutPaymentHandlerService.handlePaymentSuccess(order)`.
- On failure, it calls `checkoutPaymentHandlerService.handlePaymentFailed(order)`.

### Payment success actions
- Find checkout session by order ID.
- Mark the session `COMPLETED`.
- Clear session items from cart.
- Queue flash sale sold count increment.
- Queue promotion usage increment.
- Queue CDP sync.
- Queue Nhanh sync.
- Queue order confirmation token creation.
- Queue affiliate commission creation if `ORDER_CREATION` mode is enabled.
- Notify frontend via WebSocket.

### Payment failure actions
- Notify the client UI to refresh order data.
- Keep the checkout session in `PENDING_PAYMENT` so retry is possible.

### External operations
- The payment provider callback is the immediate trigger.
- CDP and Nhanh sync jobs are enqueued after success.
- UI clients are notified by socket events.

## 5. Nhanh.vn webhook order status updates

### Trigger
- Nhanh.vn posts webhook payload to the worker webhook endpoint.
- `NhanhWebhookService.handleOrderAddOrUpdate()` receives the payload.

### What happens in code
- Find the local order by `appOrderId` (`orderNumber`) or `nhanhId`.
- Update Nhanh sync metadata and tracking URL.
- Map the incoming Nhanh status to local `OrderStatus`.
- If status changed, update the order and run downstream syncs.

### Nhanh status mapping
- `NEW`, `CONFIRMING`, `WAITING_CUSTOMER_CONFIRMATION` => `pending`
- `CONFIRMED` => `confirmed`
- `PACKING`, `PACKED`, `WAITING_FOR_PICKUP`, `CHANGING_WAREHOUSE` => `processing`
- `SHIPPING`, `RETURNING` => `shipped`
- `SUCCESS` => `delivered`
- `FAILED`, `CARRIER_CANCELLED`, `CUSTOMER_CANCELLED`, `SYSTEM_CANCELLED`, `OUT_OF_STOCK` => `cancelled`
- `RETURNED`, `RETURN_CONFIRMED` => `refunded`

### Post-status-change operations
- If status becomes `delivered`:
  - call `orderCdpSyncService.syncOrderCompletion()`
  - create or update affiliate commission depending on `CommissionTrigger`
- If status becomes `cancelled`:
  - call `orderCdpSyncService.syncOrderCancellation()`
  - update affiliate commission status
- For any affiliate order, `queueUpdateAffiliateCommissionStatus()` runs when status changes.

### Order deletion handling
- `NhanhWebhookService.handleOrderDelete()` cancels the local order when Nhanh deletes it.
- It sets `status: cancelled` and `cancellationReason: 'Deleted on Nhanh.vn'`.
- It then syncs cancellation to CDP and updates affiliate commission status.

## 6. Customer cancellation

### Trigger
- `OrderService.cancelOrder()` is called by the cancellation endpoint.

### What happens in code
- Verify ownership by `userId` or `sessionId`.
- Only allow cancellation when local `order.status` is `pending` or `confirmed`.
- Update the order with:
  - `status: cancelled`
  - `cancelledAt: new Date()`
  - `cancellationReason`
- Queue CDP cancellation sync.
- Queue affiliate commission status update.

## 7. Abandoned order cleanup

### Trigger
- A checkout session with a pending online payment is replaced by a new checkout.
- InfoCMS QR generation fails during order placement.

### What happens in code
- `OrderService.cleanupAbandonedOrder()` updates `status: cancelled` and sets a cancellation reason.
- It queues CDP cancellation sync and affiliate commission status update.

## Notes for developers

- `status` and `paymentStatus` are separate:
  - `status` is fulfillment lifecycle state.
  - `paymentStatus` is payment lifecycle state.
- Nhanh.vn is the canonical source for fulfillment status transitions.
- `delivered` is the terminal success state for orders.
- `refunded` is the terminal return/refund state.
- Checkout session state (`ACTIVE`, `PENDING_PAYMENT`, `COMPLETED`) is separate from order state.
- Keep Nhanh status mapping in sync with `src/nhanh/services/nhanh-webhook.service.ts`.

## External integrations involved

- OnePay / InfoCMS for online payments
- Nhanh.vn for fulfillment/status sync
- CDP for order spending and customer data sync
- Zalo ZNS for order confirmation messages
- Affiliate commission service for referral orders
- Flash sale / promotion queues for sold count and usage tracking

> Use this document when changing checkout, payment, Nhanh sync, CDP sync, or order cancellation paths.
