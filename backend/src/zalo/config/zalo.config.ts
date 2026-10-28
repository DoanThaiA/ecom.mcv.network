import { registerAs } from '@nestjs/config';

import { IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { env } from '../../utils/env';
import { ZaloConfig } from './zalo-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  ZALO_APP_ID: string;

  @IsString()
  ZALO_APP_SECRET: string;
}

export default registerAs<ZaloConfig>('zalo', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    appId: env.ZALO_APP_ID,
    appSecret: env.ZALO_APP_SECRET,
  };
});
