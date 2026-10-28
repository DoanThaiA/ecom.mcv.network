import {
  Controller,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Logger,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('webhook/esms')
export class EsmsController {
  private readonly logger = new Logger('eSMS Webhook');

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  handleGetCallback(@Request() req) {
    this.logger.debug('eSMS Callback received', req.query);
    return { status: 'ok' };
  }
}
