import { registerAs } from '@nestjs/config';

import { IsOptional, IsInt, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { env } from '../../utils/env';
import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  MONGODB_URL: string;

  @IsInt()
  @IsOptional()
  DATABASE_MAX_CONNECTIONS: number;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    isDocumentDatabase: true,
    url: env.MONGODB_URL,
    maxConnections: parseInt(env.DATABASE_MAX_CONNECTIONS, 10),
  };
});
