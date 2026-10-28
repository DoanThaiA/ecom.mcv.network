import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import crypto from 'crypto';
import { Order } from '../order/domain/order';
import { OrderRepository } from '../order/domain/order.repository';
import { throwException } from '../../utils/errors/throw-exception';
import { AllConfigType } from '../../config/config.type';
import { ZaloZnsService } from '../../zalo/zns/zalo-zns.service';
import { OrderConfirmationTemplateData } from '../../zalo/zns/zns-templates.config';
import { getPaymentMethodLabel } from '../order/domain/order.enums';
import { truncateString } from '../../utils/helpers/string';

/** Token expiration: 7 days in seconds */
const TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;

/** Signature length in characters (base64url encoded) */
const SIGNATURE_LENGTH = 16;

/**
 * Service for managing order confirmations (ZNS link)
 * Uses compact HMAC tokens with orderId - no database storage needed
 *
 * Token format: {orderId}.{expiryBase36}.{signature}
 * Example: 507f1f77bcf86cd799439011.m5x2k0.Hs7dK2mN9pQr3t
 * Total length: ~50 characters (well under ZNS 200 char limit)
 */
@Injectable()
export class OrderConfirmationService {
  private readonly logger = new Logger(OrderConfirmationService.name);

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly i18n: I18nService,
    private readonly orderRepository: OrderRepository,
    private readonly zaloZnsService: ZaloZnsService,
  ) {}

  /**
   * Create a confirmation token for the given order
   * @param order - Order to create token for
   * @returns Confirmation token
   */
  async createOrderConfirmationToken(order: Order): Promise<string> {
    const token = this.generateToken(order.id);

    this.logger.log(
      `Created confirmation token for order ${order.orderNumber}`,
    );

    await this.sendZnsConfirmation(token, order);

    return token;
  }

  /**
   * Get order by confirmation token
   * @param token - Confirmation token from SMS/ZNS
   * @returns Corresponding order
   */
  async getOrderByToken(token: string): Promise<Order> {
    const { orderId } = this.verifyToken(token);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.order.notFound'),
      });
    }

    return order;
  }

  /**
   * Generate compact token from orderId using HMAC signature
   * Format: {orderId}.{expiryBase36}.{signature}
   * @param orderId - Order ID
   * @returns Compact token (~50 chars)
   */
  private generateToken(orderId: string): string {
    const secret = this.configService.getOrThrow('auth.secret', {
      infer: true,
    });

    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_SECONDS;
    const expiryBase36 = expiresAt.toString(36);
    const payload = `${orderId}.${expiryBase36}`;

    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64url')
      .substring(0, SIGNATURE_LENGTH);

    return `${payload}.${signature}`;
  }

  /**
   * Verify and decode token
   * @param token - Token to verify
   * @returns Object containing orderId
   * @throws HttpException if token is invalid or expired
   */
  private verifyToken(token: string): { orderId: string } {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.order.tokenInvalid'),
      });
    }

    const [orderId, expiryBase36, signature] = parts;
    const payload = `${orderId}.${expiryBase36}`;

    const secret = this.configService.getOrThrow('auth.secret', {
      infer: true,
    });

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64url')
      .substring(0, SIGNATURE_LENGTH);

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )
    ) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.order.tokenInvalid'),
      });
    }

    // Verify expiration
    const expiresAt = parseInt(expiryBase36, 36);
    if (Date.now() / 1000 > expiresAt) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: this.i18n.t('shop.order.tokenInvalid'),
      });
    }

    return { orderId };
  }

  /**
   * Send ZNS order confirmation message
   * @param token - Confirmation token
   * @param order - Order information
   */
  private async sendZnsConfirmation(
    token: string,
    order: Order,
  ): Promise<void> {
    const phone = order.customer.phone;

    const totalQuantity = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const templateData: OrderConfirmationTemplateData = {
      ten_khach_hang: order.customer.name,
      ma_don_hang: order.orderNumber,
      so_luong: totalQuantity.toString(),
      ten_san_pham: this.getProductNameSummary(order),
      size: '_', // TODO: Continue in future updates
      hinh_thuc: getPaymentMethodLabel(order.paymentMethod),
      cost: order.total.toLocaleString('vi-VN') + 'đ',
      token: token,
    };

    try {
      this.logger.log(
        `Sending ZNS order confirmation to ${phone} for order ${order.orderNumber}`,
      );

      await this.zaloZnsService.sendOrderConfirmation(
        phone,
        order.orderNumber,
        templateData,
      );

      this.logger.log(
        `ZNS order confirmation sent successfully for order ${order.orderNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send ZNS order confirmation for order ${order.orderNumber}: ${error.message}`,
      );
    }
  }

  /**
   * Get product name summary (truncated if needed)
   */
  private getProductNameSummary(order: Order): string {
    if (order.items.length === 1) {
      return truncateString(order.items[0].name, 200);
    }

    const firstName = order.items[0].name;
    const remaining = order.items.length - 1;
    const summary = `${firstName} (+${remaining} more)`;

    return truncateString(summary, 200);
  }
}
