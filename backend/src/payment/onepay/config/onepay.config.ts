import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../../utils/validate-config';
import { env } from '../../../utils/env';
import { OnepayConfig } from './onepay-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  ONEPAY_MERCHANT_ID: string;

  @IsString()
  @IsOptional()
  ONEPAY_ACCESS_CODE: string;

  @IsString()
  @IsOptional()
  ONEPAY_HASH_CODE: string;
}

export default registerAs<OnepayConfig>('onepay', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    merchantId: env.ONEPAY_MERCHANT_ID,
    accessCode: env.ONEPAY_ACCESS_CODE,
    hashCode: env.ONEPAY_HASH_CODE,
  };
});
