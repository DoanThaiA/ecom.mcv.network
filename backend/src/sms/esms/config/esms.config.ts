import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import validateConfig from '../../../utils/validate-config';
import { env } from '../../../utils/env';
import { EsmsConfig } from './esms-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  ESMS_API_KEY: string;

  @IsString()
  ESMS_SECRET_KEY: string;
}

export default registerAs<EsmsConfig>('esms', () => {
  validateConfig(EnvironmentVariablesValidator);

  const callbackUrl = `${env.BACKEND_DOMAIN}/api/webhook/esms`;

  return {
    apiKey: env.ESMS_API_KEY,
    secretKey: env.ESMS_SECRET_KEY,
    brandName: 'CCHAT.VN',
    campaignid: 'Cảm ơn sau mua hàng tháng 7', // TODO: Update after esms setup
    callbackUrl: callbackUrl,
  };
});
