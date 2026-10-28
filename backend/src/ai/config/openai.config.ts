import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { env } from '../../utils/env';
import { OpenaiConfig } from './openai-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  OPENAI_API_KEY: string;

  @IsString()
  @IsOptional()
  OPENAI_MODEL: string;
}

export default registerAs<OpenaiConfig>('openai', () => {
  validateConfig(EnvironmentVariablesValidator);

  return {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  };
});
