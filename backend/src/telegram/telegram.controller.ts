import { Controller, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('/test')
  async testTelegramAlert() {
    const isConfigured = this.telegramService.isConfigured;

    if (!isConfigured) {
      return {
        success: false,
        message: 'Telegram is not configured (missing BOT_TOKEN or CHANNEL_ID)',
      };
    }

    const success = await this.telegramService.sendMessage(
      '✅ <b>Telegram Test Message</b>\n\n' +
        `Timestamp: ${new Date().toISOString()}\n` +
        'This is a test message from the CChat API.',
    );

    return {
      success,
      message: success
        ? 'Test message sent successfully!'
        : 'Failed to send test message (check backend logs)',
    };
  }
}
