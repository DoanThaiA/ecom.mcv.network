import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config.type';
import validateConfig from '../utils/validate-config';
import { env } from '../utils/env';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Internal = 'internal',
  Staging = 'staging',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  WEBSITE_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  CMS_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    nodeEnv: env.NODE_ENV,
    name: env.APP_NAME,
    workingDirectory: process.env.PWD || process.cwd(),
    websiteDomain: env.WEBSITE_DOMAIN,
    cmsDomain: env.CMS_DOMAIN,
    backendDomain: env.BACKEND_DOMAIN,
    port: parseInt(env.APP_PORT, 10),
    apiPrefix: env.API_PREFIX,
    fallbackLanguage: env.APP_FALLBACK_LANGUAGE,
    headerLanguage: env.APP_HEADER_LANGUAGE,
    adminUsername: env.ADMIN_USERNAME,
    adminPassword: env.ADMIN_PASSWORD,
  };
});
