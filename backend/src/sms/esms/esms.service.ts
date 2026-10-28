import { Injectable, HttpStatus } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import axios from 'axios';
import { AllConfigType } from '../../config/config.type';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class EsmsService {
  private readonly API_URL =
    'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/';

  constructor(
    private configService: ConfigService<AllConfigType>,
    private i18n: I18nService,
  ) {}

  async sendOtp(phone: string, otp: string): Promise<void> {
    const apiKey = this.configService.getOrThrow('esms.apiKey', {
      infer: true,
    });
    const secretKey = this.configService.getOrThrow('esms.secretKey', {
      infer: true,
    });
    const brandName = this.configService.getOrThrow('esms.brandName', {
      infer: true,
    });
    const campaignid = this.configService.getOrThrow('esms.campaignid', {
      infer: true,
    });
    const callbackUrl = this.configService.get('esms.callbackUrl', {
      infer: true,
    });

    const content = `Ma OTP cua ban tai ${brandName} la: ${otp}`;

    try {
      const response = await axios.post(
        this.API_URL,
        {
          ApiKey: apiKey,
          SecretKey: secretKey,
          Content: content,
          Phone: phone,
          Brandname: brandName,
          SmsType: '2',
          IsUnicode: '0',
          campaignid,
          RequestId: randomStringGenerator(),
          CallbackUrl: callbackUrl,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;

      if (data.CodeResult !== '100') {
        console.error('eSMS error:', data);
        throwException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('sms.sendFailed'),
        });
      }

      return data.SMSID;
    } catch (error) {
      console.error('Failed to send SMS via eSMS:', error);

      if (axios.isAxiosError(error)) {
        throwException({
          status: error.response?.status || HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18n.t('sms.sendFailed'),
        });
      }

      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('sms.sendFailed'),
      });
    }
  }
}
