import { registerAs } from '@nestjs/config';

import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { env } from '../../utils/env';
import { MailConfig } from './mail-config.type';

class EnvironmentVariablesValidator {
  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  MAIL_PORT: number;

  @IsString()
  MAIL_HOST: string;

  @IsString()
  @IsOptional()
  MAIL_USER: string;

  @IsString()
  @IsOptional()
  MAIL_PASSWORD: string;
}

export default registerAs<MailConfig>('mail', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    port: parseInt(env.MAIL_PORT, 10),
    host: env.MAIL_HOST,
    user: env.MAIL_USER,
    password: env.MAIL_PASSWORD,
  };
});
