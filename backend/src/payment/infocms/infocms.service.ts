import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../config/config.type';
import {
  INFOCMS_API_URL,
  INFOCMS_API_VERSION_V2,
  INFOCMS_API_VERSION_V3,
  INFOCMS_LOGIN_PATH,
  INFOCMS_REFRESH_PATH,
  INFOCMS_CREATE_QR_PATH,
  INFOCMS_CANCEL_QR_PATH,
  INFOCMS_INQUIRY_RECV_PATH,
  INFOCMS_CALLBACK_PATH,
  INFOCMS_ACCESS_TOKEN_EXPIRY,
  INFOCMS_HEADER_TOKEN,
  INFOCMS_HEADER_CLIENT_ID,
  INFOCMS_HEADER_REQUEST_ID,
  INFOCMS_HEADER_BANK_CODE,
  INFOCMS_HEADER_AUTHORIZATION,
  INFOCMS_HEADER_AUTHORIZATION_PARAMS,
  INFOCMS_HEADER_RSA_SIGNATURE,
} from './infocms.constants';
import {
  generateHmacSignature,
  generateRsaSignature,
  generateRequestId,
  generateTransactionUuid,
  extractOrderNumberFromTransactionUuid,
  toBase64,
  isSuccessResponse,
  getErrorMessage,
  InfocmsBaseResponse,
  InfocmsLoginData,
  InfocmsCreateQrData,
  InfocmsCallbackData,
  InfocmsInquiryDataItem,
} from './infocms.utils';
import { Order, PaymentEventStatus } from '../../shop/order/domain/order';
import { OrderRepository } from '../../shop/order/domain/order.repository';
import { CheckoutPaymentHandlerService } from '../../shop/checkout/checkout-payment-handler.service';
import { PaymentStatus } from '../../shop/order/domain/order.enums';

export interface InfocmsQrResult {
  success: boolean;
  qrUrl?: string;
  qrData?: string;
  transactionUuid?: string;
  ecollectionCd?: string;
  motherAccountNo?: string;
  accountHolderNm?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface InfocmsCallbackResult {
  success: boolean;
  orderNumber?: string;
  message: string;
}

@Injectable()
export class InfocmsService {
  private readonly logger = new Logger(InfocmsService.name);

  // Configuration
  private readonly masterId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly bankCode: string;
  private readonly posUniqueId: string;
  private readonly privateKey: string;
  private readonly backendDomain: string;

  // Token cache
  private accessToken: string | null = null;
  private refreshIdx: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly orderRepository: OrderRepository,
    private readonly checkoutPaymentHandlerService: CheckoutPaymentHandlerService,
  ) {
    this.masterId =
      this.configService.get('infocms.masterId', { infer: true }) || '';
    this.clientId =
      this.configService.get('infocms.clientId', { infer: true }) || '';
    this.clientSecret =
      this.configService.get('infocms.clientSecret', { infer: true }) || '';
    this.bankCode =
      this.configService.get('infocms.bankCode', { infer: true }) || '';
    this.posUniqueId =
      this.configService.get('infocms.posUniqueId', { infer: true }) || '';
    this.privateKey =
      this.configService.get('infocms.privateKey', { infer: true }) || '';
    this.backendDomain = this.configService.getOrThrow('app.backendDomain', {
      infer: true,
    });
  }

  /**
   * Check if InfoCMS is configured
   */
  isConfigured(): boolean {
    return !!(
      this.masterId &&
      this.clientId &&
      this.clientSecret &&
      this.bankCode &&
      this.posUniqueId &&
      this.privateKey
    );
  }

