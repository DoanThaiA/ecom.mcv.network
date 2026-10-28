import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import axios from 'axios';
import { throwException } from '../../utils/errors/throw-exception';
import { SendZnsDto } from './dto/send-zns.dto';
import { ZnsResponseDto } from './dto/zns-response.dto';
import { ZaloOaAuthService } from '../oa-auth/zalo-oa-auth.service';
import {
  ZNS_TEMPLATES,
  generateOtpTrackingId,
  generateOrderConfirmationTrackingId,
  generateRegistrationVoucherTrackingId,
  OrderConfirmationTemplateData,
  RegistrationVoucherTemplateData,
} from './zns-templates.config';

@Injectable()
export class ZaloZnsService {
  private readonly znsApiUrl =
    'https://business.openapi.zalo.me/message/template';

  constructor(
    private i18n: I18nService,
    private zaloOaAuthService: ZaloOaAuthService,
  ) {}

  /**
   * Send ZNS (Zalo Notification Service) message
   * @param sendZnsDto - ZNS message details
   * @returns ZNS response
   */
  async sendZns(sendZnsDto: SendZnsDto): Promise<ZnsResponseDto> {
    // Get access token from OA auth service
    const tokenData = await this.zaloOaAuthService.getAccessToken();

    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('social.integration.zaloOa.noAccessToken'),
      });
    }

    try {
      // Prepare the request payload according to Zalo ZNS API
      const payload = {
        phone: sendZnsDto.phone,
        template_id: sendZnsDto.templateId,
        template_data: sendZnsDto.templateData,
        ...(sendZnsDto.trackingId && { tracking_id: sendZnsDto.trackingId }),
      };

      const response = await axios.post<ZnsResponseDto>(
        this.znsApiUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            access_token: tokenData.accessToken,
          },
          timeout: 10000,
        },
      );

      const data = response.data;

      // Check if the response indicates an error
      if (data.error !== 0) {
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: `${this.i18n.t('social.integration.zaloZns.failedToSend')}: ${data.message}`,
        });
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throwException({
            status: HttpStatus.REQUEST_TIMEOUT,
            message: this.i18n.t('social.integration.zaloZns.apiTimeout'),
          });
        }

        throwException({
          status: error.response?.status || HttpStatus.UNPROCESSABLE_ENTITY,
          message: `${this.i18n.t('social.integration.zaloZns.failedToSend')}: ${JSON.stringify(error.response?.data)}`,
        });
      }

      // Re-throw if it's already a handled exception
      throw error;
    }
  }

  /**
   * Send OTP via ZNS
   * @param phone - Phone number to send OTP (must include country code)
   * @param otp - OTP code to send
   * @returns ZNS response
   */
  async sendOtp(phone: string, otp: string): Promise<ZnsResponseDto> {
    return this.sendZns({
      phone,
      templateId: ZNS_TEMPLATES.OTP,
      templateData: { otp },
      trackingId: generateOtpTrackingId(otp),
    });
  }

  /**
   * Send order confirmation via ZNS
   * @param phone - Phone number (international format 84...)
   * @param orderNumber - Order number
   * @param templateData - Template data
   * @returns ZNS response
   */
  async sendOrderConfirmation(
    phone: string,
    orderNumber: string,
    templateData: OrderConfirmationTemplateData,
  ): Promise<ZnsResponseDto> {
    return this.sendZns({
      phone,
      templateId: ZNS_TEMPLATES.ORDER_CONFIRMATION,
      templateData: templateData as unknown as Record<string, string>,
      trackingId: generateOrderConfirmationTrackingId(orderNumber),
    });
  }

  /**
   * Send registration voucher via ZNS
   * @param phone - Phone number (international format 84...)
   * @param templateData - Registration voucher template data
   * @returns ZNS response
   */
  async sendRegistrationVoucher(
    phone: string,
    templateData: RegistrationVoucherTemplateData,
  ): Promise<ZnsResponseDto> {
    return this.sendZns({
      phone,
      templateId: ZNS_TEMPLATES.REGISTRATION_VOUCHER,
      templateData: templateData as unknown as Record<string, string>,
      trackingId: generateRegistrationVoucherTrackingId(
        templateData.customer_id,
      ),
    });
  }
}
