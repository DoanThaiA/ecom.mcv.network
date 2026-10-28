import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobSchemaClass, JobSchema } from './model/job.schema';
import { JobRepository } from './domain/job.repository';
import { JobDocumentRepository } from './model/job.repository';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { AllConfigType } from '../config/config.type';
import { jobQueueName } from '../utils/env';

const logger = new Logger('JobsModule');

/**
 * Module quan ly job cho server
 * Chi chua JobsService va JobsController de enqueue job
 * JobsProcessor da duoc chuyen sang worker rieng
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobSchemaClass.name, schema: JobSchema },
    ]),
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
    ProductDocumentModule,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    {
      provide: JobRepository,
      useClass: JobDocumentRepository,
    },
  ],
  exports: [JobsService],
})
export class JobsModule {}
