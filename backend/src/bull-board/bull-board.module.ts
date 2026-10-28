import { Module, INestApplication, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import basicAuth from 'express-basic-auth';
import { AllConfigType } from '../config/config.type';
import {
  jobQueueName,
  systemTaskQueueName,
  orderTaskQueueName,
} from '../utils/env';

/**
 * Service for Bull Board setup and authentication
 * Uses HTTP Basic Auth for browser access
 */
@Injectable()
export class BullBoardService {
  private serverAdapter: ExpressAdapter;
  private jobsQueue: Queue;
  private systemTasksQueue: Queue;
  private orderTasksQueue: Queue;
  private initialized = false;

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  /**
   * Initialize Bull Board (lazy initialization)
   */
  private initialize() {
    if (this.initialized) return;

    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/admin/queues');

    const redisUrl = this.configService.get('cache.redisUrl', { infer: true });
    const connection = redisUrl
      ? { url: redisUrl }
      : { host: 'localhost', port: 6379 };

    this.jobsQueue = new Queue(jobQueueName, { connection });
    this.systemTasksQueue = new Queue(systemTaskQueueName, { connection });
    this.orderTasksQueue = new Queue(orderTaskQueueName, { connection });

    createBullBoard({
      queues: [
        new BullMQAdapter(this.jobsQueue),
        new BullMQAdapter(this.systemTasksQueue),
        new BullMQAdapter(this.orderTasksQueue),
      ],
      serverAdapter: this.serverAdapter,
    });

    this.initialized = true;
  }

  /**
   * Setup Bull Board routes on the Express app with Basic Auth
   * Call this from main.ts after NestFactory.create()
   */
  setupBullBoard(app: INestApplication) {
    // Initialize Bull Board first
    this.initialize();

    const expressApp = app.getHttpAdapter().getInstance();

    // Get credentials from env (defaults for dev)
    const username =
      this.configService.get('app.adminUsername', { infer: true }) ?? 'admin';
    const password =
      this.configService.get('app.adminPassword', { infer: true }) ??
      'admin123';

    // Basic Auth middleware - browser will prompt for username/password
    expressApp.use(
      '/admin/queues',
      basicAuth({
        users: { [username]: password },
        challenge: true, // Shows browser login prompt
        realm: 'Bull Board - Job Queue Monitor',
      }),
    );

    // Mount Bull Board router
    expressApp.use('/admin/queues', this.serverAdapter.getRouter());
  }
}

/**
 * Bull Board module for job queue monitoring
 * Protected by HTTP Basic Auth (username/password from env)
 */
@Module({
  imports: [ConfigModule],
  providers: [BullBoardService],
  exports: [BullBoardService],
})
export class BullBoardModule {}
