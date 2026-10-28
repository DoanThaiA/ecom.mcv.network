import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { OnepayService } from '../../payment/onepay/onepay.service';
import { AllConfigType } from '../../config/config.type';

@ApiTags('Payment')
@Controller({ path: 'shop/payment', version: '1' })
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  private readonly websiteDomain: string;

  constructor(
    private readonly onepayService: OnepayService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.websiteDomain =
      this.configService.get('app.websiteDomain', { infer: true }) || '';
  }

  @Get('onepay/return')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'OnePay return URL handler' })
  async handleOnepayReturn(
    @Query() params: Record<string, string>,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log('Received OnePay return redirect');
    this.logger.debug('Return params:', JSON.stringify(params));

    // Process payment update (idempotent - will skip if already processed by IPN)
    const ipnResult = await this.onepayService.processIpnCallback(params);

    if (!ipnResult.success && !ipnResult.orderNumber) {
      // Invalid signature or invalid params
      this.logger.warn('Invalid return params: ' + ipnResult.message);
      res.redirect(`${this.websiteDomain}/payment?reason=invalid_signature`);
      return;
    }

    // Determine success based on response code
    const txnResponseCode = params['vpc_TxnResponseCode'];

    res.redirect(
      `${this.websiteDomain}/payment?orderNumber=${ipnResult.orderNumber}&code=${txnResponseCode}`,
    );
  }
}
