import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../../utils/validate-config';
import { env } from '../../../utils/env';
import { InfocmsConfig } from './infocms-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  INFOCMS_MASTER_ID: string;

  @IsString()
  @IsOptional()
  INFOCMS_CLIENT_ID: string;

  @IsString()
  @IsOptional()
  INFOCMS_CLIENT_SECRET: string;

  @IsString()
  @IsOptional()
  INFOCMS_BANK_CODE: string;

  @IsString()
  @IsOptional()
  INFOCMS_POS_UNIQUE_ID: string;

  @IsString()
  @IsOptional()
  INFOCMS_PRIVATE_KEY: string;

  @IsString()
  @IsOptional()
  INFOCMS_PUBLIC_KEY: string;
}

export default registerAs<InfocmsConfig>('infocms', () => {
  validateConfig(EnvironmentVariablesValidator);

  const config = {
    masterId: env.INFOCMS_MASTER_ID,
    clientId: env.INFOCMS_CLIENT_ID,
    clientSecret: env.INFOCMS_CLIENT_SECRET,
    bankCode: env.INFOCMS_BANK_CODE,
    posUniqueId: env.INFOCMS_POS_UNIQUE_ID,
    privateKey: env.INFOCMS_PRIVATE_KEY,
    publicKey: env.INFOCMS_PUBLIC_KEY,
  };

  return config;
});
