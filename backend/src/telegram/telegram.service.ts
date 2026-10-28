import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string | undefined;
  private readonly channelId: string | undefined;
  private readonly apiBaseUrl: string | undefined;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.botToken =
      this.configService.get('telegram.botToken', { infer: true }) || undefined;
    this.channelId =
      this.configService.get('telegram.channelId', { infer: true }) ||
      undefined;

    if (this.botToken) {
      this.apiBaseUrl = `https://api.telegram.org/bot${this.botToken}`;
      this.logger.log('Telegram notifications enabled');
    } else {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN is not set — Telegram notifications are disabled',
      );
    }
  }

  /** Returns true when the service has valid credentials configured. */
  get isConfigured(): boolean {
    return Boolean(this.botToken && this.channelId);
  }

  /**
   * Send a plain text message to the configured Telegram channel.
   *
   * @param message - The text content to send
   * @returns True if the message was sent successfully, false otherwise
   */
  async sendMessage(message: string): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const url = `${this.apiBaseUrl}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.channelId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `Telegram API error: ${response.status} ${response.statusText} — ${body}`,
        );
        return false;
      }

      this.logger.debug('Telegram message sent successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to send Telegram message', error);
      return false;
    }
  }

  /**
   * Send a critical error alert to the Telegram channel.
   * Formats the message with context, error details, optional metadata, and stack trace.
   *
   * @param context - Short label describing where the error occurred (e.g. "OrderService.create")
   * @param error - The error object or message string
   * @param metadata - Optional key-value pairs providing extra context (e.g. orderId, userId)
   */
  /**
   * Send a critical error alert to the Telegram channel.
   *
   * @param context - Short label describing where the error occurred (e.g. "OrderService.create")
   * @param error - The error object or message string
   * @param metadata - Optional key-value pairs providing extra context (e.g. orderId, userId)
   */
  async sendErrorAlert(
    context: string,
    error: Error | string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    const metaEntries = metadata
      ? Object.entries(metadata).filter(([, v]) => v !== undefined)
      : [];

    const timestamp = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const lines: string[] = [
      `🔴 <b>CCHAT ERROR</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `📍 <b>Source:</b>  ${this.escapeHtml(context)}`,
      `⏰ <b>Time:</b>    ${timestamp}`,
    ];

    if (metaEntries.length > 0) {
      lines.push(``);
      lines.push(`📋 <b>Details:</b>`);
      for (const [key, value] of metaEntries) {
        lines.push(`   ├ <b>${key}:</b> ${this.escapeHtml(String(value))}`);
      }
    }

    lines.push(``);
    lines.push(`❌ <b>Error:</b>`);
    lines.push(`<code>${this.escapeHtml(errorMessage)}</code>`);

    if (stack) {
      const shortStack = stack
        .split('\n')
        .slice(1, 4)
        .map((l) => l.trim())
        .join('\n');
      lines.push(``);
      lines.push(`📜 <b>Stack:</b>`);
      lines.push(`<pre>${this.escapeHtml(shortStack)}</pre>`);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━`);

    await this.sendMessage(lines.join('\n'));
  }

  /** Escape HTML special characters for Telegram HTML parse mode. */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
