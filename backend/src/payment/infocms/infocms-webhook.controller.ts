import {
  Controller,
  Post,
  Body,
  Res,
  Headers,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { InfocmsService } from './infocms.service';
import { InfocmsCallbackData, verifyRsaSignature } from './infocms.utils';
import { AllConfigType } from '../../config/config.type';
import { TelegramService } from '../../telegram/telegram.service';

/**
 * DTO for InfoCMS callback request body
 */
interface InfocmsCallbackBody {
  data: string | InfocmsCallbackData;
}

@ApiTags('Webhooks')
@Controller({
  path: 'webhooks/infocms',
  version: '1',
})
export class InfocmsWebhookController {
  private readonly logger = new Logger(InfocmsWebhookController.name);
  private readonly publicKey: string;

  constructor(
    private readonly infocmsService: InfocmsService,
    private readonly configService: ConfigService<AllConfigType>,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {
    this.publicKey =
      this.configService.get('infocms.publicKey', { infer: true }) || '';
  }

  /**
   * Handle callback from InfoCMS when payment is received
   * This endpoint is called by InfoCMS server-to-server
   */
  @Post('callback')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'InfoCMS payment callback (server-to-server)' })
  async handleCallback(
    @Body() body: InfocmsCallbackBody,
    @Headers('CMS-RSA-Signature') signature: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log('Received InfoCMS callback with signature: ' + signature);

    // Verify RSA signature if public key is configured
    if (this.publicKey) {
      if (!signature) {
        this.logger.warn('Missing CMS-RSA-Signature header');
        this.sendErrorResponse(res, 'Missing signature');
        return;
      }

      const isValid = verifyRsaSignature(
        body as unknown as Record<string, unknown>,
        signature,
        this.publicKey,
      );
      if (!isValid) {
        this.logger.warn('Invalid CMS-RSA-Signature');
        this.sendErrorResponse(res, 'Invalid signature');
        return;
      }

      this.logger.log('CMS-RSA-Signature verified successfully');
    }

    try {
      // Parse callback data
      let callbackData: InfocmsCallbackData;

      if (typeof body.data === 'string') {
        // Data may come as JSON string
        try {
          callbackData = JSON.parse(body.data);
        } catch {
          this.logger.error('Failed to parse callback data');
          this.sendErrorResponse(res, 'Invalid data format');
          return;
        }
      } else {
        callbackData = body.data;
      }

      const result = await this.infocmsService.processCallback(callbackData);

      if (result.success) {
        this.sendSuccessResponse(res, result.orderNumber);
      } else {
        this.sendErrorResponse(res, result.message);
      }
    } catch (error) {
      this.logger.error('Error processing InfoCMS callback', error);
      void this.telegramService?.sendErrorAlert(
        'InfocmsWebhook.handleCallback',
        error as Error,
      );
      this.sendErrorResponse(res, 'Internal error');
    }
  }

  /**
   * Send success response to InfoCMS
   */
  private sendSuccessResponse(res: Response, orderNumber?: string): void {
    const response = {
      responseCd: '000000',
      responseMsg: 'OK.',
      responseTs: this.formatTimestamp(new Date()),
      responseTraceId: this.generateTraceId(),
      requesterTrId: orderNumber || '',
    };
    res.json(response);
  }

  /**
   * Send error response to InfoCMS
   */
  private sendErrorResponse(res: Response, message: string): void {
    const response = {
      responseCd: '000001',
      responseMsg: message,
      responseTs: this.formatTimestamp(new Date()),
      responseTraceId: this.generateTraceId(),
    };
    res.json(response);
  }

  /**
   * Format timestamp as YYYY-MM-DD HH:MI:SS sss
   */
  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ms}`;
  }

  /**
   * Generate trace ID
   */
  private generateTraceId(): string {
    return crypto.randomUUID();
  }
}
