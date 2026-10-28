import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { env } from '../../utils/env';
import { TelegramConfig } from './telegram-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  TELEGRAM_BOT_TOKEN: string;

  @IsString()
  @IsOptional()
  TELEGRAM_CHANNEL_ID: string;
}

export default registerAs<TelegramConfig>('telegram', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN,
    channelId: process.env.TELEGRAM_CHANNEL_ID || env.TELEGRAM_CHANNEL_ID,
  };
});
