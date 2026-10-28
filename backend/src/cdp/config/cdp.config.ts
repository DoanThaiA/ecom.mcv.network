import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { CdpConfig } from './cdp-config.type';
import validateConfig from '../../utils/validate-config';
import { env } from '../../utils/env';

class EnvironmentVariablesValidator {
  @IsString()
  CDP_PHONE: string;

  @IsString()
  CDP_PASSWORD: string;
}

export default registerAs<CdpConfig>('cdp', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    phone: env.CDP_PHONE,
    password: env.CDP_PASSWORD,
    serverAddress:
      env.NODE_ENV === 'production'
        ? 'mmenu-cdp-server-prod.mmenu-prod.svc.cluster.local:8081'
        : env.NODE_ENV === 'internal'
          ? 'mmenu-cdp-server-internal.mmenu-prod.svc.cluster.local:8081'
          : 'mmenu-cdp-server-staging.mmenu-staging.svc.cluster.local:8081',
  };
});
