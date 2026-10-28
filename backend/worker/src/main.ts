import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { WorkerModule } from './worker.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('Worker');
const WORKER_PORT = parseInt(process.env.WORKER_PORT || '3001', 10);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(WorkerModule);

  // Increase body size limit for large webhook payloads (e.g., Nhanh.vn)
  app.useBodyParser('json', { limit: '5mb' });

  app.enableShutdownHooks();

  // Enable API prefix and versioning for webhook routes
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(WORKER_PORT);

  logger.log(
    `Health check endpoint available at http://localhost:${WORKER_PORT}/api/health`,
  );
  logger.log(
    `Webhook endpoint available at http://localhost:${WORKER_PORT}/api/v1/webhooks/nhanh`,
  );
  logger.log(
    'Worker started - processing cron jobs, BullMQ jobs, and webhooks',
  );

  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });
}

void bootstrap();
