import { Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderTasksService } from './order-tasks.service';
import { AllConfigType } from '../config/config.type';
import { orderTaskQueueName } from '../utils/env';
import { TelegramModule } from '../telegram/telegram.module';

const logger = new Logger('OrderTasksModule');

/**
 * Module for order post-processing background tasks.
 * Each post-payment operation is a separate retriable job.
 * Jobs are queued to BullMQ with exponential backoff — no DB records.
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
      name: orderTaskQueueName,
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 1000,
      },
    }),
    TelegramModule,
  ],
  providers: [OrderTasksService],
  exports: [OrderTasksService],
})
export class OrderTasksModule {}