  /**
   * Get valid access token (login or refresh if needed)
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    // Try to refresh if we have a refresh index
    if (this.refreshIdx) {
      try {
        await this.refreshToken();
        if (this.accessToken) {
          return this.accessToken;
        }
      } catch (error) {
        this.logger.warn('Token refresh failed, will login again', error);
      }
    }

    // Login to get new token
    await this.login();
    if (!this.accessToken) {
      throw new Error('Failed to obtain InfoCMS access token');
    }
    return this.accessToken;
  }

  /**
   * Login to InfoCMS and get access token
   */
  private async login(): Promise<void> {
    this.logger.log('Logging in to InfoCMS');

    const requestId = generateRequestId();
    const hmacSignature = generateHmacSignature(
      this.clientId,
      this.clientSecret,
    );

    const requestData = {
      masterId: this.masterId,
      clientId: this.clientId,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      [INFOCMS_HEADER_AUTHORIZATION]: hmacSignature,
      [INFOCMS_HEADER_AUTHORIZATION_PARAMS]: toBase64(this.clientId),
      [INFOCMS_HEADER_REQUEST_ID]: requestId,
      [INFOCMS_HEADER_BANK_CODE]: this.bankCode,
    };

    // For now, send data directly (PGP encryption would be added here)
    // In production, you would encrypt requestData with InfoCMS public key
    const body = { data: requestData };

    try {
      const url = `${INFOCMS_API_URL}/${INFOCMS_API_VERSION_V2}${INFOCMS_LOGIN_PATH}`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const result: InfocmsBaseResponse = await response.json();

      if (!isSuccessResponse(result.responseCd)) {
        throw new Error(getErrorMessage(result.responseCd, result.responseMsg));
      }

      // Parse response data (would need decryption in production)
      const data = result.data as unknown as InfocmsLoginData;
      this.accessToken = data.accessToken;
      this.refreshIdx = String(data.refreshIdx);
      this.tokenExpiresAt = Date.now() + INFOCMS_ACCESS_TOKEN_EXPIRY;

      this.logger.log('InfoCMS login successful');
    } catch (error) {
      this.logger.error('InfoCMS login failed', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<void> {
    this.logger.log('Refreshing InfoCMS token');

    if (!this.refreshIdx) {
      throw new Error('No refresh index available');
    }

    const requestId = generateRequestId();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      [INFOCMS_HEADER_REQUEST_ID]: requestId,
      [INFOCMS_HEADER_BANK_CODE]: this.bankCode,
    };

    const requestData = { refreshIdx: this.refreshIdx };
    const body = { data: requestData };

    try {
      const url = `${INFOCMS_API_URL}/${INFOCMS_API_VERSION_V2}${INFOCMS_REFRESH_PATH}`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const result: InfocmsBaseResponse = await response.json();

      if (!isSuccessResponse(result.responseCd)) {
        throw new Error(getErrorMessage(result.responseCd, result.responseMsg));
      }

      const data = result.data as unknown as InfocmsLoginData;
      this.accessToken = data.accessToken;
      this.refreshIdx = String(data.refreshIdx);
      this.tokenExpiresAt = Date.now() + INFOCMS_ACCESS_TOKEN_EXPIRY;

      this.logger.log('InfoCMS token refreshed');
    } catch (error) {
      this.logger.error('InfoCMS token refresh failed', error);
      // Clear tokens to force re-login
      this.accessToken = null;
      this.refreshIdx = null;
      throw error;
    }
  }

  /**
   * Build common headers for API requests
   * @param requestId - Unique request ID
   * @param body - Request body object for RSA signing
   */
  private async buildHeaders(
    requestId: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, string>> {
    const token = await this.getAccessToken();

    // Generate RSA signature for the request body
    const rsaSignature = generateRsaSignature(body, this.privateKey);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      [INFOCMS_HEADER_TOKEN]: token,
      [INFOCMS_HEADER_CLIENT_ID]: toBase64(this.clientId),
      [INFOCMS_HEADER_REQUEST_ID]: requestId,
      [INFOCMS_HEADER_BANK_CODE]: this.bankCode,
      [INFOCMS_HEADER_RSA_SIGNATURE]: rsaSignature,
    };

    return headers;
  }

  /**
   * Create QR code for POS payment (v3 API - integer amounts)
   */
  async createPaymentQr(
    order: Order,
    remark?: string,
  ): Promise<InfocmsQrResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        errorCode: 'NOT_CONFIGURED',
        errorMessage: 'InfoCMS is not configured',
      };
    }

