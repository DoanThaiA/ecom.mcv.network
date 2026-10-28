import { Module, Logger } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import path from 'path';

// Config imports from main app
import databaseConfig from '@app/database/config/database.config';
import appConfig from '@app/config/app.config';
import cacheConfig from '@app/cache/config/cache.config';
import nhanhConfig from '@app/nhanh/config/nhanh.config';
import fileConfig from '@app/files/config/file.config';
import cdpConfig from '@app/cdp/config/cdp.config';
import authConfig from '@app/auth/config/auth.config';
import telegramConfig from '@app/telegram/config/telegram.config';

// Module imports from main app
import { MongooseConfigService } from '@app/database/mongoose-config.service';
import { AllConfigType } from '@app/config/config.type';
import {
  jobQueueName,
  systemTaskQueueName,
  orderTaskQueueName,
} from '@app/utils/env';
import { CacheModule } from '@app/cache/cache.module';

// Worker-specific modules
import { JobsWorkerModule } from './modules/jobs-worker.module';
import { SystemTasksWorkerModule } from './modules/system-tasks-worker.module';
import { OrderTasksWorkerModule } from './modules/order-tasks-worker.module';
import { CronsModule } from './modules/crons.module';
import { HealthModule } from './health/health.module';
import { WebhookModule } from './webhooks/webhook.module';

const logger = new Logger('WorkerModule');

const infrastructureDatabaseModule = MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
});

/**
 * Worker module - handles cron jobs and BullMQ job processing
 * Exposes /api/health endpoint for Kubernetes health probes
 */
@Module({
  imports: [
    // Enable cron jobs
    ScheduleModule.forRoot(),

    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        appConfig,
        cacheConfig,
        nhanhConfig,
        fileConfig,
        cdpConfig,
        authConfig,
        telegramConfig,
      ],
      envFilePath: ['.env'],
    }),

    // Database
    infrastructureDatabaseModule,

    // Cache (required by NhanhAuthService)
    CacheModule,

    // i18n for error messages
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: {
          // Path from worker/dist/worker/src/ to dist/i18n/
          path: path.join(__dirname, '../../../../dist/i18n/'),
          watch: false,
        },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    // BullMQ configuration
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => {
        const redisUrl = configService.get('cache.redisUrl', { infer: true });
        return {
          connection: {
            url: redisUrl || 'redis://localhost:6379',
            maxRetriesPerRequest: null,
            retryStrategy: (times: number) => {
              const delay = Math.min(times * 1000, 10000);
              logger.warn(
                `Redis connection attempt ${times} failed. Retrying in ${delay}ms...`,
              );
              return delay;
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: jobQueueName,
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
    BullModule.registerQueue({
      name: systemTaskQueueName,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
    BullModule.registerQueue({
      name: orderTaskQueueName,
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 1000,
      },
    }),

    // Worker modules
    JobsWorkerModule,
    SystemTasksWorkerModule,
    OrderTasksWorkerModule,
    CronsModule,

    // Webhook processing
    WebhookModule,

    // Health check module
    HealthModule,
  ],
})
export class WorkerModule {}
