import { Controller, Get, Query, Res, Logger, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { OnepayService } from './onepay.service';
import { TelegramService } from '../../telegram/telegram.service';

@ApiTags('Webhooks')
@Controller({
  path: 'webhooks/onepay',
  version: '1',
})
export class OnepayWebhookController {
  private readonly logger = new Logger(OnepayWebhookController.name);

  constructor(
    private readonly onepayService: OnepayService,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {}

  @Get('ipn')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'OnePay IPN callback (server-to-server)' })
  async handleIpn(
    @Query() params: Record<string, string>,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log('Received OnePay IPN callback');

    try {
      const result = await this.onepayService.processIpnCallback(params);

      if (result.success) {
        // OnePay expects this exact response format
        res.send('responsecode=1&desc=confirm-success');
      } else {
        res.send('responsecode=0&desc=confirm-fail');
      }
    } catch (error) {
      this.logger.error('Error processing IPN callback', error);
      void this.telegramService?.sendErrorAlert(
        'OnepayWebhook.handleIpn',
        error as Error,
        { params },
      );
      res.send('responsecode=0&desc=confirm-fail');
    }
  }
}