    // Generate transactionUuid based on orderNumber for easy lookup (same pattern as OnePay)
    const transactionUuid = generateTransactionUuid(order.orderNumber);
    const requestId = generateRequestId();

    this.logger.log(
      `Creating InfoCMS QR for order ${order.orderNumber}, transactionUuid: ${transactionUuid}`,
    );

    try {
      const requestData = {
        transactionUuid,
        depositAmt: String(Math.round(order.total)), // v3 uses string amounts
        posUniqueId: this.posUniqueId,
        posBillNo: order.orderNumber,
        remark: (remark || `Thanh toan ${order.orderNumber}`).replace(
          /[^a-zA-Z0-9\s]/g,
          '',
        ),
      };

      const body = { data: requestData };
      const headers = await this.buildHeaders(requestId, body);

      const url = `${INFOCMS_API_URL}/${INFOCMS_API_VERSION_V3}${INFOCMS_CREATE_QR_PATH}`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const result: InfocmsBaseResponse = await response.json();

      if (!isSuccessResponse(result.responseCd)) {
        this.logger.warn(
          `InfoCMS create QR failed: ${result.responseCd} - ${result.responseMsg}`,
        );
        return {
          success: false,
          transactionUuid,
          errorCode: result.responseCd,
          errorMessage: getErrorMessage(result.responseCd, result.responseMsg),
        };
      }

      const data = result.data as unknown as InfocmsCreateQrData;

      this.logger.log(
        `InfoCMS QR created successfully for order ${order.orderNumber}`,
      );

      // Record payment initiated event
      await this.orderRepository.addPaymentEvent(order.id, {
        status: PaymentEventStatus.INITIATED,
        timestamp: new Date(),
        amount: order.total,
        ref: transactionUuid,
      });

      return {
        success: true,
        qrUrl: data.qrUrl,
        qrData: data.qrData,
        transactionUuid: data.transactionUuid,
        ecollectionCd: data.ecollectionCd,
        motherAccountNo: data.motherAccountNo,
        accountHolderNm: data.accountHolderNm,
      };
    } catch (error) {
      this.logger.error('InfoCMS create QR error', error);
      return {
        success: false,
        transactionUuid,
        errorCode: 'API_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel QR code
   */
  async cancelQr(
    ecollectionCd: string,
    transactionUuid: string,
  ): Promise<{ success: boolean; errorMessage?: string }> {
    const requestId = generateRequestId();

    this.logger.log(`Cancelling InfoCMS QR: ${ecollectionCd}`);

    try {
      const requestData = {
        transactionUuid,
        posUniqueId: this.posUniqueId,
        ecollectionCd,
      };

      const body = { data: requestData };
      const headers = await this.buildHeaders(requestId, body);

      const url = `${INFOCMS_API_URL}/${INFOCMS_API_VERSION_V2}${INFOCMS_CANCEL_QR_PATH}`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const result: InfocmsBaseResponse = await response.json();

      if (!isSuccessResponse(result.responseCd)) {
        return {
          success: false,
          errorMessage: getErrorMessage(result.responseCd, result.responseMsg),
        };
      }

      this.logger.log(`InfoCMS QR cancelled: ${ecollectionCd}`);
      return { success: true };
    } catch (error) {
      this.logger.error('InfoCMS cancel QR error', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Inquiry receivables list
   */
  async inquiryReceivables(
    ecollectionCd: string,
    options?: {
      paidYn?: 'A' | 'Y' | 'N';
      transId?: string;
      transactionUuid?: string;
    },
  ): Promise<{
    success: boolean;
    data?: InfocmsInquiryDataItem[];
    errorMessage?: string;
  }> {
    const requestId = generateRequestId();

    try {
      const requestData: Record<string, string> = {
        ecollectionCd,
        paidYn: options?.paidYn || 'A',
        transId: options?.transId || '',
        transactionUuid: options?.transactionUuid || '',
        posUniqueId: this.posUniqueId,
      };

      const body = { data: requestData };
      const headers = await this.buildHeaders(requestId, body);

      const url = `${INFOCMS_API_URL}/${INFOCMS_API_VERSION_V2}${INFOCMS_INQUIRY_RECV_PATH}`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const result: InfocmsBaseResponse = await response.json();

      if (!isSuccessResponse(result.responseCd)) {
        return {
          success: false,
          errorMessage: getErrorMessage(result.responseCd, result.responseMsg),
        };
      }

      return {
        success: true,
        data: result.data as unknown as InfocmsInquiryDataItem[],
      };
    } catch (error) {
      this.logger.error('InfoCMS inquiry error', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process callback from InfoCMS (payment notification)
   */
  async processCallback(
    data: InfocmsCallbackData,
  ): Promise<InfocmsCallbackResult> {
    this.logger.log('Processing InfoCMS callback');
    this.logger.debug('Callback data:', JSON.stringify(data));

    const { transactionUuid, depositAmt, transId, bankTransId } = data;

    // Extract orderNumber from transactionUuid (format: {orderNumber}-{timestamp})
    const orderNumber = extractOrderNumberFromTransactionUuid(transactionUuid);
    if (!orderNumber) {
      this.logger.warn(`Invalid transactionUuid format: ${transactionUuid}`);
      return {
        success: false,
        message: 'Invalid transaction UUID format',
      };
    }

    // Find order by orderNumber (no extra index needed)
    const order = await this.orderRepository.findByOrderNumber(orderNumber);

    if (!order) {
      this.logger.warn(`Order not found for orderNumber: ${orderNumber}`);
      return {
        success: false,
        message: 'Order not found',
      };
    }

    // Idempotency: Skip if already processed
    if (order.paymentStatus !== PaymentStatus.PENDING) {
      this.logger.log(
        `Order ${order.orderNumber} already processed with status: ${order.paymentStatus}`,
      );
      return {
        success: true,
        orderNumber: order.orderNumber,
        message: 'Order already processed',
      };
    }

    // Verify amount matches
    if (Math.round(order.total) !== depositAmt) {
      this.logger.warn(
        `Amount mismatch for order ${order.orderNumber}: expected ${order.total}, got ${depositAmt}`,
      );
      // Still process but log warning
    }

    this.logger.log(
      `Processing payment success for order ${order.orderNumber}`,
    );

    // Record payment event (also updates paymentStatus atomically)
    const updatedOrder = await this.orderRepository.addPaymentEvent(order.id, {
      status: PaymentEventStatus.SUCCESS,
      timestamp: new Date(),
      amount: depositAmt,
      ref: transId,
    });

    if (!updatedOrder) {
      return { success: false, message: 'Failed to update order' };
    }

    // Store InfoCMS transaction IDs for reconciliation
    await this.orderRepository.update(order.id, {
      infocms: {
        transactionUuid: order.infocms?.transactionUuid,
        ecollectionCd: order.infocms?.ecollectionCd,
        transId,
        bankTransId,
      },
    });

    // Handle post-payment actions
    this.checkoutPaymentHandlerService
      .handlePaymentSuccess(updatedOrder)
      .catch((err) => {
        this.logger.error(
          `Failed to handle payment success for order ${order.orderNumber}: ${err.message}`,
        );
      });

    return {
      success: true,
      orderNumber: order.orderNumber,
      message: 'Payment processed successfully',
    };
  }

  /**
   * Get callback URL for InfoCMS
   */
  getCallbackUrl(): string {
    return `${this.backendDomain}${INFOCMS_CALLBACK_PATH}`;
  }
}
