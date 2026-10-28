import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../config/config.type';
import {
  ONEPAY_COMMAND,
  ONEPAY_CURRENCY,
  ONEPAY_LOCALE,
  ONEPAY_PAYMENT_URL,
  ONEPAY_RETURN_PATH,
  ONEPAY_VERSION,
} from './onepay.constants';
import {
  generateMerchTxnRef,
  generateSecureHash,
  extractOrderNumber,
  verifySecureHash,
} from './onepay.utils';
import { Order, PaymentEventStatus } from '../../shop/order/domain/order';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../shop/order/domain/order.enums';
import { OrderRepository } from '../../shop/order/domain/order.repository';
import { CheckoutPaymentHandlerService } from '../../shop/checkout/checkout-payment-handler.service';

export interface OnepayIpnResult {
  success: boolean;
  orderNumber?: string;
  message: string;
}

@Injectable()
export class OnepayService {
  private readonly logger = new Logger(OnepayService.name);
  private readonly merchantId: string;
  private readonly accessCode: string;
  private readonly hashCode: string;
  private readonly backendDomain: string;
  private readonly websiteDomain: string;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly orderRepository: OrderRepository,
    private readonly checkoutPaymentHandlerService: CheckoutPaymentHandlerService,
  ) {
    this.merchantId = this.configService.getOrThrow('onepay.merchantId', {
      infer: true,
    });
    this.accessCode = this.configService.getOrThrow('onepay.accessCode', {
      infer: true,
    });
    this.hashCode = this.configService.getOrThrow('onepay.hashCode', {
      infer: true,
    });
    this.backendDomain = this.configService.getOrThrow('app.backendDomain', {
      infer: true,
    });
    this.websiteDomain = this.configService.getOrThrow('app.websiteDomain', {
      infer: true,
    });
  }

  /**
   * Get card list based on payment method
   */
  private getCardListFromPaymentMethod(paymentMethod: PaymentMethod): string {
    if (paymentMethod === PaymentMethod.ONEPAY_INTERCARD) {
      return 'INTERCARD';
    }
    if (paymentMethod === PaymentMethod.ONEPAY_DOMESTIC) {
      return 'DOMESTIC';
    }
    // Fallback: both card types
    return 'INTERCARD,DOMESTIC';
  }

  /**
   * Create payment URL for OnePay redirect
   */
  async createPaymentUrl(
    order: Order,
    clientIp: string,
    locale?: string,
  ): Promise<string> {
    const merchTxnRef = generateMerchTxnRef(order.orderNumber);
    const amount = Math.round(order.total * 100); // OnePay expects amount in cents

    const params: Record<string, string> = {
      vpc_Version: ONEPAY_VERSION,
      vpc_Currency: ONEPAY_CURRENCY,
      vpc_Command: ONEPAY_COMMAND,
      vpc_AccessCode: this.accessCode,
      vpc_Merchant: this.merchantId,
      vpc_Locale: locale || ONEPAY_LOCALE,
      vpc_ReturnURL: `${this.backendDomain}${ONEPAY_RETURN_PATH}`,
      vpc_MerchTxnRef: merchTxnRef,
      vpc_OrderInfo: `Payment for order ${order.orderNumber}`,
      vpc_Amount: amount.toString(),
      vpc_TicketNo: clientIp,
      vpc_CardList: this.getCardListFromPaymentMethod(order.paymentMethod),
    };

    // IPN callback is optional - payment is processed via return URL redirect
    // params['vpc_CallbackURL'] = `${this.backendDomain}${ONEPAY_IPN_PATH}`;

    // Generate secure hash and build payment URL
    const hash = generateSecureHash(params, this.hashCode);
    params['vpc_SecureHash'] = hash;
    params['vpc_SecureHashType'] = 'SHA256';

    const query = new URLSearchParams(params).toString();
    const paymentUrl = `${ONEPAY_PAYMENT_URL}?${query}`;

    // Record payment initiated event
    await this.orderRepository.addPaymentEvent(order.id, {
      status: PaymentEventStatus.INITIATED,
      timestamp: new Date(),
      amount: order.total,
      ref: merchTxnRef,
    });

    return paymentUrl;
  }

  /**
   * Process IPN callback from OnePay
   */
  async processIpnCallback(
    params: Record<string, string>,
  ): Promise<OnepayIpnResult> {
    this.logger.log('Processing OnePay IPN callback');
    this.logger.debug('IPN params:', JSON.stringify(params));

    // Verify secure hash
    if (!verifySecureHash(params, this.hashCode)) {
      this.logger.warn('Invalid secure hash in IPN callback');
      return {
        success: false,
        message: 'Invalid secure hash',
      };
    }

    // Extract order number from merchant transaction reference
    const merchTxnRef = params['vpc_MerchTxnRef'];
    const orderNumber = extractOrderNumber(merchTxnRef);

    if (!orderNumber) {
      this.logger.warn('Could not extract order number from merchTxnRef');
      return {
        success: false,
        message: 'Invalid merchant transaction reference',
      };
    }

    // Find order
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      this.logger.warn(`Order not found: ${orderNumber}`);
      return {
        success: false,
        orderNumber,
        message: 'Order not found',
      };
    }

    // Idempotency: Skip if already processed
    if (order.paymentStatus !== PaymentStatus.PENDING) {
      this.logger.log(
        `Order ${orderNumber} already processed with status: ${order.paymentStatus}`,
      );
      return {
        success: true,
        orderNumber,
        message: 'Order already processed',
      };
    }

    // Check transaction response code
    const txnResponseCode = params['vpc_TxnResponseCode'];
    const isSuccess = txnResponseCode === '0';

    this.logger.log(
      `Processing payment ${isSuccess ? 'success' : 'failure'} for order ${orderNumber}`,
    );

    // Record payment event (also updates paymentStatus atomically)
    const updatedOrder = await this.orderRepository.addPaymentEvent(order.id, {
      status: isSuccess
        ? PaymentEventStatus.SUCCESS
        : PaymentEventStatus.FAILED,
      timestamp: new Date(),
      amount: params['vpc_Amount']
        ? parseInt(params['vpc_Amount'], 10) / 100
        : null,
      ref: params['vpc_TransactionNo'],
      code: txnResponseCode,
      message: params['vpc_Message'],
    });

    if (!updatedOrder) {
      return { success: false, orderNumber, message: 'Failed to update order' };
    }

    // Handle post-payment actions
    if (isSuccess) {
      this.checkoutPaymentHandlerService
        .handlePaymentSuccess(updatedOrder)
        .catch((err) => {
          this.logger.error(
            `Failed to handle payment success for order ${orderNumber}: ${err.message}`,
          );
        });
    } else {
      this.checkoutPaymentHandlerService.handlePaymentFailed(updatedOrder);
    }

    return {
      success: true,
      orderNumber,
      message: isSuccess
        ? 'Payment successful'
        : `Payment failed with code: ${txnResponseCode}`,
    };
  }

  /**
   * Verify return URL parameters
   */
  verifyReturnParams(params: Record<string, string>): {
    valid: boolean;
    orderNumber?: string;
    success?: boolean;
    responseCode?: string;
    message?: string;
  } {
    // Verify secure hash
    if (!verifySecureHash(params, this.hashCode)) {
      return {
        valid: false,
        message: 'Invalid signature',
      };
    }

    const merchTxnRef = params['vpc_MerchTxnRef'];
    const orderNumber = extractOrderNumber(merchTxnRef);
    const txnResponseCode = params['vpc_TxnResponseCode'];
    const success = txnResponseCode === '0';

    return {
      valid: true,
      orderNumber: orderNumber || undefined,
      success,
      responseCode: txnResponseCode,
      message: params['vpc_Message'] || undefined,
    };
  }
}
