import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { env } from '../../utils/env';
import { NhanhConfig } from './nhanh-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  NHANH_APP_ID: string;

  @IsString()
  @IsOptional()
  NHANH_APP_SECRET: string;

  @IsString()
  @IsOptional()
  NHANH_OAUTH_URL: string;

  @IsString()
  @IsOptional()
  NHANH_API_URL: string;
}

export default registerAs<NhanhConfig>('nhanh', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    appId: env.NHANH_APP_ID,
    appSecret: env.NHANH_APP_SECRET,
    apiVersion: '3.0',
    oauthUrl: env.NHANH_OAUTH_URL,
    apiUrl: env.NHANH_API_URL,
  };
});
