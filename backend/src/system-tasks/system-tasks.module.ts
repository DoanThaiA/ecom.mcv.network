import { Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SystemTasksService } from './system-tasks.service';
import { AllConfigType } from '../config/config.type';
import { systemTaskQueueName } from '../utils/env';

const logger = new Logger('SystemTasksModule');

/**
 * Module for system background tasks (e.g., thumbnail generation).
 * These tasks are internal-only and not exposed via API.
 * Jobs are queued to BullMQ with retry — no DB records.
 */
@Module({
  imports: [
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
      name: systemTaskQueueName,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
  ],
  providers: [SystemTasksService],
  exports: [SystemTasksService],
})
export class SystemTasksModule {}
